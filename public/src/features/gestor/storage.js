/**
 * DIBA FBC - Gestor Storage Module (Refactored for Light Mode)
 */
import { supabase } from '../../core/supabase.js';

export async function loadStorageBuckets(dynamicContent, pageTitle, mainTitle, setActiveFilter) {
    if (pageTitle) pageTitle.innerHTML = 'Storage <span>Cloud</span>';
    if (mainTitle) mainTitle.innerHTML = 'Explorador de Archivos';
    setActiveFilter('filter-club-btn');
    
    dynamicContent.innerHTML = `
        <div class="p-12 animate-fade-up">
            <div id="storage-header" class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h3 class="text-2xl font-black text-[#003366] uppercase italic tracking-tight">Nube de Documentos</h3>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Explora los buckets de almacenamiento de Supabase</p>
                </div>
                <div class="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span class="text-[9px] font-black uppercase text-[#003366] tracking-widest">En Línea</span>
                    </div>
                </div>
            </div>
            <div id="bucketsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="flex flex-col items-center justify-center py-20 col-span-full opacity-30">
                    <i class="fas fa-circle-notch fa-spin text-3xl text-[#003366] mb-4"></i>
                    <p class="text-[10px] font-black uppercase tracking-widest">Escaneando Infraestructura...</p>
                </div>
            </div>
        </div>
    `;

    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) throw error;

        const bucketsList = document.getElementById("bucketsList");
        bucketsList.innerHTML = '';

        buckets.forEach(bucket => {
            const div = document.createElement('div');
            div.className = "group flex flex-col items-center justify-center p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-premium hover:shadow-2xl hover:border-[#FFD700] hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden";
            div.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative z-10 flex flex-col items-center text-center">
                    <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-[#003366] mb-6 group-hover:bg-[#FFD700]/10 transition-colors border border-slate-100 shadow-inner">
                        <i class="fas fa-database text-3xl"></i>
                    </div>
                    <h4 class="text-lg font-black text-[#003366] uppercase italic tracking-tight mb-2">${bucket.name}</h4>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-6">${bucket.public ? 'Bucket Público' : 'Bucket Privado'}</p>
                    <div class="px-6 py-2.5 bg-[#003366] text-white text-[9px] font-black uppercase italic tracking-widest rounded-xl shadow-lg shadow-[#003366]/20 opacity-0 group-hover:opacity-100 transition-all">
                        Explorar Bucket
                    </div>
                </div>
            `;
            div.onclick = () => loadBucketFiles(bucket.id, dynamicContent, pageTitle, mainTitle);
            bucketsList.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        document.getElementById("bucketsList").innerHTML = `<div class="p-10 text-center text-rose-500 font-black uppercase text-xs col-span-full">Error: ${err.message}</div>`;
    }
}

async function loadBucketFiles(bucketId, dynamicContent, pageTitle, mainTitle) {
    if (pageTitle) pageTitle.innerHTML = `Bucket <span>${bucketId}</span>`;
    
    dynamicContent.innerHTML = `
        <div class="p-12 animate-fade-up">
            <div class="flex items-center gap-4 mb-10">
                <button onclick="window.loadStorageBucketsGlobal()" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#003366] hover:bg-[#FFD700] hover:text-[#003366] transition-all border border-slate-100 shadow-sm group">
                    <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                </button>
                <div>
                    <h3 class="text-2xl font-black text-[#003366] uppercase italic tracking-tight">Archivos en ${bucketId}</h3>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Explora el contenido de este contenedor</p>
                </div>
            </div>
            <div id="filesGrid" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                <div class="flex justify-center py-20 col-span-full"><i class="fas fa-circle-notch animate-spin text-3xl text-[#003366]"></i></div>
            </div>
        </div>
    `;

    // Global helper for back button
    window.loadStorageBucketsGlobal = () => loadStorageBuckets(dynamicContent, pageTitle, mainTitle, (id) => {});

    try {
        const { data: files, error } = await supabase.storage.from(bucketId).list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        });

        if (error) throw error;

        const filesGrid = document.getElementById("filesGrid");
        filesGrid.innerHTML = '';

        if (files.length === 0) {
            filesGrid.innerHTML = '<div class="p-20 text-center col-span-full text-slate-400 font-black uppercase text-xs italic">Este bucket está vacío</div>';
            return;
        }

        files.forEach(file => {
            const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            const div = document.createElement('div');
            div.className = "group flex flex-col items-center bg-white p-6 rounded-3xl border border-slate-100 hover:border-[#FFD700] hover:shadow-premium transition-all cursor-pointer";
            div.innerHTML = `
                <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 group-hover:text-[#003366] group-hover:bg-[#FFD700]/10 transition-colors border border-slate-100 shadow-inner">
                    <i class="fas ${isImage ? 'fa-image' : 'fa-file-alt'} text-xl"></i>
                </div>
                <p class="text-[10px] font-bold text-[#003366] text-center line-clamp-2 break-all uppercase tracking-tighter">${file.name}</p>
            `;
            filesGrid.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        document.getElementById("filesGrid").innerHTML = `<div class="p-10 text-center text-rose-500 font-black uppercase text-xs col-span-full">Error: ${err.message}</div>`;
    }
}
