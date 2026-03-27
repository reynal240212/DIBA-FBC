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

    // Sidebar Injection (DIBA Blue Background)
    const sidebarHTML = `
    <aside class="fixed top-0 left-0 bottom-0 w-[280px] bg-[#003366] border-r border-[#002244] z-50 transition-transform duration-500 lg:translate-x-0 -translate-x-full sidebar shadow-2xl" id="sidebar">
        <div class="p-8 pb-4 flex items-center gap-4">
            <img src="/images/ESCUDO.png" alt="DIBA FBC" class="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
            <div class="text-2xl font-black italic tracking-tighter text-white font-montserrat">DIBA <span class="text-[#FFD700]">FBC</span></div>
        </div>

        <nav class="px-5 py-6 space-y-1.5 overflow-y-auto h-[calc(100vh-220px)] custom-scrollbar">
            <div class="px-6 py-3 text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/30 italic">Principal</div>
            <a href="dashboard.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('dashboard') ? 'bg-[#FFD700] text-[#003366] font-black shadow-lg scale-[1.02]' : 'text-white/70 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-chart-line text-lg ${isActive('dashboard') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Dashboard
            </a>

            <div class="px-6 pt-8 pb-3 text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/30 italic">Gestión Deportiva</div>
            <a href="planilla.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('planilla') ? 'bg-[#FFD700] text-[#003366] font-black shadow-lg scale-[1.02]' : 'text-white/70 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-list-check text-lg ${isActive('planilla') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Planilla
            </a>
            <a href="crear-jugador.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('crear-jugador') ? 'bg-[#FFD700] text-[#003366] font-black shadow-lg scale-[1.02]' : 'text-white/70 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-user-plus text-lg ${isActive('crear-jugador') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Nuevo Jugador
            </a>
            <a href="partidos.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('partidos') ? 'bg-[#FFD700] text-[#003366] font-black shadow-lg scale-[1.02]' : 'text-white/70 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-futbol text-lg ${isActive('partidos') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Partidos
            </a>
            <a href="convocatorias.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('convocatorias') ? 'bg-[#FFD700] text-[#003366] font-black shadow-lg scale-[1.02]' : 'text-white/70 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-bullhorn text-lg ${isActive('convocatorias') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Convocatorias
            </a>

            <div class="px-6 pt-8 pb-3 text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/30 italic">Administración</div>
            <a href="GestorDocumental.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('GestorDocumental') ? 'bg-[#FFD700] text-[#003366] font-black shadow-lg scale-[1.02]' : 'text-white/70 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-file-invoice text-lg ${isActive('GestorDocumental') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Documentos
            </a>
            <a href="usuarios.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('usuarios') ? 'bg-[#FFD700] text-[#003366] font-black shadow-lg scale-[1.02]' : 'text-white/70 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-user-shield text-lg ${isActive('usuarios') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Usuarios
            </a>
            <a href="rifa_diba.html" class="nav-link flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${isActive('rifa_diba') ? 'bg-[#FFD700] text-[#003366] font-black shadow-lg scale-[1.02]' : 'text-white/70 font-bold hover:bg-white/10 hover:text-white group'}">
                <i class="fas fa-ticket-alt text-lg ${isActive('rifa_diba') ? '' : 'opacity-40 group-hover:opacity-100 group-hover:text-[#FFD700]'}"></i> Rifas
            </a>
        </nav>

        <div class="absolute bottom-0 left-0 right-0 p-6 bg-[#002a55] border-t border-white/5">
            <div class="flex items-center gap-3 p-4 bg-white/5 rounded-2xl mb-4 border border-white/5">
                <div class="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold font-black italic border border-gold/30">${userInitial}</div>
                <div class="min-w-0">
                    <div class="text-[0.8rem] font-black text-white truncate italic">${userName}</div>
                    <div class="text-[0.6rem] font-bold text-gold/60 uppercase tracking-widest">${userRole}</div>
                </div>
            </div>
            <button class="w-full py-3.5 rounded-xl bg-red-500/10 text-red-500 text-[0.7rem] font-black uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all border border-red-500/10" id="logout-btn-layout">
                <i class="fas fa-power-off mr-2"></i> Cerrar Sesión
            </button>
        </div>
    </aside>
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 hidden" id="sidebar-overlay"></div>
    `;

    // Header Injection (White Background)
    const pageTitle = document.title.split('—')[0].trim();
    const headerHTML = `
    <header class="sticky top-0 z-40 bg-white px-8 h-20 flex items-center justify-between border-b border-slate-200 shadow-sm">
        <div class="flex items-center gap-6">
            <button class="lg:hidden w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#003366] hover:bg-slate-200 transition-all" id="menu-btn-layout">
                <i class="fas fa-bars-staggered"></i>
            </button>
            <div class="animate-fade-up">
                <h1 class="text-xl font-black italic text-[#003366] uppercase tracking-tighter font-montserrat">${pageTitle} <span class="text-[#FFD700] opacity-100 font-normal">SISTEMA</span></h1>
                <p class="text-[0.55rem] font-bold text-slate-400 uppercase tracking-[0.4em] mt-0.5">Gestión Administrativa DIBA FBC</p>
            </div>
        </div>
        <div class="flex items-center gap-4">
            <div class="hidden md:flex flex-col items-end">
                <div class="text-[0.9rem] font-black text-[#003366] italic" id="layout-clock">00:00:00</div>
                <div class="text-[0.5rem] font-bold text-slate-400 uppercase tracking-widest" id="layout-date">---</div>
            </div>
            <div class="w-[1px] h-8 bg-slate-200 hidden md:block"></div>
            <div class="flex items-center gap-2">
                <button id="theme-toggle" class="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#003366] hover:bg-slate-100 transition-all shadow-sm">
                    <i class="fas fa-circle-half-stroke"></i>
                </button>
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


