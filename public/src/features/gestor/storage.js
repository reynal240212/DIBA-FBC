/**
 * DIBA FBC - Gestor Storage Module (Robust Supabase Admin Style)
 */
import { supabase } from '../../core/supabase.js';

export async function loadStorageBuckets(dynamicContent, pageTitle, setActiveFilter) {
    if (!dynamicContent) return;
    
    if (pageTitle) pageTitle.innerHTML = 'Explorador <span class="text-gold">Cloud</span>';
    setActiveFilter('filter-club-btn');
    
    // Set List Layout
    dynamicContent.className = "flex flex-col gap-4 w-full";
    dynamicContent.innerHTML = `
        <div class="col-span-full mb-6">
            <div class="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/20">
                <div class="flex-1 w-1/4">Nombre</div>
                <div class="hidden md:block w-1/6 text-center">Políticas</div>
                <div class="hidden lg:block w-1/4 text-center">Límite de Tamaño</div>
                <div class="hidden lg:block w-1/4 text-center">Tipos Permitidos</div>
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

        // Fallback: Si el API está restringido, forzamos los buckets conocidos del proyecto
        const knownBuckets = [
            { id: 'documents', name: 'documents', public: true, file_size_limit: 52428800, allowed_mime_types: [] },
            { id: 'statuses', name: 'statuses', public: true, file_size_limit: 52428800, allowed_mime_types: [] },
            { id: 'asistencia-fotos', name: 'asistencia-fotos', public: true, file_size_limit: 52428800, allowed_mime_types: [] }
        ];

        // Mezclar buckets reales con conocidos para asegurar visibilidad
        knownBuckets.forEach(kb => {
            if (!buckets.find(b => b.id === kb.id)) buckets.push(kb);
        });

        const rowsContainer = document.getElementById('buckets-rows');
        if (!rowsContainer) return;
        
        rowsContainer.innerHTML = '';

        if (!buckets || buckets.length === 0) {
            rowsContainer.innerHTML = '<div class="p-10 text-center text-white/20 font-black uppercase text-xs italic">No hay buckets disponibles</div>';
            return;
        }

        buckets.forEach(bucket => {
            const sizeLimit = bucket.file_size_limit ? `${(bucket.file_size_limit / 1024 / 1024).toFixed(0)} MB` : 'No definido (50 MB)';
            const mimeTypes = bucket.allowed_mime_types && bucket.allowed_mime_types.length > 0 ? bucket.allowed_mime_types.join(', ') : 'CUALQUIERA';
            
            const div = document.createElement('div');
            div.className = "panel p-5 group hover:border-gold/30 transition-all cursor-pointer flex items-center relative overflow-hidden bg-white/[0.01]";
            div.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div class="flex-1 w-1/4 flex items-center gap-5">
                    <div class="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/10 group-hover:bg-gold group-hover:text-[#004d98] transition-all">
                        <i class="fas fa-folder-closed"></i>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm font-black italic text-white uppercase tracking-tighter group-hover:text-gold transition-colors">${bucket.name}</span>
                        <span class="text-[0.55rem] font-bold text-white/20 uppercase tracking-widest">${bucket.public ? 'PÚBLICO' : 'PRIVADO'}</span>
                    </div>
                </div>

                <div class="hidden md:block w-1/6 text-center">
                    <span class="px-3 py-1 rounded bg-white/5 text-white/40 text-[0.6rem] font-black">ACTIVA</span>
                </div>

                <div class="hidden lg:block w-1/4 text-center">
                    <span class="text-[0.6rem] font-black uppercase tracking-widest text-white/30 italic">${sizeLimit}</span>
                </div>

                <div class="hidden lg:block w-1/4 text-center">
                    <span class="text-[0.55rem] font-black uppercase tracking-widest text-gold/40 truncate">${mimeTypes}</span>
                </div>

                <div class="w-10 text-right">
                    <i class="fas fa-chevron-right text-white/10 group-hover:text-gold group-hover:translate-x-1 transition-all"></i>
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
        <div class="col-span-full border border-white/5 rounded-[2rem] overflow-hidden bg-white/[0.01]">
            <div class="p-6 border-b border-white/5 flex items-center justify-between flex-wrap gap-4">
                <button id="back-to-buckets" class="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl text-white/40 hover:text-gold hover:bg-white/10 transition-all group">
                    <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform text-xs"></i>
                    <span class="text-[0.6rem] font-black uppercase tracking-widest">VOLVER</span>
                </button>
                
                <div class="flex items-center gap-4">
                    <span class="text-[0.6rem] font-black uppercase tracking-widest text-white/20 italic">Visualización por Grilla</span>
                    <div class="flex bg-white/5 p-1 rounded-xl">
                        <button class="w-8 h-8 rounded-lg bg-gold text-[#004d98] flex items-center justify-center shadow-lg"><i class="fas fa-grid-2 text-xs"></i></button>
                        <button class="w-8 h-8 rounded-lg text-white/20 flex items-center justify-center"><i class="fas fa-list-ul text-xs"></i></button>
                    </div>
                </div>
            </div>

            <div id="inner-files-grid" class="p-8 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6">
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
                // Dummy setActiveFilter inside back navigation if needed
                const btn = document.getElementById(id);
                if (btn) btn.click(); 
            });
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

        if (!files || files.length === 0) {
            filesGrid.innerHTML = '<div class="p-20 text-center col-span-full text-white/10 font-black uppercase text-xs italic tracking-[0.4em]">Carpeta Vacía</div>';
            return;
        }

        filesGrid.innerHTML = '';
        files.forEach(file => {
            const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            const isDoc = file.name.match(/\.(pdf|doc|docx|xls|xlsx)$/i);
            
            const div = document.createElement('div');
            div.className = "panel p-5 animate-fade-up group hover:border-gold/30 transition-all flex flex-col items-center text-center cursor-pointer relative overflow-hidden bg-white/[0.01]";
            div.innerHTML = `
                <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-gold/10 group-hover:text-gold transition-all mb-4 border border-white/5">
                    <i class="fas ${isImage ? 'fa-image' : isDoc ? 'fa-file-pdf' : 'fa-file'} text-lg"></i>
                </div>
                <p class="text-[0.6rem] font-bold text-white/40 group-hover:text-white transition-all break-all line-clamp-2 uppercase tracking-tight">${file.name}</p>
                <div class="absolute bottom-0 left-0 w-full h-1 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            `;
            filesGrid.appendChild(div);
        });
    } catch (err) {
        console.error("loadBucketFiles error:", err);
        if (dynamicContent) dynamicContent.innerHTML = `<div class="p-10 text-center text-red-500 font-black uppercase text-xs col-span-full">Error: ${err.message}</div>`;
    }
}
