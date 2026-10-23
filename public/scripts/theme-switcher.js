/**
 * DIBA FBC - Theme & Tailwind Brand Configurator
 * Ensures dark mode and injects custom DIBA FBC palette into Tailwind CDN.
 */

(function() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-bs-theme', 'dark');

    const dibaTailwindConfig = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    gold: '#FFD700',
                    diba: {
                        blue: '#004d98',
                        red: '#a50044',
                        gold: '#FFD700',
                        dark: '#020617'
                    }
                },
                fontFamily: {
                    outfit: ['Outfit', 'sans-serif'],
                    montserrat: ['Montserrat', 'sans-serif']
                }
            }
        }
    };

    // Apply immediately if tailwind is already loaded, or hook before/after it loads
    if (window.tailwind) {
        window.tailwind.config = dibaTailwindConfig;
    } else {
        window.tailwind = { config: dibaTailwindConfig };
    }

    window.addEventListener('DOMContentLoaded', () => {
        if (window.tailwind && (!window.tailwind.config || !window.tailwind.config.theme)) {
            window.tailwind.config = dibaTailwindConfig;
        }
    });
})();
