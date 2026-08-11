/* ==============================================
   DIBA FBC - COMPONENT LOADER (ADAPTADOR COMPATIBLE)
   Delega la lógica pesada a los nuevos módulos en public/src
   ================================================= */

// Exponer loadComponent en el scope global para compatibilidad
function loadComponent(containerId, filePath, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  fetch(filePath)
    .then(r => r.text())
    .then(data => {
      container.innerHTML = data;
      if (callback) callback();
    })
    .catch(err => console.error("Error loading legacy component:", filePath, err));
}
window.loadComponent = loadComponent;

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // 1. Cargar estilos y estructura del modal común
    const { initCommonUI } = await import('../src/core/loader.js');
    initCommonUI();

    // 2. Cargar componentes comunes
    loadComponent("navbar-container", "layout/navbar.html", async () => {
      try {
        const { initNavbar } = await import('./navbar.js');
        initNavbar();
      } catch (err) {
        console.error("Error initializing legacy navbar:", err);
      }
      
      if (!document.getElementById('search-overlay')) {
        const s = document.createElement('script');
        s.src = 'scripts/search.js';
        document.body.appendChild(s);
      }
    });

    loadComponent("match-banner-container", "layout/match_banner.html", async () => {
      try {
        const { initMatchBanner } = await import('../src/features/matches/banner.js');
        initMatchBanner();
      } catch (err) {
        console.error("Error loading match banner:", err);
      }
    });

    loadComponent("hero-container", "layout/hero.html");
    
    loadComponent("stats-container", "layout/stats_counter.html", async () => {
      try {
        const { initStatsCounter } = await import('../src/features/stats/counter.js');
        initStatsCounter();
      } catch (err) {
        console.error("Error loading stats:", err);
      }
    });

    loadComponent("patrocinadores-container", "layout/patrocinadores.html");
    loadComponent("testimonials-container", "layout/testimonials.html");
    loadComponent("footer-container", "layout/footer.html");
    loadComponent("fab-container", "layout/fab.html");

    // 3. Widget de IA
    import('../src/core/aiWidget.js').catch(err => console.error("Error loading AI Widget:", err));

    // 4. Plantilla de Jugadores y Goleadores (Solo si los contenedores existen en el DOM)
    if (document.getElementById("players-container")) {
      const { initPublicPlayers } = await import('../src/features/players/public.js');
      initPublicPlayers();
    }

    if (document.getElementById("goleadores-list")) {
      const { initScorers } = await import('../src/features/players/public.js');
      initScorers();
    }

  } catch (error) {
    console.error("Error crítico en inicialización de componentes:", error);
  }
});