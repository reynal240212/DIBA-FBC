/**
 * DIBA FBC - Gestor Storage Module (El Optimizador)
 * Handles universal storage exploration and bucket listing.
 */
import { supabase } from './supabaseClient.js';

let currentBucket = 'documents';

export async function loadStorageBuckets(dynamicContent, pageTitle, mainTitle, setActiveFilter) {
    if (pageTitle) pageTitle.innerHTML = 'Storage <span>Universal</span>';
    if (mainTitle) mainTitle.innerHTML = 'Storage Universal';
    
    setActiveFilter('filter-club-btn');
    dynamicContent.innerHTML = `
        <div id="buckets-container" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate__animated animate__fadeIn">
            <div class="flex justify-center py-10 col-span-full"><i class="fas fa-circle-notch animate-spin text-2xl text-dibaGold"></i></div>
        </div>
        <div id="fileListContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    `;

    const bucketsContainer = document.getElementById("buckets-container");

    try {
        let { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error || !buckets || buckets.length === 0) {
            buckets = [
                { id: 'documents', name: 'documents', public: true },
                { id: 'asistencia-fotos', name: 'asistencia-fotos', public: true },
                { id: 'statuses', name: 'statuses', public: true }
            ];
        }

        bucketsContainer.innerHTML = '';
        buckets.forEach(bucket => {
            const card = document.createElement('div');
            card.className = `p-6 bg-white border border-slate-200 rounded-[2rem] hover:shadow-xl transition-all cursor-pointer group flex items-center gap-4 ${currentBucket === bucket.id ? 'border-dibaGold bg-yellow-50/10' : ''}`;
            card.onclick = () => {
                currentBucket = bucket.id;
                loadStorageBuckets(dynamicContent, pageTitle, mainTitle, setActiveFilter);
            };
            card.innerHTML = `
                <div class="w-12 h-12 ${currentBucket === bucket.id ? 'bg-dibaGold text-blue-900 border-dibaGold' : 'bg-slate-50 text-slate-400 group-hover:bg-dibaGold/10 group-hover:text-dibaGold'} rounded-2xl flex items-center justify-center text-xl transition-all">
                    <i class="fas fa-archive"></i>
                </div>
                <div>
                    <h4 class="font-black text-slate-800 text-xs uppercase italic tracking-tight mb-1">${bucket.name}</h4>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${bucket.public ? 'Público' : 'Privado'}</p>
                </div>
            `;
            bucketsContainer.appendChild(card);
        });

        loadFilesFromBucket(currentBucket);

    } catch (err) {
        console.error(err);
        bucketsContainer.innerHTML = `<p class="text-rose-500 font-bold uppercase text-[10px] text-center col-span-full">Error: ${err.message}</p>`;
    }
}

export async function loadFilesFromBucket(bucketId, path = '') {
    const fileListContainer = document.getElementById("fileListContainer");
    if (!fileListContainer) return;

    fileListContainer.innerHTML = '<div class="flex justify-center py-20 col-span-full"><i class="fas fa-circle-notch animate-spin text-3xl text-dibaGold"></i></div>';

    try {
        const { data: files, error } = await supabase.storage.from(bucketId).list(path, {
            limit: 100,
            sortBy: { column: 'name', order: 'desc' }
        });

        if (error) throw error;
        fileListContainer.innerHTML = '';

        if (path) {
            const backDiv = document.createElement('div');
            backDiv.className = "col-span-full mb-4";
            backDiv.innerHTML = `
                <button class="flex items-center gap-2 text-[10px] font-black uppercase italic text-dibaGold hover:text-white transition-all bg-white/5 px-6 py-2 rounded-full border border-dibaGold/20" 
                        onclick="window.openSubFolder('${path.split('/').slice(0, -1).join('/')}')">
                    <i class="fas fa-chevron-left"></i> Volver
                </button>
            `;
            fileListContainer.appendChild(backDiv);
        }

        if (!files || files.length === 0) {
            fileListContainer.innerHTML += `<p class="text-center text-slate-400 py-10 uppercase text-[10px] font-black italic tracking-widest col-span-full">Carpeta vacía</p>`;
            return;
        }

        // --- OPTIMIZACIÓN: Batch Signed URLs ---
        const filePaths = files.filter(f => f.id !== undefined || f.metadata).map(f => path ? `${path}/${f.name}` : f.name);
        let signedUrls = {};
        
        if (filePaths.length > 0) {
            const { data, error: sError } = await supabase.storage.from(bucketId).createSignedUrls(filePaths, 3600);
            if (!sError) {
                data.forEach(item => {
                    signedUrls[item.path] = item.signedUrl;
                });
            }
        }

        files.forEach(file => {
            if (file.name === '.emptyFolderPlaceholder') return;
            const isFolder = file.id === undefined && !file.metadata;
            const fullPath = path ? `${path}/${file.name}` : file.name;
            const fileUrl = signedUrls[fullPath] || '#';
            const isImg = !isFolder && /\.(jpg|jpeg|png|gif)$/i.test(file.name);

            const div = document.createElement('div');
            div.className = `flex flex-col p-6 bg-white border border-slate-200 rounded-[2rem] hover:shadow-xl transition-all animate__animated animate__fadeIn group`;
            div.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 ${isFolder ? 'bg-blue-50 text-dibaBlue' : 'bg-slate-50 text-slate-400'} rounded-2xl flex items-center justify-center group-hover:bg-dibaGold/10 group-hover:text-dibaGold transition-colors">
                        <i class="fas ${isFolder ? 'fa-folder' : (isImg ? 'fa-image' : 'fa-file-alt')} text-xl"></i>
                    </div>
                </div>
                <div>
                    <h4 class="font-black text-slate-800 text-xs uppercase italic tracking-tight line-clamp-1 mb-1">${file.name}</h4>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                        ${isFolder ? 'Carpeta' : `${(file.metadata.size / 1024).toFixed(1)} KB`}
                    </p>
                </div>
                <div class="pt-4 border-t border-slate-50 mt-auto">
                    ${isFolder ? `
                        <button onclick="window.openSubFolder('${fullPath}')" class="w-full py-3 flex items-center justify-center gap-2 bg-dibaBlue text-white text-[10px] font-black uppercase italic rounded-xl hover:bg-dibaGold hover:text-dibaBlue transition-all">
                            <i class="fas fa-folder-open"></i> Abrir
                        </button>
                    ` : `
                        <a href="${fileUrl}" target="_blank" class="w-full py-3 flex items-center justify-center gap-2 bg-white border border-slate-200 text-dibaBlue text-[10px] font-black uppercase italic rounded-xl hover:bg-dibaGold hover:border-dibaGold transition-all">
                            <i class="fas fa-eye"></i> Ver
                        </a>
                    `}
                </div>
            `;
            fileListContainer.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        fileListContainer.innerHTML = `<p class="text-rose-500 font-bold uppercase text-[10px] text-center col-span-full">Error: ${err.message}</p>`;
    }
}

window.openSubFolder = (path) => {
    loadFilesFromBucket(currentBucket, path);
};
