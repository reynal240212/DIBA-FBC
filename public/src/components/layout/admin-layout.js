import { supabase } from '../../../scripts/supabaseClient.js';

export async function initAdminLayout() {
    const navContainer = document.getElementById('admin-nav');
    if (!navContainer) return;

    // Security Check & Role Verification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || (!session && !window.location.pathname.includes('login'))) {
        window.location.replace('/admin/login.html');
        return;
    }

    if (session && !window.location.pathname.includes('login')) {
        const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (roleError || userData?.role !== 'admin') {
            console.warn('Acceso denegado: Usuario sin permisos de administrador');
            window.location.replace('/index.html');
            return;
        }
    }

    const user = session?.user;
    const { data: profile } = user ? await supabase.from('users').select('*').eq('id', user.id).single() : { data: null };
    const userName = profile?.username || profile?.full_name || 'Admin';
    const userRole = profile?.role || 'Club Admin';
    const userInitial = userName ? userName[0].toUpperCase() : 'A';

    const currentPath = window.location.pathname;
    const isAct = (path) => path === 'dashboard'
        ? (currentPath.includes('dashboard') && !currentPath.includes('gold-dashboard'))
        : currentPath.includes(path);

    const getLinkClass = (path) => isAct(path) 
        ? 'bg-gold !text-slate-950 font-black shadow-[0_10px_25px_rgba(255,215,0,0.28)]' 
        : 'text-slate-300 font-semibold hover:bg-white/[0.07] hover:text-white group';

    const getIconClass = (path) => isAct(path)
        ? '!text-[#004d98]'
        : 'text-slate-400 group-hover:text-gold transition-colors';

    // Sidebar Injection
    const sidebarHTML = `
    <aside class="fixed top-0 left-0 bottom-0 w-[280px] bg-[#020617]/95 backdrop-blur-2xl z-[200] transition-transform duration-500 lg:translate-x-0 -translate-x-full sidebar flex flex-col border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.65)]" id="sidebar">
        <div class="h-1 w-full bg-gradient-to-r from-[#004d98] via-[#FFD700] to-[#a50044] flex-none"></div>
        <div class="absolute inset-0 opacity-15 pointer-events-none" style="background: radial-gradient(circle at 0% 0%, #004d98 0%, transparent 55%)"></div>
        
        <!-- Logo Header -->
        <div class="px-6 py-6 flex items-center gap-4 relative z-10 flex-none border-b border-white/5">
            <div class="relative group cursor-pointer" onclick="window.location.href='dashboard.html'">
                <div class="absolute -inset-2 bg-gold/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <img src="/images/ESCUDO.webp" alt="DIBA FBC" class="w-12 h-12 object-contain relative drop-shadow-[0_0_10px_rgba(255,215,0,0.35)] group-hover:scale-110 transition-transform">
            </div>
            <div class="flex flex-col">
                <div class="text-xl font-black italic tracking-tighter text-white leading-none">DIBA <span class="text-gold">FBC</span></div>
                <div class="text-[0.52rem] font-black text-gold/70 uppercase tracking-[0.3em] mt-1.5">ADMINISTRATION HUB</div>
            </div>
        </div>

        <!-- Scrollable Navigation -->
        <nav class="px-4 py-4 space-y-1 overflow-y-auto flex-1 no-scrollbar relative z-10">
            <!-- GRUPO: CENTRAL -->
            <div class="px-3 mb-2 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-gold rounded-full"></span>
                <span class="text-[0.55rem] font-black uppercase tracking-[0.28em] text-slate-400">Centro de Mando</span>
            </div>
            <a href="dashboard.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('dashboard')}">
                <div class="w-7 flex justify-center"><i class="fas fa-table-columns text-base ${getIconClass('dashboard')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Dashboard Maestro</span>
            </a>

            <!-- GRUPO: DEPORTIVO -->
            <div class="px-3 pt-5 pb-1.5 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-gold rounded-full"></span>
                <span class="text-[0.55rem] font-black uppercase tracking-[0.28em] text-slate-400">Gestión Deportiva</span>
            </div>
            <a href="planilla.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('planilla')}">
                <div class="w-7 flex justify-center"><i class="fas fa-clipboard-check text-base ${getIconClass('planilla')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Planilla Diaria</span>
            </a>
            <a href="crear-jugador.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('crear-jugador')}">
                <div class="w-7 flex justify-center"><i class="fas fa-user-plus text-base ${getIconClass('crear-jugador')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Alta de Jugadores</span>
            </a>
            <a href="partidos.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('partidos')}">
                <div class="w-7 flex justify-center"><i class="fas fa-calendar-day text-base ${getIconClass('partidos')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Partidos & Eventos</span>
            </a>
            <a href="convocatorias.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('convocatorias')}">
                <div class="w-7 flex justify-center"><i class="fas fa-bullhorn text-base ${getIconClass('convocatorias')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Convocatorias</span>
            </a>
            <a href="auto-import.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('auto-import')}">
                <div class="w-7 flex justify-center"><i class="fas fa-cloud-arrow-up text-base ${getIconClass('auto-import')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Importador Rápido</span>
            </a>

            <!-- GRUPO: ADMINISTRACIÓN -->
            <div class="px-3 pt-5 pb-1.5 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-gold rounded-full"></span>
                <span class="text-[0.55rem] font-black uppercase tracking-[0.28em] text-slate-400">Administración</span>
            </div>
            <a href="usuarios.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('usuario')}">
                <div class="w-7 flex justify-center"><i class="fas fa-users-gear text-base ${getIconClass('usuario')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Gestión de Accesos</span>
            </a>
            <a href="GestorDocumental.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('GestorDocumental')}">
                <div class="w-7 flex justify-center"><i class="fas fa-file-invoice text-base ${getIconClass('GestorDocumental')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Archivo Digital</span>
            </a>
            <a href="rifa_diba.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('rifa_diba')}">
                <div class="w-7 flex justify-center"><i class="fas fa-ticket text-base ${getIconClass('rifa_diba')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Recaudación & Rifas</span>
            </a>
            <a href="profile.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('profile')}">
                <div class="w-7 flex justify-center"><i class="fas fa-id-badge text-base ${getIconClass('profile')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Mi Perfil</span>
            </a>

            <!-- GRUPO: COMUNIDAD -->
            <div class="px-3 pt-5 pb-1.5 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-gold rounded-full"></span>
                <span class="text-[0.55rem] font-black uppercase tracking-[0.28em] text-slate-400">Social & Cloud</span>
            </div>
            <a href="push.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('push')}">
                <div class="w-7 flex justify-center"><i class="fas fa-paper-plane text-base ${getIconClass('push')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Notificaciones Push</span>
            </a>
            <a href="whatsapp.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('whatsapp')}">
                <div class="w-7 flex justify-center"><i class="fab fa-whatsapp text-base ${getIconClass('whatsapp')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">WhatsApp Bot</span>
            </a>
            <a href="https://asistencia-dibafbc.vercel.app/" target="_blank" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-slate-400 font-semibold hover:bg-white/[0.07] hover:text-white group">
                <div class="w-7 flex justify-center"><i class="fas fa-mobile-screen-button text-base text-slate-400 group-hover:text-gold transition-colors"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate flex items-center gap-2">Asistencia App <i class="fas fa-arrow-up-right-from-square text-[0.55rem] opacity-50"></i></span>
            </a>

            <!-- GRUPO: GOLD -->
            <div class="px-3 pt-5 pb-1.5 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-gold rounded-full"></span>
                <span class="text-[0.55rem] font-black uppercase tracking-[0.28em] text-gold"><i class="fas fa-bolt text-gold mr-1"></i>Gold Edition</span>
            </div>
            <a href="gold-dashboard.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('gold-dashboard')}">
                <div class="w-7 flex justify-center"><i class="fas fa-crown text-base ${getIconClass('gold-dashboard')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Dashboard Gold</span>
            </a>
            <a href="asistencia.html" class="nav-link flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${getLinkClass('asistencia')}">
                <div class="w-7 flex justify-center"><i class="fas fa-camera text-base ${getIconClass('asistencia')}"></i></div>
                <span class="text-[0.75rem] tracking-tight truncate">Asistencia Inteligente</span>
            </a>
        </nav>

        <!-- User Profile (Fixed Bottom) -->
        <div class="p-4 bg-white/[0.02] border-t border-white/10 flex-none relative z-10">
            <div onclick="window.location.href='profile.html'" title="Editar Mi Perfil" class="flex items-center gap-3 p-3 bg-white/[0.04] rounded-2xl mb-3 border border-white/10 hover:border-gold/30 hover:bg-white/[0.08] transition-all cursor-pointer group">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-amber-500 text-[#004d98] flex items-center justify-center font-black italic shadow-lg group-hover:scale-105 transition-transform">${userInitial}</div>
                <div class="min-w-0 flex-1">
                    <div class="text-[0.78rem] font-bold text-white truncate tracking-tight">${userName}</div>
                    <div class="text-[0.55rem] font-black text-gold uppercase tracking-[0.2em] mt-0.5">${userRole}</div>
                </div>
                <i class="fas fa-chevron-right text-[0.6rem] text-slate-400 group-hover:text-gold transition-colors"></i>
            </div>
            <button class="w-full py-3 rounded-xl bg-rose-500/10 text-rose-400 text-[0.62rem] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all border border-rose-500/25" id="logout-btn-layout">
                <i class="fas fa-power-off mr-2"></i> Cerrar Sesión
            </button>
        </div>
    </aside>

    <div class="fixed inset-0 bg-[#000]/70 backdrop-blur-md z-[150] hidden transition-opacity duration-500" id="sidebar-overlay"></div>
    `;

    // Header Injection
    const pageTitle = document.title.split('—')[0].trim();
    const headerHTML = `
    <header class="fixed top-0 right-0 left-0 lg:left-[280px] z-[100] bg-[#020617]/85 backdrop-blur-2xl px-4 lg:px-10 h-[70px] lg:h-[80px] flex items-center justify-between border-b border-white/10 shadow-2xl transition-all duration-300">
        <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#004d98] via-[#FFD700] to-[#a50044]"></div>
        
        <div class="flex items-center gap-3 lg:gap-6 flex-1 min-w-0">
            <button class="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/10 shadow-lg" id="menu-btn-layout">
                <i class="fas fa-bars-staggered text-base"></i>
            </button>
            <div class="flex-1 min-w-0 pr-4">
                <div class="flex items-center gap-3">
                    <h1 class="text-[0.95rem] sm:text-lg lg:text-2xl font-black italic text-white uppercase tracking-tighter leading-none truncate">${pageTitle}</h1>
                    <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/25">
                        <span class="w-1.5 h-1.5 rounded-full bg-gold"></span>
                        <span class="text-gold text-[0.5rem] font-black uppercase tracking-[0.2em]">Admin Oficial</span>
                    </div>
                </div>
                <p class="hidden md:block text-[0.58rem] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Ecosistema Administrativo DIBA FBC <span class="mx-2 text-gold">|</span> Temporada 2026</p>
            </div>
        </div>
        
        <div class="flex items-center gap-3 lg:gap-6 flex-none">
            <a href="/index.html" target="_blank" class="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[0.62rem] font-black uppercase tracking-widest text-slate-200 hover:text-gold hover:border-gold/30 hover:bg-white/10 transition-all">
                <i class="fas fa-globe text-gold"></i> Ver Sitio Web
            </a>

            <div class="hidden xl:flex flex-col items-end">
                <div class="text-[1.05rem] font-black text-white italic tracking-tight" id="layout-clock">00:00:00</div>
                <div class="text-[0.55rem] font-black text-gold uppercase tracking-[0.2em]" id="layout-date">---</div>
            </div>
            
            <div class="w-[1px] h-8 bg-white/10 hidden xl:block"></div>
            
            <div class="flex items-center gap-2.5">
                <button onclick="window.location.href='push.html'" title="Notificaciones Push" class="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-gold hover:border-gold/30 hover:bg-white/10 transition-all group">
                    <i class="fas fa-bell text-sm"></i>
                </button>
                <div onclick="window.location.href='profile.html'" title="Mi Perfil" class="relative group cursor-pointer">
                    <div class="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-gradient-to-br from-[#FFD700] to-amber-500 border border-gold/40 flex items-center justify-center text-[#004d98] font-black text-sm shadow-lg group-hover:scale-105 transition-transform">
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
