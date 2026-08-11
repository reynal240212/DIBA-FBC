// public/scripts/paridos.js — Versión mejorada

const { createClient } = window.supabase;
const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ──────────────────────────────────────────────────────────────────────────────
//  UTILIDADES
// ──────────────────────────────────────────────────────────────────────────────

/** Formatea una fecha ISO a "14 de marzo de 2025" */
function formatearFecha(fechaISO) {
  if (!fechaISO) return 'Sin fecha';
  return new Date(fechaISO).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

/** Convierte una fecha ISO a YYYY-MM-DD en hora local evitando desfases */
function toLocalDate(fechaISO) {
  if (!fechaISO) return '';
  const parts = fechaISO.includes('T') ? fechaISO.split('T')[0].split('-') : fechaISO.split('-');
  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

/** Evalúa el resultado de un partido para DIBA FBC */
function evaluarResultado(p) {
  const r = p.resultado;
  if (!r || r === 'Pendiente' || r === '-' || r === '—') return 'pendiente';

  const partes = r.split(/[-:]/).map(x => {
    const n = parseInt(x.trim());
    return isNaN(n) ? null : n;
  });

  if (partes.length >= 2 && partes[0] !== null && partes[1] !== null) {
    const golesL = partes[0];
    const golesV = partes[1];
    const localEsDiba = (p.equipolocal || '').toUpperCase().includes('DIBA');
    const visitaEsDiba = (p.equipovisitante || '').toUpperCase().includes('DIBA');

    if (golesL === golesV) return 'empate';
    const ganoL = golesL > golesV;
    if ((ganoL && localEsDiba) || (!ganoL && visitaEsDiba)) return 'victoria';
    if ((ganoL && visitaEsDiba) || (!ganoL && localEsDiba)) return 'derrota';
  }

  const lower = r.toLowerCase();
  if (lower.includes('victoria') || lower.includes('ganó') || lower.includes('ganamos') || lower.startsWith('w')) {
    return 'victoria';
  }
  if (lower.includes('derrota') || lower.includes('perdió') || lower.includes('perdimos') || lower.startsWith('l')) {
    return 'derrota';
  }
  if (lower.includes('empat')) {
    return 'empate';
  }

  return 'pendiente';
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

function mostrarSpinner(id, v) {
  const el = document.getElementById(id);
  if (el) el.style.display = v ? 'flex' : 'none';
}

function mostrarInicialPanel(id, v) {
  const el = document.getElementById(id);
  if (el) el.style.display = v ? 'block' : 'none';
}

/** Helper para escudos con proxy anti-bloqueo */
function getEscudoUrl(url, equipoNombre) {
  if (equipoNombre && equipoNombre.toUpperCase().includes('DIBA')) {
    return 'images/ESCUDO.webp';
  }
  // Generar initials (ej. NH para Nuevo Horizonte) usando ui-avatars, con estilo dark y amber text
  const avatarParams = `background=0f172a&color=f59e0b&size=256&bold=true&font-size=0.45&rounded=false`;
  if (!url) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(equipoNombre || 'R')}&${avatarParams}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=https://ui-avatars.com/api/?name=R&${avatarParams}`;
  }
  return url;
}

// ──────────────────────────────────────────────────────────────────────────────
//  TARJETA DE PARTIDO
// ──────────────────────────────────────────────────────────────────────────────
function crearTarjetaPartido(p) {
  const div = document.createElement('div');
  div.className = 'col-12 col-md-6 col-lg-4 animate__animated animate__fadeInUp';

  const partes = (p.resultado || '').split(/[-:]/).map(x => x.trim());
  const golesLocal = partes[0] || '—';
  const golesVisitante = partes[1] || '—';
  const tieneResult = partes.length >= 2 && partes[0] !== '' && partes[1] !== '';
  
  const isPending = !p.resultado || p.resultado === 'Pendiente' || p.resultado === '-' || p.resultado === '—';
  
  // Preparar estado del badge superior derecho
  let estadoText = 'PROGRAMADO';
  let estadoClass = 'border-blue-500/30 bg-blue-500/10 text-blue-400';
  if (!isPending) {
    const res = evaluarResultado(p);
    if (res === 'victoria') { estadoText = 'VICTORIA'; estadoClass = 'border-green-500/30 bg-green-500/10 text-green-400'; }
    else if (res === 'derrota') { estadoText = 'DERROTA'; estadoClass = 'border-red-500/30 bg-red-500/10 text-red-400'; }
    else if (res === 'empate') { estadoText = 'EMPATE'; estadoClass = 'border-slate-400/30 bg-slate-400/10 text-slate-300'; }
    else { estadoText = 'FINALIZADO'; estadoClass = 'border-slate-500/30 bg-slate-500/10 text-slate-400'; }
  }

  // Estilo de la tarjeta completo basado en la captura
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
          <div class="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
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

// Lógica del modal de detalles
window.abrirDetallesPartido = function(partidoData) {
  const p = JSON.parse(decodeURIComponent(partidoData));
  
  document.getElementById('modal-categoria').textContent = 'CAT. ' + (p.categoria || 'GENERAL');
  document.getElementById('modal-torneo').textContent = p.descripcion ? p.descripcion.toUpperCase() : 'PARTIDO PROGRAMADO';
  
  // Local
  document.getElementById('modal-local-name').textContent = p.equipolocal || 'LOCAL';
  document.getElementById('modal-local-name-mob').textContent = (p.equipolocal || 'LOC').substring(0,4);
  document.getElementById('modal-local-shield').src = getEscudoUrl(p.escudo_local || p.escudo, p.equipolocal);
  
  // Visitante
  document.getElementById('modal-visit-name').textContent = p.equipovisitante || 'VISITANTE';
  document.getElementById('modal-visit-name-mob').textContent = (p.equipovisitante || 'VIS').substring(0,4);
  document.getElementById('modal-visit-shield').src = getEscudoUrl(p.escudo_visitante, p.equipovisitante);

  // Score
  const partes = (p.resultado || '').split(/[-:]/).map(x => x.trim());
  const tieneResult = partes.length >= 2 && partes[0] !== '' && partes[1] !== '';
  if (tieneResult) {
    document.getElementById('modal-score').textContent = `${partes[0]} - ${partes[1]}`;
  } else {
    document.getElementById('modal-score').textContent = p.hora || 'VS';
  }

  // Date
  document.getElementById('modal-date').textContent = `${p.hora || '00:00'} • ${formatearFecha(p.fecha).toUpperCase()}`;

  // Resumen
  document.getElementById('modal-lugar').textContent = p.Cancha || 'No especificado';
  document.getElementById('modal-uniforme').textContent = p.uniforme || 'No especificado';
  document.getElementById('modal-valor').textContent = p.valor ? '$' + p.valor : 'No especificado';
  document.getElementById('modal-obs').textContent = p.observaciones || 'Sin observaciones registradas.';

  // Show
  const m = document.getElementById('match-details-modal');
  m.classList.remove('hidden');
  m.classList.remove('pointer-events-none');
  setTimeout(() => m.classList.remove('opacity-0'), 10);
  setTimeout(() => m.classList.add('opacity-100'), 10);
};

// Helper para cambiar a la pestaña de cancha/mapa
window.activarPestanaMapa = function(lugar) {
  const btnMapa = document.querySelector('.tab-btn[data-tab="mapa-tab"]');
  if (btnMapa) {
    btnMapa.click();
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
//  TARJETA DE ENTRENAMIENTO
// ──────────────────────────────────────────────────────────────────────────────
function crearTarjetaEntrenamiento(e) {
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
      <button onclick="activarPestanaMapa('${e.lugar || ''}')" class="w-full mt-auto py-3 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 text-emerald-400 rounded-xl text-[0.7rem] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95">
        <i class="fas fa-location-dot"></i> Ver Cancha / Ubicación
      </button>
    </div>
  `;
  return div;
}

// ──────────────────────────────────────────────────────────────────────────────
//  PARTIDOS — FILTRO POR FECHA
// ──────────────────────────────────────────────────────────────────────────────
const inputFecha = document.getElementById('fecha');
const inputCategoria = document.getElementById('filtro-categoria');
const resultsPartidos = document.getElementById('partidos-results');

async function filtrarPartidos() {
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

  let query = sb.from('partidos').select('*');
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

if (inputFecha) inputFecha.addEventListener('change', filtrarPartidos);
if (inputCategoria) inputCategoria.addEventListener('change', filtrarPartidos);

// ──────────────────────────────────────────────────────────────────────────────
//  ENTRENAMIENTOS — CÁRGA Y FILTRO
// ──────────────────────────────────────────────────────────────────────────────
const inputFechaEnt = document.getElementById('fecha-entrenamiento');
const inputCatEnt = document.getElementById('filtro-categoria-entrenamientos');
const resultsEnt = document.getElementById('entrenamientos-results');

async function cargarEntrenamientos() {
  if (!resultsEnt) return;
  
  const fecha = inputFechaEnt?.value;
  const cat = inputCatEnt?.value;
  resultsEnt.innerHTML = '';

  mostrarSpinner('entrenamientos-spinner', true);

  let query = sb.from('entrenamientos').select('*');
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

if (inputFechaEnt) inputFechaEnt.addEventListener('change', cargarEntrenamientos);
if (inputCatEnt) inputCatEnt.addEventListener('change', cargarEntrenamientos);

// Botones limpiar
const btnLimpiarPartidos = document.getElementById('btn-limpiar-partidos');
if (btnLimpiarPartidos) {
  btnLimpiarPartidos.addEventListener('click', () => {
    const f = document.getElementById('fecha');
    if (f) f.value = '';
    const c = document.getElementById('filtro-categoria');
    if (c) c.value = '';
    resultsPartidos.innerHTML = '';
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
// ──────────────────────────────────────────────────────────────────────────────
async function mostrarClasificacion() {
  const container = document.getElementById('clasificacion-container');
  const spinner = document.getElementById('clasificacion-spinner');
  if (!container) return;

  if (spinner) spinner.style.display = 'flex';

  try {
    const response = await fetch('data/clasificaciones.json');
    if (!response.ok) throw new Error('No se pudo cargar el archivo de clasificaciones');
    const data = await response.json();
    
    if (spinner) spinner.style.display = 'none';

    if (!data?.cat_2014_15?.length) {
      container.innerHTML = `<p class="text-center text-slate-500 py-8">No hay datos de clasificación disponibles.</p>`;
      return;
    }

    // Sort dataset by points DESC, then difference DESC, then goals favor DESC
    const sorted = [...data.cat_2014_15].sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
      return b.goles_favor - a.goles_favor;
    });

    const tabla = document.createElement('table');
    tabla.className = 'tabla-clas w-full text-left text-white';
    tabla.innerHTML = `
      <thead>
        <tr>
          <th class="text-center w-12">#</th>
          <th>Equipo</th>
          <th class="text-center w-12">Pts</th>
          <th class="text-center w-10">PJ</th>
          <th class="text-center w-10">PG</th>
          <th class="text-center w-10">PE</th>
          <th class="text-center w-10">PP</th>
          <th class="text-center w-12">GF</th>
          <th class="text-center w-12">GC</th>
          <th class="text-center w-12">DIF</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map((e, index) => {
          const position = index + 1;
          const isDiba = e.equipo?.toUpperCase().includes('DIBA');
          
          let posBadge = '';
          if (position === 1) {
            posBadge = `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-black shadow-md shadow-yellow-500/20"><i class="fas fa-crown text-[7px] mr-0.5"></i>1</span>`;
          } else if (position === 2) {
            posBadge = `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 text-black text-[10px] font-black shadow-md shadow-slate-400/20">2</span>`;
          } else if (position === 3) {
            posBadge = `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-black shadow-md shadow-amber-700/20">3</span>`;
          } else {
            posBadge = `<span class="text-slate-500 text-[11px] font-bold">${position}</span>`;
          }

          let teamNameHTML = '';
          if (isDiba) {
            teamNameHTML = `
              <span class="flex items-center gap-1.5 text-yellow-400 font-extrabold tracking-wide drop-shadow-[0_0_8px_rgba(234,179,8,0.2)]">
                <i class="fas fa-shield-halved text-[10px] animate-pulse"></i>
                ${e.equipo}
                <span class="text-[7px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-500/30 uppercase tracking-widest font-black">Nosotros</span>
              </span>
            `;
          } else {
            teamNameHTML = `<span class="text-slate-300 font-medium">${e.equipo}</span>`;
          }

          return `
            <tr class="${isDiba ? 'diba-row' : ''}">
              <td class="text-center font-bold">${posBadge}</td>
              <td class="font-semibold py-3">${teamNameHTML}</td>
              <td class="text-center font-bold text-[13px] ${isDiba ? 'text-yellow-400' : 'text-white'}">${e.puntos}</td>
              <td class="text-center text-slate-400">${e.jugados}</td>
              <td class="text-center text-green-400">${e.ganados}</td>
              <td class="text-center text-slate-400">${e.empatados}</td>
              <td class="text-center text-red-400">${e.perdidos}</td>
              <td class="text-center text-slate-500 text-[10px]">${e.goles_favor}</td>
              <td class="text-center text-slate-500 text-[10px]">${e.goles_contra}</td>
              <td class="text-center font-bold ${e.diferencia > 0 ? 'text-green-400' : e.diferencia < 0 ? 'text-red-400' : 'text-slate-400'}">${e.diferencia > 0 ? '+' : ''}${e.diferencia}</td>
            </tr>`;
        }).join('')}
      </tbody>
    `;
    container.innerHTML = '';
    container.appendChild(tabla);
  } catch (err) {
    console.error('Error loading standings in partidos.js:', err);
    if (spinner) spinner.style.display = 'none';
    container.innerHTML = `<p class="text-center text-slate-500 py-8"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar datos de clasificación.</p>`;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  PARTIDOS DIBA FBC (sección inferior)
// ──────────────────────────────────────────────────────────────────────────────
async function mostrarPartidosDIBA() {
  const container = document.getElementById('diba-slider');
  const spinner = document.getElementById('diba-spinner');
  if (!container) return;

  if (spinner) spinner.style.display = 'flex';

  const { data, error } = await sb
    .from('partidos')
    .select('*')
    .or('equipolocal.ilike.%DIBA%,equipovisitante.ilike.%DIBA%')
    .order('fecha', { ascending: false });

  if (spinner) spinner.style.display = 'none';

  if (error) {
    container.innerHTML = `<p class="text-slate-500 text-sm text-center col-span-3">No se pudieron cargar los partidos de DIBA FBC.</p>`;
    return;
  }

  if (!data?.length) {
    container.innerHTML = `<p class="text-slate-500 text-sm text-center col-span-3">No hay partidos de DIBA FBC registrados.</p>`;
    return;
  }

  data.forEach(p => container.appendChild(crearTarjetaPartido(p)));
}

// ──────────────────────────────────────────────────────────────────────────────
//  ESTADÍSTICAS RÁPIDAS (hero)
// ──────────────────────────────────────────────────────────────────────────────
async function cargarEstadisticasRapidas() {
  const { data } = await sb
    .from('partidos')
    .select('*')
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

// ──────────────────────────────────────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  mostrarClasificacion();
  mostrarPartidosDIBA();
  cargarEstadisticasRapidas();
  cargarEntrenamientos();

  // Activar pestaña según parámetro de URL ?tab=entrenamientos
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

  // Supabase Real-time para recargar en vivo si el admin actualiza partidos o entrenamientos
  try {
    sb.channel('public:partidos_entrenamientos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidos' }, payload => {
        console.log('¡Cambio en partidos detectado en Supabase! Recargando datos...', payload);
        mostrarPartidosDIBA();
        cargarEstadisticasRapidas();
        const f = document.getElementById('fecha');
        if (f && f.value) filtrarPartidos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entrenamientos' }, payload => {
        console.log('¡Cambio en entrenamientos detectado en Supabase! Recargando datos...', payload);
        cargarEntrenamientos();
      })
      .subscribe();
  } catch (err) {
    console.error("Error suscribiendo a Realtime:", err);
  }
});
