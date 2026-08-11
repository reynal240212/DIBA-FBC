/**
 * DIBA FBC - Public Matches & Trainings Feature
 * Handles the dynamic schedule banner for matches and training sessions.
 */
import { supabase } from '../../core/supabase.js';
import { formatearFechaLarga, getEscudoUrl } from '../../core/utils.js';

export async function initMatchBanner() {
    const dynamicContainer = document.getElementById("dynamic-match-banner-container");
    const titleContainer = document.getElementById("banner-title-container");
    const loadingStatus = document.getElementById("banner-loading");
    if (!dynamicContainer) return;

    try {
        const today = new Date();
        const targetDate = today.toISOString().split('T')[0];

        // Fecha hace 30 días para mostrar también la programación reciente
        const hace30Dias = new Date(today);
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        const desde = hace30Dias.toISOString().split('T')[0];

        // Obtener partidos y entrenamientos en paralelo
        // Solo cols necesarias + filtro de fecha para no descargar todo el historial
        const PARTIDOS_COLS = 'id, fecha, hora, equipolocal, equipovisitante, resultado, categoria, Cancha, descripcion, escudo_local, escudo_visitante, escudo';
        const ENTRENOS_COLS = 'id, fecha, hora, titulo, categoria, lugar';

        const [partidosRes, entrenamientosRes] = await Promise.all([
            supabase.from('partidos').select(PARTIDOS_COLS)
                .gte('fecha', desde)
                .order('fecha', { ascending: true })
                .limit(50),
            supabase.from('entrenamientos').select(ENTRENOS_COLS)
                .gte('fecha', desde)
                .order('fecha', { ascending: true })
                .limit(50)
        ]);

        if (partidosRes.error) throw partidosRes.error;

        const partidos = (partidosRes.data || []).map(p => ({
            ...p,
            isTraining: false,
            dateOnly: p.fecha?.includes('T') ? p.fecha.split('T')[0] : (p.fecha || '')
        }));

        const entrenamientos = (entrenamientosRes.data || []).map(e => ({
            ...e,
            isTraining: true,
            equipolocal: 'DIBA FBC',
            equipovisitante: 'ENTRENAMIENTO',
            Cancha: e.lugar || 'Parque La Pradera',
            categoria: e.categoria || 'GENERAL',
            dateOnly: e.fecha?.includes('T') ? e.fecha.split('T')[0] : (e.fecha || '')
        }));

        // Combinar todos los eventos
        const allEvents = [...partidos, ...entrenamientos];

        // 1. Buscar eventos de hoy
        let displayEvents = allEvents.filter(e => e.dateOnly === targetDate);
        let isFuture = false;
        let isRecent = false;

        // 2. Si no hay hoy, buscar eventos próximos (fecha >= hoy)
        if (displayEvents.length === 0) {
            const futureEvents = allEvents.filter(e => e.dateOnly >= targetDate);
            if (futureEvents.length > 0) {
                const sorted = futureEvents.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                const nextDate = sorted[0].dateOnly;
                displayEvents = sorted.filter(e => e.dateOnly === nextDate);
                isFuture = true;
            }
        }

        // 3. Si no hay próximos, mostrar la fecha más reciente registrada para mantener la sección activa
        if (displayEvents.length === 0 && allEvents.length > 0) {
            const sortedDesc = allEvents.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            const latestDate = sortedDesc[0].dateOnly;
            displayEvents = sortedDesc.filter(e => e.dateOnly === latestDate);
            isRecent = true;
        }

        if (loadingStatus) loadingStatus.style.display = 'none';

        if (displayEvents.length === 0) {
            dynamicContainer.innerHTML = `
               <div class="w-full py-8 flex flex-col items-center justify-center text-center space-y-4 animate__animated animate__fadeIn">
                   <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-yellow-500 animate-pulse">
                       <i class="fas fa-calendar-day text-lg"></i>
                   </div>
                   <div>
                       <p class="text-xs font-black uppercase tracking-[0.2em] text-white">Sin Encuentros ni Entrenamientos Programados</p>
                       <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">No hay partidos ni prácticas agendadas para esta semana.</p>
                   </div>
               </div>
            `;
            return;
        }

        // Limpiar contenedores
        dynamicContainer.innerHTML = '';
        if (titleContainer) titleContainer.innerHTML = '';

        if (titleContainer) {
            let label = "Partidos y Entrenamientos de Hoy";
            let colorClass = "text-red-500";
            let bgClass = "bg-red-500";

            if (isFuture) {
                label = "Próximos Partidos y Entrenamientos";
                colorClass = "text-amber-500";
                bgClass = "bg-amber-500";
            } else if (isRecent) {
                label = "Programación Reciente";
                colorClass = "text-emerald-400";
                bgClass = "bg-emerald-400";
            }

            titleContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center animate__animated animate__fadeIn">
                    <span class="text-[10px] font-black ${colorClass} uppercase tracking-[0.3em] mb-1">${label}</span>
                    <h2 class="text-white font-black text-lg sm:text-xl uppercase tracking-tight">${formatearFechaLarga(displayEvents[0].fecha)}</h2>
                    <div class="w-12 h-1 ${bgClass} mt-2 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                </div>
            `;
        }

        displayEvents.forEach((event, idx) => {
            const card = event.isTraining ? renderTrainingCard(event) : renderMatchCard(event);
            card.style.animationDelay = `${idx * 0.1}s`;
            dynamicContainer.appendChild(card);
        });

        setupScroll(dynamicContainer);

    } catch (err) {
        console.error("Match banner error:", err);
        if (loadingStatus) loadingStatus.innerHTML = `<span class="text-red-400 text-xs font-black uppercase tracking-widest">Error de Conexión</span>`;
    }
}

export function renderMatchCard(p) {
    const card = document.createElement("div");
    card.className = "flex-none w-[85vw] max-w-[360px] sm:w-[380px] snap-center bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-5 sm:p-6 flex flex-col gap-5 hover:bg-slate-800/60 hover:border-amber-500/30 transition-all duration-500 group/card relative overflow-hidden shadow-2xl animate__animated animate__fadeInUp";
    
    const today = new Date().toISOString().split('T')[0];
    const targetDate = p.dateOnly || (p.fecha?.includes('T') ? p.fecha.split('T')[0] : p.fecha);
    const esHoy = targetDate === today;
    const tieneResultado = p.resultado && p.resultado !== '' && p.resultado !== '-' && p.resultado !== 'Pendiente';

    let statusBadge = '';
    if (tieneResultado) {
        statusBadge = '<span class="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Finalizado</span>';
    } else if (esHoy) {
        statusBadge = '<span class="bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]"><span class="w-1.5 h-1.5 bg-white rounded-full"></span> EN VIVO</span>';
    } else {
        statusBadge = '<span class="bg-blue-500/10 text-blue-400 text-[9px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">Partido</span>';
    }

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
                    <img src="${getEscudoUrl(p.escudo_local || p.escudo, p.equipolocal)}" 
                         class="w-full h-full object-contain relative z-10 drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)] group-hover/card:scale-110 transition-transform duration-500" 
                         onerror="this.src='images/ESCUDO.webp'">
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
                    <img src="${getEscudoUrl(p.escudo_visitante, p.equipovisitante)}" 
                         class="w-full h-full object-contain relative z-10 drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)] group-hover/card:scale-110 transition-transform duration-500" 
                         onerror="this.src='${getEscudoUrl(null, p.equipovisitante)}'">
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

export function renderTrainingCard(e) {
    const card = document.createElement("div");
    card.className = "flex-none w-[85vw] max-w-[360px] sm:w-[380px] snap-center bg-slate-900/40 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-5 sm:p-6 flex flex-col gap-5 hover:bg-slate-800/60 hover:border-emerald-500/40 transition-all duration-500 group/card relative overflow-hidden shadow-2xl animate__animated animate__fadeInUp";
    
    const today = new Date().toISOString().split('T')[0];
    const targetDate = e.dateOnly || (e.fecha?.includes('T') ? e.fecha.split('T')[0] : e.fecha);
    const esHoy = targetDate === today;

    let statusBadge = esHoy
        ? '<span class="bg-emerald-500 text-slate-950 text-[9px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"><span class="w-1.5 h-1.5 bg-slate-950 rounded-full"></span> HOY</span>'
        : '<span class="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Práctica</span>';

    card.innerHTML = `
        <!-- Glow effect -->
        <div class="absolute -top-20 -right-20 w-44 h-44 bg-emerald-500/10 rounded-full blur-[80px] group-hover/card:bg-emerald-500/20 transition-all duration-700"></div>

        <div class="flex items-center justify-between relative z-10">
            <div class="bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                <i class="fas fa-dumbbell text-emerald-400 text-xs"></i>
                <span class="text-[10px] font-black text-emerald-400 uppercase tracking-widest">CAT. ${e.categoria || 'GENERAL'}</span>
            </div>
            ${statusBadge}
        </div>

        <div class="flex flex-col items-center justify-center text-center gap-2 w-full relative z-10 py-2">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-1 group-hover/card:scale-110 transition-transform duration-500 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <i class="fas fa-running text-3xl sm:text-4xl text-emerald-400"></i>
            </div>
            <h3 class="text-white font-black text-base sm:text-lg uppercase line-clamp-1 leading-tight tracking-tight group-hover/card:text-emerald-400 transition-colors">${e.titulo || 'Entrenamiento DIBA FBC'}</h3>
            <span class="text-amber-400 font-black text-sm tracking-tight flex items-center gap-1.5"><i class="far fa-clock text-xs"></i> ${e.hora || '5:30 PM'}</span>
        </div>

        <div class="mt-auto pt-4 border-t border-white/5 flex flex-col gap-3 relative z-10">
            <div class="flex items-center justify-center gap-4">
                <div class="flex items-center gap-2 group/info">
                    <div class="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover/info:bg-emerald-500/20 transition-colors">
                        <i class="fas fa-map-marker-alt text-[10px] text-emerald-400"></i>
                    </div>
                    <span class="text-[10px] font-bold text-slate-300 uppercase tracking-tight line-clamp-1">${e.lugar || 'Parque La Pradera'}</span>
                </div>
            </div>
            
            <a href="partidos.html?tab=entrenamientos" class="w-full py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 hover:shadow-[0_8px_20px_-5px_rgba(16,185,129,0.5)] transition-all duration-500 active:scale-95">
                Ver Horarios <i class="fas fa-arrow-right-long animate-bounce-x"></i>
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
