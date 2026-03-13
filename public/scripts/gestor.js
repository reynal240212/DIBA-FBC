/**
 * DIBA FBC - Gestor Main Router (El Optimizador)
 * Handles navigation and module delegation.
 */
import { requireAdmin } from './supabaseClient.js';
import { cerrarSesion } from './auth.js';
import { loadStorageBuckets } from './gestor-storage.js';
import { loadPlayers } from './gestor-players.js';
import { loadDocuments } from './gestor-docs.js';

(async () => {
    // 1. SEGURIDAD
    const session = await requireAdmin();
    if (!session) return;
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // 2. DOM ELEMENTS
    const navName = document.getElementById("nav-user-name");
    const navRole = document.getElementById("nav-user-role");
    const mainTitle = document.getElementById("main-title");
    const pageTitle = document.querySelector(".page-title");
    const dynamicContent = document.getElementById("dynamic-content");
    const searchInput = document.getElementById("searchInput");

    // Initialize UI
    if (usuario) {
        if (navName) navName.textContent = usuario.username || 'Usuario';
        if (navRole) navRole.textContent = usuario.role === 'admin' ? 'Administrador' : 'Técnico';
    }

    // --- NAVIGATION LOGIC ---
    function setActiveFilter(btnId) {
        const buttons = document.querySelectorAll('#filter-container button');
        buttons.forEach(btn => {
            const isActive = btn.id === btnId;
            btn.className = isActive 
                ? "px-6 py-2 rounded-full bg-dibaGold text-blue-900 text-[10px] font-black uppercase italic border border-dibaGold transition-all whitespace-nowrap"
                : "px-6 py-2 rounded-full bg-white/5 text-slate-400 text-[10px] font-black uppercase italic border border-white/10 hover:border-dibaGold transition-all whitespace-nowrap";
        });
    }

    // ---------------------------------------------------------
    // ASISTENCIAS (KEEPING HERE UNTIL NEXT REFACTOR)
    // ---------------------------------------------------------
    async function loadAsistencias() {
        if (pageTitle) pageTitle.innerHTML = 'Registro de <span>Asistencias</span>';
        if (mainTitle) mainTitle.innerHTML = 'Asistencias';
        setActiveFilter('filter-asistencias-btn');
        dynamicContent.innerHTML = `<div id="fileListContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><div class="flex justify-center py-20 col-span-full"><i class="fas fa-circle-notch animate-spin text-3xl text-dibaGold"></i></div></div>`;

        // ... logic kept simplified for now ...
        // Note: Performance could still use batching here if needed.
    }

    // --- EVENT LISTENERS ---
    document.getElementById("view-players-btn")?.addEventListener("click", () => loadPlayers(dynamicContent, pageTitle, mainTitle, setActiveFilter));
    document.getElementById("filter-docs-btn")?.addEventListener("click", () => loadDocuments(dynamicContent, pageTitle, mainTitle, setActiveFilter, usuario)); 
    document.getElementById("filter-club-btn")?.addEventListener("click", () => loadStorageBuckets(dynamicContent, pageTitle, mainTitle, setActiveFilter));
    document.getElementById("filter-asistencias-btn")?.addEventListener("click", loadAsistencias);
    document.getElementById("logout-btn")?.addEventListener("click", cerrarSesion);

    searchInput?.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const rows = dynamicContent.querySelectorAll('.group, tbody tr');
        rows.forEach(row => row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none');
    });

    // Default Load
    loadDocuments(dynamicContent, pageTitle, mainTitle, setActiveFilter, usuario);

    console.log("Gestor Admin Modularizado (v2) inicializado.");
})();