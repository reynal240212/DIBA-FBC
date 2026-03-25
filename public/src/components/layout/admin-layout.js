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
        <nav class="glass border-b border-white/5 sticky top-0 z-[1000] backdrop-blur-xl">
            <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div class="flex items-center gap-4 group cursor-pointer">
                    <div class="p-2 bg-gold/10 rounded-xl border border-gold/20 group-hover:scale-110 transition-transform">
                        <img src="/images/ESCUDO.png" alt="DIBA FBC" class="h-8 w-auto">
                    </div>
                    <div class="flex flex-col">
                        <span class="font-black uppercase italic tracking-tighter text-lg text-white leading-none">GESTOR DIBA</span>
                        <span class="text-[8px] font-black text-gold uppercase tracking-[0.4em] mt-1">SISTEMA INTEGRAL</span>
                    </div>
                </div>
                <div class="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
                    <a href="/" class="text-slate-400 hover:text-gold transition-colors">Inicio</a>
                    <a href="/admin/GestorDocumental.html" class="text-slate-400 hover:text-gold transition-colors">Documentos</a>
                    <a href="/admin/usuarios.html" class="text-slate-400 hover:text-gold transition-colors">Usuarios</a>
                    <button id="logout-btn-layout" class="bg-white/5 hover:bg-rose-600/20 text-slate-400 hover:text-rose-500 px-5 py-2.5 rounded-xl border border-white/5 hover:border-rose-500/30 transition-all flex items-center gap-2">
                        <i class="fas fa-power-off"></i> SALIR
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
        <footer class="border-t border-white/5 py-12 mt-12 bg-black/20">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="flex flex-col items-center md:items-start opacity-40">
                    <p class="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">DIBA FBC © 2026</p>
                    <p class="text-[8px] font-bold text-slate-500 uppercase mt-1">Gestión Deportiva de Alto Rendimiento</p>
                </div>
                <div class="flex gap-6 opacity-40">
                    <i class="fab fa-instagram text-white hover:text-gold cursor-pointer"></i>
                    <i class="fab fa-facebook-f text-white hover:text-gold cursor-pointer"></i>
                    <i class="fab fa-whatsapp text-white hover:text-gold cursor-pointer"></i>
                </div>
            </div>
        </footer>`;
    }
}
