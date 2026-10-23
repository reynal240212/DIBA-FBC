/**
 * DIBA FBC - Matches Manager Module
 * Handles all interactive matches page features, filtering, detail modals, and realtime sync.
 */
import { supabase } from '../../core/supabase.js';
import { formatearFecha, formatearFechaLarga, toLocalDate, evaluarResultado, getEscudoUrl } from '../../core/utils.js';

// DOM Elements
let inputFecha, inputCategoria, resultsPartidos;
let inputFechaEnt, inputCatEnt, resultsEnt;
let currentCategoriaFilter = '';

export function initPartidosPage() {
  inputFecha = document.getElementById('fecha');
  inputCategoria = document.getElementById('filtro-categoria');
  resultsPartidos = document.getElementById('partidos-results');

  inputFechaEnt = document.getElementById('fecha-entrenamiento');
  inputCatEnt = document.getElementById('filtro-categoria-entrenamientos');
  resultsEnt = document.getElementById('entrenamientos-results');

  // Setup Quick Category Filter Pills
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.cat-filter-btn').forEach(b => {
        b.classList.remove('active', 'bg-amber-400', 'text-slate-950', 'border-amber-400');
        b.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
      });
      btn.classList.add('active', 'bg-amber-400', 'text-slate-950', 'border-amber-400');
      btn.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
      
      currentCategoriaFilter = btn.dataset.cat || '';
      if (inputCategoria) inputCategoria.value = currentCategoriaFilter;
      filtrarPartidos();
    });
  });

  // Attach Event Listeners
  if (inputFecha) inputFecha.addEventListener('change', () => filtrarPartidos());
  if (inputCategoria) {
    inputCategoria.addEventListener('change', (e) => {
      currentCategoriaFilter = e.target.value;
      // Sync pill active state
      document.querySelectorAll('.cat-filter-btn').forEach(b => {
        if ((b.dataset.cat || '') === currentCategoriaFilter) {
          b.classList.add('active', 'bg-amber-400', 'text-slate-950', 'border-amber-400');
          b.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
        } else {
          b.classList.remove('active', 'bg-amber-400', 'text-slate-950', 'border-amber-400');
          b.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
        }
      });
      filtrarPartidos();
    });
  }

  if (inputFechaEnt) inputFechaEnt.addEventListener('change', cargarEntrenamientos);
  if (inputCatEnt) inputCatEnt.addEventListener('change', cargarEntrenamientos);

  // Clear Buttons
  const btnLimpiarPartidos = document.getElementById('btn-limpiar-partidos');
  if (btnLimpiarPartidos) {
    btnLimpiarPartidos.addEventListener('click', () => {
      if (inputFecha) inputFecha.value = '';
      if (inputCategoria) inputCategoria.value = '';
      currentCategoriaFilter = '';
      document.querySelectorAll('.cat-filter-btn').forEach(b => {
        if ((b.dataset.cat || '') === '') {
          b.classList.add('active', 'bg-amber-400', 'text-slate-950', 'border-amber-400');
          b.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
        } else {
          b.classList.remove('active', 'bg-amber-400', 'text-slate-950', 'border-amber-400');
          b.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
        }
      });
      filtrarPartidos();
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

  // Initial Data Loads
  filtrarPartidos();
  cargarEstadisticasRapidas();
  cargarEntrenamientos();

  // Set up Realtime Sync
  setupRealtimeSync();

  // Global functions for inline onclick
  window.abrirDetallesPartido = abrirDetallesPartido;
  window.activarPestanaMapa = activarPestanaMapa;
}

function mostrarSpinner(id, v) {
  const el = document.getElementById(id);
  if (el) el.style.display = v ? 'flex' : 'none';
}

/** Extrae la lista de convocados del texto de observaciones */
function extraerConvocados(texto) {
  if (!texto) return [];
  const idx = texto.toUpperCase().indexOf('CONVOCADOS');
  if (idx === -1) return [];
  const after = texto.substring(idx + 10);
  const rawLines = after.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const players = [];
  
  for (const line of rawLines) {
    const l = line.toLowerCase();
    // Parar si llegamos a notas administrativas
    if (l.includes('nequi') || l.includes('nota') || l.includes('arbitraje') || l.includes('deben llevar') || l.startsWith('$') || l.includes('transferencia')) {
      break;
    }
    // Ignorar encabezados secundarios
    if (l.includes('solo estos') || l.includes('jugadores') || l.includes('categoria') || l.length < 3) {
      continue;
    }
    players.push(line);
  }
  return players;
}

/** Crea tarjeta de partido moderna y responsiva */
export function crearTarjetaPartido(p) {
  const div = document.createElement('div');
  div.className = 'w-full animate__animated animate__fadeInUp';

  const partes = (p.resultado || '').split(/[-:]/).map(x => x.trim());
  const golesLocal = partes[0] || '—';
  const golesVisitante = partes[1] || '—';
  const tieneResult = partes.length >= 2 && partes[0] !== '' && partes[1] !== '';
  
  const isPending = !p.resultado || p.resultado === 'Pendiente' || p.resultado === '-' || p.resultado === '—';
  
  let estadoText = 'PROGRAMADO';
  let estadoClass = 'border-amber-400/40 bg-amber-400/10 text-amber-300';
  if (!isPending) {
    const res = evaluarResultado(p);
    if (res === 'victoria') { estadoText = 'VICTORIA'; estadoClass = 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'; }
    else if (res === 'derrota') { estadoText = 'DERROTA'; estadoClass = 'border-rose-400/40 bg-rose-400/15 text-rose-300'; }
    else if (res === 'empate') { estadoText = 'EMPATE'; estadoClass = 'border-slate-400/40 bg-slate-400/15 text-slate-300'; }
    else { estadoText = 'FINALIZADO'; estadoClass = 'border-slate-500/40 bg-slate-500/10 text-slate-400'; }
  }

  const escudoLoc = getEscudoUrl(p.escudo_local || p.escudo, p.equipolocal);
  const escudoVis = getEscudoUrl(p.escudo_visitante, p.equipovisitante);
  const nombreLoc = p.equipolocal || 'DIBA FBC';
  const nombreVis = p.equipovisitante || 'RIVAL';

  // Fecha corta legible
  let fechaLegible = formatearFecha(p.fecha);
  try {
    const dt = new Date(p.fecha);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    fechaLegible = `${dias[dt.getUTCDay()]}, ${dt.getUTCDate()} ${meses[dt.getUTCMonth()]}`;
  } catch (e) {}

  div.innerHTML = `
    <div class="h-full bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden backdrop-blur-sm">
      <!-- Glow superior sutil -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/15 transition-all"></div>

      <!-- Header: Categoría + Torneo / Estado -->
      <div class="flex items-center justify-between gap-2 mb-6 relative z-10">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
          <i class="fas fa-crown text-[9px]"></i> CAT. ${p.categoria || 'GENERAL'}
        </span>
        <span class="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${estadoClass}">
          ${estadoText}
        </span>
      </div>

      <!-- Enfrentamiento y Marcador -->
      <div class="grid grid-cols-12 items-center gap-2 mb-6 relative z-10">
        <!-- Local -->
        <div class="col-span-4 flex flex-col items-center text-center">
          <div class="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-950/80 border border-slate-700/60 p-2 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <img src="${escudoLoc}" alt="${nombreLoc}" class="w-full h-full object-contain" onerror="this.src='images/ESCUDO.webp'" />
          </div>
          <span class="text-xs font-black uppercase tracking-tight text-white line-clamp-1 leading-snug">${nombreLoc}</span>
          <span class="text-[9px] text-amber-400 font-bold uppercase tracking-widest">Local</span>
        </div>

        <!-- Centro: Hora / VS / Marcador -->
        <div class="col-span-4 flex flex-col items-center justify-center text-center px-1">
          ${tieneResult ? `
            <div class="text-2xl sm:text-3xl font-black text-white tracking-tight">${golesLocal} - ${golesVisitante}</div>
            <span class="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-1">Finalizado</span>
          ` : `
            <span class="text-xs font-black text-amber-400 italic mb-1">VS</span>
            <div class="text-lg sm:text-xl font-black text-white tracking-tight">${p.hora || '2:40 PM'}</div>
            <span class="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
              <i class="far fa-calendar-alt text-[9px] text-amber-400"></i> ${fechaLegible}
            </span>
          `}
        </div>

        <!-- Visitante -->
        <div class="col-span-4 flex flex-col items-center text-center">
          <div class="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-950/80 border border-slate-700/60 p-2 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <img src="${escudoVis}" alt="${nombreVis}" class="w-full h-full object-contain" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(nombreVis)}&background=002a40&color=eab308'" />
          </div>
          <span class="text-xs font-black uppercase tracking-tight text-white line-clamp-1 leading-snug">${nombreVis}</span>
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Rival</span>
        </div>
      </div>

      <!-- Divisor -->
      <div class="h-px w-full bg-slate-800/80 mb-4"></div>

      <!-- Detalles: Cancha, Uniforme, Arbitraje -->
      <div class="space-y-2 mb-6 relative z-10 text-xs">
        <div class="flex items-center gap-2.5 text-slate-300">
          <div class="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
            <i class="fas fa-map-marker-alt text-rose-400 text-[10px]"></i>
          </div>
          <span class="font-bold uppercase tracking-wide truncate">${p.Cancha || 'La Bombonera'}</span>
        </div>

        ${p.descripcion ? `
        <div class="flex items-center gap-2.5 text-slate-300">
          <div class="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <i class="fas fa-trophy text-blue-400 text-[10px]"></i>
          </div>
          <span class="font-bold text-slate-300 truncate">${p.descripcion}</span>
        </div>` : ''}

        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span class="flex items-center gap-1.5">
            <i class="fas fa-tshirt text-amber-400 text-[10px]"></i> ${p.uniforme || 'Competencia'}
          </span>
          <span class="font-black text-amber-400">
            ${p.valor ? '$' + Number(p.valor).toLocaleString('es-CO') : '$6.000'}
          </span>
        </div>
      </div>

      <!-- Botón de Acción -->
      <button class="w-full py-3.5 bg-slate-800 hover:bg-amber-400 text-slate-200 hover:text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md"
              onclick="window.abrirDetallesPartido('${encodeURIComponent(JSON.stringify(p))}')">
        <i class="fas fa-clipboard-list"></i> Ver Convocados y Detalles
      </button>
    </div>
  `;
  return div;
}

/** Modal de detalles completo con pestaña de Convocados */
export function abrirDetallesPartido(partidoData) {
  const p = JSON.parse(decodeURIComponent(partidoData));
  
  const setElText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  const setElSrc = (id, src) => { const el = document.getElementById(id); if (el) el.src = src; };

  setElText('modal-categoria', 'CAT. ' + (p.categoria || 'GENERAL'));
  setElText('modal-torneo', p.descripcion ? p.descripcion.toUpperCase() : 'PARTIDO PROGRAMADO');
  
  // Local
  const escudoLoc = getEscudoUrl(p.escudo_local || p.escudo, p.equipolocal);
  setElText('modal-local-name', p.equipolocal || 'DIBA FBC');
  setElText('modal-local-name-mob', (p.equipolocal || 'DIBA').substring(0, 4));
  setElSrc('modal-local-shield', escudoLoc);
  
  // Visitante
  const escudoVis = getEscudoUrl(p.escudo_visitante, p.equipovisitante);
  setElText('modal-visit-name', p.equipovisitante || 'RIVAL');
  setElText('modal-visit-name-mob', (p.equipovisitante || 'RIV').substring(0, 4));
  setElSrc('modal-visit-shield', escudoVis);

  // Score / Hora
  const partes = (p.resultado || '').split(/[-:]/).map(x => x.trim());
  const tieneResult = partes.length >= 2 && partes[0] !== '' && partes[1] !== '';
  setElText('modal-score', tieneResult ? `${partes[0]} - ${partes[1]}` : (p.hora || 'VS'));

  // Date
  setElText('modal-date', `${p.hora || '00:00'} • ${formatearFechaLarga(p.fecha).toUpperCase()}`);

  // Resumen
  setElText('modal-lugar', p.Cancha || 'No especificado');
  setElText('modal-uniforme', p.uniforme || 'Uniforme de competencia');
  setElText('modal-valor', p.valor ? '$' + Number(p.valor).toLocaleString('es-CO') : '$6.000');
  setElText('modal-obs', p.observaciones || 'Sin observaciones registradas.');

  // Parse Convocados
  const convocados = extraerConvocados(p.observaciones);
  const containerConvocados = document.getElementById('modal-convocados-list');
  const emptyConvocados = document.getElementById('modal-convocados-empty');

  if (containerConvocados) {
    containerConvocados.innerHTML = '';
    if (convocados.length > 0) {
      if (emptyConvocados) emptyConvocados.style.display = 'none';
      containerConvocados.style.display = 'grid';
      convocados.forEach((nombre, idx) => {
        const item = document.createElement('div');
        item.className = 'flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-sm';
        item.innerHTML = `
          <div class="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
            ${idx + 1}
          </div>
          <div class="min-w-0 flex-1">
            <span class="text-xs font-black uppercase text-white truncate block">${nombre}</span>
            <span class="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Convocado DIBA</span>
          </div>
        `;
        containerConvocados.appendChild(item);
      });
    } else {
      if (emptyConvocados) emptyConvocados.style.display = 'block';
      containerConvocados.style.display = 'none';
    }
  }

  // Show modal
  const m = document.getElementById('match-details-modal');
  if (m) {
    m.classList.remove('hidden');
    m.classList.remove('pointer-events-none');
    setTimeout(() => m.classList.remove('opacity-0'), 10);
    setTimeout(() => m.classList.add('opacity-100'), 10);
  }
}

export function activarPestanaMapa(lugar) {
  const btnMapa = document.querySelector('.tab-btn[data-tab="mapa-tab"]');
  if (btnMapa) {
    btnMapa.click();
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }
}

/** Tarjeta de entrenamiento */
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
    <div class="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 flex flex-col gap-5 transition-all duration-300 shadow-xl group relative overflow-hidden h-full backdrop-blur-sm">
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>

      <div class="flex items-center justify-between relative z-10">
        <span class="border border-emerald-500/30 text-emerald-400 px-3.5 py-1 rounded-xl text-[0.65rem] font-black tracking-widest uppercase bg-emerald-500/5">
          CAT. ${e.categoria || 'GENERAL'}
        </span>
        ${badgeStatus}
      </div>

      <div class="flex items-center gap-4 py-2 relative z-10">
        <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.15)]">
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

      <button onclick="window.activarPestanaMapa('${e.lugar || ''}')" class="w-full mt-auto py-3 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 text-emerald-400 rounded-xl text-[0.7rem] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95">
        <i class="fas fa-location-dot"></i> Ver Cancha / Ubicación
      </button>
    </div>
  `;
  return div;
}

/** Carga y filtra partidos automáticamente */
export async function filtrarPartidos() {
  if (!resultsPartidos) return;

  resultsPartidos.innerHTML = '';
  mostrarSpinner('partidos-spinner', true);

  const fecha = inputFecha?.value;
  const categoria = currentCategoriaFilter || inputCategoria?.value;

  let query = supabase.from('partidos')
    .select('id, fecha, hora, equipolocal, equipovisitante, resultado, categoria, Cancha, descripcion, uniforme, valor, observaciones, metodo_pago, escudo_local, escudo_visitante, escudo');

  if (fecha) query = query.gte('fecha', fecha).lte('fecha', fecha + 'T23:59:59Z');
  if (categoria) query = query.ilike('categoria', `%${categoria}%`);

  const { data: filtrados, error } = await query.order('fecha', { ascending: false }).limit(60);

  mostrarSpinner('partidos-spinner', false);

  if (error) {
    resultsPartidos.innerHTML = `
      <div class="col-span-full text-center py-12 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p class="text-sm font-bold">Error al sincronizar con la base de datos de partidos.</p>
      </div>`;
    return;
  }

  if (!filtrados || filtrados.length === 0) {
    resultsPartidos.innerHTML = `
      <div class="col-span-full text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8">
        <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500 text-2xl">
          <i class="fas fa-futbol"></i>
        </div>
        <h4 class="text-base font-black uppercase tracking-tight text-white">No hay partidos encontrados</h4>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Prueba seleccionando otra categoría o limpiando el filtro de fecha.</p>
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
  if (fecha) query = query.gte('fecha', fecha).lte('fecha', fecha + 'T23:59:59Z');
  if (cat) query = query.ilike('categoria', `%${cat}%`);

  const { data: filtrados, error } = await query.order('fecha', { ascending: false }).limit(30);

  mostrarSpinner('entrenamientos-spinner', false);

  if (error) {
    resultsEnt.innerHTML = `<p class="col-span-full text-center text-rose-400 py-8"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar entrenamientos.</p>`;
    return;
  }

  if (!filtrados || filtrados.length === 0) {
    resultsEnt.innerHTML = `
      <div class="col-span-full text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8">
        <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-2xl">
          <i class="fas fa-dumbbell"></i>
        </div>
        <h4 class="text-base font-black uppercase tracking-tight text-white">No hay entrenamientos agendados</h4>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Prueba seleccionando otra fecha o categoría.</p>
      </div>`;
    return;
  }

  filtrados.forEach(e => resultsEnt.appendChild(crearTarjetaEntrenamiento(e)));
}

/** Carga estadísticas rápidas en el Hero */
export async function cargarEstadisticasRapidas() {
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
    const step = Math.max(1, Math.floor(val / 15));
    const interval = setInterval(() => {
      cur = Math.min(cur + step, val);
      el.textContent = cur;
      if (cur >= val) clearInterval(interval);
    }, 30);
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
        filtrarPartidos();
        cargarEstadisticasRapidas();
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
