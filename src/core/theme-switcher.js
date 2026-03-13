/**
 * DIBA FBC - Theme Management Core
 */

export function initTheme() {
    const savedTheme = localStorage.getItem('diba-theme') || 'dark';
    applyTheme(savedTheme);

    // Initial setup for existing toggle in DOM
    setupToggle();
    
    // Watch for dynamic DOM changes (if toggle injected late)
    const observer = new MutationObserver(() => setupToggle());
    observer.observe(document.body, { childList: true, subtree: true });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('diba-theme', theme);
    updateIcon(theme);
}

function setupToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && !themeToggle.dataset.hooked) {
        themeToggle.dataset.hooked = "true";
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
        updateIcon(localStorage.getItem('diba-theme') || 'dark');
    }
}

function updateIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeIcon) return;
    
    if (theme === 'light') {
        themeIcon.className = 'fas fa-moon';
        if (themeToggle) themeToggle.title = 'Cambiar a Modo Oscuro';
    } else {
        themeIcon.className = 'fas fa-sun';
        if (themeToggle) themeToggle.title = 'Cambiar a Modo Claro';
    }
}

// Auto-init on script load
initTheme();
