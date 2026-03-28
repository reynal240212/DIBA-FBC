/**
 * DIBA FBC - Gestor Main Router (High Robustness)
 */
import { requireAdmin } from '../../core/supabase.js';
import { cerrarSesion } from '../../core/auth.js';
import { loadStorageBuckets } from './storage.js';
import { loadDocuments } from './docs.js';

async function init() {
    console.log("Initializing Gestor...");
    
    // Security check
    const session = await requireAdmin();
    if (!session) return;
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // DOM Elements with null-checks
    const dynamicContent = document.getElementById("docs-grid");
    const pageTitle = document.getElementById("main-title");
    const searchInput = document.getElementById("search-docs");

    if (!dynamicContent) {
        console.error("Critical Error: #docs-grid not found in DOM.");
        return;
    }

    const setActiveFilter = (btnId) => {
        document.querySelectorAll('.panel button').forEach(btn => {
            const isActive = btn.id === btnId;
            if (isActive) {
                btn.className = "w-full flex items-center justify-between p-5 rounded-2xl bg-gold text-[#004d98] font-black text-[0.7rem] uppercase tracking-widest group shadow-xl shadow-gold/10";
            } else {
                btn.className = "w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 text-white/40 font-black text-[0.7rem] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-transparent hover:border-white/10";
            }
        });
    };

    // Event Listeners
    document.getElementById("upload-btn")?.addEventListener("click", () => document.getElementById("newDocument")?.click());
    document.getElementById("filter-docs-btn")?.addEventListener("click", () => loadDocuments(dynamicContent, pageTitle, setActiveFilter, usuario));
    document.getElementById("filter-club-btn")?.addEventListener("click", () => loadStorageBuckets(dynamicContent, pageTitle, setActiveFilter));
    document.getElementById("logout-btn")?.addEventListener("click", cerrarSesion);

    searchInput?.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const cards = dynamicContent.querySelectorAll('.match-card, .doc-card, .panel, .group');
        cards.forEach(card => {
            if (card.id === 'inner-files-grid') return; // Don't hide the container
            card.style.display = card.innerText.toLowerCase().includes(val) ? '' : 'none';
        });
    });

    // Default Load
    await loadDocuments(dynamicContent, pageTitle, setActiveFilter, usuario);
    console.log("Gestor Feature Initialized Successfully.");
}

// Ensure DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
