/**
 * DIBA FBC - Gestor Documents Module (Reorganized)
 */
import { supabase } from '../../core/supabase.js';

export async function loadDocuments(dynamicContent, pageTitle, mainTitle, setActiveFilter, usuario) {
    if (pageTitle) pageTitle.innerHTML = 'Gestor <span>Documental</span>';
    if (mainTitle) mainTitle.innerHTML = 'Gestor Documental';
    setActiveFilter('filter-docs-btn');
    
    dynamicContent.innerHTML = `
        <section id="uploadSection" class="${usuario.role !== 'admin' ? 'hidden' : ''} mb-12 animate__animated animate__fadeInUp">
            <div id="dropZone" class="drop-zone animate__animated animate__fadeIn">
                <i class="fas fa-cloud-upload-alt text-3xl text-gold/60 mb-2"></i>
                <p class="font-black text-white uppercase italic text-[10px] tracking-widest">Arrastra archivos aquí o haz clic</p>
                <input type="file" id="newDocument" class="hidden" accept=".pdf,.jpg,.png">
            </div>
        </section>
        <div id="fileListContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex justify-center py-10 col-span-full"><i class="fas fa-circle-notch animate-spin text-2xl text-dibaGold"></i></div>
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
            fileListContainer.innerHTML = '<p class="text-center text-slate-400 py-10 uppercase text-[10px] font-black italic tracking-widest col-span-full">No hay archivos disponibles</p>';
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
            div.className = `flex flex-col p-6 glass rounded-[2rem] hover:shadow-2xl transition-all animate__animated animate__fadeIn group ${doc.is_signed ? 'border-l-4 border-l-emerald-500' : ''}`;
            div.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                        <i class="far fa-file-pdf text-xl"></i>
                    </div>
                    ${doc.is_signed ? '<span class="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase italic rounded-full tracking-widest border border-emerald-100"><i class="fas fa-signature mr-1"></i> Firmado</span>' : ''}
                </div>
                <div>
                    <h4 class="font-black text-white text-xs uppercase italic tracking-tight line-clamp-1 mb-1">${doc.file_name}</h4>
                    <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-4">${date}</p>
                </div>
                <div class="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <a href="${fileUrl}" target="_blank" class="text-[9px] font-black uppercase italic text-gold hover:text-white flex items-center gap-1.5 transition-all">
                        <i class="fas fa-eye"></i> Visualizar
                    </a>
                </div>
            `;
            fileListContainer.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        fileListContainer.innerHTML = `<p class="text-center text-rose-500 py-10 col-span-full">Error: ${err.message}</p>`;
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
