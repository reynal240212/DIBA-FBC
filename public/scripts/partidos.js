/** 
 * public/scripts/partidos.js - Migrado a Spring Boot API
 */

const API_BASE = 'http://localhost:8080/api';

// ──────────────────────────────────────────────────────────────────────────────
//  UTILIDADES
// ──────────────────────────────────────────────────────────────────────────────

function mostrarSpinner(id, v) {
  const el = document.getElementById(id);
  if (el) el.style.display = v ? 'flex' : 'none';
}

function mostrarInicialPanel(id, v) {
  const el = document.getElementById(id);
  if (el) el.style.display = v ? 'block' : 'none';
}

// ──────────────────────────────────────────────────────────────────────────────
//  TARJETA DE PARTIDO
// ──────────────────────────────────────────────────────────────────────────────
function crearTarjetaPartido(p) {
  const div = document.createElement('div');
  div.className = 'match-card animate__animated animate__fadeInUp';

  let statusBadge = '';
  if (p.estado === 'FINALIZADO') {
    statusBadge = `<span class="badge-resultado badge-victoria"><i class="fas fa-check mr-1"></i>Finalizado</span>`;
  } else if (p.estado === 'EN_VIVO') {
    statusBadge = `<span class="badge-resultado bg-red-500 text-white animate-pulse border-none">En Vivo</span>`;
  } else {
    statusBadge = `<span class="badge-resultado badge-pendiente">Próximo</span>`;
  }

  const tieneResult = p.resultado && p.resultado !== '' && p.resultado !== '-';

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
          <img src="${p.escudoLocal}" alt="${p.equipoLocal}" class="w-12 h-12 object-contain mb-2 img-drop-shadow" onerror="this.src='/images/ESCUDO.png'">
          <span class="text-white font-bold text-xs truncate w-full">${p.equipoLocal}</span>
        </div>

        <!-- Score/VS -->
        <div class="flex flex-col items-center justify-center w-1/3">
           ${tieneResult 
             ? `<span class="match-score font-black text-2xl tracking-tight text-white">${p.resultado}</span>`
             : `<span class="vs-badge text-amber-500 font-black">VS</span>`
           }
            <div class="mt-2 text-center">
             ${statusBadge}
            </div>
        </div>

        <!-- Visitante -->
        <div class="flex flex-col items-center w-1/3 text-center">
          <img src="${p.escudoVisitante}" alt="${p.equipoVisitante}" class="w-12 h-12 object-contain mb-2 img-drop-shadow" onerror="this.src='/images/ESCUDO.png'">
          <span class="text-white font-bold text-xs truncate w-full">${p.equipoVisitante}</span>
        </div>
      </div>
    </div>

    <!-- Detalles -->
    <div class="border-t border-slate-800 px-5 py-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
      <div class="flex items-center gap-2">
        <i class="fas fa-calendar-alt text-amber-400 w-4 text-center"></i>
        <span>${p.fecha}</span>
      </div>
      <div class="flex items-center gap-2">
        <i class="fas fa-clock text-amber-400 w-4 text-center"></i>
        <span>${p.hora || 'Sin hora'}</span>
      </div>
      <div class="flex items-center gap-2 col-span-2">
        <i class="fas fa-map-marker-alt text-red-400 w-4 text-center"></i>
        <span>${p.cancha || 'No especificada'}</span>
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
  const sectionDiba = document.getElementById('section-diba-fbc');
  mostrarInicialPanel('partidos-estado-inicial', false);
  resultsPartidos.innerHTML = '';

  if (!fecha) {
    mostrarInicialPanel('partidos-estado-inicial', true);
    if (sectionDiba) sectionDiba.style.display = 'block';
    return;
  }

  if (sectionDiba) sectionDiba.style.display = 'none';

  mostrarSpinner('partidos-spinner', true);

  try {
    const response = await fetch(`${API_BASE}/partidos/fecha?val=${fecha}`);
    const filtrados = await response.json();

    mostrarSpinner('partidos-spinner', false);

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
  } catch (error) {
    mostrarSpinner('partidos-spinner', false);
    resultsPartidos.innerHTML = `<p class="text-center text-red-400 py-8"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar partidos desde API.</p>`;
  }
}

if (inputFecha) inputFecha.addEventListener('change', filtrarPartidos);

// ──────────────────────────────────────────────────────────────────────────────
//  PARTIDOS DIBA FBC (sección inferior)
// ──────────────────────────────────────────────────────────────────────────────
async function mostrarPartidosDIBA() {
  const container = document.getElementById('diba-slider');
  const spinner = document.getElementById('diba-spinner');
  if (!container) return;

  if (spinner) spinner.style.display = 'flex';

  try {
    const response = await fetch(`${API_BASE}/partidos/equipo?val=DIBA`);
    const data = await response.json();

    if (spinner) spinner.style.display = 'none';

    if (!data?.length) {
      container.innerHTML = `<p class="text-slate-500 text-sm text-center col-span-3">No hay partidos de DIBA FBC registrados.</p>`;
      return;
    }

    data.forEach(p => container.appendChild(crearTarjetaPartido(p)));
  } catch (error) {
    if (spinner) spinner.style.display = 'none';
    container.innerHTML = `<p class="text-slate-500 text-sm text-center col-span-3">Error al cargar partidos de DIBA FBC.</p>`;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  ESTADÍSTICAS RÁPIDAS (hero)
// ──────────────────────────────────────────────────────────────────────────────
async function cargarEstadisticasRapidas() {
  try {
    const response = await fetch(`${API_BASE}/partidos/equipo?val=DIBA`);
    const data = await response.json();

    if (!data) return;

    const total = data.length;
    let victorias = 0, derrotas = 0, empates = 0;

    data.forEach(p => {
      if (p.estado === 'FINALIZADO') {
        // Lógica simple para stats rápidas
        if (p.resultado.includes('-')) {
          const res = p.resultado.split('-').map(x => parseInt(x.trim()));
          const localEsDiba = p.equipoLocal.toUpperCase().includes('DIBA');
          if (res[0] === res[1]) empates++;
          else if ((res[0] > res[1] && localEsDiba) || (res[1] > res[0] && !localEsDiba)) victorias++;
          else derrotas++;
        }
      }
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
  } catch (e) {
    console.error("Error al cargar stats:", e);
  }
}

// Botones limpiar
const btnLimpiarPartidos = document.getElementById('btn-limpiar-partidos');
if (btnLimpiarPartidos) {
  btnLimpiarPartidos.addEventListener('click', () => {
    if (inputFecha) inputFecha.value = '';
    resultsPartidos.innerHTML = '';
    mostrarInicialPanel('partidos-estado-inicial', true);
    const sectionDiba = document.getElementById('section-diba-fbc');
    if (sectionDiba) sectionDiba.style.display = 'block';
  });
}

// ──────────────────────────────────────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  mostrarPartidosDIBA();
  cargarEstadisticasRapidas();
});
