import { supabase } from '../../../scripts/supabaseClient.js';

export async function initAdminLayout() {
    const navContainer = document.getElementById('admin-nav');
    if (!navContainer) return;

    // Security Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && !window.location.pathname.includes('login')) {
        window.location.href = '/admin/login.html';
        return;
    }

    const user = session?.user;
    const { data: profile } = user ? await supabase.from('users').select('*').eq('id', user.id).single() : { data: null };
    const userName = profile?.username || profile?.full_name || 'Admin';
    const userRole = profile?.role || 'Club Admin';
    const userInitial = userName ? userName[0].toUpperCase() : 'A';

    const currentPath = window.location.pathname;
    const isAct = (path) => currentPath.includes(path);

    const getLinkClass = (path) => isAct(path) 
        ? 'bg-gold !text-slate-950 font-black shadow-[0_10px_25px_rgba(255,215,0,0.3)] translate-x-1' 
        : 'text-white/80 font-semibold hover:bg-white/10 hover:text-white group hover:translate-x-1';

    const getIconClass = (path) => isAct(path) ? '!text-slate-900' : 'opacity-30 group-hover:opacity-100 group-hover:text-gold';

    // Sidebar Injection
    const sidebarHTML = `
    <aside class="fixed top-0 left-0 bottom-0 w-[280px] bg-[#020617]/95 backdrop-blur-2xl z-[200] transition-transform duration-500 lg:translate-x-0 -translate-x-full sidebar flex flex-col border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)]" id="sidebar">
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background: radial-gradient(circle at 0% 0%, #FFD700 0%, transparent 50%)"></div>
        
        <!-- Logo Header -->
        <div class="p-8 pb-10 flex items-center gap-4 relative z-10 flex-none">
            <div class="relative group cursor-pointer" onclick="window.location.href='dashboard.html'">
                <div class="absolute -inset-2 bg-gold/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <img src="/images/ESCUDO.webp" alt="DIBA FBC" class="w-12 h-12 object-contain relative drop-shadow-[0_0_10px_rgba(255,215,0,0.3)] group-hover:scale-110 transition-transform">
            </div>
            <div class="flex flex-col">
                <div class="text-xl font-black italic tracking-tighter text-white leading-none">DIBA <span class="text-[#FFD700]">FBC</span></div>
                <div class="text-[0.5rem] font-bold text-white/30 uppercase tracking-[0.4em] mt-1.5">SISTEMA PRINCIPAL</div>
            </div>
        </div>

        <!-- Scrollable Navigation -->
        <nav class="px-5 py-2 space-y-1 overflow-y-auto flex-1 no-scrollbar relative z-10">
            <!-- GRUPO: CENTRAL -->
            <div class="px-5 mb-2 flex items-center gap-2">
                <span class="w-1 h-3 bg-gold/50 rounded-full"></span>
                <span class="text-[0.55rem] font-black uppercase tracking-[0.3em] text-white/20 italic">Principal</span>
            </div>
            <a href="dashboard.html" class="nav-link flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${getLinkClass('dashboard')}">
                <div class="w-8 flex justify-center"><i class="fas fa-grid-2 text-lg ${getIconClass('dashboard')}"></i></div>
                <span class="text-[0.75rem] font-bold tracking-tight truncate">Dashboard Maestro</span>
            </a>

            <!-- GRUPO: DEPORTIVO -->
            <div class="px-5 mt-8 mb-2 flex items-center gap-2">
                <span class="w-1 h-3 bg-gold/50 rounded-full"></span>
                <span class="text-[0.55rem] font-black uppercase tracking-[0.3em] text-white/20 italic">Gestión Deportiva</span>
            </div>
            <a href="planilla.html" class="nav-link flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${getLinkClass('planilla')}">
                <div class="w-8 flex justify-center"><i class="fas fa-clipboard-check text-lg ${getIconClass('planilla')}"></i></div>
                <span class="text-[0.75rem] font-bold tracking-tight truncate">Planilla Diaria</span>
            </a>
            <a href="partidos.html" class="nav-link flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${getLinkClass('partidos')}">
                <div class="w-8 flex justify-center"><i class="fas fa-calendar-day text-lg ${getIconClass('partidos')}"></i></div>
                <span class="text-[0.75rem] font-bold tracking-tight truncate">Partidos & Eventos</span>
            </a>
            <a href="convocatorias.html" class="nav-link flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${getLinkClass('convocatorias')}">
                <div class="w-8 flex justify-center"><i class="fas fa-bullhorn text-lg ${getIconClass('convocatorias')}"></i></div>
                <span class="text-[0.75rem] font-bold tracking-tight truncate">Convocatorias</span>
            </a>

            <!-- GRUPO: ADMINISTRACIÓN -->
            <div class="px-5 mt-8 mb-2 flex items-center gap-2">
                <span class="w-1 h-3 bg-gold/50 rounded-full"></span>
                <span class="text-[0.55rem] font-black uppercase tracking-[0.3em] text-white/20 italic">Administración</span>
            </div>
            <a href="usuarios.html" class="nav-link flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${getLinkClass('usuarios')}">
                <div class="w-8 flex justify-center"><i class="fas fa-users-gear text-lg ${getIconClass('usuarios')}"></i></div>
                <span class="text-[0.75rem] font-bold tracking-tight truncate">Gestión de Accesos</span>
            </a>
            <a href="GestorDocumental.html" class="nav-link flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${getLinkClass('GestorDocumental')}">
                <div class="w-8 flex justify-center"><i class="fas fa-file-invoice text-lg ${getIconClass('GestorDocumental')}"></i></div>
                <span class="text-[0.75rem] font-bold tracking-tight truncate">Archivo Digital</span>
            </a>
            <a href="rifa_diba.html" class="nav-link flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${getLinkClass('rifa_diba')}">
                <div class="w-8 flex justify-center"><i class="fas fa-ticket text-lg ${getIconClass('rifa_diba')}"></i></div>
                <span class="text-[0.75rem] font-bold tracking-tight truncate">Recaudación & Rifas</span>
            </a>

            <!-- GRUPO: COMUNIDAD -->
            <div class="px-5 mt-8 mb-2 flex items-center gap-2">
                <span class="w-1 h-3 bg-gold/50 rounded-full"></span>
                <span class="text-[0.55rem] font-black uppercase tracking-[0.3em] text-white/20 italic">Social & Cloud</span>
            </div>
            <a href="push.html" class="nav-link flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${getLinkClass('push')}">
                <div class="w-8 flex justify-center"><i class="fas fa-paper-plane text-lg ${getIconClass('push')}"></i></div>
                <span class="text-[0.75rem] font-bold tracking-tight truncate">Notificaciones Push</span>
            </a>
            <a href="https://asistencia-dibafbc.vercel.app/" target="_blank" class="nav-link flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-white/40 font-bold hover:bg-white/5 hover:text-white group">
                <div class="w-8 flex justify-center"><i class="fas fa-mobile-screen-button text-lg opacity-30 group-hover:opacity-100 group-hover:text-gold transition-all"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate flex items-center gap-2">Asistencia App <i class="fas fa-external-link text-[0.5rem] opacity-30"></i></span>
            </a>
        </nav>

        <!-- User Profile (Fixed Bottom) -->
        <div class="p-6 bg-white/[0.02] border-t border-white/5 flex-none">
            <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl mb-4 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-yellow-600 text-[#004d98] flex items-center justify-center font-black italic shadow-lg group-hover:scale-105 transition-transform">${userInitial}</div>
                <div class="min-w-0">
                    <div class="text-[0.8rem] font-bold text-white truncate tracking-tight">${userName}</div>
                    <div class="text-[0.55rem] font-black text-[#FFD700]/50 uppercase tracking-[0.2em] mt-0.5">${userRole}</div>
                </div>
            </div>
            <button class="w-full py-4 rounded-xl bg-rose-500/10 text-rose-500 text-[0.6rem] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20" id="logout-btn-layout">
                <i class="fas fa-power-off mr-2"></i> Cerrar Sesión
            </button>
        </div>
    </aside>

    <div class="fixed inset-0 bg-[#000]/60 backdrop-blur-md z-[150] hidden transition-opacity duration-500" id="sidebar-overlay"></div>
    `;

    // Header Injection
    const pageTitle = document.title.split('—')[0].trim();
    const headerHTML = `
    <header class="fixed top-0 right-0 left-0 lg:left-[280px] z-[100] bg-[#020617]/80 backdrop-blur-2xl px-4 lg:px-10 h-[70px] lg:h-[80px] flex items-center justify-between border-b border-white/5 shadow-2xl transition-all duration-300 overflow-hidden">
        <div class="absolute top-0 left-0 w-2 h-full bg-gold/50"></div>
        
        <div class="flex items-center gap-2 lg:gap-8 flex-1 min-w-0">
            <button class="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/10 shadow-lg" id="menu-btn-layout">
                <i class="fas fa-bars-staggered text-base"></i>
            </button>
            <div class="animate-fade-up flex-1 min-w-0 pr-4">
                <div class="flex items-center gap-3">
                    <h1 class="text-[0.85rem] sm:text-base lg:text-2xl font-black italic text-white uppercase tracking-tighter leading-none">${pageTitle}</h1>
                    <div class="hidden xs:flex items-center px-2 py-1 rounded-lg bg-gold/10 border border-gold/20">
                        <span class="text-gold text-[0.45rem] font-black uppercase tracking-[0.2em]">Admin Principal</span>
                    </div>
                </div>
                <p class="hidden md:block text-[0.55rem] lg:text-[0.6rem] font-bold text-white/20 uppercase tracking-[0.4em] mt-1.5 italic">Ecosistema Administrativo DIBA FBC <span class="mx-2 opacity-50">|</span> 2026</p>
            </div>
        </div>
        
        <div class="flex items-center gap-4 lg:gap-8 flex-none">
            <div class="hidden xl:flex flex-col items-end">
                <div class="text-[1.1rem] font-black text-white italic tracking-tighter" id="layout-clock">00:00:00</div>
                <div class="text-[0.55rem] font-black text-gold/50 uppercase tracking-[0.2em] mt-0.5" id="layout-date">---</div>
            </div>
            
            <div class="w-[1px] h-8 bg-white/5 hidden xl:block"></div>
            
            <div class="flex items-center gap-3">
                <button class="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-gold hover:bg-white/10 transition-all shadow-inner group">
                    <i class="fas fa-bell text-sm group-hover:animate-bounce"></i>
                </button>
                <div class="relative group cursor-pointer ml-1">
                    <div class="absolute -inset-1 bg-gradient-to-r from-[#FFD700] to-yellow-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div class="relative w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-[#020617] border border-white/10 flex items-center justify-center text-[#FFD700] font-black text-sm shadow-xl">
                        ${userInitial}
                    </div>
                </div>
            </div>
        </div>
    </header>
    `;

    navContainer.innerHTML = sidebarHTML + headerHTML;

    // Sidebar Logic
    const menuBtn = document.getElementById('menu-btn-layout');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    menuBtn?.addEventListener('click', () => {
        sidebar?.classList.add('translate-x-0');
        sidebar?.classList.remove('-translate-x-full');
        overlay?.classList.remove('hidden');
    });

    overlay?.addEventListener('click', () => {
        sidebar?.classList.remove('translate-x-0');
        sidebar?.classList.add('-translate-x-full');
        overlay?.classList.add('hidden');
    });

    // Logout
    document.getElementById('logout-btn-layout')?.addEventListener('click', async () => {
        if (confirm('¿Cerrar sesión?')) {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        }
    });

    // Clock
    function tick() {
        const now = new Date();
        const clockEl = document.getElementById('layout-clock');
        const dateEl = document.getElementById('layout-date');
        if (clockEl) clockEl.textContent = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (dateEl) dateEl.textContent = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    setInterval(tick, 1000); tick();
    
}
