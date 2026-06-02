/**
 * DIBA FBC - Theme Management Core
 */

export function initTheme() {
    applyTheme('dark');

    // Initial setup for existing toggle in DOM
    setupToggle();
    
    // Watch for dynamic DOM changes (if toggle injected late)
    const observer = new MutationObserver(() => setupToggle());
    observer.observe(document.body, { childList: true, subtree: true });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    localStorage.setItem('diba-theme', 'dark');
    updateIcon('dark');
}

function setupToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && !themeToggle.dataset.hooked) {
        themeToggle.dataset.hooked = "true";
        themeToggle.addEventListener('click', () => {
            applyTheme('dark');
        });
        updateIcon('dark');
    }
}

function updateIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeIcon) return;
    
    themeIcon.className = 'fas fa-sun';
    if (themeToggle) themeToggle.title = 'Modo Oscuro Activo';
}

// Auto-init on script load
initTheme();
