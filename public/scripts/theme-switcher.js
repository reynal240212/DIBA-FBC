/**
 * DIBA FBC - Theme Switcher
 * Manages light/dark mode preference and persistence.
 */

(function() {
    // 1. Theme Initialization (Prevent FOUC)
    document.documentElement.setAttribute('data-theme', 'dark');
    // Support for Bootstrap 5.3+
    document.documentElement.setAttribute('data-bs-theme', 'dark');

    window.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');

        // Initial icon state
        updateIcon('dark');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.documentElement.setAttribute('data-bs-theme', 'dark');
                localStorage.setItem('diba-theme', 'dark');
                updateIcon('dark');
            });
        }

        function updateIcon(theme) {
            if (!themeIcon) return;
            themeIcon.className = 'fas fa-sun';
            if (themeToggle) themeToggle.title = 'Modo Oscuro Activo';
        }
    });
})();
