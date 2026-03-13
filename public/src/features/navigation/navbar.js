/**
 * DIBA FBC - Public Navbar Feature
 * Handles authentication UI updates and navigation interactions.
 */
import { verificarSesion, iniciarSesionGoogle, cerrarSesion } from '../../core/auth.js';

export async function initNavbar() {
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Auth Logic ---
    const authLoading = document.getElementById('auth-loading');
    const authLoggedOut = document.getElementById('auth-logged-out');
    const authLoggedIn = document.getElementById('auth-logged-in');

    const authMobileLoggedOut = document.getElementById('auth-mobile-logged-out');
    const authMobileLoggedIn = document.getElementById('auth-mobile-logged-in');

    async function updateAuthUI() {
        try {
            const user = await verificarSesion();
            authLoading?.classList.add('hidden');

            if (user) {
                renderUserUI(user);
            } else {
                renderLoggedOutUI();
            }
        } catch (err) {
            console.error("Error updating auth UI:", err);
            authLoading?.classList.add('hidden');
            renderLoggedOutUI();
        }
    }

    function renderUserUI(user) {
        // Desktop Profile
        authLoggedOut?.classList.add('hidden');
        authLoggedIn?.classList.remove('hidden');

        const avatar = document.getElementById('user-avatar');
        const initials = document.getElementById('user-initials');
        const nameLabel = document.getElementById('user-name');
        const roleLabel = document.getElementById('user-role');
        const linkAdmin = document.getElementById('link-admin');
        const linkDocs = document.getElementById('link-docs');

        const userInitials = user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();

        if (user.avatar_url) {
            if (avatar) { avatar.src = user.avatar_url; avatar.classList.remove('hidden'); }
            initials?.classList.add('hidden');
        } else {
            if (initials) { initials.textContent = userInitials; initials.classList.remove('hidden'); }
            avatar?.classList.add('hidden');
        }

        if (nameLabel) nameLabel.textContent = user.full_name || user.username;
        if (roleLabel) roleLabel.textContent = user.role;

        if (user.role === 'admin' || user.role === 'tecnico') linkAdmin?.classList.remove('hidden');
        if (user.role === 'usuario' || user.role === 'admin') linkDocs?.classList.remove('hidden');

        // Mobile Profile
        authMobileLoggedOut?.classList.add('hidden');
        authMobileLoggedIn?.classList.remove('hidden');

        const avatarMob = document.getElementById('user-avatar-mobile');
        const initialsMob = document.getElementById('user-initials-mobile');
        const nameLabelMob = document.getElementById('user-name-mobile');
        const roleLabelMob = document.getElementById('user-role-mobile');
        const linkAdminMob = document.getElementById('link-admin-mobile');
        const linkDocsMob = document.getElementById('link-docs-mobile');

        if (user.avatar_url) {
            if (avatarMob) { avatarMob.src = user.avatar_url; avatarMob.classList.remove('hidden'); }
            initialsMob?.classList.add('hidden');
        } else {
            if (initialsMob) { initialsMob.textContent = userInitials; initialsMob.classList.remove('hidden'); }
            avatarMob?.classList.add('hidden');
        }

        if (nameLabelMob) nameLabelMob.textContent = user.full_name || user.username;
        if (roleLabelMob) roleLabelMob.textContent = user.role;

        if (user.role === 'admin' || user.role === 'tecnico') linkAdminMob?.classList.remove('hidden');
        if (user.role === 'usuario' || user.role === 'admin') linkDocsMob?.classList.remove('hidden');
    }

    function renderLoggedOutUI() {
        authLoggedIn?.classList.add('hidden');
        authLoggedOut?.classList.remove('hidden');
        authMobileLoggedIn?.classList.add('hidden');
        authMobileLoggedOut?.classList.remove('hidden');
    }

    // Bind Events
    const googleBtns = [
        document.getElementById('btn-login-google'),
        document.getElementById('btn-login-google-mobile')
    ];
    googleBtns.forEach(btn => {
        btn?.addEventListener('click', async () => {
            try {
                await iniciarSesionGoogle();
            } catch (err) {
                alert("Error al iniciar con Google: " + err.message);
            }
        });
    });

    const logoutBtns = [
        document.getElementById('btn-logout'),
        document.getElementById('btn-logout-mobile')
    ];
    logoutBtns.forEach(btn => {
        btn?.addEventListener('click', async () => {
            await cerrarSesion();
            window.location.reload();
        });
    });

    // Initial update
    updateAuthUI();

    // --- Dropdowns desktop ---
    setupDropdowns();
}

function setupDropdowns() {
    const btnClub = document.getElementById('btn-club');
    const ddClub = document.getElementById('dropdown-club');
    const btnPartidos = document.getElementById('btn-partidos');
    const ddPartidos = document.getElementById('dropdown-partidos');

    if (!(btnClub && ddClub && btnPartidos && ddPartidos)) return;

    function closeAllDropdowns() {
        ddClub.classList.add('hidden');
        ddPartidos.classList.add('hidden');
    }

    btnClub.addEventListener('mouseenter', () => {
        ddClub.classList.remove('hidden');
        ddPartidos.classList.add('hidden');
    });

    btnPartidos.addEventListener('mouseenter', () => {
        ddPartidos.classList.remove('hidden');
        ddClub.classList.add('hidden');
    });

    ddClub.addEventListener('mouseleave', closeAllDropdowns);
    ddPartidos.addEventListener('mouseleave', closeAllDropdowns);

    document.addEventListener('click', (e) => {
        if (!e.target.closest('li.relative')) {
            closeAllDropdowns();
        }
    });
}
