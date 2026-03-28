/**
 * DIBA FBC - Gestor Storage Module (Premium Azul Grana)
 */
import { supabase } from '../../core/supabase.js';

export async function loadStorageBuckets(dynamicContent, pageTitle, mainTitle, setActiveFilter) {
    if (pageTitle) pageTitle.innerHTML = 'Explorador <span class="text-gold">Cloud</span>';
    setActiveFilter('filter-club-btn');
    
    // Set Loader
    if (dynamicContent) {
        dynamicContent.innerHTML = `
            <div class="col-span-full py-24 flex flex-col items-center opacity-20">
                <div class="relative w-16 h-16 mb-6">
                    <div class="absolute inset-0 border-4 border-gold/10 rounded-full"></div>
                    <div class="absolute inset-0 border-4 border-t-gold rounded-full animate-spin"></div>
                </div>
                <p class="text-[0.7rem] font-black uppercase tracking-[0.3em] text-gold italic">Escaneando Infraestructura...</p>
            </div>
        `;
    }

    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) throw error;

        if (dynamicContent) dynamicContent.innerHTML = '';

        buckets.forEach(bucket => {
            const div = document.createElement('div');
            div.className = "panel p-8 animate-fade-up group hover:border-gold/30 transition-all flex flex-col items-center text-center cursor-pointer relative overflow-hidden";
            div.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div class="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center text-gold border border-gold/10 group-hover:bg-gold group-hover:text-[#004d98] transition-all mb-6">
                    <i class="fas fa-database text-3xl"></i>
                </div>
                
                <h4 class="text-lg font-black italic text-white uppercase tracking-tighter mb-2 group-hover:text-gold transition-colors">${bucket.name}</h4>
                <div class="flex items-center gap-2 mb-6">
                    <span class="px-3 py-1 bg-white/5 text-white/40 text-[0.6rem] font-black uppercase tracking-widest rounded-lg border border-white/5">
                        ${bucket.public ? 'Público' : 'Privado'}
                    </span>
                </div>
                
                <button class="w-full py-3 bg-white/5 text-white/40 group-hover:bg-gold group-hover:text-[#004d98] text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-gold/5">
                    EXPLORAR CONTENIDO
                </button>
            `;
            div.onclick = () => loadBucketFiles(bucket.id, dynamicContent, pageTitle, mainTitle);
            if (dynamicContent) dynamicContent.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        if (dynamicContent) dynamicContent.innerHTML = `<div class="p-10 text-center text-red-500 font-black uppercase text-xs col-span-full">Error: ${err.message}</div>`;
    }
}

async function loadBucketFiles(bucketId, dynamicContent, pageTitle, mainTitle) {
    if (pageTitle) pageTitle.innerHTML = `Bucket: <span class="text-gold">${bucketId}</span>`;
    
    if (dynamicContent) {
        dynamicContent.innerHTML = `
            <div class="col-span-full flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <button id="back-to-buckets" class="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl text-white/40 hover:text-gold hover:bg-white/10 transition-all group">
                    <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                    <span class="text-[0.6rem] font-black uppercase tracking-widest">VOLVER A BUCKETS</span>
                </button>
                <div class="hidden sm:flex items-center gap-2 text-white/20 text-[0.6rem] font-black uppercase tracking-widest">
                    <i class="fas fa-folder-open"></i> Sincronizando Archivos...
                </div>
            </div>
            <div id="inner-files-grid" class="contents"></div>
        `;

        document.getElementById('back-to-buckets')?.addEventListener('click', () => {
            loadStorageBuckets(dynamicContent, pageTitle, mainTitle, (id) => {});
        });
    }

    try {
        const { data: files, error } = await supabase.storage.from(bucketId).list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        });

        if (error) throw error;

        const filesGrid = document.getElementById("inner-files-grid");
        if (!filesGrid) return;

        if (files.length === 0) {
            filesGrid.innerHTML = '<div class="p-20 text-center col-span-full text-white/20 font-black uppercase text-xs italic tracking-[0.3em]">Este bucket está vacío</div>';
            return;
        }

        files.forEach(file => {
            const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            const isDoc = file.name.match(/\.(pdf|doc|docx|xls|xlsx)$/i);
            
            const div = document.createElement('div');
            div.className = "panel p-5 animate-fade-up group hover:border-gold/30 transition-all flex flex-col items-center text-center cursor-pointer relative overflow-hidden";
            div.innerHTML = `
                <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-gold/10 group-hover:text-gold transition-all mb-4 border border-white/5">
                    <i class="fas ${isImage ? 'fa-image' : isDoc ? 'fa-file-pdf' : 'fa-file'} text-lg"></i>
                </div>
                <p class="text-[0.6rem] font-bold text-white/40 group-hover:text-white transition-all break-all line-clamp-2 uppercase tracking-tight">${file.name}</p>
            `;
            filesGrid.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        if (dynamicContent) dynamicContent.innerHTML = `<div class="p-10 text-center text-red-500 font-black uppercase text-xs col-span-full">Error: ${err.message}</div>`;
    }
}
