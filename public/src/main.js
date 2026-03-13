/**
 * DIBA FBC - Main Entry Point (Public Site)
 * Orchestrates all feature initializations.
 */
import { initTheme } from './core/theme-switcher.js';
import { initCommonUI, loadComponent } from './core/loader.js';
import { initNavbar } from './features/navigation/navbar.js';
import { initMatchBanner } from './features/matches/banner.js';
import { initStatsCounter } from './features/stats/counter.js';
import { initPublicPlayers, initScorers } from './features/players/public.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Base UI
    initTheme();
    initCommonUI();

    // 2. Load Components
    loadComponent("navbar-container", "layout/navbar.html", initNavbar);
    loadComponent("match-banner-container", "layout/match_banner.html", initMatchBanner);
    loadComponent("hero-container", "layout/hero.html");
    loadComponent("stats-container", "layout/stats_counter.html", initStatsCounter);
    loadComponent("patrocinadores-container", "layout/patrocinadores.html");
    loadComponent("testimonials-container", "layout/testimonials.html");
    loadComponent("footer-container", "layout/footer.html");
    loadComponent("fab-container", "layout/fab.html");

    // 3. Dynamic Features
    initPublicPlayers();
    initScorers();

    // 4. Search Overlay (Dynamic import fallback)
    if (!document.getElementById('search-overlay')) {
        const s = document.createElement('script');
        s.src = '/scripts/search.js';
        document.body.appendChild(s);
    }
});
