/**
 * DIBA FBC - Public Matches Feature
 * Handles the dynamic match banner and related content.
 */
import { supabase } from '../../core/supabase.js';

export async function initMatchBanner() {
    const dynamicContainer = document.getElementById("dynamic-match-banner-container");
    const loadingStatus = document.getElementById("banner-loading");
    if (!dynamicContainer) return;

    try {
        const today = new Date();
        const targetDate = today.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('partidos')
            .select('*')
            .gte('fecha', targetDate);

        if (error) throw error;

        const matches = (data || []).filter(p => p.fecha === targetDate);
        let displayMatches = matches;
        let isFuture = false;

        if (displayMatches.length === 0) {
            const futureMatches = (data || []).filter(p => p.fecha >= targetDate);
            if (futureMatches.length > 0) {
                const sorted = futureMatches.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                const nextDate = sorted[0].fecha;
                displayMatches = sorted.filter(p => p.fecha === nextDate);
                isFuture = true;
            }
        }

        if (loadingStatus) loadingStatus.style.display = 'none';

        if (displayMatches.length === 0) {
            dynamicContainer.innerHTML = `<div class="w-full text-center text-slate-400 text-sm py-4 italic">No hay partidos programados.</div>`;
            return;
        }

        dynamicContainer.innerHTML = '';
        if (isFuture) {
            const title = document.createElement("div");
            title.className = "w-full flex-none text-center text-amber-500 font-bold text-xs uppercase tracking-widest mb-2 snap-center";
            title.innerHTML = `PRÓXIMOS PARTIDOS: ${displayMatches[0].fecha}`;
            dynamicContainer.appendChild(title);
        }

        displayMatches.forEach(p => {
            const card = renderMatchCard(p);
            dynamicContainer.appendChild(card);
        });

        setupScroll(dynamicContainer);

    } catch (err) {
        console.error("Match banner error:", err);
        if (loadingStatus) loadingStatus.innerHTML = `<span class="text-red-400 text-xs">Error cargando.</span>`;
    }
}

function renderMatchCard(p) {
    const card = document.createElement("div");
    card.className = "flex-none w-80 sm:w-96 snap-center bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-all";
    
    const escudoImg = (url, name) => {
        if (name?.toUpperCase().includes('DIBA')) return "/images/ESCUDO.png";
        if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'R')}&background=1e293b&color=cbd5e1&bold=true`;
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'R')}&background=1e293b&color=cbd5e1`;
    };

    card.innerHTML = `
        <div class="flex items-center justify-between gap-4 w-full">
            <div class="flex flex-col items-center w-1/3">
                <img src="${escudoImg(p.escudo_local || p.escudo, p.equipolocal)}" class="w-12 h-12 object-contain mb-2 img-drop-shadow" onerror="this.src='/images/ESCUDO.png'">
                <span class="text-white font-bold text-[10px] sm:text-xs uppercase text-center line-clamp-2">${p.equipolocal || 'DIBA FBC'}</span>
            </div>
            <div class="flex flex-col items-center justify-center w-1/3">
                <span class="bg-amber-500 text-slate-900 text-[9px] font-black uppercase px-2 py-0.5 rounded mb-1">${p.hora || 'VS'}</span>
                <span class="text-slate-400 text-[9px] font-bold text-center truncate w-full">${p.Cancha || 'Cancha'}</span>
            </div>
            <div class="flex flex-col items-center w-1/3">
                <img src="${escudoImg(p.escudo_visitante, p.equipovisitante)}" class="w-12 h-12 object-contain mb-2 img-drop-shadow" onerror="this.src='/images/ESCUDO.png'">
                <span class="text-white font-bold text-[10px] sm:text-xs uppercase text-center line-clamp-2">${p.equipovisitante || 'Rival'}</span>
            </div>
        </div>
        <div class="flex items-center justify-between mt-1">
            <span class="text-[9px] font-black text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full">CAT. ${p.categoria || 'GENERAL'}</span>
            <span class="text-[9px] font-bold text-slate-500 italic">DIBA FBC "Fuerza y Lealtad"</span>
        </div>
        <a href="partidos.html" class="w-full mt-2 inline-flex justify-center items-center gap-2 bg-slate-900/50 hover:bg-amber-500 hover:text-slate-900 border border-white/5 py-1.5 rounded-xl text-[10px] font-black text-white uppercase transition-all">
            Ver Detalles <i class="fas fa-external-link-alt text-[9px]"></i>
        </a>
    `;
    return card;
}

function setupScroll(el) {
    let isDown = false, startX, scrollLeft;
    el.addEventListener('mousedown', (e) => {
        isDown = true; el.classList.remove('snap-x', 'snap-mandatory');
        startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => { isDown = false; el.classList.add('snap-x', 'snap-mandatory'); });
    el.addEventListener('mouseup', () => { isDown = false; el.classList.add('snap-x', 'snap-mandatory'); });
    el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        el.scrollLeft = scrollLeft - (x - startX) * 2;
    });
}
