/**
 * DIBA FBC - Gestor Storage Module (Reorganized)
 */
import { supabase } from '../../core/supabase.js';

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

    try {
        let { data: buckets, error } = await supabase.storage.listBuckets();
        if (error || !buckets || buckets.length === 0) {
            buckets = [
                { id: 'documents', name: 'documents', public: true },
                { id: 'asistencia-fotos', name: 'asistencia-fotos', public: true }
            ];
        }

        const bucketsContainer = document.getElementById("buckets-container");
        bucketsContainer.innerHTML = '';
        buckets.forEach(bucket => {
            const card = document.createElement('div');
            card.className = `p-6 glass border border-white/5 rounded-[2rem] hover:shadow-2xl transition-all cursor-pointer group flex items-center gap-4 ${currentBucket === bucket.id ? 'border-gold bg-gold/5' : ''}`;
            card.onclick = () => {
                currentBucket = bucket.id;
                loadStorageBuckets(dynamicContent, pageTitle, mainTitle, setActiveFilter);
            };
            card.innerHTML = `
                <div class="w-12 h-12 ${currentBucket === bucket.id ? 'bg-gold text-blue-900 shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 'bg-white/5 text-slate-400'} rounded-2xl flex items-center justify-center text-xl transition-all">
                    <i class="fas fa-archive"></i>
                </div>
                <div><h4 class="font-black text-white text-xs uppercase italic tracking-tight">${bucket.name}</h4></div>
            `;
            bucketsContainer.appendChild(card);
        });

        loadFilesFromBucket(currentBucket);
    } catch (err) { console.error(err); }
}

export async function loadFilesFromBucket(bucketId, path = '') {
    const fileListContainer = document.getElementById("fileListContainer");
    if (!fileListContainer) return;
    fileListContainer.innerHTML = '<div class="flex justify-center py-20 col-span-full"><i class="fas fa-circle-notch animate-spin text-3xl text-dibaGold"></i></div>';

    try {
        const { data: files, error } = await supabase.storage.from(bucketId).list(path, { limit: 100 });
        if (error) throw error;
        fileListContainer.innerHTML = '';

        if (path) {
            const backDiv = document.createElement('div');
            backDiv.className = "col-span-full mb-4";
            backDiv.innerHTML = `<button class="text-dibaGold font-black uppercase italic" onclick="window.openSubFolder('${path.split('/').slice(0, -1).join('/')}')">Volver</button>`;
            fileListContainer.appendChild(backDiv);
        }

        const filePaths = files.filter(f => f.id !== undefined || f.metadata).map(f => path ? `${path}/${f.name}` : f.name);
        let signedUrls = {};
        if (filePaths.length > 0) {
            const { data } = await supabase.storage.from(bucketId).createSignedUrls(filePaths, 3600);
            data?.forEach(item => signedUrls[item.path] = item.signedUrl);
        }

        files.forEach(file => {
            if (file.name === '.emptyFolderPlaceholder') return;
            const isFolder = !file.id && !file.metadata;
            const fullPath = path ? `${path}/${file.name}` : file.name;
            const fileUrl = signedUrls[fullPath] || '#';

            const div = document.createElement('div');
            div.className = "p-6 glass rounded-[2rem] hover:shadow-2xl transition-all animate__animated animate__fadeIn group";
            div.innerHTML = `
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 ${isFolder ? 'bg-gold/10 text-gold' : 'bg-white/5 text-slate-400'} rounded-2xl flex items-center justify-center"><i class="fas ${isFolder ? 'fa-folder' : 'fa-file-alt'} text-xl"></i></div>
                    <h4 class="font-black text-white text-xs uppercase italic">${file.name}</h4>
                </div>
                <div class="pt-4 border-t border-white/5 mt-auto">
                    ${isFolder ? `<button onclick="window.openSubFolder('${fullPath}')" class="w-full py-3 bg-gold text-blue-900 font-black rounded-xl uppercase italic text-[10px] tracking-widest shadow-lg">Abrir</button>` : `<a href="${fileUrl}" target="_blank" class="w-full py-3 border border-white/10 block text-center rounded-xl text-white font-black uppercase italic text-[10px] tracking-widest hover:border-gold hover:text-gold transition-all">Ver</a>`}
                </div>
            `;
            fileListContainer.appendChild(div);
        });
    } catch (err) { console.error(err); }
}

window.openSubFolder = (path) => loadFilesFromBucket(currentBucket, path);
