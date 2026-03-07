import { supabase } from './supabaseClient.js';

export function setupAdminUI() {
    // Clock
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        const updateClock = () => {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        };
        updateClock();
        setInterval(updateClock, 60000);
    }

    // Sidebar Toggle
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn && sidebar) {
        menuBtn.onclick = () => {
            sidebar.classList.toggle('open');
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        };
    }

    // Active Link Highlighting
    const currentPath = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // User Info
    const sbName = document.getElementById('sb-name');
    const sbAvatar = document.getElementById('sb-avatar');
    const sbRole = document.getElementById('sb-role');

    if (sbName || sbAvatar) {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                const name = user.user_metadata?.full_name || user.email.split('@')[0];
                if (sbName) sbName.textContent = name;
                if (sbAvatar) sbAvatar.textContent = name.charAt(0).toUpperCase();

                // Fetch role from profile/users table if needed
                supabase.from('users').select('role').eq('id', user.id).single().then(({ data }) => {
                    if (data && sbRole) sbRole.textContent = data.role;
                });
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            if (confirm('¿Cerrar sesión ahora?')) {
                await supabase.auth.signOut();
                window.location.href = 'login.html';
            }
        };
    }
}
