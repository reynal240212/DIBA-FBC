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
    card.className = "flex-none w-80 sm:w-96 snap-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-500 group/card relative overflow-hidden";
    
    const today = new Date().toISOString().split('T')[0];
    const targetDate = p.fecha?.includes('T') ? p.fecha.split('T')[0] : p.fecha;
    const esHoy = targetDate === today;
    const tieneResultado = p.resultado && p.resultado !== '' && p.resultado !== '-';

    let statusBadge = '';
    if (tieneResultado) {
        statusBadge = '<span class="bg-slate-700 text-slate-300 text-[8px] font-black px-2 py-0.5 rounded-full ring-1 ring-white/10 uppercase tracking-widest">Finalizado</span>';
    } else if (esHoy) {
        statusBadge = '<span class="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-500/20"><span class="w-1 h-1 bg-white rounded-full"></span> En Vivo</span>';
    } else {
        statusBadge = '<span class="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Próximo</span>';
    }

    const escudoImg = (url, name) => {
        if (name?.toUpperCase().includes('DIBA')) return "/images/ESCUDO.png";
        if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'R')}&background=1e293b&color=cbd5e1&bold=true`;
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'R')}&background=1e293b&color=cbd5e1`;
    };

    card.innerHTML = `
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover/card:bg-amber-500/10 transition-all duration-700"></div>

        <div class="flex items-center justify-between mb-1">
            <span class="text-[9px] font-black text-amber-500/80 uppercase tracking-[0.2em]">CAT. ${p.categoria || 'GENERAL'}</span>
            ${statusBadge}
        </div>

        <div class="flex items-center justify-between gap-4 w-full relative z-10">
            <div class="flex flex-col items-center w-[35%]">
                <div class="relative mb-3">
                    <div class="absolute inset-0 bg-white/5 rounded-full blur-xl scale-150 group-hover/card:bg-white/10 transition-all duration-700"></div>
                    <img src="${escudoImg(p.escudo_local || p.escudo, p.equipolocal)}" class="w-14 h-14 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover/card:scale-110 transition-transform duration-500" onerror="this.src='/images/ESCUDO.png'">
                </div>
                <span class="text-white font-black text-[10px] sm:text-[11px] uppercase text-center line-clamp-2 leading-tight tracking-tight">${p.equipolocal || 'DIBA FBC'}</span>
            </div>
            <div class="flex flex-col items-center justify-center w-[30%] px-1">
                <div class="mb-2 relative">
                    ${tieneResultado 
                        ? `<span class="text-2xl font-black text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">${p.resultado}</span>`
                        : `<div class="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg shadow-[0_4px_20px_-5px_rgba(245,158,11,0.5)] transform -rotate-2 group-hover/card:rotate-0 transition-all duration-500">${p.hora || 'VS'}</div>`
                    }
                </div>
                <span class="text-slate-400 text-[9px] font-bold text-center w-full truncate tracking-tighter uppercase opacity-60">${p.Cancha || 'Cancha'}</span>
            </div>
            <div class="flex flex-col items-center w-[35%]">
                <div class="relative mb-3">
                    <div class="absolute inset-0 bg-white/5 rounded-full blur-xl scale-150 group-hover/card:bg-white/10 transition-all duration-700"></div>
                    <img src="${escudoImg(p.escudo_visitante, p.equipovisitante)}" class="w-14 h-14 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover/card:scale-110 transition-transform duration-500" onerror="this.src='/images/ESCUDO.png'">
                </div>
                <span class="text-white font-black text-[10px] sm:text-[11px] uppercase text-center line-clamp-2 leading-tight tracking-tight">${p.equipovisitante || 'Rival'}</span>
            </div>
        </div>

        <div class="mt-2 flex items-center justify-between gap-4">
            <div class="flex items-center gap-1.5 opacity-40">
                <i class="fas fa-calendar-day text-[9px] text-amber-500"></i>
                <span class="text-[9px] font-bold text-white uppercase italic tracking-tighter">${targetDate}</span>
            </div>
            <a href="partidos.html" class="flex-grow inline-flex justify-center items-center gap-2 bg-white/5 hover:bg-amber-500 hover:text-slate-950 border border-white/5 py-2 rounded-xl text-[9px] font-black text-white uppercase tracking-[0.2em] transition-all duration-300">
                Ficha Técnica <i class="fas fa-chevron-right text-[8px]"></i>
            </a>
        </div>
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
