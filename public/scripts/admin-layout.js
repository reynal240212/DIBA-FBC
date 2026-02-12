import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const navContainer = document.getElementById('admin-nav');
    const footerContainer = document.getElementById('admin-footer');

    // 1. Verificación de Seguridad Básica
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && !window.location.pathname.includes('login')) {
        // Si no hay sesión, redirigir al login (URL limpia)
        window.location.href = '/admin/login';
        return;
    }

    // 2. Inyectar Navbar del Gestor
    if (navContainer) {
        navContainer.innerHTML = `
        <nav class="bg-[#001f3f] text-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <img src="/images/ESCUDO.png" alt="DIBA FBC" class="h-10 w-auto">
                    <span class="font-black uppercase italic tracking-tighter text-lg">GESTOR DIBA</span>
                </div>

                <div class="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest">
                    <a href="/" class="hover:text-amber-400 transition-colors">Inicio</a>
                    <a href="/admin/GestorDocumental" class="hover:text-amber-400 transition-colors">Documentos</a>
                    <a href="/admin/usuarios" class="hover:text-amber-400 transition-colors">Usuarios</a>
                    
                    <button id="logout-btn" class="bg-red-900/50 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-all border border-red-500/30">
                        <i class="fas fa-sign-out-alt"></i> SALIR
                    </button>
                </div>
            </div>
        </nav>`;
    }

    // 3. Inyectar Footer del Gestor
    if (footerContainer) {
        footerContainer.innerHTML = `
        <footer class="bg-slate-50 border-t border-slate-200 py-6 mt-12">
            <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    © 2026 DIBA FBC | Panel de Control Administrativo
                </p>
                <div class="flex gap-4 text-slate-400 text-xs">
                    <a href="/ayuda" class="hover:text-blue-600">Ayuda</a>
                    <a href="/aviso.legal" class="hover:text-blue-600">Privacidad</a>
                </div>
            </div>
        </footer>`;
    }

    // 4. Lógica de Logout
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('usuario');
        window.location.href = '/';
    });
});