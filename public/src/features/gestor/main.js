/**
 * DIBA FBC - Gestor Main Router (Reorganized)
 */
import { requireAdmin } from '../../core/supabase.js';
import { cerrarSesion } from '../../core/auth.js';
import { loadStorageBuckets } from './storage.js';
import { loadPlayers } from './players.js';
import { loadDocuments } from './docs.js';

(async () => {
    // Security check
    const session = await requireAdmin();
    if (!session) return;
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // DOM Elements
    const dynamicContent = document.getElementById("dynamic-content");
    const pageTitle = document.querySelector(".page-title");
    const mainTitle = document.getElementById("main-title");
    const searchInput = document.getElementById("searchInput");

    function setActiveFilter(btnId) {
        document.querySelectorAll('#filter-container button').forEach(btn => {
            const isActive = btn.id === btnId;
            btn.className = isActive 
                ? "px-8 py-3 rounded-2xl bg-diba-blue text-diba-gold text-[10px] font-black uppercase tracking-widest border border-diba-blue transition-all whitespace-nowrap shadow-xl shadow-blue-900/10 scale-[1.02]"
                : "px-8 py-3 rounded-2xl bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:border-diba-blue hover:text-diba-blue transition-all whitespace-nowrap shadow-sm";
        });
    }

    // Event Listeners
    document.getElementById("view-players-btn")?.addEventListener("click", () => loadPlayers(dynamicContent, pageTitle, mainTitle, setActiveFilter));
    document.getElementById("filter-docs-btn")?.addEventListener("click", () => loadDocuments(dynamicContent, pageTitle, mainTitle, setActiveFilter, usuario));
    document.getElementById("filter-club-btn")?.addEventListener("click", () => loadStorageBuckets(dynamicContent, pageTitle, mainTitle, setActiveFilter));
    document.getElementById("logout-btn")?.addEventListener("click", cerrarSesion);

    searchInput?.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const rows = dynamicContent.querySelectorAll('.group, tbody tr');
        rows.forEach(row => row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none');
    });

    // Default Load
    loadDocuments(dynamicContent, pageTitle, mainTitle, setActiveFilter, usuario);

    console.log("Gestor Feature Reorganized.");
})();
