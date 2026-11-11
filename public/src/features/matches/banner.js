/**
 * DIBA FBC - Public Matches & Trainings Banner Feature
 * Dual-column schedule block: matches carousel on the left + official training hub on the right.
 */
import { supabase } from '../../core/supabase.js';
import { formatearFechaLarga, getEscudoUrl } from '../../core/utils.js';

export async function initMatchBanner() {
    const bannerDualContent = document.getElementById("banner-dual-content");
    const dynamicMatchesCol = document.getElementById("dynamic-matches-col");
    const dynamicTrainingsCol = document.getElementById("dynamic-trainings-col");
    const titleContainer = document.getElementById("banner-title-container");
    const loadingStatus = document.getElementById("banner-loading");
    const emptyState = document.getElementById("banner-empty-state");
    const matchesCountBadge = document.getElementById("banner-matches-count-badge");
    const prevBtn = document.getElementById("banner-match-prev-btn");
    const nextBtn = document.getElementById("banner-match-next-btn");

    if (!dynamicMatchesCol && !bannerDualContent) return;

    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Rango de búsqueda: desde hace 45 días para mostrar el historial reciente activo
        const hace45Dias = new Date(today);
        hace45Dias.setDate(hace45Dias.getDate() - 45);
        const desde = hace45Dias.toISOString().split('T')[0];

        const PARTIDOS_COLS = 'id, fecha, hora, equipolocal, equipovisitante, resultado, categoria, Cancha, descripcion, escudo_local, escudo_visitante, escudo, valor';
        const ENTRENOS_COLS = 'id, fecha, hora, titulo, lugar, descripcion, observaciones';

        // Obtener partidos y entrenamientos en paralelo
        const [partidosRes, entrenamientosRes] = await Promise.all([
            supabase.from('partidos').select(PARTIDOS_COLS)
                .gte('fecha', desde)
                .order('fecha', { ascending: true })
                .limit(60),
            supabase.from('entrenamientos').select(ENTRENOS_COLS)
                .gte('fecha', desde)
                .order('fecha', { ascending: false })
                .limit(20)
        ]);

        if (partidosRes.error) throw partidosRes.error;

        const partidos = (partidosRes.data || []).map(p => ({
            ...p,
            dateOnly: p.fecha?.includes('T') ? p.fecha.split('T')[0] : (p.fecha || '')
        }));

        const entrenamientos = (entrenamientosRes.data || []).map(e => {
            const fullTxt = `${e.titulo || ''} ${e.descripcion || ''} ${e.observaciones || ''}`;
            let cat = '2012 a 2016';
            const catMatch = fullTxt.match(/categor[ií]as?\s*:?[\s]*([0-9\/\-\s]+)/i) || fullTxt.match(/\b(201[0-9](?:\/[0-9]{2,4})?)\b/i);
            if (catMatch) cat = catMatch[1].trim();

            return {
                ...e,
                categoria: cat,
                dateOnly: e.fecha?.includes('T') ? e.fecha.split('T')[0] : (e.fecha || '')
            };
        });

        // 1. DETERMINAR FECHA OBJETIVO PARA PARTIDOS
        let displayMatches = [];
        let isTodayMatches = false;
        let isFutureMatches = false;
        let isRecentMatches = false;

        // ¿Hay partidos hoy?
        const matchesToday = partidos.filter(p => p.dateOnly === todayStr);
        if (matchesToday.length > 0) {
            displayMatches = matchesToday;
            isTodayMatches = true;
        } else {
            // ¿Hay partidos próximos?
            const futureMatches = partidos.filter(p => p.dateOnly > todayStr);
            if (futureMatches.length > 0) {
                const sortedFuture = futureMatches.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                const nextDate = sortedFuture[0].dateOnly;
                displayMatches = sortedFuture.filter(p => p.dateOnly === nextDate);
                isFutureMatches = true;
            } else if (partidos.length > 0) {
                // Si no hay hoy ni futuros, mostrar la jornada más reciente registrada
                const sortedRecent = [...partidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                const latestDate = sortedRecent[0].dateOnly;
                displayMatches = sortedRecent.filter(p => p.dateOnly === latestDate);
                isRecentMatches = true;
            }
        }

        // 2. DETERMINAR ENTRENAMIENTO DESTACADO
        let activeTraining = null;
        if (entrenamientos.length > 0) {
            const futureTrainings = entrenamientos.filter(e => e.dateOnly >= todayStr);
            if (futureTrainings.length > 0) {
                // El más próximo hacia adelante
                activeTraining = futureTrainings.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
            } else {
                // El más reciente registrado
                activeTraining = entrenamientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
            }
        }

        if (loadingStatus) loadingStatus.style.display = 'none';

        // Si no hay absolutamente nada
        if (displayMatches.length === 0 && !activeTraining) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        // Mostrar contenedor principal de doble columna
        if (bannerDualContent) {
            bannerDualContent.classList.remove('hidden');
        }

        // 3. RENDERIZAR TÍTULO GENERAL DEL BLOQUE
        if (titleContainer) {
            const refDate = displayMatches[0]?.fecha || activeTraining?.fecha || todayStr;
            let statusPill = 'PROGRAMACIÓN DEPORTIVA';
            let colorAccent = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            let barGlow = 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.6)]';

            if (isTodayMatches) {
                statusPill = 'EN DIRECTO HOY';
                colorAccent = 'text-rose-400 border-rose-500/40 bg-rose-500/15 animate-pulse';
                barGlow = 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]';
            } else if (isFutureMatches) {
                statusPill = 'PRÓXIMA JORNADA OFICIAL';
                colorAccent = 'text-amber-300 border-amber-500/40 bg-amber-500/15';
            } else if (isRecentMatches) {
                statusPill = 'PROGRAMACIÓN RECIENTE';
                colorAccent = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
                barGlow = 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
            }

            titleContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center text-center animate__animated animate__fadeIn">
                    <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border ${colorAccent} mb-2 shadow-sm">
                        <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>${statusPill}</span>
                    </div>
                    <h2 class="text-white font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight font-display drop-shadow-md">
                        ${formatearFechaLarga(refDate)}
                    </h2>
                    <div class="w-20 h-1 ${barGlow} mt-3 rounded-full"></div>
                </div>
            `;
        }

        // 4. RENDERIZAR PARTIDOS
        if (dynamicMatchesCol) {
            dynamicMatchesCol.innerHTML = '';

            if (displayMatches.length === 0) {
                dynamicMatchesCol.innerHTML = `
                    <div class="w-full py-8 flex flex-col items-center justify-center text-center text-slate-400">
                        <i class="fas fa-futbol text-2xl text-slate-600 mb-2"></i>
                        <p class="text-xs font-bold uppercase tracking-wider">Sin partidos registrados para esta fecha</p>
                    </div>
                `;
            } else {
                displayMatches.forEach((partido, idx) => {
                    const card = renderMatchCard(partido);
                    card.style.animationDelay = `${idx * 0.08}s`;
                    dynamicMatchesCol.appendChild(card);
                });
            }

            // Actualizar badge de conteo
            if (matchesCountBadge) {
                matchesCountBadge.textContent = `${displayMatches.length} ${displayMatches.length === 1 ? 'Partido' : 'Partidos'}`;
            }

            // Controles de desplazamiento para el carrusel de partidos
            if (prevBtn) {
                prevBtn.onclick = (e) => {
                    e.preventDefault();
                    dynamicMatchesCol.scrollBy({ left: -340, behavior: 'smooth' });
                };
            }
            if (nextBtn) {
                nextBtn.onclick = (e) => {
                    e.preventDefault();
                    dynamicMatchesCol.scrollBy({ left: 340, behavior: 'smooth' });
                };
            }

            setupDragScroll(dynamicMatchesCol);
        }

        // 5. RENDERIZAR ENTRENAMIENTOS
        if (dynamicTrainingsCol) {
            dynamicTrainingsCol.innerHTML = '';
            const trainingHub = renderTrainingHub(activeTraining);
            dynamicTrainingsCol.appendChild(trainingHub);
        }

    } catch (err) {
        console.error("Match banner error:", err);
        if (loadingStatus) {
            loadingStatus.innerHTML = `<span class="text-red-400 text-xs font-black uppercase tracking-widest"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar programación</span>`;
        }
    }
}

/**
 * Renderiza una tarjeta de partido con diseño de lujo, badges de alta definición y sin textos truncados
 */
export function renderMatchCard(p) {
    const card = document.createElement("div");
    card.className = "flex-none w-[85vw] max-w-[340px] sm:w-[350px] snap-start bg-slate-950/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_30px_rgba(245,158,11,0.15)] group/card relative overflow-hidden animate__animated animate__fadeInUp";

    const today = new Date().toISOString().split('T')[0];
    const targetDate = p.dateOnly || (p.fecha?.includes('T') ? p.fecha.split('T')[0] : p.fecha);
    const esHoy = targetDate === today;
    const tieneResultado = p.resultado && p.resultado !== '' && p.resultado !== '-' && p.resultado !== 'Pendiente';

    let statusBadge = '';
    if (tieneResultado) {
        statusBadge = '<span class="bg-emerald-500/15 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5"><i class="fas fa-check-circle text-[9px]"></i> Finalizado</span>';
    } else if (esHoy) {
        statusBadge = '<span class="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.5)]"><span class="w-1.5 h-1.5 bg-white rounded-full"></span> En Vivo</span>';
    } else {
        statusBadge = '<span class="bg-sky-500/15 text-sky-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-sky-500/30 uppercase tracking-wider flex items-center gap-1"><i class="far fa-clock text-[9px]"></i> Programado</span>';
    }

    const localEscudo = getEscudoUrl(p.escudo_local || p.escudo, p.equipolocal);
    const visitaEscudo = getEscudoUrl(p.escudo_visitante, p.equipovisitante);
    const canchaText = p.Cancha ? (p.Cancha.toLowerCase().includes('bombonera') ? 'Cancha La Bombonera' : p.Cancha) : 'Cancha Oficial';
    const torneoText = p.descripcion || 'Torneo Oficial';
    const valorText = p.valor ? `$${Number(p.valor).toLocaleString('es-CO')}` : null;

    card.innerHTML = `
        <!-- Glow ambiental en hover -->
        <div class="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-[60px] group-hover/card:bg-amber-500/20 transition-all duration-500 pointer-events-none"></div>

        <!-- Encabezado de la Tarjeta: Categoría y Estado -->
        <div class="flex items-center justify-between gap-2 relative z-10 mb-3">
            <div class="bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/25 flex items-center gap-1.5">
                <i class="fas fa-shield-alt text-amber-400 text-[10px]"></i>
                <span class="text-[10px] font-black text-amber-400 uppercase tracking-widest">CAT. ${p.categoria || 'GENERAL'}</span>
            </div>
            ${statusBadge}
        </div>

        <!-- Enfrentamiento Central: Equipos y Hora/Marcador -->
        <div class="flex items-center justify-between gap-2 w-full relative z-10 py-1">
            <!-- Local (DIBA FBC) -->
            <div class="flex flex-col items-center w-[38%] text-center group/team">
                <div class="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 group-hover/card:border-amber-400/40 transition-all duration-300 shadow-md mb-2">
                    <img src="${localEscudo}" 
                         alt="${p.equipolocal || 'DIBA FBC'}"
                         class="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] group-hover/card:scale-105 transition-transform duration-300" 
                         onerror="this.src='images/ESCUDO.webp'">
                </div>
                <span class="text-white font-black text-xs sm:text-sm uppercase tracking-tight line-clamp-1 leading-snug group-hover/team:text-amber-400 transition-colors" title="${p.equipolocal || 'DIBA FBC'}">${p.equipolocal || 'DIBA FBC'}</span>
                <span class="text-[9px] font-bold text-amber-400/80 uppercase tracking-wider">Local</span>
            </div>

            <!-- Centro: VS y Hora / Resultado -->
            <div class="flex flex-col items-center justify-center w-[24%] shrink-0">
                ${tieneResultado 
                    ? `<div class="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">${p.resultado}</div>`
                    : `<span class="text-[11px] font-black text-amber-400 italic tracking-widest mb-1">VS</span>
                       <div class="px-2.5 py-1 bg-slate-800/90 border border-white/10 rounded-xl flex items-center gap-1.5 text-white font-black text-xs whitespace-nowrap shadow-inner">
                         <i class="far fa-clock text-amber-400 text-[10px]"></i>
                         <span>${p.hora || '--:--'}</span>
                       </div>`
                }
            </div>

            <!-- Visitante -->
            <div class="flex flex-col items-center w-[38%] text-center group/team">
                <div class="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 group-hover/card:border-amber-400/40 transition-all duration-300 shadow-md mb-2">
                    <img src="${visitaEscudo}" 
                         alt="${p.equipovisitante || 'Rival'}"
                         class="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] group-hover/card:scale-105 transition-transform duration-300" 
                         onerror="this.src='${getEscudoUrl(null, p.equipovisitante)}'">
                </div>
                <span class="text-white font-black text-xs sm:text-sm uppercase tracking-tight line-clamp-1 leading-snug group-hover/team:text-amber-400 transition-colors" title="${p.equipovisitante || 'Rival'}">${p.equipovisitante || 'Rival'}</span>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rival</span>
            </div>
        </div>

        <!-- Chips de Información: Sede, Torneo, Arbitraje -->
        <div class="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2 relative z-10">
            <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5 min-w-0" title="${canchaText}">
                    <i class="fas fa-map-marker-alt text-rose-400 text-xs shrink-0"></i>
                    <div class="min-w-0 flex-1">
                        <span class="block text-[8px] uppercase tracking-wider text-slate-400 font-bold leading-none">Cancha</span>
                        <span class="block text-[10px] font-bold text-slate-200 truncate mt-0.5">${canchaText}</span>
                    </div>
                </div>

                <div class="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5 min-w-0" title="${torneoText}">
                    <i class="fas fa-trophy text-amber-400 text-xs shrink-0"></i>
                    <div class="min-w-0 flex-1">
                        <span class="block text-[8px] uppercase tracking-wider text-slate-400 font-bold leading-none">Torneo</span>
                        <span class="block text-[10px] font-bold text-slate-200 truncate mt-0.5">${torneoText}</span>
                    </div>
                </div>
            </div>

            ${valorText ? `
            <div class="flex items-center justify-between px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-[10px]">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <i class="fas fa-receipt text-emerald-400 text-[9px]"></i> Arbitraje
                </span>
                <span class="font-black text-emerald-400">${valorText}</span>
            </div>` : ''}

            <!-- Botón CTA -->
            <a href="partidos.html" class="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 active:scale-95 group/btn">
                <span>Ver Convocados y Cancha</span>
                <i class="fas fa-arrow-right-long text-xs group-hover/btn:translate-x-1 transition-transform"></i>
            </a>
        </div>
    `;
    return card;
}

/**
 * Renderiza el Hub y tarjeta oficial de entrenamientos para la columna lateral
 */
export function renderTrainingHub(training) {
    const hub = document.createElement("div");
    hub.className = "flex flex-col justify-between h-full gap-3 animate__animated animate__fadeIn";

    const lugar = training?.lugar ? training.lugar.trim() : 'Parque La Pradera (Cancha Principal)';
    const hora = training?.hora ? training.hora.trim() : '5:30 PM';
    const categoria = training?.categoria || '2012 / 2013 / 2014 / 2015 / 2016';
    const titulo = training?.titulo ? training.titulo.trim() : 'Entrenamiento Oficial DIBA FBC';
    const fechaTxt = training?.fecha ? formatearFechaLarga(training.fecha) : 'Martes, Jueves y Sábados';
    const uniforme = training?.observaciones?.includes('uniforme') || training?.descripcion?.includes('uniforme')
        ? 'Uniforme blanco de práctica, medias rojas oficiales'
        : 'Uniforme blanco de práctica, medias rojas';

    hub.innerHTML = `
        <!-- Tarjeta de Práctica Destacada -->
        <div class="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg flex flex-col gap-3 group/traincard">
            <div class="flex items-center justify-between gap-2">
                <span class="bg-emerald-500/15 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Práctica Oficial
                </span>
                <span class="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Cat. ${categoria}
                </span>
            </div>

            <div>
                <h4 class="text-white font-black text-sm sm:text-base uppercase tracking-tight leading-snug group-hover/traincard:text-emerald-400 transition-colors">${titulo}</h4>
                <div class="flex items-center gap-2 text-slate-300 text-xs font-bold mt-1">
                    <i class="far fa-calendar-alt text-emerald-400"></i>
                    <span>${fechaTxt}</span>
                </div>
            </div>

            <!-- Fila de Especificaciones -->
            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div class="bg-white/5 border border-white/5 rounded-xl p-2.5">
                    <span class="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Horario</span>
                    <span class="text-xs font-black text-white flex items-center gap-1 mt-0.5">
                        <i class="far fa-clock text-emerald-400 text-[10px]"></i> ${hora}
                    </span>
                </div>
                <div class="bg-white/5 border border-white/5 rounded-xl p-2.5">
                    <span class="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Sede</span>
                    <span class="text-xs font-black text-white truncate block mt-0.5" title="${lugar}">
                        <i class="fas fa-map-pin text-rose-400 text-[10px]"></i> ${lugar}
                    </span>
                </div>
            </div>

            <!-- Indumentaria y Requisitos -->
            <div class="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-2.5 flex items-start gap-2 text-[10px]">
                <i class="fas fa-tshirt text-emerald-400 text-xs mt-0.5 shrink-0"></i>
                <div class="min-w-0">
                    <span class="text-slate-300 font-medium leading-relaxed block">${uniforme}. Aporte sesión: $2.000.</span>
                </div>
            </div>
        </div>

        <!-- Calendario Semanal Rápido -->
        <div class="bg-slate-950/50 border border-white/5 rounded-2xl p-3.5 flex flex-col gap-2 text-xs">
            <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <i class="fas fa-calendar-week text-amber-400"></i> Horarios Habituales DIBA FBC
            </span>
            <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                    <div class="min-w-0">
                        <span class="block text-[10px] font-bold text-white leading-none">Martes y Jueves</span>
                        <span class="block text-[9px] text-slate-400 mt-0.5">5:30 PM - 7:30 PM</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-1.5">
                    <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                    <div class="min-w-0">
                        <span class="block text-[10px] font-bold text-white leading-none">Sábados</span>
                        <span class="block text-[9px] text-slate-400 mt-0.5">Partidos Oficiales</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Botones de Acción -->
        <div class="grid grid-cols-2 gap-2 mt-auto pt-1">
            <a href="partidos.html?tab=entrenamientos-tab" class="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 hover:border-emerald-500 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 text-center shadow-lg shadow-emerald-500/10">
                <i class="fas fa-clipboard-list text-xs"></i> Convocatorias
            </a>
            <a href="partidos.html?tab=mapa-tab" class="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 text-center">
                <i class="fas fa-map-marked-alt text-amber-400 text-xs"></i> Ver Cancha
            </a>
        </div>
    `;
    return hub;
}

/**
 * Permite arrastrar el contenedor con mouse o touch para scroll horizontal suave
 */
function setupDragScroll(el) {
    if (!el) return;
    let isDown = false;
    let startX, scrollLeft;

    el.addEventListener('mousedown', (e) => {
        isDown = true;
        el.classList.remove('snap-x', 'snap-mandatory');
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
    });

    el.addEventListener('mouseleave', () => {
        isDown = false;
        el.classList.add('snap-x', 'snap-mandatory');
    });

    el.addEventListener('mouseup', () => {
        isDown = false;
        el.classList.add('snap-x', 'snap-mandatory');
    });

    el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5;
        el.scrollLeft = scrollLeft - walk;
    });
}
