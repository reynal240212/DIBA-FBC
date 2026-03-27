/**
 * DIBA FBC - Public Matches Feature
 * Handles the dynamic match banner and related content.
 */
import { supabase } from '../../core/supabase.js';

function formatFecha(fechaStr) {
    if (!fechaStr) return '';
    // Normaliza: toma solo la parte de fecha (YYYY-MM-DD) y agrega mediodía UTC para evitar desfase
    const parteDate = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const [year, month, day] = parteDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Fecha local, sin zona horaria
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export async function initMatchBanner() {
    const dynamicContainer = document.getElementById("dynamic-match-banner-container");
    const titleContainer = document.getElementById("banner-title-container");
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

        // Limpiar contenedores
        dynamicContainer.innerHTML = '';
        if (titleContainer) titleContainer.innerHTML = '';

        if (isFuture && titleContainer) {
            titleContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center animate__animated animate__fadeIn">
                    <span class="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1">Próximos Encuentros</span>
                    <h2 class="text-white font-black text-lg sm:text-xl uppercase tracking-tight">${formatFecha(displayMatches[0].fecha)}</h2>
                    <div class="w-12 h-1 bg-amber-500 mt-2 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                </div>
            `;
        } else if (titleContainer) {
            titleContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center animate__animated animate__fadeIn">
                    <span class="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-1">Partidos de Hoy</span>
                    <h2 class="text-white font-black text-lg sm:text-xl uppercase tracking-tight">${formatFecha(targetDate)}</h2>
                    <div class="w-12 h-1 bg-red-500 mt-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                </div>
            `;
        }

        displayMatches.forEach((p, idx) => {
            const card = renderMatchCard(p);
            card.style.animationDelay = `${idx * 0.1}s`;
            dynamicContainer.appendChild(card);
        });

        setupScroll(dynamicContainer);

    } catch (err) {
        console.error("Match banner error:", err);
        if (loadingStatus) loadingStatus.innerHTML = `<span class="text-red-400 text-xs font-black uppercase tracking-widest">Error de Conexión</span>`;
    }
}

function renderMatchCard(p) {
    const card = document.createElement("div");
    card.className = "flex-none w-[85vw] max-w-[360px] sm:w-[380px] snap-center bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-5 sm:p-6 flex flex-col gap-5 hover:bg-slate-800/60 hover:border-amber-500/30 transition-all duration-500 group/card relative overflow-hidden shadow-2xl animate__animated animate__fadeInUp";
    
    const today = new Date().toISOString().split('T')[0];
    const targetDate = p.fecha?.includes('T') ? p.fecha.split('T')[0] : p.fecha;
    const esHoy = targetDate === today;
    const tieneResultado = p.resultado && p.resultado !== '' && p.resultado !== '-' && p.resultado !== 'Pendiente';

    let statusBadge = '';
    if (tieneResultado) {
        statusBadge = '<span class="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Finalizado</span>';
    } else if (esHoy) {
        statusBadge = '<span class="bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]"><span class="w-1.5 h-1.5 bg-white rounded-full"></span> EN VIVO</span>';
    } else {
        statusBadge = '<span class="bg-blue-500/10 text-blue-400 text-[9px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">Programado</span>';
    }

    const escudoImg = (url, name) => {
        if (name?.toUpperCase().includes('DIBA')) return "images/ESCUDO.png";
        if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'R')}&background=0f172a&color=f59e0b&bold=true&font-size=0.55`;
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=100&h=100&fit=contain&default=https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'R')}&background=0f172a&color=f59e0b`;
    };

    card.innerHTML = `
        <!-- Glow effect -->
        <div class="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-[80px] group-hover/card:bg-amber-500/20 transition-all duration-700"></div>
        <div class="absolute -bottom-20 -left-20 w-44 h-44 bg-blue-500/5 rounded-full blur-[80px] group-hover/card:bg-blue-500/10 transition-all duration-700"></div>

        <div class="flex items-center justify-between relative z-10">
            <div class="bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">CAT. ${p.categoria || 'GENERAL'}</span>
            </div>
            ${statusBadge}
        </div>

        <div class="flex items-center justify-between gap-2 w-full relative z-10 py-2">
            <!-- Local -->
            <div class="flex flex-col items-center w-[38%] group/team">
                <div class="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-3">
                    <div class="absolute inset-0 bg-white/5 rounded-full blur-2xl group-hover/card:scale-125 transition-all duration-700"></div>
                    <img src="${escudoImg(p.escudo_local || p.escudo, p.equipolocal)}" 
                         class="w-full h-full object-contain relative z-10 drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)] group-hover/card:scale-110 transition-transform duration-500" 
                         onerror="this.src='images/ESCUDO.png'">
                </div>
                <span class="text-white font-black text-xs sm:text-sm uppercase text-center line-clamp-2 leading-tight tracking-tight group-hover/team:text-amber-400 transition-colors">${p.equipolocal || 'DIBA FBC'}</span>
            </div>

            <!-- VS / Score -->
            <div class="flex flex-col items-center justify-center w-[24%]">
                ${tieneResultado 
                    ? `<span class="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">${p.resultado}</span>`
                    : `<div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1">
                         <span class="text-amber-500 font-black text-xs italic">VS</span>
                       </div>
                       <span class="text-white font-black text-lg tracking-tight">${p.hora || '--:--'}</span>`
                }
            </div>

            <!-- Visitante -->
            <div class="flex flex-col items-center w-[38%] group/team">
                <div class="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-3">
                    <div class="absolute inset-0 bg-white/5 rounded-full blur-2xl group-hover/card:scale-125 transition-all duration-700"></div>
                    <img src="${escudoImg(p.escudo_visitante, p.equipovisitante)}" 
                         class="w-full h-full object-contain relative z-10 drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)] group-hover/card:scale-110 transition-transform duration-500" 
                         onerror="this.src='${escudoImg(null, p.equipovisitante)}'">
                </div>
                <span class="text-white font-black text-xs sm:text-sm uppercase text-center line-clamp-2 leading-tight tracking-tight group-hover/team:text-amber-400 transition-colors">${p.equipovisitante || 'Rival'}</span>
            </div>
        </div>

        <div class="mt-auto pt-4 border-t border-white/5 flex flex-col gap-3 relative z-10">
            <div class="flex items-center justify-center gap-4">
                <div class="flex items-center gap-2 group/info">
                    <div class="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center group-hover/info:bg-red-500/20 transition-colors">
                        <i class="fas fa-map-marker-alt text-[10px] text-red-400"></i>
                    </div>
                    <span class="text-[10px] font-bold text-slate-300 uppercase tracking-tight line-clamp-1">${p.Cancha || 'Cancha TBD'}</span>
                </div>
                <div class="flex items-center gap-2 group/info">
                    <div class="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center group-hover/info:bg-sky-500/20 transition-colors">
                        <i class="fas fa-trophy text-[10px] text-sky-400"></i>
                    </div>
                    <span class="text-[10px] font-bold text-slate-300 uppercase tracking-tight line-clamp-1">${p.descripcion || 'Torneo'}</span>
                </div>
            </div>
            
            <a href="partidos.html" class="w-full py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 hover:shadow-[0_8px_20px_-5px_rgba(245,158,11,0.5)] transition-all duration-500 active:scale-95">
                Ver Detalles <i class="fas fa-arrow-right-long animate-bounce-x"></i>
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
