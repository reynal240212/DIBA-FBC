// DIBA FBC - Layout Component (Admin)
import { supabase } from '../../core/supabase.js';

export async function initAdminLayout() {
    const navContainer = document.getElementById('admin-nav');
    const footerContainer = document.getElementById('admin-footer');

    // Security Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && !window.location.pathname.includes('login')) {
        window.location.href = '/admin/login.html';
        return;
    }

    // Navigation Injection
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
                    <a href="/admin/GestorDocumental.html" class="hover:text-amber-400 transition-colors">Documentos</a>
                    <a href="/admin/usuarios.html" class="hover:text-amber-400 transition-colors">Usuarios</a>
                    <a href="/admin/push.html" class="hover:text-amber-400 transition-colors">Notificaciones</a>
                    <button id="logout-btn-layout" class="bg-red-900/50 hover:bg-red-600 px-4 py-2 rounded flex items-center gap-2 border border-red-500/30">
                        <i class="fas fa-sign-out-alt"></i> SALIR
                    </button>
                </div>
            </div>
        </nav>`;
        
        document.getElementById('logout-btn-layout')?.addEventListener('click', async () => {
            await supabase.auth.signOut();
            localStorage.removeItem('usuario');
            window.location.href = '/';
        });
    }

    // Footer Injection
    if (footerContainer) {
        footerContainer.innerHTML = `
        <footer class="bg-slate-50 border-t border-slate-200 py-6 mt-12">
            <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">© 2026 DIBA FBC</p>
            </div>
        </footer>`;
    }
}
