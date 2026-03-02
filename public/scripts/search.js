/**
 * DIBA FBC - Buscador Global
 * 
 * Se carga en todas las páginas. Inyecta el modal de búsqueda en el body
 * y lo activa cuando el documento está listo, independientemente de cuándo
 * se haya cargado el navbar.
 */

// ── Índice de páginas ---------------------------------------------------
const SEARCH_PAGES = [
    { title: 'Inicio', url: 'index.html', icon: 'fa-home', tags: 'inicio home portada principal noticias patrocinadores' },
    { title: 'Historia del Club', url: 'Historia.html', icon: 'fa-book-open', tags: 'historia fundación origen años pasado trayectoria' },
    { title: 'Escudo DIBA FBC', url: 'escudo.html', icon: 'fa-shield-alt', tags: 'escudo logo símbolo emblema identidad' },
    { title: 'Visión y Misión', url: 'vision_mision.html', icon: 'fa-compass', tags: 'vision mision objetivo valores disciplina respeto formacion ejes' },
    { title: 'Galería Multimedia', url: 'galeria.html', icon: 'fa-images', tags: 'galeria fotos videos partidos campeonatos celebraciones cultura multimedia' },
    { title: 'Plantilla de Jugadores', url: 'ficha.html', icon: 'fa-users', tags: 'plantilla jugadores equipo ficha nómina' },
    { title: 'Partidos y Entrenamiento', url: 'partidos.html', icon: 'fa-futbol', tags: 'partidos entrenamiento resultado calendario fixture' },
    { title: 'Estadísticas', url: 'analisis.html', icon: 'fa-chart-bar', tags: 'estadisticas analisis datos rendimiento goles asistencias' },
    { title: 'Noticias', url: 'Noticias.html', icon: 'fa-newspaper', tags: 'noticias actualidad novedades indumentaria uniforme' },
    { title: 'Social DIBA', url: 'socialDIBA.html', icon: 'fa-comments', tags: 'social chat comunidad publicaciones muro red social' },
    { title: 'Contacto', url: 'contacto.html', icon: 'fa-envelope', tags: 'contacto correo email teléfono mensaje formulario' },
    { title: 'Ayuda', url: 'ayuda.html', icon: 'fa-question-circle', tags: 'ayuda soporte faq preguntas frecuentes' },
    { title: 'Torneo Kids Soccer Pradera', url: 'KidsSoccerPradera.html', icon: 'fa-child', tags: 'torneo kids soccer pradera categorias sub infantil' },
    { title: 'Torneo SurOccidente', url: 'torneo_suroccidente.html', icon: 'fa-trophy', tags: 'torneo suroccidente competencia liga copa' },
    { title: 'Lista de Jugadores', url: 'listaJugadores.html', icon: 'fa-list', tags: 'lista jugadores nombres categorías registrados' },
    { title: 'Registro de Jugador', url: 'registro.html', icon: 'fa-user-plus', tags: 'registro nuevo jugador inscripción formulario' },
];

// ── Inyectar HTML del modal en el body ---------------------------------
function injectSearchModal() {
    if (document.getElementById('search-overlay')) return; // ya existe

    const modalHTML = `
<div id="search-overlay"
     role="dialog" aria-modal="true" aria-label="Buscador del sitio"
     style="display:none;"
     class="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4">
  <div id="search-backdrop" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
  <div id="search-panel"
       class="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
       style="animation: searchIn 0.25s ease;">
    <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
      <i class="fas fa-search text-amber-400 text-lg flex-shrink-0"></i>
      <input id="search-input" type="text"
             placeholder="Buscar en DIBA FBC..."
             autocomplete="off" spellcheck="false"
             class="w-full bg-transparent text-white placeholder-slate-500 text-base font-medium outline-none" />
      <button id="search-close" aria-label="Cerrar"
              class="text-slate-400 hover:text-white transition-colors ml-2 text-xl flex-shrink-0">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div id="search-results" class="max-h-[420px] overflow-y-auto py-2"></div>
    <div class="px-5 py-3 border-t border-slate-800 flex items-center gap-4 text-[11px] text-slate-500">
      <span><kbd class="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd> Navegar</span>
      <span><kbd class="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">Enter</kbd> Ir</span>
      <span><kbd class="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> Cerrar</span>
      <span class="ml-auto"><kbd class="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">Ctrl K</kbd></span>
    </div>
  </div>
</div>
<style>
  @keyframes searchIn {
    from { opacity: 0; transform: translateY(-14px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ── Lógica del buscador ------------------------------------------------
let searchActiveIndex = -1;

function openSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    if (!overlay) return;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    input.value = '';
    searchActiveIndex = -1;
    renderSearchResults(SEARCH_PAGES.slice(0, 8));
    setTimeout(() => input.focus(), 60);
}

function closeSearch() {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

function renderSearchResults(items) {
    const container = document.getElementById('search-results');
    if (!container) return;
    if (items.length === 0) {
        container.innerHTML = '<p class="px-5 py-8 text-center text-slate-500 text-sm">No se encontraron resultados.</p>';
        return;
    }
    container.innerHTML = items.map((p, i) => `
    <a href="${p.url}"
       class="search-result flex items-center gap-3 px-5 py-3 hover:bg-slate-800 transition-colors group"
       data-index="${i}">
      <span class="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
        <i class="fas ${p.icon} text-amber-400 text-sm"></i>
      </span>
      <span class="text-white text-sm font-medium">${p.title}</span>
      <i class="fas fa-arrow-right text-slate-600 text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity"></i>
    </a>
  `).join('');
    searchActiveIndex = -1;
}

function filterSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) { renderSearchResults(SEARCH_PAGES.slice(0, 8)); return; }
    const filtered = SEARCH_PAGES.filter(p =>
        p.title.toLowerCase().includes(q) || p.tags.includes(q)
    );
    renderSearchResults(filtered);
}

function highlightSearchItem(index) {
    const items = document.querySelectorAll('#search-results .search-result');
    items.forEach((el, i) => el.classList.toggle('bg-slate-800', i === index));
    if (items[index]) items[index].scrollIntoView({ block: 'nearest' });
}

// ── Registrar eventos --------------------------------------------------
function initSearch() {
    injectSearchModal();

    const input = document.getElementById('search-input');
    const backdrop = document.getElementById('search-backdrop');

    document.getElementById('search-close').addEventListener('click', closeSearch);
    backdrop.addEventListener('click', closeSearch);

    input.addEventListener('input', () => filterSearch(input.value));
    input.addEventListener('keydown', e => {
        const items = document.querySelectorAll('#search-results .search-result');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            searchActiveIndex = Math.min(searchActiveIndex + 1, items.length - 1);
            highlightSearchItem(searchActiveIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            searchActiveIndex = Math.max(searchActiveIndex - 1, 0);
            highlightSearchItem(searchActiveIndex);
        } else if (e.key === 'Enter' && searchActiveIndex >= 0) {
            items[searchActiveIndex]?.click();
        } else if (e.key === 'Escape') {
            closeSearch();
        }
    });

    // Botón de apertura (delegación en document para capturar botón dinámico del navbar)
    document.addEventListener('click', e => {
        if (e.target.closest('#search-open')) openSearch();
    });

    // Atajos globales: Ctrl+K o /
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && document.getElementById('search-overlay')?.style.display === 'flex') {
            closeSearch();
            return;
        }
        if (
            (e.ctrlKey && e.key === 'k') ||
            (e.key === '/' &&
                document.activeElement.tagName !== 'INPUT' &&
                document.activeElement.tagName !== 'TEXTAREA')
        ) {
            e.preventDefault();
            openSearch();
        }
    });
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}
