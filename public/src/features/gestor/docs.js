/**
 * DIBA FBC - Gestor Documents Module (Refactored for Light Mode)
 */
import { supabase } from '../../core/supabase.js';

export async function loadDocuments(dynamicContent, pageTitle, mainTitle, setActiveFilter, usuario) {
    if (pageTitle) pageTitle.innerHTML = 'Gestor <span>Documental</span>';
    if (mainTitle) mainTitle.innerHTML = 'Gestor Documental';
    setActiveFilter('filter-docs-btn');
    
    dynamicContent.innerHTML = `
        <section id="uploadSection" class="${usuario.role !== 'admin' ? 'hidden' : ''} mb-12 animate__animated animate__fadeInUp">
            <div id="dropZone" class="group relative overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center cursor-pointer hover:border-diba-blue hover:bg-white transition-all shadow-inner">
                <div class="absolute inset-0 bg-diba-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative z-10">
                    <div class="w-16 h-16 bg-white rounded-2xl shadow-premium flex items-center justify-center text-diba-blue mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <i class="fas fa-cloud-upload-alt text-2xl"></i>
                    </div>
                    <p class="font-black text-diba-blue uppercase italic text-xs tracking-widest mb-2">Arrastra archivos aquí o haz clic</p>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Formatos permitidos: PDF, JPG, PNG (Máx 5MB)</p>
                </div>
                <input type="file" id="newDocument" class="hidden" accept=".pdf,.jpg,.png">
            </div>
        </section>
        <div id="fileListContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="flex flex-col items-center justify-center py-20 col-span-full opacity-30">
                <i class="fas fa-circle-notch fa-spin text-3xl text-diba-blue mb-4"></i>
                <p class="text-[10px] font-black uppercase tracking-widest">Consultando Expedientes...</p>
            </div>
        </div>
    `;

    const fileListContainer = document.getElementById("fileListContainer");
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("newDocument");

    dropZone?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => { 
        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], dynamicContent, pageTitle, mainTitle, setActiveFilter, usuario); 
    });

    try {
        let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
        if (usuario.role !== 'admin') query = query.eq('owner_id', usuario.id);

        const { data: documents, error } = await query;
        if (error) throw error;

        if (!documents || documents.length === 0) {
            fileListContainer.innerHTML = `
                <div class="p-20 text-center col-span-full">
                    <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6 border border-slate-100">
                        <i class="fas fa-folder-open text-3xl"></i>
                    </div>
                    <p class="text-slate-400 uppercase text-[10px] font-black italic tracking-widest">Todavía no has cargado ningún documento</p>
                </div>
            `;
            return;
        }

        const paths = documents.map(d => d.storage_path);
        const { data: signedData, error: sError } = await supabase.storage.from("documents").createSignedUrls(paths, 3600);
        
        let urlMap = {};
        if (!sError) signedData.forEach(item => urlMap[item.path] = item.signedUrl);

        fileListContainer.innerHTML = '';
        documents.forEach(doc => {
            const fileUrl = urlMap[doc.storage_path] || '#';
            const date = new Date(doc.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
            
            const div = document.createElement('div');
            div.className = `group flex flex-col p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all animate-fade-up relative overflow-hidden ${doc.is_signed ? 'border-l-[6px] border-l-emerald-500' : ''}`;
            div.innerHTML = `
                <div class="flex items-center justify-between mb-6">
                    <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-diba-gold/10 group-hover:text-diba-blue transition-all border border-slate-100 shadow-inner">
                        <i class="far fa-file-pdf text-2xl"></i>
                    </div>
                    ${doc.is_signed ? '<span class="px-4 py-2 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase italic rounded-xl tracking-widest border border-emerald-100 shadow-sm"><i class="fas fa-signature mr-2"></i> Firmado</span>' : '<span class="px-4 py-2 bg-slate-50 text-slate-400 text-[9px] font-black uppercase italic rounded-xl tracking-widest border border-slate-100 shadow-sm">Pendiente</span>'}
                </div>
                <div class="mb-8">
                    <h4 class="font-black text-diba-blue text-sm uppercase italic tracking-tight line-clamp-2 mb-2 group-hover:text-diba-red transition-colors">${doc.file_name}</h4>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <i class="fas fa-calendar-day text-diba-gold"></i> ${date}
                    </p>
                </div>
                <div class="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <a href="${fileUrl}" target="_blank" class="px-5 py-2.5 bg-diba-blue text-white text-[9px] font-black uppercase italic tracking-widest rounded-xl hover:bg-diba-red transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10">
                        <i class="fas fa-eye text-diba-gold"></i> Abrir Archivo
                    </a>
                </div>
            `;
            fileListContainer.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        fileListContainer.innerHTML = `<div class="p-10 text-center col-span-full text-rose-500 font-black uppercase text-xs">Error: ${err.message}</div>`;
    }
}

async function handleFileUpload(file, dynamicContent, pageTitle, mainTitle, setActiveFilter, usuario) {
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: storageError } = await supabase.storage.from('documents').upload(fileName, file);
        if (storageError) throw storageError;

        const { error: dbError } = await supabase.from('documents').insert({
            file_name: file.name,
            storage_path: fileName,
            owner_id: usuario.id,
            is_signed: false
        });

        if (dbError) throw dbError;
        loadDocuments(dynamicContent, pageTitle, mainTitle, setActiveFilter, usuario);
    } catch (err) {
        alert("Error al subir archivo: " + err.message);
    }
}

