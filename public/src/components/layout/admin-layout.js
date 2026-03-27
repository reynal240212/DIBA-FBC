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
    const userInitial = userName[0].toUpperCase();

    // Sidebar Injection (Azul Grana Gradient)
    const sidebarHTML = `
    <aside class="fixed top-0 left-0 bottom-0 w-[280px] bg-gradient-to-b from-[#004d98] to-[#a50044] z-50 transition-transform duration-500 lg:translate-x-0 -translate-x-full sidebar shadow-2xl overflow-hidden" id="sidebar">
        <!-- Visual Decorator -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div class="p-8 pb-6 flex items-center gap-4 relative z-10 border-b border-white/10">
            <img src="/images/ESCUDO.png" alt="DIBA FBC" class="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">
            <div class="text-2xl font-black italic tracking-tighter text-white font-montserrat">DIBA <span class="text-[#FFD700]">FBC</span></div>
        </div>

        <nav class="px-5 py-8 space-y-1.5 overflow-y-auto h-[calc(100vh-240px)] custom-scrollbar relative z-10">
            <div class="px-6 py-3 text-[0.65rem] font-black uppercase tracking-[0.3em] text-white/40 italic">Principal</div>
            <a href="dashboard.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('dashboard') ? 'bg-[#FFD700] text-[#004d98] font-black shadow-lg scale-[1.02]' : 'text-white/80 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-chart-line text-lg ${isActive('dashboard') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Dashboard
            </a>

            <div class="px-6 pt-10 pb-3 text-[0.65rem] font-black uppercase tracking-[0.3em] text-white/40 italic">Gestión</div>
            <a href="planilla.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('planilla') ? 'bg-[#FFD700] text-[#004d98] font-black shadow-lg scale-[1.02]' : 'text-white/80 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-list-check text-lg ${isActive('planilla') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Planilla
            </a>
            <a href="partidos.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('partidos') ? 'bg-[#FFD700] text-[#004d98] font-black shadow-lg scale-[1.02]' : 'text-white/80 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-futbol text-lg ${isActive('partidos') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Partidos
            </a>
            <a href="convocatorias.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('convocatorias') ? 'bg-[#FFD700] text-[#004d98] font-black shadow-lg scale-[1.02]' : 'text-white/80 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-bullhorn text-lg ${isActive('convocatorias') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Convocatorias
            </a>
            <a href="usuarios.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('usuarios') ? 'bg-[#FFD700] text-[#004d98] font-black shadow-lg scale-[1.02]' : 'text-white/80 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-user-shield text-lg ${isActive('usuarios') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Usuarios
            </a>
            <a href="GestorDocumental.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('GestorDocumental') ? 'bg-[#FFD700] text-[#004d98] font-black shadow-lg scale-[1.02]' : 'text-white/80 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-file-invoice text-lg ${isActive('GestorDocumental') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Documentos
            </a>
            <a href="rifa_diba.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('rifa_diba') ? 'bg-[#FFD700] text-[#004d98] font-black shadow-lg scale-[1.02]' : 'text-white/80 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-ticket-simple text-lg ${isActive('rifa_diba') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Rifa
            </a>
            <a href="push.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('push') ? 'bg-[#FFD700] text-[#004d98] font-black shadow-lg scale-[1.02]' : 'text-white/80 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-paper-plane text-lg ${isActive('push') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Push
            </a>
            <a href="profile.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('profile') ? 'bg-[#FFD700] text-[#004d98] font-black shadow-lg scale-[1.02]' : 'text-white/80 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-user-circle text-lg ${isActive('profile') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Perfil
            </a>
        </nav>

        <div class="absolute bottom-0 left-0 right-0 p-6 bg-black/20 backdrop-blur-md border-t border-white/5">
            <div class="flex items-center gap-3 p-4 bg-white/5 rounded-2xl mb-4 border border-white/5">
                <div class="w-10 h-10 rounded-full bg-[#FFD700] text-[#004d98] flex items-center justify-center font-black italic shadow-inner">${userInitial}</div>
                <div class="min-w-0">
                    <div class="text-[0.8rem] font-black text-white truncate italic uppercase tracking-tighter">${userName}</div>
                    <div class="text-[0.6rem] font-bold text-[#FFD700]/70 uppercase tracking-widest">${userRole}</div>
                </div>
            </div>
            <button class="w-full py-3.5 rounded-xl bg-white/10 text-white text-[0.7rem] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all border border-white/10" id="logout-btn-layout">
                <i class="fas fa-power-off mr-2 text-[#FFD700]"></i> Salir
            </button>
        </div>
    </aside>
    <div class="fixed inset-0 bg-[#004d98]/40 backdrop-blur-sm z-40 hidden" id="sidebar-overlay"></div>
    `;

    // Header Injection (Azul Grana Styled)
    const pageTitle = document.title.split('—')[0].trim();
    const headerHTML = `
    <header class="sticky top-0 z-40 bg-white px-8 h-[70px] flex items-center justify-between border-b border-slate-100 shadow-sm relative overflow-hidden">
        <!-- Visual Accent -->
        <div class="absolute top-0 left-0 w-1 h-full bg-[#004d98]"></div>
        
        <div class="flex items-center gap-6">
            <button class="lg:hidden w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-[#004d98] hover:bg-slate-100 transition-all border border-slate-100" id="menu-btn-layout">
                <i class="fas fa-bars-staggered"></i>
            </button>
            <div class="animate-fade-up">
                <h1 class="text-xl font-black italic text-[#004d98] uppercase tracking-tighter font-montserrat">${pageTitle} <span class="text-[#a50044] font-normal">PANEL</span></h1>
                <p class="text-[0.55rem] font-bold text-slate-400 uppercase tracking-[0.4em] mt-0.5">Club Deportivo DIBA FBC</p>
            </div>
        </div>
        
        <div class="flex items-center gap-6">
            <div class="hidden md:flex flex-col items-end">
                <div class="text-[1rem] font-black text-[#004d98] italic tracking-tighter" id="layout-clock">00:00:00</div>
                <div class="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest" id="layout-date">---</div>
            </div>
            <div class="w-[1px] h-8 bg-slate-100 hidden md:block"></div>
            <div class="flex items-center gap-3">
                <button class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#004d98] hover:text-[#a50044] transition-colors shadow-sm">
                    <i class="fas fa-bell text-sm"></i>
                </button>
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004d98] to-[#a50044] flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-900/10 border border-white/20">
                    ${userInitial}
                </div>
            </div>
        </div>
    </header>
    `;

    navContainer.innerHTML = sidebarHTML + headerHTML;

    // Sidebar Logic
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuBtn = document.getElementById('menu-btn-layout');

    menuBtn?.addEventListener('click', () => {
        sidebar?.classList.add('open');
        overlay?.classList.remove('hidden');
    });

    overlay?.addEventListener('click', () => {
        sidebar?.classList.remove('open');
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

function isActive(path) {
    return window.location.pathname.includes(path);
}


