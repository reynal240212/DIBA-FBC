/**
 * DIBA FBC - Gestor Storage Module (Robust Supabase Admin Style + Auto WebP Upload)
 */
import { supabase } from '../../core/supabase.js';
import { optimizeImageToWebP } from './docs.js';

export async function loadStorageBuckets(dynamicContent, pageTitle, setActiveFilter) {
    if (!dynamicContent) return;

    if (pageTitle) pageTitle.innerHTML = 'Explorador <span class="text-gold">Cloud</span>';
    setActiveFilter('filter-club-btn');

    // Set List Layout
    dynamicContent.className = "flex flex-col gap-4 w-full";
    dynamicContent.innerHTML = `
        <div class="col-span-full mb-6">
            <div class="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/90">
                <div class="flex-1 w-1/4">Nombre</div>
                <div class="hidden md:block w-1/6 text-center">Políticas</div>
                <div class="hidden lg:block w-1/4 text-center">Límite de Tamaño</div>
                <div class="hidden lg:block w-1/4 text-center">Optimización</div>
            </div>
            <div id="buckets-rows" class="space-y-3 mt-4">
                <div class="py-24 flex flex-col items-center opacity-20">
                    <div class="relative w-12 h-12 mb-6">
                        <div class="absolute inset-0 border-2 border-gold/10 rounded-full"></div>
                        <div class="absolute inset-0 border-2 border-t-gold rounded-full animate-spin"></div>
                    </div>
                    <p class="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gold italic">Sincronizando Buckets...</p>
                </div>
            </div>
        </div>
    `;

    try {
        let { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
            console.warn("Storage listBuckets restricted, using fallback.");
            buckets = [];
        }

        const knownBuckets = [
            { id: 'documents', name: 'documents', public: true, file_size_limit: 52428800, allowed_mime_types: [] },
            { id: 'statuses', name: 'statuses', public: true, file_size_limit: 52428800, allowed_mime_types: [] },
            { id: 'asistencia-fotos', name: 'asistencia-fotos', public: true, file_size_limit: 52428800, allowed_mime_types: [] }
        ];

        knownBuckets.forEach(kb => {
            if (!buckets.find(b => b.id === kb.id)) buckets.push(kb);
        });

        const rowsContainer = document.getElementById('buckets-rows');
        if (!rowsContainer) return;

        rowsContainer.innerHTML = '';

        if (!buckets || buckets.length === 0) {
            rowsContainer.innerHTML = '<div class="p-10 text-center text-white/60 font-black uppercase text-xs italic">No hay buckets disponibles</div>';
            return;
        }

        buckets.forEach(bucket => {
            const sizeLimit = bucket.file_size_limit ? `${(bucket.file_size_limit / 1024 / 1024).toFixed(0)} MB` : 'No definido (50 MB)';

            const div = document.createElement('div');
            div.className = "panel p-5 group hover:border-gold/30 transition-all cursor-pointer flex items-center relative overflow-hidden bg-white/[0.01]";
            div.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div class="flex-1 w-1/4 flex items-center gap-4 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/10 group-hover:bg-gold group-hover:text-[#004d98] transition-all shrink-0">
                        <i class="fas fa-folder-closed"></i>
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="text-sm font-black italic text-white uppercase tracking-tighter group-hover:text-gold transition-colors truncate">${bucket.name}</span>
                        <span class="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">${bucket.public ? 'PÚBLICO' : 'PRIVADO'}</span>
                    </div>
                </div>

                <div class="hidden md:block w-1/6 text-center">
                    <span class="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[0.55rem] font-black">RLS ACTIVA</span>
                </div>

                <div class="hidden lg:block w-1/4 text-center">
                    <span class="text-[0.6rem] font-black uppercase tracking-widest text-white/90 italic">${sizeLimit}</span>
                </div>

                <div class="hidden lg:block w-1/4 text-center">
                    <span class="text-[0.55rem] font-black uppercase tracking-widest text-gold truncate">AUTO-WEBP ACTIVO</span>
                </div>

                <div class="w-10 text-right">
                    <i class="fas fa-chevron-right text-white/20 group-hover:text-gold group-hover:translate-x-1 transition-all"></i>
                </div>
            `;
            div.onclick = () => loadBucketFiles(bucket.id, dynamicContent, pageTitle);
            rowsContainer.appendChild(div);
        });
    } catch (err) {
        console.error("loadStorageBuckets error:", err);
        const rowsContainer = document.getElementById('buckets-rows');
        if (rowsContainer) rowsContainer.innerHTML = `<div class="p-10 text-center text-red-500 font-black uppercase text-xs">Error: ${err.message}</div>`;
    }
}

async function loadBucketFiles(bucketId, dynamicContent, pageTitle) {
    if (!dynamicContent) return;
    if (pageTitle) pageTitle.innerHTML = `Bucket: <span class="text-gold">${bucketId}</span>`;

    dynamicContent.innerHTML = `
        <div class="col-span-full border border-white/10 rounded-[2rem] overflow-hidden bg-slate-900/50">
            <div class="p-5 lg:p-6 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
                <button id="back-to-buckets" class="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl text-white/80 hover:text-gold hover:bg-white/10 transition-all group">
                    <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform text-xs"></i>
                    <span class="text-[0.6rem] font-black uppercase tracking-widest">Volver a Buckets</span>
                </button>
                
                <div class="flex items-center flex-wrap gap-3">
                    <label for="bucket-file-upload" class="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-gold text-[#004d98] rounded-xl text-[0.6rem] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg">
                        <i class="fas fa-cloud-upload-alt"></i> Subir a ${bucketId}
                    </label>
                    <input type="file" id="bucket-file-upload" class="hidden" multiple>
                    <div class="flex bg-white/5 p-1 rounded-xl">
                        <button class="w-8 h-8 rounded-lg bg-gold text-[#004d98] flex items-center justify-center shadow-lg"><i class="fas fa-border-all text-xs"></i></button>
                    </div>
                </div>
            </div>

            <div id="inner-files-grid" class="p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
                <div class="col-span-full py-24 flex flex-col items-center opacity-20">
                    <div class="relative w-10 h-10 mb-6">
                        <div class="absolute inset-0 border-2 border-gold/10 rounded-full"></div>
                        <div class="absolute inset-0 border-2 border-t-gold rounded-full animate-spin"></div>
                    </div>
                    <p class="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gold italic">Leyendo Archivos...</p>
                </div>
            </div>
        </div>
    `;

    const backBtn = document.getElementById('back-to-buckets');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            loadStorageBuckets(dynamicContent, pageTitle, (id) => {
                const btn = document.getElementById(id);
                if (btn) btn.click();
            });
        });
    }

    const uploadInput = document.getElementById('bucket-file-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', async (e) => {
            const selectedFiles = Array.from(e.target.files || []);
            if (!selectedFiles.length) return;
            const filesGrid = document.getElementById("inner-files-grid");
            if (filesGrid) {
                filesGrid.innerHTML = `
                    <div class="col-span-full py-20 flex flex-col items-center">
                        <div class="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4"></div>
                        <p class="text-xs font-black uppercase tracking-widest text-gold">Comprimiendo (WebP) y subiendo ${selectedFiles.length} archivo(s)...</p>
                    </div>
                `;
            }
            for (const rawFile of selectedFiles) {
                const optimized = await optimizeImageToWebP(rawFile);
                const safeName = `${Date.now()}_${optimized.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                await supabase.storage.from(bucketId).upload(safeName, optimized, { cacheControl: '3600', upsert: false });
            }
            await loadBucketFiles(bucketId, dynamicContent, pageTitle);
        });
    }

    try {
        const { data: files, error } = await supabase.storage.from(bucketId).list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
        });

        if (error) throw error;

        const filesGrid = document.getElementById("inner-files-grid");
        if (!filesGrid) return;

        const validFiles = (files || []).filter(f => f.name && f.name !== '.emptyFolderPlaceholder');

        if (validFiles.length === 0) {
            filesGrid.innerHTML = '<div class="p-20 text-center col-span-full text-slate-500 font-black uppercase text-xs italic tracking-[0.3em]">Carpeta Vacía — Usa el botón superior para subir archivos</div>';
            return;
        }

        filesGrid.innerHTML = '';
        validFiles.forEach(file => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
            const isDoc = /\.(pdf|doc|docx|xls|xlsx)$/i.test(file.name);
            const sizeKB = file.metadata?.size ? `${(file.metadata.size / 1024).toFixed(1)} KB` : '';
            const { data: pubUrlData } = supabase.storage.from(bucketId).getPublicUrl(file.name);
            const publicUrl = pubUrlData?.publicUrl || '';

            const div = document.createElement('div');
            div.className = "panel p-4 animate-fade-up group hover:border-gold/40 transition-all flex flex-col justify-between relative overflow-hidden bg-white/[0.02]";
            div.innerHTML = `
                <div>
                    ${isImage && publicUrl ? `
                    <div class="w-full h-28 rounded-xl overflow-hidden bg-slate-950 mb-3 border border-white/5 relative">
                        <img src="${publicUrl}" alt="${file.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                    </div>
                    ` : `
                    <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-[#004d98] transition-all mb-3 border border-white/5 mx-auto">
                        <i class="fas ${isImage ? 'fa-image' : isDoc ? 'fa-file-pdf' : 'fa-file'} text-lg"></i>
                    </div>
                    `}
                    <p class="text-[0.62rem] font-bold text-white break-all line-clamp-2 uppercase tracking-tight mb-1" title="${file.name}">${file.name}</p>
                    ${sizeKB ? `<p class="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">${sizeKB}</p>` : ''}
                </div>
                <div class="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <button type="button" class="open-file-btn flex-1 py-2 rounded-lg bg-white/5 hover:bg-gold hover:text-[#004d98] text-white text-[0.55rem] font-black uppercase tracking-widest transition-all">
                        Abrir
                    </button>
                    <button type="button" class="del-file-btn w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all text-xs" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;

            const openBtn = div.querySelector('.open-file-btn');
            if (openBtn) {
                openBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const { data: signedData } = await supabase.storage.from(bucketId).createSignedUrl(file.name, 3600);
                    const urlToOpen = signedData?.signedUrl || publicUrl;
                    if (urlToOpen) window.open(urlToOpen, '_blank');
                });
            }

            const delBtn = div.querySelector('.del-file-btn');
            if (delBtn) {
                delBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (!confirm(`¿Eliminar "${file.name}" del bucket ${bucketId}?`)) return;
                    await supabase.storage.from(bucketId).remove([file.name]);
                    loadBucketFiles(bucketId, dynamicContent, pageTitle);
                });
            }

            filesGrid.appendChild(div);
        });
    } catch (err) {
        console.error("loadBucketFiles error:", err);
        if (dynamicContent) dynamicContent.innerHTML = `<div class="p-10 text-center text-red-500 font-black uppercase text-xs col-span-full">Error: ${err.message}</div>`;
    }
}
