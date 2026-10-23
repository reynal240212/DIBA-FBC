/**
 * DIBA FBC - Gestor Documents Module (Robust + Auto WebP Optimization)
 */
import { supabase } from '../../core/supabase.js';

/**
 * Comprime y convierte automaticamente imagenes (JPG/PNG) a WebP ligero en el navegador
 */
export async function optimizeImageToWebP(file, maxWidth = 1600, quality = 0.82) {
    if (!file || !file.type.startsWith('image/') || file.type === 'image/webp' || file.type === 'image/gif') {
        return file;
    }
    return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(file);
                    return;
                }
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                const optimizedFile = new File([blob], `${baseName}.webp`, {
                    type: 'image/webp',
                    lastModified: Date.now()
                });
                resolve(optimizedFile);
            }, 'image/webp', quality);
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
        };
        img.src = objectUrl;
    });
}

/**
 * Calcula y actualiza la barra de almacenamiento real en GestorDocumental.html
 */
async function updateStorageMetrics(docCount) {
    const countEl = document.getElementById('count-all');
    if (countEl && typeof docCount === 'number') {
        countEl.textContent = String(docCount);
    }

    const usedEl = document.getElementById('storage-used');
    const barEl = document.getElementById('storage-bar');
    if (!usedEl && !barEl) return;

    try {
        const buckets = ['documents', 'statuses', 'asistencia-fotos'];
        let totalBytes = 0;

        await Promise.all(buckets.map(async (b) => {
            const { data } = await supabase.storage.from(b).list('', { limit: 200 });
            if (Array.isArray(data)) {
                data.forEach(item => {
                    const size = item.metadata?.size || 0;
                    totalBytes += size;
                });
            }
        }));

        const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
        const quotaMB = 50;
        const pct = Math.min(100, Math.max(2, (totalBytes / (quotaMB * 1024 * 1024)) * 100));

        if (usedEl) usedEl.textContent = `${usedMB} MB / ${quotaMB} MB`;
        if (barEl) barEl.style.width = `${pct}%`;
    } catch (e) {
        console.warn('No se pudo calcular cuota de storage:', e);
    }
}

export async function loadDocuments(dynamicContent, pageTitle, setActiveFilter, usuario) {
    if (!dynamicContent) return;

    if (pageTitle) pageTitle.innerHTML = 'Gestor <span class="text-gold">Documental</span>';
    setActiveFilter('filter-docs-btn');

    // Set Grid Layout
    dynamicContent.className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full";
    dynamicContent.innerHTML = `
        <div class="col-span-full py-24 flex flex-col items-center opacity-20">
            <div class="relative w-16 h-16 mb-6">
                <div class="absolute inset-0 border-4 border-gold/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-gold rounded-full animate-spin"></div>
            </div>
            <p class="text-[0.7rem] font-black uppercase tracking-[0.3em] text-gold italic">Sincronizando Archivos...</p>
        </div>
    `;

    const fileInput = document.getElementById("newDocument");
    if (fileInput && !fileInput.dataset.listener) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0], dynamicContent, pageTitle, setActiveFilter, usuario);
                e.target.value = '';
            }
        });
        fileInput.dataset.listener = "true";
    }

    try {
        let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
        if (usuario && usuario.role !== 'admin') query = query.eq('owner_id', usuario.id);

        const { data: documents, error } = await query;
        if (error) throw error;

        updateStorageMetrics(documents ? documents.length : 0);

        if (!documents || documents.length === 0) {
            dynamicContent.innerHTML = `
                <div class="p-20 text-center col-span-full opacity-40">
                    <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gold mx-auto mb-6 border border-white/5 shadow-inner">
                        <i class="fas fa-folder-open text-3xl"></i>
                    </div>
                    <p class="text-white/40 uppercase text-[0.7rem] font-black italic tracking-widest">Aún no se han registrado documentos oficiales</p>
                </div>
            `;
            return;
        }

        const paths = documents.map(d => d.storage_path).filter(Boolean);
        let urlMap = {};
        if (paths.length) {
            const { data: signedData, error: sError } = await supabase.storage.from("documents").createSignedUrls(paths, 3600);
            if (!sError && signedData) signedData.forEach(item => { urlMap[item.path] = item.signedUrl; });
        }

        dynamicContent.innerHTML = '';
        documents.forEach(doc => {
            const fileUrl = urlMap[doc.storage_path] || '#';
            const date = new Date(doc.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
            const isImg = /\.(webp|jpg|jpeg|png|gif)$/i.test(doc.file_name || doc.storage_path || '');
            const iconClass = isImg ? 'fa-file-image' : 'fa-file-pdf';

            const div = document.createElement('div');
            div.className = "panel p-6 animate-fade-up group hover:border-gold/30 transition-all flex flex-col gap-4 relative overflow-hidden bg-white/[0.01]";
            div.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/10 group-hover:bg-gold group-hover:text-[#004d98] transition-all">
                        <i class="far ${iconClass} text-xl"></i>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" class="toggle-sign-btn px-2.5 py-1 ${doc.is_signed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/10'} text-[0.5rem] font-black uppercase tracking-widest rounded border hover:border-gold/40 transition-all" title="Cambiar estado de firma">
                            ${doc.is_signed ? 'Firmado' : 'Pendiente'}
                        </button>
                        <button type="button" class="delete-doc-btn w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all text-xs" title="Eliminar documento">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                ${isImg && fileUrl !== '#' ? `
                <div class="w-full h-32 rounded-xl overflow-hidden bg-slate-950/60 border border-white/5">
                    <img src="${fileUrl}" alt="${doc.file_name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                </div>
                ` : ''}
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-black italic text-white uppercase tracking-tighter truncate mb-1" title="${doc.file_name}">${doc.file_name}</h4>
                    <p class="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <i class="fas fa-calendar-alt text-gold/60"></i> ${date}
                    </p>
                </div>
                <div class="pt-4 border-t border-white/5 mt-auto flex gap-2">
                    <a href="${fileUrl}" target="_blank" rel="noopener" class="flex-1 py-3 bg-white/5 hover:bg-gold hover:text-[#004d98] text-white text-[0.6rem] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all">
                        <i class="fas fa-eye"></i> Visualizar
                    </a>
                    <a href="${fileUrl}" download="${doc.file_name}" class="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[0.6rem] font-black uppercase rounded-xl flex items-center justify-center transition-all" title="Descargar">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            `;

            const signBtn = div.querySelector('.toggle-sign-btn');
            if (signBtn) {
                signBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const { error: uErr } = await supabase.from('documents').update({ is_signed: !doc.is_signed }).eq('id', doc.id);
                    if (!uErr) loadDocuments(dynamicContent, pageTitle, setActiveFilter, usuario);
                });
            }

            const delBtn = div.querySelector('.delete-doc-btn');
            if (delBtn) {
                delBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (!confirm(`¿Eliminar el documento "${doc.file_name}"?`)) return;
                    if (doc.storage_path) {
                        await supabase.storage.from('documents').remove([doc.storage_path]);
                    }
                    await supabase.from('documents').delete().eq('id', doc.id);
                    loadDocuments(dynamicContent, pageTitle, setActiveFilter, usuario);
                });
            }

            dynamicContent.appendChild(div);
        });

    } catch (err) {
        console.error("loadDocuments error:", err);
        dynamicContent.innerHTML = `<div class="p-10 text-center col-span-full text-red-500 font-black uppercase text-xs">Error: ${err.message}</div>`;
    }
}

async function handleFileUpload(rawFile, dynamicContent, pageTitle, setActiveFilter, usuario) {
    if (!usuario) return;
    try {
        dynamicContent.innerHTML = `
            <div class="col-span-full py-20 flex flex-col items-center">
                <div class="w-14 h-14 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4"></div>
                <p class="text-xs font-black uppercase tracking-widest text-gold">Optimizando y subiendo archivo...</p>
            </div>
        `;

        // Comprimir automáticamente si es imagen JPG/PNG a WebP
        const file = await optimizeImageToWebP(rawFile);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${Date.now()}_${safeName}`;

        const { error: storageError } = await supabase.storage.from('documents').upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });
        if (storageError) throw storageError;

        const { error: dbError } = await supabase.from('documents').insert({
            file_name: file.name,
            storage_path: fileName,
            owner_id: usuario.id,
            is_signed: false
        });

        if (dbError) throw dbError;
        await loadDocuments(dynamicContent, pageTitle, setActiveFilter, usuario);
    } catch (err) {
        alert("Error al subir archivo: " + err.message);
        await loadDocuments(dynamicContent, pageTitle, setActiveFilter, usuario);
    }
}
