/**
 * DIBA FBC - Matches Manager Module
 * Handles all interactive matches page features, filtering, detail modals, and realtime sync.
 */
import { supabase } from '../../core/supabase.js';
import { formatearFecha, toLocalDate, evaluarResultado, getEscudoUrl } from '../../core/utils.js';

// DOM Elements (evaluated dynamically)
let inputFecha, inputCategoria, resultsPartidos;
let inputFechaEnt, inputCatEnt, resultsEnt;

export function initPartidosPage() {
  inputFecha = document.getElementById('fecha');
  inputCategoria = document.getElementById('filtro-categoria');
  resultsPartidos = document.getElementById('partidos-results');

  inputFechaEnt = document.getElementById('fecha-entrenamiento');
  inputCatEnt = document.getElementById('filtro-categoria-entrenamientos');
  resultsEnt = document.getElementById('entrenamientos-results');

  // Page Initializations
  mostrarPartidosDIBA();
  cargarEstadisticasRapidas();
  cargarEntrenamientos();

  // Attach Event Listeners
  if (inputFecha) inputFecha.addEventListener('change', filtrarPartidos);
  if (inputCategoria) inputCategoria.addEventListener('change', filtrarPartidos);
  if (inputFechaEnt) inputFechaEnt.addEventListener('change', cargarEntrenamientos);
  if (inputCatEnt) inputCatEnt.addEventListener('change', cargarEntrenamientos);

  // Clear Buttons
  const btnLimpiarPartidos = document.getElementById('btn-limpiar-partidos');
  if (btnLimpiarPartidos) {
    btnLimpiarPartidos.addEventListener('click', () => {
      if (inputFecha) inputFecha.value = '';
      if (inputCategoria) inputCategoria.value = '';
      if (resultsPartidos) resultsPartidos.innerHTML = '';
      mostrarInicialPanel('partidos-estado-inicial', true);
    });
  }

  const btnLimpiarEnt = document.getElementById('btn-limpiar-entrenamientos');
  if (btnLimpiarEnt) {
    btnLimpiarEnt.addEventListener('click', () => {
      if (inputFechaEnt) inputFechaEnt.value = '';
      if (inputCatEnt) inputCatEnt.value = '';
      cargarEntrenamientos();
    });
  }

  // URL Tab parsing
  try {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabParam}-tab"]`);
      if (targetBtn) {
        targetBtn.click();
      }
    }
  } catch (e) {
    console.error('Error procesando tab de URL:', e);
  }

  // Set up Realtime Sync
  setupRealtimeSync();

  // Bind global modal functions (so inline HTML event handlers still work)
  window.abrirDetallesPartido = abrirDetallesPartido;
  window.activarPestanaMapa = activarPestanaMapa;
}

function mostrarSpinner(id, v) {
  const el = document.getElementById(id);
  if (el) el.style.display = v ? 'flex' : 'none';
}

function mostrarInicialPanel(id, v) {
  const el = document.getElementById(id);
  if (el) el.style.display = v ? 'block' : 'none';
}

/** Determina badge de resultado para un partido */
function badgeResultado(p) {
  const res = evaluarResultado(p);
  switch (res) {
    case 'victoria':
      return `<span class="badge-resultado badge-victoria"><i class="fas fa-check mr-1"></i>Victoria</span>`;
    case 'derrota':
      return `<span class="badge-resultado badge-derrota"><i class="fas fa-times mr-1"></i>Derrota</span>`;
    case 'empate':
      return `<span class="badge-resultado badge-empate">Empate</span>`;
    default:
      const label = (p.resultado && p.resultado !== '-' && p.resultado !== '—') ? p.resultado : 'Pendiente';
      return `<span class="badge-resultado badge-pendiente">${label}</span>`;
  }
}

/** Crea tarjeta de partido con formato Bootstrap para partidos.html */
export function crearTarjetaPartido(p) {
  const div = document.createElement('div');
  div.className = 'col-12 col-md-6 col-lg-4 animate__animated animate__fadeInUp';

  const partes = (p.resultado || '').split(/[-:]/).map(x => x.trim());
  const golesLocal = partes[0] || '—';
  const golesVisitante = partes[1] || '—';
  const tieneResult = partes.length >= 2 && partes[0] !== '' && partes[1] !== '';
  
  const isPending = !p.resultado || p.resultado === 'Pendiente' || p.resultado === '-' || p.resultado === '—';
  
  let estadoText = 'PROGRAMADO';
  let estadoClass = 'border-blue-500/30 bg-blue-500/10 text-blue-400';
  if (!isPending) {
    const res = evaluarResultado(p);
    if (res === 'victoria') { estadoText = 'VICTORIA'; estadoClass = 'border-green-500/30 bg-green-500/10 text-green-400'; }
    else if (res === 'derrota') { estadoText = 'DERROTA'; estadoClass = 'border-red-500/30 bg-red-500/10 text-red-400'; }
    else if (res === 'empate') { estadoText = 'EMPATE'; estadoClass = 'border-slate-400/30 bg-slate-400/10 text-slate-300'; }
    else { estadoText = 'FINALIZADO'; estadoClass = 'border-slate-500/30 bg-slate-500/10 text-slate-400'; }
  }

  div.innerHTML = `
    <div class="h-full bg-[#131b2c] border border-amber-500/20 rounded-3xl overflow-hidden flex flex-col p-6 shadow-xl transition-transform hover:scale-[1.02]">
      
      <!-- Top Badges -->
      <div class="flex items-center justify-between mb-8">
        <span class="border border-amber-500/30 text-amber-500 px-4 py-1.5 rounded-xl text-[0.65rem] font-black tracking-widest uppercase">
          CAT. ${p.categoria || 'GENERAL'}
        </span>
        <span class="border px-4 py-1.5 rounded-xl text-[0.65rem] font-black tracking-widest uppercase ${estadoClass}">
          ${estadoText}
        </span>
      </div>
      
      <!-- Middle Area (Teams & Score) -->
      <div class="flex items-center justify-between mb-8 px-2">
        <!-- Local -->
        <div class="flex flex-col items-center w-[100px]">
          <img src="${getEscudoUrl(p.escudo_local || p.escudo, p.equipolocal)}" alt="${p.equipolocal}" class="w-20 h-20 object-contain rounded-xl drop-shadow-xl mb-3" onerror="this.src='images/ESCUDO.webp'">
          <span class="text-white font-black text-[0.7rem] uppercase text-center leading-tight tracking-wide line-clamp-2">${p.equipolocal || 'DIBA FBC'}</span>
        </div>

        <!-- Center (VS & Score/Time) -->
        <div class="flex flex-col items-center justify-center flex-1">
           <div class="w-10 h-10 rounded-full border border-slate-600/50 flex items-center justify-center mb-2">
             <span class="text-amber-500 font-black text-xs italic">VS</span>
           </div>
           ${tieneResult 
             ? `<span class="text-white font-black text-2xl tracking-tighter">${golesLocal} - ${golesVisitante}</span>`
             : `<span class="text-white font-black text-2xl tracking-tighter">${p.hora || 'TBD'}</span>`
           }
        </div>

        <!-- Visitante -->
        <div class="flex flex-col items-center w-[100px]">
          <img src="${getEscudoUrl(p.escudo_visitante, p.equipovisitante)}" alt="${p.equipovisitante}" class="w-20 h-20 object-contain rounded-xl drop-shadow-xl mb-3" onerror="this.src='${getEscudoUrl(null, p.equipovisitante)}'">
          <span class="text-white font-black text-[0.7rem] uppercase text-center leading-tight tracking-wide line-clamp-2">${p.equipovisitante || 'Visitante'}</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px w-full bg-slate-800/80 mb-6"></div>

      <!-- Info Badges -->
      <div class="flex flex-col gap-2 mb-8 flex-grow">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <i class="fas fa-map-marker-alt text-red-400 text-[0.6rem]"></i>
          </div>
          <span class="text-slate-300 font-bold text-[0.7rem] uppercase truncate tracking-wider">${p.Cancha || 'No especificada'}</span>
        </div>
        ${(p.descripcion || p.observaciones || p.uniforme) ? `
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
            <i class="fas fa-trophy text-sky-400 text-[0.6rem]"></i>
          </div>
          <span class="text-slate-300 font-bold text-[0.7rem] uppercase truncate tracking-wider">
            ${p.descripcion ? p.descripcion : (p.uniforme ? 'Unif: ' + p.uniforme : p.observaciones)}
          </span>
        </div>` : ''}
      </div>

      <!-- Action Button -->
      <button class="w-full py-4 border border-slate-600 hover:border-amber-500 hover:bg-amber-500/5 text-white rounded-2xl text-[0.75rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
              onclick="window.abrirDetallesPartido('${encodeURIComponent(JSON.stringify(p))}')">
        VER DETALLES <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  `;
  return div;
}

/** Lógica del modal de detalles */
export function abrirDetallesPartido(partidoData) {
  const p = JSON.parse(decodeURIComponent(partidoData));
  
  const setElText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  const setElSrc = (id, src) => { const el = document.getElementById(id); if (el) el.src = src; };

  setElText('modal-categoria', 'CAT. ' + (p.categoria || 'GENERAL'));
  setElText('modal-torneo', p.descripcion ? p.descripcion.toUpperCase() : 'PARTIDO PROGRAMADO');
  
  // Local
  setElText('modal-local-name', p.equipolocal || 'LOCAL');
  setElText('modal-local-name-mob', (p.equipolocal || 'LOC').substring(0,4));
  setElSrc('modal-local-shield', getEscudoUrl(p.escudo_local || p.escudo, p.equipolocal));
  
  // Visitante
  setElText('modal-visit-name', p.equipovisitante || 'VISITANTE');
  setElText('modal-visit-name-mob', (p.equipovisitante || 'VIS').substring(0,4));
  setElSrc('modal-visit-shield', getEscudoUrl(p.escudo_visitante, p.equipovisitante));

  // Score
  const partes = (p.resultado || '').split(/[-:]/).map(x => x.trim());
  const tieneResult = partes.length >= 2 && partes[0] !== '' && partes[1] !== '';
  setElText('modal-score', tieneResult ? `${partes[0]} - ${partes[1]}` : (p.hora || 'VS'));

  // Date
  setElText('modal-date', `${p.hora || '00:00'} • ${formatearFecha(p.fecha).toUpperCase()}`);

  // Resumen
  setElText('modal-lugar', p.Cancha || 'No especificado');
  setElText('modal-uniforme', p.uniforme || 'No especificado');
  setElText('modal-valor', p.valor ? '$' + p.valor : 'No especificado');
  setElText('modal-obs', p.observaciones || 'Sin observaciones registradas.');

  // Show modal
  const m = document.getElementById('match-details-modal');
  if (m) {
    m.classList.remove('hidden');
    m.classList.remove('pointer-events-none');
    setTimeout(() => m.classList.remove('opacity-0'), 10);
    setTimeout(() => m.classList.add('opacity-100'), 10);
  }
}

/** Helper para cambiar a la pestaña de cancha/mapa */
export function activarPestanaMapa(lugar) {
  const btnMapa = document.querySelector('.tab-btn[data-tab="mapa-tab"]');
  if (btnMapa) {
    btnMapa.click();
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }
}

/** Crea tarjeta de entrenamiento con formato Bootstrap para partidos.html */
export function crearTarjetaEntrenamiento(e) {
  const div = document.createElement('div');
  div.className = 'animate__animated animate__fadeInUp';

  const todayStr = new Date().toISOString().split('T')[0];
  const fechaStr = e.fecha?.includes('T') ? e.fecha.split('T')[0] : (e.fecha || '');
  const esHoy = fechaStr === todayStr;
  const esFuturo = fechaStr >= todayStr;

  let badgeStatus = '';
  if (esHoy) {
    badgeStatus = `<span class="bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)]"><span class="w-1.5 h-1.5 bg-slate-950 rounded-full"></span> HOY</span>`;
  } else if (esFuturo) {
    badgeStatus = `<span class="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">PRÓXIMO</span>`;
  } else {
    badgeStatus = `<span class="bg-slate-800 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">FINALIZADO</span>`;
  }

  div.innerHTML = `
    <div class="bg-[#0b1726] border border-emerald-500/20 rounded-3xl p-6 flex flex-col gap-5 hover:bg-[#0e1e32] hover:border-emerald-500/40 transition-all duration-300 shadow-xl group relative overflow-hidden h-full">
      <!-- Glow decoration -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>

      <!-- Top Header -->
      <div class="flex items-center justify-between relative z-10">
        <span class="border border-emerald-500/30 text-emerald-400 px-3.5 py-1 rounded-xl text-[0.65rem] font-black tracking-widest uppercase bg-emerald-500/5">
          CAT. ${e.categoria || 'GENERAL'}
        </span>
        ${badgeStatus}
      </div>

      <!-- Main info -->
      <div class="flex items-center gap-4 py-2 relative z-10">
        <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <i class="fas fa-running text-2xl text-emerald-400"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-white font-black text-base uppercase tracking-tight line-clamp-1 leading-snug group-hover:text-emerald-400 transition-colors">${e.titulo || 'Entrenamiento DIBA FBC'}</h3>
          <p class="text-amber-400 font-extrabold text-xs tracking-wide mt-1 flex items-center gap-1.5">
            <i class="far fa-clock text-[10px]"></i> ${e.hora || '5:30 PM'}
          </p>
        </div>
      </div>

      <div class="h-px w-full bg-slate-800"></div>

      <!-- Extra details -->
      <div class="space-y-2.5 text-xs relative z-10 flex-grow">
        <div class="flex items-center gap-2.5 text-slate-300">
          <div class="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <i class="fas fa-calendar-day text-emerald-400 text-[10px]"></i>
          </div>
          <span class="font-bold uppercase tracking-wide">${formatearFecha(e.fecha)}</span>
        </div>

        <div class="flex items-center gap-2.5 text-slate-300">
          <div class="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <i class="fas fa-map-marker-alt text-red-400 text-[10px]"></i>
          </div>
          <span class="font-semibold uppercase tracking-wide truncate">${e.lugar || 'Parque La Pradera'}</span>
        </div>

        ${(e.descripcion || e.observaciones) ? `
        <div class="flex items-start gap-2.5 text-slate-400 pt-1">
          <div class="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <i class="fas fa-info-circle text-sky-400 text-[10px]"></i>
          </div>
          <p class="text-[0.75rem] leading-relaxed text-slate-300">${e.descripcion || e.observaciones}</p>
        </div>` : ''}
      </div>

      <!-- Footer Button -->
      <button onclick="window.activarPestanaMapa('${e.lugar || ''}')" class="w-full mt-auto py-3 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 text-emerald-400 rounded-xl text-[0.7rem] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95">
        <i class="fas fa-location-dot"></i> Ver Cancha / Ubicación
      </button>
    </div>
  `;
  return div;
}

/** Filtra partidos según los valores de los inputs de búsqueda */
export async function filtrarPartidos() {
  if (!resultsPartidos) return;

  const sectionDiba = document.getElementById('section-diba-fbc');
  mostrarInicialPanel('partidos-estado-inicial', false);
  resultsPartidos.innerHTML = '';

  const fecha = inputFecha?.value;
  const categoria = inputCategoria?.value;

  if (!fecha && !categoria) {
    mostrarInicialPanel('partidos-estado-inicial', true);
    if (sectionDiba) sectionDiba.style.display = 'block';
    return;
  }

  if (sectionDiba) sectionDiba.style.display = 'none';

  mostrarSpinner('partidos-spinner', true);

  let query = supabase.from('partidos')
    .select('id, fecha, hora, equipolocal, equipovisitante, resultado, categoria, Cancha, descripcion, escudo_local, escudo_visitante, escudo');
  if (fecha) query = query.eq('fecha', fecha);
  if (categoria) query = query.eq('categoria', categoria);

  const { data: filtrados, error } = await query.order('fecha', { ascending: false });

  mostrarSpinner('partidos-spinner', false);

  if (error) {
    resultsPartidos.innerHTML = `<p class="text-center text-red-400 py-8"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar partidos.</p>`;
    return;
  }

  if (!filtrados || filtrados.length === 0) {
    resultsPartidos.innerHTML = `
      <div class="text-center py-14">
        <div class="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-futbol text-slate-600 text-xl"></i>
        </div>
        <p class="text-slate-500 text-sm">No hay partidos registrados para estos filtros</p>
      </div>`;
    return;
  }

  filtrados.forEach(p => resultsPartidos.appendChild(crearTarjetaPartido(p)));
}

/** Carga y filtra entrenamientos */
export async function cargarEntrenamientos() {
  if (!resultsEnt) return;
  
  const fecha = inputFechaEnt?.value;
  const cat = inputCatEnt?.value;
  resultsEnt.innerHTML = '';

  mostrarSpinner('entrenamientos-spinner', true);

  let query = supabase.from('entrenamientos')
    .select('id, fecha, hora, titulo, categoria, lugar, descripcion, observaciones');
  if (fecha) query = query.eq('fecha', fecha);
  if (cat) query = query.ilike('categoria', `%${cat}%`);

  const { data: filtrados, error } = await query.order('fecha', { ascending: false });

  mostrarSpinner('entrenamientos-spinner', false);

  if (error) {
    resultsEnt.innerHTML = `<p class="col-span-full text-center text-red-400 py-8"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar entrenamientos.</p>`;
    return;
  }

  if (!filtrados || filtrados.length === 0) {
    resultsEnt.innerHTML = `
      <div class="col-span-full text-center py-14">
        <div class="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-dumbbell text-slate-600 text-xl"></i>
        </div>
        <p class="text-slate-400 font-bold text-sm">No hay entrenamientos agendados con este filtro</p>
        <p class="text-slate-500 text-xs mt-1">Prueba cambiando la fecha o seleccionando todas las categorías.</p>
      </div>`;
    return;
  }

  filtrados.forEach(e => resultsEnt.appendChild(crearTarjetaEntrenamiento(e)));
}

/** Carga partidos de DIBA FBC (sección inferior) */
export async function mostrarPartidosDIBA() {
  const container = document.getElementById('diba-slider');
  const spinner = document.getElementById('diba-spinner');
  if (!container) return;

  if (spinner) spinner.style.display = 'flex';

  const { data, error } = await supabase
    .from('partidos')
    .select('id, fecha, hora, equipolocal, equipovisitante, resultado, categoria, Cancha, descripcion, escudo_local, escudo_visitante, escudo')
    .or('equipolocal.ilike.%DIBA%,equipovisitante.ilike.%DIBA%')
    .order('fecha', { ascending: false })
    .limit(20);

  if (spinner) spinner.style.display = 'none';

  if (error) {
    container.innerHTML = `<p class="text-slate-500 text-sm text-center col-span-3">No se pudieron cargar los partidos de DIBA FBC.</p>`;
    return;
  }

  if (!data?.length) {
    container.innerHTML = `<p class="text-slate-500 text-sm text-center col-span-3">No hay partidos de DIBA FBC registrados.</p>`;
    return;
  }

  container.innerHTML = '';
  data.forEach(p => container.appendChild(crearTarjetaPartido(p)));
}

/** Carga estadísticas rápidas en el Hero */
export async function cargarEstadisticasRapidas() {
  // Solo se necesitan los campos de equipos y resultado para calcular victorias/empates/derrotas
  const { data } = await supabase
    .from('partidos')
    .select('resultado, equipolocal, equipovisitante')
    .or('equipolocal.ilike.%DIBA%,equipovisitante.ilike.%DIBA%');

  if (!data) return;

  const total = data.length;
  let victorias = 0, derrotas = 0, empates = 0;

  data.forEach(p => {
    const res = evaluarResultado(p);
    if (res === 'victoria') victorias++;
    else if (res === 'derrota') derrotas++;
    else if (res === 'empate') empates++;
  });

  const animate = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    let cur = 0;
    const step = Math.max(1, Math.floor(val / 20));
    const interval = setInterval(() => {
      cur = Math.min(cur + step, val);
      el.textContent = cur;
      if (cur >= val) clearInterval(interval);
    }, 40);
  };

  animate('stat-partidos', total);
  animate('stat-victorias', victorias);
  animate('stat-derrotas', derrotas);
  animate('stat-empates', empates);
}

function setupRealtimeSync() {
  try {
    supabase.channel('public:partidos_entrenamientos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidos' }, payload => {
        console.log('¡Cambio en partidos detectado en Supabase! Recargando datos...', payload);
        mostrarPartidosDIBA();
        cargarEstadisticasRapidas();
        if (inputFecha && inputFecha.value) filtrarPartidos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entrenamientos' }, payload => {
        console.log('¡Cambio en entrenamientos detectado en Supabase! Recargando datos...', payload);
        cargarEntrenamientos();
      })
      .subscribe();
  } catch (err) {
    console.error("Error suscribiendo a Realtime:", err);
  }
}
