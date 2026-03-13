/**
 * DIBA FBC - Theme Switcher
 * Manages light/dark mode preference and persistence.
 */

(function() {
    // 1. Theme Initialization (Prevent FOUC)
    const savedTheme = localStorage.getItem('diba-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    // Support for Bootstrap 5.3+
    document.documentElement.setAttribute('data-bs-theme', savedTheme);

    window.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');

        // Initial icon state
        updateIcon(savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                document.documentElement.setAttribute('data-bs-theme', newTheme);
                localStorage.setItem('diba-theme', newTheme);
                updateIcon(newTheme);
            });
        }

        function updateIcon(theme) {
            if (!themeIcon) return;
            if (theme === 'light') {
                themeIcon.className = 'fas fa-moon';
                if (themeToggle) themeToggle.title = 'Cambiar a Modo Oscuro';
            } else {
                themeIcon.className = 'fas fa-sun';
                if (themeToggle) themeToggle.title = 'Cambiar a Modo Claro';
            }
        }
    });
})();
