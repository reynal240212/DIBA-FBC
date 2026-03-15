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

/** Determina badge de resultado para un partido */
function badgeResultado(resultado) {
  if (!resultado || resultado === 'Pendiente' || resultado === '-') {
    return '<span class="badge-resultado badge-pendiente">Pendiente</span>';
  }
  const lower = resultado.toLowerCase();
  if (lower.includes('victoria') || lower.includes('ganó') || lower.includes('ganamos') || lower.startsWith('w')) {
    return `<span class="badge-resultado badge-victoria"><i class="fas fa-check mr-1"></i>Victoria</span>`;
  }
  if (lower.includes('derrota') || lower.includes('perdió') || lower.includes('perdimos') || lower.startsWith('l')) {
    return `<span class="badge-resultado badge-derrota"><i class="fas fa-times mr-1"></i>Derrota</span>`;
  }
  if (lower.includes('empat')) {
    return `<span class="badge-resultado badge-empate">Empate</span>`;
  }
  return `<span class="badge-resultado badge-pendiente">${resultado}</span>`;
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
    return 'images/ESCUDO.png';
  }
  if (!url) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(equipoNombre || 'R')}&background=1e293b&color=cbd5e1`;
  }
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=https://ui-avatars.com/api/?name=R&background=1e293b&color=cbd5e1`;
}

// ──────────────────────────────────────────────────────────────────────────────
//  TARJETA DE PARTIDO
// ──────────────────────────────────────────────────────────────────────────────
function crearTarjetaPartido(p) {
  const div = document.createElement('div');
  div.className = 'match-card animate__animated animate__fadeInUp';

  const partes = (p.resultado || '').split(/[-:]/).map(x => x.trim());
  const golesLocal = partes[0] || '—';
  const golesVisitante = partes[1] || '—';
  const tieneResult = partes.length >= 2 && partes[0] !== '' && partes[1] !== '';

  div.innerHTML = `
    <!-- Cabecera equipos -->
    <div class="p-5">
      <div class="flex items-center justify-between mb-3 text-[10px] uppercase font-black tracking-widest text-amber-500/80">
        <span>${p.descripcion || 'Competición'}</span>
        <span class="bg-amber-500/10 px-2 py-0.5 rounded-full">CAT. ${p.categoria || 'GENERAL'}</span>
      </div>
      
      <div class="flex items-center justify-between gap-4">
        <!-- Local -->
        <div class="flex flex-col items-center w-1/3 text-center">
          <img src="${getEscudoUrl(p.escudo_local || p.escudo, p.equipolocal)}" alt="${p.equipolocal}" class="w-12 h-12 object-contain mb-2 img-drop-shadow" onerror="this.src='images/ESCUDO.png'">
          <span class="text-white font-bold text-xs truncate w-full">${p.equipolocal || 'DIBA FBC'}</span>
        </div>

        <!-- Score/VS -->
        <div class="flex flex-col items-center justify-center w-1/3">
           ${tieneResult 
             ? `<span class="match-score font-black text-2xl tracking-tight text-white">${golesLocal} – ${golesVisitante}</span>`
             : `<span class="vs-badge text-amber-500 font-black">VS</span>`
           }
           <div class="mt-2">
             ${badgeResultado(p.resultado)}
           </div>
        </div>

        <!-- Visitante -->
        <div class="flex flex-col items-center w-1/3 text-center">
          <img src="${getEscudoUrl(p.escudo_visitante, p.equipovisitante)}" 
               alt="${p.equipovisitante}" 
               class="w-12 h-12 object-contain mb-2 img-drop-shadow" 
               onerror="this.src='${getEscudoUrl(null, p.equipovisitante)}'">
          <span class="text-white font-bold text-xs truncate w-full">${p.equipovisitante || 'Visitante'}</span>
        </div>
      </div>
    </div>

    <!-- Detalles -->
    <div class="border-t border-slate-800 px-5 py-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
      <div class="flex items-center gap-2">
        <i class="fas fa-calendar-alt text-amber-400 w-4 text-center"></i>
        <span>${formatearFecha(p.fecha)}</span>
      </div>
      <div class="flex items-center gap-2">
        <i class="fas fa-clock text-amber-400 w-4 text-center"></i>
        <span>${p.hora || 'Sin hora'}</span>
      </div>
      <div class="flex items-center gap-2 col-span-2">
        <i class="fas fa-map-marker-alt text-red-400 w-4 text-center"></i>
        <span>${p.Cancha || 'No especificada'}</span>
      </div>
      ${p.descripcion ? `
      <div class="flex items-start gap-2 col-span-2">
        <i class="fas fa-align-left text-sky-400 w-4 text-center mt-0.5"></i>
        <span class="text-slate-300">${p.descripcion}</span>
      </div>` : ''}
      ${p.uniforme ? `
      <div class="flex items-center gap-2">
        <i class="fas fa-tshirt text-purple-400 w-4 text-center"></i>
        <span>Uniforme: ${p.uniforme}</span>
      </div>` : ''}
      ${p.valor ? `
      <div class="flex items-center gap-2">
        <i class="fas fa-dollar-sign text-green-400 w-4 text-center"></i>
        <span>$${p.valor}</span>
      </div>` : ''}
      ${p.observaciones ? `
      <div class="flex items-start gap-2 col-span-2">
        <i class="fas fa-comment-dots text-indigo-400 w-4 text-center mt-0.5"></i>
        <span>${p.observaciones}</span>
      </div>` : ''}
    </div>
  `;
  return div;
}

// ──────────────────────────────────────────────────────────────────────────────
//  TARJETA DE ENTRENAMIENTO
// ──────────────────────────────────────────────────────────────────────────────
function crearTarjetaEntrenamiento(e) {
  const div = document.createElement('div');
  div.className = 'match-card animate__animated animate__fadeInUp';
  div.style.borderColor = 'rgba(74,222,128,0.15)';

  div.innerHTML = `
    <div class="p-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-dumbbell text-green-400"></i>
        </div>
        <div>
          <p class="font-black text-white text-sm">${e.titulo || 'Entrenamiento'}</p>
          <p class="text-xs text-green-400 mt-0.5">Sesión de entrenamiento</p>
        </div>
      </div>
    </div>
    <div class="border-t border-slate-800 px-5 py-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
      <div class="flex items-center gap-2">
        <i class="fas fa-calendar-alt text-green-400 w-4 text-center"></i>
        <span>${formatearFecha(e.fecha)}</span>
      </div>
      <div class="flex items-center gap-2">
        <i class="fas fa-clock text-green-400 w-4 text-center"></i>
        <span>${e.hora || 'Sin hora'}</span>
      </div>
      <div class="flex items-center gap-2 col-span-2">
        <i class="fas fa-map-marker-alt text-red-400 w-4 text-center"></i>
        <span>${e.lugar || 'No especificado'}</span>
      </div>
      ${e.descripcion ? `
      <div class="flex items-start gap-2 col-span-2">
        <i class="fas fa-align-left text-sky-400 w-4 text-center mt-0.5"></i>
        <span class="text-slate-300">${e.descripcion}</span>
      </div>` : ''}
      ${e.observaciones ? `
      <div class="flex items-start gap-2 col-span-2">
        <i class="fas fa-comment-dots text-indigo-400 w-4 text-center mt-0.5"></i>
        <span>${e.observaciones}</span>
      </div>` : ''}
    </div>
  `;
  return div;
}

// ──────────────────────────────────────────────────────────────────────────────
//  PARTIDOS — FILTRO POR FECHA
// ──────────────────────────────────────────────────────────────────────────────
const inputFecha = document.getElementById('fecha');
const resultsPartidos = document.getElementById('partidos-results');

async function filtrarPartidos() {
  const fecha = inputFecha?.value;
  mostrarInicialPanel('partidos-estado-inicial', false);
  resultsPartidos.innerHTML = '';

  if (!fecha) {
    mostrarInicialPanel('partidos-estado-inicial', true);
    return;
  }

  mostrarSpinner('partidos-spinner', true);

  const { data: filtrados, error } = await sb
    .from('partidos')
    .select('*')
    .eq('fecha', fecha);

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
        <p class="text-slate-500 text-sm">No hay partidos registrados para esta fecha</p>
      </div>`;
    return;
  }

  filtrados.forEach(p => resultsPartidos.appendChild(crearTarjetaPartido(p)));
}

if (inputFecha) inputFecha.addEventListener('change', filtrarPartidos);

// ──────────────────────────────────────────────────────────────────────────────
//  ENTRENAMIENTOS — FILTRO POR FECHA
// ──────────────────────────────────────────────────────────────────────────────
const inputFechaEnt = document.getElementById('fecha-entrenamiento');
const resultsEnt = document.getElementById('entrenamientos-results');

async function filtrarEntrenamientos() {
  const fecha = inputFechaEnt?.value;
  mostrarInicialPanel('entrenamientos-estado-inicial', false);
  resultsEnt.innerHTML = '';

  if (!fecha) {
    mostrarInicialPanel('entrenamientos-estado-inicial', true);
    return;
  }

  mostrarSpinner('entrenamientos-spinner', true);

  const { data: filtrados, error } = await sb
    .from('entrenamientos')
    .select('*')
    .eq('fecha', fecha);

  mostrarSpinner('entrenamientos-spinner', false);

  if (error) {
    resultsEnt.innerHTML = `<p class="text-center text-red-400 py-8"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar entrenamientos.</p>`;
    return;
  }

  if (!filtrados || filtrados.length === 0) {
    resultsEnt.innerHTML = `
      <div class="text-center py-14">
        <div class="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-dumbbell text-slate-600 text-xl"></i>
        </div>
        <p class="text-slate-500 text-sm">No hay entrenamientos registrados para esta fecha</p>
      </div>`;
    return;
  }

  filtrados.forEach(e => resultsEnt.appendChild(crearTarjetaEntrenamiento(e)));
}

if (inputFechaEnt) inputFechaEnt.addEventListener('change', filtrarEntrenamientos);

// Botones limpiar
const btnLimpiarPartidos = document.getElementById('btn-limpiar-partidos');
if (btnLimpiarPartidos) {
  btnLimpiarPartidos.addEventListener('click', () => {
    const f = document.getElementById('fecha');
    if (f) f.value = '';
    resultsPartidos.innerHTML = '';
    mostrarInicialPanel('partidos-estado-inicial', true);
  });
}

const btnLimpiarEnt = document.getElementById('btn-limpiar-entrenamientos');
if (btnLimpiarEnt) {
  btnLimpiarEnt.addEventListener('click', () => {
    const f = document.getElementById('fecha-entrenamiento');
    if (f) f.value = '';
    resultsEnt.innerHTML = '';
    mostrarInicialPanel('entrenamientos-estado-inicial', true);
  });
}
// ──────────────────────────────────────────────────────────────────────────────
async function mostrarClasificacion() {
  const container = document.getElementById('clasificacion-container');
  const spinner = document.getElementById('clasificacion-spinner');
  if (!container) return;

  if (spinner) spinner.style.display = 'flex';

  const { data, error } = await sb
    .from('clasificacion_categoria_2014_15')
    .select('*')
    .order('posicion', { ascending: true });

  if (spinner) spinner.style.display = 'none';

  if (error || !data?.length) {
    container.innerHTML = `<p class="text-center text-slate-500 py-8">No hay datos de clasificación disponibles.</p>`;
    return;
  }

  const tabla = document.createElement('table');
  tabla.className = 'tabla-clas w-full text-left text-white';
  tabla.innerHTML = `
    <thead>
      <tr>
        <th class="text-center">#</th>
        <th>Equipo</th>
        <th class="text-center">Pts</th>
        <th class="text-center">PJ</th>
        <th class="text-center">PG</th>
        <th class="text-center">PE</th>
        <th class="text-center">PP</th>
        <th class="text-center">GF</th>
        <th class="text-center">GC</th>
        <th class="text-center">DIF</th>
      </tr>
    </thead>
    <tbody>
      ${data.map(e => {
    const isDiba = e.equipo?.toLowerCase().includes('diba');
    return `
        <tr class="${isDiba ? 'diba-row' : ''}">
          <td class="text-center font-bold">${e.posicion}</td>
          <td class="font-semibold flex items-center gap-2">
            ${isDiba ? '<i class="fas fa-star text-amber-400 text-xs"></i>' : ''}
            ${e.equipo}
          </td>
          <td class="text-center font-bold ${isDiba ? '' : 'text-white'}">${e.puntos}</td>
          <td class="text-center">${e.jugados}</td>
          <td class="text-center text-green-400">${e.ganados}</td>
          <td class="text-center">${e.empatados}</td>
          <td class="text-center text-red-400">${e.perdidos}</td>
          <td class="text-center">${e.goles_favor}</td>
          <td class="text-center">${e.goles_contra}</td>
          <td class="text-center ${e.diferencia > 0 ? 'text-green-400' : e.diferencia < 0 ? 'text-red-400' : ''}">${e.diferencia > 0 ? '+' : ''}${e.diferencia}</td>
        </tr>`;
  }).join('')}
    </tbody>
  `;
  container.appendChild(tabla);
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
    .select('resultado')
    .or('equipolocal.ilike.%DIBA%,equipovisitante.ilike.%DIBA%');

  if (!data) return;

  const total = data.length;
  let victorias = 0, derrotas = 0, empates = 0;

  data.forEach(p => {
    const r = (p.resultado || '').toLowerCase();
    if (r.includes('victoria') || r.includes('ganó') || r.includes('ganamos')) victorias++;
    else if (r.includes('derrota') || r.includes('perdió') || r.includes('perdimos')) derrotas++;
    else if (r.includes('empat')) empates++;
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
});
