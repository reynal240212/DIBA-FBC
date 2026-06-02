/**
 * DIBA FBC - Public Players Feature
 */
import { supabase } from '../../core/supabase.js';
import { openPlayerModal } from '../../core/loader.js';

export async function initPublicPlayers() {
    const container = document.getElementById("players-container");
    if (!container) return;

    container.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-20 opacity-50"><i class="fas fa-circle-notch animate-spin text-4xl text-amber-500 mb-4"></i><p class="text-[10px] font-black uppercase tracking-widest text-slate-500">Cargando Plantilla Oficial...</p></div>`;

    try {
        const { data: jugadores, error } = await supabase
            .from('identificacion')
            .select('nombre, apellidos, categoria, foto_url, fecha_nacimiento, numero')
            .order('apellidos');

        if (error) throw error;
        if (!jugadores?.length) {
            container.innerHTML = '<p class="text-center py-16 col-span-full uppercase text-xs font-black italic">No hay jugadores registrados.</p>';
            return;
        }

        renderPlayers(container, jugadores);
    } catch (err) {
        console.error('Players load error:', err);
        container.innerHTML = `<div class="col-span-full py-20 text-center uppercase text-red-500 font-black">Error de Sincronización</div>`;
    }
}

function renderPlayers(container, list) {
    const grouped = groupBy(list, j => {
        let cat = j.categoria || 'General';
        if (cat === 'General' && j.fecha_nacimiento) {
            const year = new Date(j.fecha_nacimiento).getUTCFullYear();
            if (year === 2012) return '2012';
            if (year === 2013) return '2013';
            if (year >= 2014) return '2014+';
        }
        return cat;
    });

    container.innerHTML = '';
    Object.keys(grouped).sort().forEach(cat => {
        const section = document.createElement("section");
        section.className = "mb-24 w-full animate__animated animate__fadeIn";
        section.innerHTML = `
            <div class="flex items-center mb-12 px-4 group">
                <h2 class="text-3xl font-black text-white uppercase italic mr-8">Categoría ${cat}</h2>
                <div class="flex-grow h-[1px] bg-white/10"></div>
            </div>`;
        
        const grid = document.createElement("div");
        grid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 px-4";
        
        grouped[cat].forEach((j, i) => grid.appendChild(createPlayerCard(j, i)));
        section.appendChild(grid);
        container.appendChild(section);
    });
}

function createPlayerCard(j, i) {
    const card = document.createElement("article");
    card.className = "group bg-slate-900/30 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl hover:shadow-amber-500/10 hover:border-yellow-500/30 transition-all cursor-pointer animate__animated animate__fadeInUp";
    card.style.animationDelay = `${i * 0.05}s`;
    
    const name = `${j.nombre} ${j.apellidos}`;
    const img = j.foto_url || "images/ESCUDO.png";

    card.innerHTML = `
        <div class="aspect-[4/5] overflow-hidden bg-slate-950/40 relative">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 opacity-60 z-10"></div>
            <img src="${img}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy">
            <div class="absolute top-4 right-4 z-20">
                <div class="bg-white/10 backdrop-blur-xl rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <span class="text-[9px] font-black text-white">#${j.numero?.slice(-3) || '??'}</span>
                </div>
            </div>
        </div>
        <div class="p-5 text-center bg-transparent">
            <h3 class="text-sm font-black text-white uppercase leading-snug group-hover:text-amber-500 transition-colors">${name}</h3>
        </div>
    `;

    card.addEventListener('click', () => openPlayerModal(img, name));
    return card;
}

function groupBy(arr, fn) {
    return arr.reduce((acc, v) => {
        const k = fn(v);
        (acc[k] = acc[k] || []).push(v);
        return acc;
    }, {});
}

export async function initScorers() {
    const container = document.getElementById("goleadores-list");
    if (!container) return;

    try {
        const { data, error } = await supabase.from("goleadores").select("*").order("goles", { ascending: false });
        if (error) throw error;
        container.innerHTML = "";
        data.forEach(g => {
            const item = document.createElement("div");
            item.className = "flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-all";
            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${g.escudo_url || 'images/ESCUDO.png'}" class="w-8 h-8 object-contain">
                    <div>
                        <div class="text-sm font-bold text-white">${g.nombre_jugador}</div>
                        <div class="text-[10px] text-slate-400 uppercase">${g.equipo}</div>
                    </div>
                </div>
                <div class="bg-slate-800 text-amber-500 font-black py-1 px-3 rounded-lg text-xs">${g.goles}</div>
            `;
            container.appendChild(item);
        });
    } catch (err) {
        container.innerHTML = `<p class="text-center text-red-500 text-xs p-4">Error de conexión.</p>`;
    }
}
