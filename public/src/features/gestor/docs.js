/**
 * DIBA FBC - Gestor Documents Module (Refactored for Light Mode)
 */
import { supabase } from '../../core/supabase.js';

export async function loadDocuments(dynamicContent, pageTitle, mainTitle, setActiveFilter, usuario) {
    if (pageTitle) pageTitle.innerHTML = 'Gestor <span class="text-gold">Documental</span>';
    setActiveFilter('filter-docs-btn');
    
    // Clear loader/previous content
    if (dynamicContent) dynamicContent.innerHTML = `
        <div class="col-span-full py-24 flex flex-col items-center opacity-20">
            <div class="relative w-16 h-16 mb-6">
                <div class="absolute inset-0 border-4 border-gold/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-gold rounded-full animate-spin"></div>
            </div>
            <p class="text-[0.7rem] font-black uppercase tracking-[0.3em] text-gold italic">Sincronizando Archivos...</p>
        </div>
    `;

    const fileInput = document.getElementById("newDocument");

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

        if (dynamicContent) dynamicContent.innerHTML = '';
        documents.forEach(doc => {
            const fileUrl = urlMap[doc.storage_path] || '#';
            const date = new Date(doc.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
            
            const div = document.createElement('div');
            div.className = `panel p-6 animate-fade-up group hover:border-gold/30 transition-all flex flex-col gap-4 relative overflow-hidden`;
            div.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <div class="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/10 group-hover:bg-gold group-hover:text-[#004d98] transition-all">
                        <i class="far fa-file-pdf text-xl"></i>
                    </div>
                    ${doc.is_signed ? '<span class="px-2 py-1 bg-green-500/10 text-green-500 text-[0.5rem] font-black uppercase tracking-widest rounded border border-green-500/20">Firmado</span>' : '<span class="px-2 py-1 bg-white/5 text-white/20 text-[0.5rem] font-black uppercase tracking-widest rounded border border-white/5">Pendiente</span>'}
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-black italic text-white uppercase tracking-tighter truncate mb-1">${doc.file_name}</h4>
                    <p class="text-[0.6rem] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                        <i class="fas fa-calendar-alt text-gold/40"></i> ${date}
                    </p>
                </div>
                <div class="pt-4 border-t border-white/5 mt-auto">
                    <a href="${fileUrl}" target="_blank" class="w-full py-3 bg-white/5 hover:bg-gold hover:text-[#004d98] text-white text-[0.6rem] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 transition-all">
                        <i class="fas fa-eye"></i> Visualizar
                    </a>
                </div>
            `;
            if (dynamicContent) dynamicContent.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        if (dynamicContent) dynamicContent.innerHTML = `<div class="p-10 text-center col-span-full text-red-500 font-black uppercase text-xs">Error: ${err.message}</div>`;
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

