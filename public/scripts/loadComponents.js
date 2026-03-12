/* ==============================================
   DIBA FBC - GESTIÓN DE JUGADORES Y COMPONENTES
================================================= */
document.addEventListener("DOMContentLoaded", function () {

  // --- 1. ESTILOS PARA EL MODAL Y MEJORA DE IMAGEN (ANTI-GRANULADO) ---
  const style = document.createElement('style');
  style.innerHTML = `
    .player-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.93);
      z-index: 10000;
      padding: 20px;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(10px);
    }
    .player-modal.active {
      opacity: 1;
      display: flex;
    }
    .modal-content-wrapper {
      transform: scale(0.8);
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .player-modal.active .modal-content-wrapper {
      transform: scale(1);
    }

    /* FILTRO PARA CORREGIR EL RUIDO/GRANULADO DE LAS FOTOS */
    #modal-img {
      width: 100%;
      border-radius: 24px;
      border: 4px solid #f59e0b;
      box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8);
      /* El blur mínimo mezcla los puntos del granulado y el brillo limpia las sombras */
      filter: brightness(1.06) contrast(1.03) saturate(1.1) blur(0.15px);
      image-rendering: auto;
    }

    #close-modal {
      position: absolute;
      top: 25px;
      right: 25px;
      background: #f59e0b;
      color: #000;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(0,0,0,0.4);
      transition: all 0.2s;
      z-index: 10001;
    }
    #close-modal:hover { transform: scale(1.1) rotate(90deg); background: #fff; }
  `;
  document.head.appendChild(style);

  // --- 2. ESTRUCTURA DEL MODAL ---
  const modalHTML = `
    <div id="player-modal" class="player-modal">
      <div id="close-modal">&times;</div>
      <div class="modal-content-wrapper">
        <img id="modal-img" src="" alt="Jugador">
        <h2 id="modal-name" class="text-3xl font-black text-white uppercase italic mt-6 tracking-tighter"></h2>
        <p class="text-amber-500 font-bold tracking-widest uppercase text-sm">DIBA FBC</p>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('player-modal');
  const modalImg = document.getElementById('modal-img');
  const modalName = document.getElementById('modal-name');
  const closeModal = document.getElementById('close-modal');

  const closeFunc = () => modal.classList.remove('active');
  closeModal.addEventListener('click', closeFunc);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeFunc(); });

  // --- 3. CARGA DE COMPONENTES (Navbar, Footer, etc.) ---
  function loadComponent(containerId, filePath, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    fetch(filePath)
      .then(r => r.text())
      .then(data => {
        container.innerHTML = data;
        if (callback) callback();
      }).catch(err => console.error("Error:", filePath));
  }

  loadComponent("navbar-container", "layout/navbar.html", async () => {
    try {
      const { initNavbar } = await import('./navbar.js');
      initNavbar();
    } catch (err) {
      console.error("Error initializing navbar module:", err);
    }

    // Cargar buscador global después de que el navbar esté en el DOM
    if (!document.getElementById('search-overlay')) {
      const s = document.createElement('script');
      s.src = 'scripts/search.js';
      document.body.appendChild(s);
    }
  });
  loadComponent("match-banner-container", "layout/match_banner.html", async () => {
    // --- LÓGICA DEL MATCH BANNER DINÁMICO ---
    const dynamicContainer = document.getElementById("dynamic-match-banner-container");
    const loadingStatus = document.getElementById("banner-loading");
    if (!dynamicContainer) return;

    try {
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
      const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Obtener la fecha actual del sistema dinámicamente
      const today = new Date();
      const targetDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

      // Reutiliza la función toLocalDate si estuviera global, pero aquí la redefinimos para uso seguro
      const toLocalDateBanner = (fechaISO) => {
        const d = new Date(fechaISO);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      };

      const { data, error } = await supabase.from('partidos').select('*').gte('fecha', targetDate);

      if (error) throw error;

      const matches = (data || []).filter(p => toLocalDateBanner(p.fecha) === targetDate);

      // Si no hay partidos hoy, busca los PRÓXIMOS partidos a futuro
      let displayMatches = matches;
      let isFuture = false;

      if (displayMatches.length === 0) {
        const futureMatches = (data || []).filter(p => new Date(p.fecha) >= new Date(targetDate));
        // Agrupar por la fecha más cercana
        if (futureMatches.length > 0) {
          const sorted = futureMatches.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
          const nextDate = toLocalDateBanner(sorted[0].fecha);
          displayMatches = sorted.filter(p => toLocalDateBanner(p.fecha) === nextDate);
          isFuture = true;
        }
      }

      if (loadingStatus) loadingStatus.style.display = 'none';

      if (displayMatches.length === 0) {
        dynamicContainer.innerHTML = `
           <div class="w-full text-center text-slate-400 text-sm py-4 italic">
              No hay partidos programados próximamente.
           </div>
         `;
        return;
      }

      // Limpiar contenedor
      dynamicContainer.innerHTML = '';

      // Título sutil si son partidos futuros
      if (isFuture) {
        const title = document.createElement("div");
        title.className = "w-full flex-none text-center text-amber-500 font-bold text-xs uppercase tracking-widest mb-2 snap-center";
        title.innerHTML = `PRÓXIMOS PARTIDOS: ${toLocalDateBanner(displayMatches[0].fecha)}`;
        dynamicContainer.appendChild(title);
      }

      displayMatches.forEach(p => {
        const card = document.createElement("div");
        // Se encoge al ancho mínimo del contenido, snap center para scroll horizontal
        card.className = "flex-none w-80 sm:w-96 snap-center bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors duration-300";

        // Helper function para manejar el escudo, logo DIBA si aplica, o iniciales autogeneradas si es rival
        const escudoImg = (url, equipoNombre) => {
          if (equipoNombre && equipoNombre.toUpperCase().includes('DIBA')) {
            return "images/ESCUDO.png";
          }
          return url ? url : `https://ui-avatars.com/api/?name=${encodeURIComponent(equipoNombre || 'Rival')}&background=1e293b&color=cbd5e1&bold=true`;
        };

        card.innerHTML = `
             <div class="flex items-center justify-between gap-4 w-full">
                 <div class="flex flex-col items-center w-1/3">
                     <img src="${escudoImg(p.escudo_local || p.escudo, p.equipolocal)}" alt="${p.equipolocal}" class="w-12 h-12 object-contain mb-2 img-drop-shadow" onerror="this.src='${escudoImg(null, p.equipolocal)}'">
                     <span class="text-white font-bold text-[10px] sm:text-xs uppercase text-center line-clamp-2 leading-tight">${p.equipolocal || 'DIBA FBC'}</span>
                 </div>

                 <div class="flex flex-col items-center justify-center w-1/3 px-1">
                     <span class="bg-amber-500 text-slate-900 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-lg shadow-amber-500/20 mb-1">
                        ${p.hora || 'VS'}
                     </span>
                     <span class="text-slate-400 text-[9px] sm:text-[10px] uppercase font-bold text-center w-full truncate">${p.Cancha || 'Cancha'}</span>
                 </div>
                 
                 <div class="flex flex-col items-center w-1/3">
                     <img src="${escudoImg(p.escudo_visitante, p.equipovisitante)}" alt="${p.equipovisitante}" class="w-12 h-12 object-contain mb-2 img-drop-shadow" onerror="this.src='${escudoImg(null, p.equipovisitante)}'">
                     <span class="text-white font-bold text-[10px] sm:text-xs uppercase text-center line-clamp-2 leading-tight">${p.equipovisitante || 'Rival'}</span>
                 </div>
             </div>


          <a href="partidos.html" class="w-full mt-2 inline-flex justify-center items-center gap-2 bg-slate-900/50 hover:bg-amber-500 hover:text-slate-900 border border-white/5 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all duration-300">
            Ver Detalles <i class="fas fa-external-link-alt text-[9px]"></i>
          </a>
        `;
        dynamicContainer.appendChild(card);
      });

      // --- LOGICA DE SCROLL POR ARRASTRE DE RATÓN (DESKTOP) ---
      let isDown = false;
      let startX;
      let scrollLeft;

      dynamicContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        dynamicContainer.classList.remove('snap-x', 'snap-mandatory'); // temporalmente quitar el snap al arrastrar
        startX = e.pageX - dynamicContainer.offsetLeft;
        scrollLeft = dynamicContainer.scrollLeft;
      });

      dynamicContainer.addEventListener('mouseleave', () => {
        isDown = false;
        dynamicContainer.classList.add('snap-x', 'snap-mandatory');
      });

      dynamicContainer.addEventListener('mouseup', () => {
        isDown = false;
        dynamicContainer.classList.add('snap-x', 'snap-mandatory');
      });

      dynamicContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - dynamicContainer.offsetLeft;
        const walk = (x - startX) * 2; // velocidad de scroll
        dynamicContainer.scrollLeft = scrollLeft - walk;
      });

    } catch (err) {
      console.error("Match banner fetch error:", err);
      if (loadingStatus) loadingStatus.innerHTML = `<span class="text-red-400 text-xs" > Error cargando banner.</span> `;
    }
  }); loadComponent("hero-container", "layout/hero.html");
  loadComponent("stats-container", "layout/stats_counter.html", async () => {
    try {
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
      const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      async function fetchAndSetValues() {
        const startYear = 2012;
        const currentYear = new Date().getFullYear();
        const yearsOfHistory = currentYear - startYear > 0 ? currentYear - startYear : 14;

        const totalTrophies = 13 + 3 + 2;

        let totalPlayers = 60;
        try {
          const { count, error } = await supabase
            .from('identificacion')
            .select('*', { count: 'exact', head: true });

          if (!error && count !== null && count > 0) {
            totalPlayers = count;
          }
        } catch (e) {
          console.error("Error connecting to supabase for stats:", e);
        }

        const yearsEl = document.getElementById('stats-years');
        const trophiesEl = document.getElementById('stats-trophies');
        const playersEl = document.getElementById('stats-players');
        const commitmentEl = document.getElementById('stats-commitment');

        if (yearsEl) animateValue(yearsEl, 0, yearsOfHistory, 2000);
        if (trophiesEl) animateValue(trophiesEl, 0, totalTrophies, 2000);
        if (playersEl) animateValue(playersEl, 0, totalPlayers, 2000);
        if (commitmentEl) animateValue(commitmentEl, 0, 100, 2000);
      }

      function animateValue(obj, start, end, duration) {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          obj.innerHTML = Math.floor(progress * (end - start) + start);
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
      }

      const statsSection = document.querySelector('.max-w-7xl');
      if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            fetchAndSetValues();
            observer.disconnect();
          }
        }, { threshold: 0.1 });
        observer.observe(statsSection);
      } else {
        fetchAndSetValues(); // Fallback
      }

    } catch (err) {
      console.error("Error initializing stats component:", err);
    }
  });
  loadComponent("patrocinadores-container", "layout/patrocinadores.html");
  loadComponent("testimonials-container", "layout/testimonials.html");
  loadComponent("footer-container", "layout/footer.html");
  loadComponent("fab-container", "layout/fab.html");

  // --- 4. JUGADORES DINÁMICOS DESDE SUPABASE (ÚNICA FUENTE DE VERDAD) ---
  const playersContainer = document.getElementById("players-container");

  if (playersContainer) {
    async function loadPlayersFromSupabase() {
      // Estado de carga elegante (Skeleton UI sutil)
      playersContainer.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
          <i class="fas fa-circle-notch animate-spin text-4xl text-amber-500 mb-4"></i>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">Cargando Plantilla Oficial DIBA FBC...</p>
        </div>
      `;

      try {
        const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
        const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG || {};
        
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
          console.error("Configuración de Supabase no encontrada.");
          playersContainer.innerHTML = '<p class="text-center py-10 text-red-500 font-bold uppercase text-xs">Error: Servidor DIBA-Connect no disponible.</p>';
          return;
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        const { data: jugadores, error } = await supabase
          .from('identificacion')
          .select('nombre, apellidos, categoria, foto_url, fecha_nacimiento, numero')
          .order('apellidos');

        if (error) throw error;

        if (!jugadores || jugadores.length === 0) {
          playersContainer.innerHTML = '<p class="text-center text-slate-400 py-16 col-span-full uppercase text-xs font-black italic tracking-widest">No hay jugadores registrados en la base de datos oficial.</p>';
          return;
        }

        // Agrupar por categoría
        const grouped = {};
        jugadores.forEach(j => {
          let cat = j.categoria || 'General';

          // Autocategorización lógica (Fallback dinámico)
          if ((cat === 'General' || !cat) && j.fecha_nacimiento) {
            const birthYear = new Date(j.fecha_nacimiento).getUTCFullYear();
            if (birthYear === 2012) cat = '2012';
            else if (birthYear === 2013) cat = '2013';
            else if (birthYear >= 2014 && birthYear <= 2016) cat = '2014/2015/2016';
          }

          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(j);
        });

        playersContainer.innerHTML = '';
        const defaultImg = "https://placehold.co/400x500/1e293b/64748b?text=DIBA+FBC";

        // Ordenar categorías (2012, 2013, 2014/15/16)
        const sortedCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

        sortedCategories.forEach(catTitle => {
          const players = grouped[catTitle];
          
          const section = document.createElement("section");
          section.className = "mb-24 w-full animate__animated animate__fadeIn";
          section.innerHTML = `
            <div class="flex items-center mb-12 px-4 group">
              <div class="relative">
                <h2 class="text-3xl font-black text-slate-900 uppercase tracking-tighter italic mr-8 group-hover:text-amber-500 transition-colors">Categoría ${catTitle}</h2>
                <div class="absolute -bottom-2 left-0 w-16 h-1.5 bg-amber-500 rounded-full"></div>
              </div>
              <div class="flex-grow h-[1px] bg-gradient-to-r from-slate-200 to-transparent"></div>
              <div class="hidden sm:flex items-center gap-2 ml-4">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${players.length} GUERREROS</span>
                <i class="fas fa-shield-alt text-slate-200 text-sm"></i>
              </div>
            </div>`;

          const grid = document.createElement("div");
          grid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 px-4 w-full";

          players.forEach((j, index) => {
            const playerName = `${j.nombre} ${j.apellidos}`.trim();
            const imageUrl = j.foto_url || defaultImg;
            
            // Carta Premium con Glassmorphism y Animaciones
            const card = document.createElement("article");
            card.className = "group relative bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/40 hover:shadow-amber-500/30 transition-all duration-700 cursor-pointer animate__animated animate__fadeInUp";
            card.style.animationDelay = `${index * 0.05}s`;
            
            card.innerHTML = `
              <div class="aspect-[4/5] overflow-hidden bg-slate-100 relative">
                <!-- Overlay dinámico -->
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700 z-10"></div>
                
                <img src="${imageUrl}" 
                     class="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110" 
                     onerror="this.src='${defaultImg}'"
                     loading="lazy">
                
                <!-- ID Badge -->
                <div class="absolute top-4 right-4 z-20">
                  <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                    <span class="text-[9px] font-black text-white">#${j.numero?.slice(-3) || '??'}</span>
                  </div>
                </div>
              </div>

              <div class="p-5 text-center relative z-20 bg-white group-hover:bg-slate-50 transition-colors duration-500">
                <div class="absolute -top-4 inset-x-0 flex justify-center">
                  <span class="bg-amber-500 text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xl transform -rotate-1 group-hover:rotate-0 transition-all">
                    OFICIAL
                  </span>
                </div>
                <h3 class="mt-3 text-sm font-black text-slate-900 uppercase leading-snug tracking-tighter group-hover:text-amber-600 transition-colors duration-300 min-h-[40px] flex items-center justify-center">
                  ${playerName}
                </h3>
                
                <div class="mt-4 pt-3 border-t border-slate-100 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-2 group-hover:translate-y-0">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">VER DETALLES</span>
                  <div class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <i class="fas fa-chevron-right text-[8px] text-amber-600"></i>
                  </div>
                </div>
              </div>
            `;

            card.addEventListener('click', () => {
              if (typeof modalImg !== 'undefined') {
                modalImg.src = imageUrl;
                modalName.textContent = playerName;
                modal.classList.add('active');
              }
            });
            grid.appendChild(card);
          });

          section.appendChild(grid);
          playersContainer.appendChild(section);
        });

      } catch (err) {
        console.error('[Plantilla] Error Crítico:', err);
        playersContainer.innerHTML = `
          <div class="col-span-full py-20 text-center animate__animated animate__shakeX">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-500 mb-6">
              <i class="fas fa-database text-3xl"></i>
            </div>
            <h3 class="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">Error de Sincronización</h3>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-xs mx-auto">No pudimos enlazar con la base de datos de jugadores.</p>
            <button onclick="window.location.reload()" class="mt-8 px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-amber-500 hover:text-slate-900 shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1">
              Reintentar Conexión
            </button>
          </div>
        `;
      }
    }

    loadPlayersFromSupabase();
  }

  // --- 5. TABLA DE GOLEADORES (SUPABASE) ---
  async function cargarGoleadores() {
    const container = document.getElementById("goleadores-list");
    if (!container) return;

    try {
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
      const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data, error } = await supabase.from("goleadores").select("*").order("goles", { ascending: false });
      if (error) throw error;

      container.innerHTML = "";
      data.forEach((g) => {
        const item = document.createElement("div");
        item.className = "flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors";
        item.innerHTML = `
          <div class="flex items-center gap-3" >
            <img src="${g.escudo_url || 'images/ESCUDO.png'}" class="w-8 h-8 object-contain">
            <div>
              <div class="text-sm font-bold text-slate-900">${g.nombre_jugador}</div>
              <div class="text-[10px] text-slate-400 uppercase">${g.equipo}</div>
            </div>
          </div>
          <div class="bg-slate-900 text-amber-500 font-black py-1 px-3 rounded-lg text-xs">${g.goles}</div>
        `;
        container.appendChild(item);
      });
    } catch (err) {
      container.innerHTML = `<p class="text-center text-red-500 text-xs p-4" > Error de conexión.</p> `;
    }
  }
  cargarGoleadores();
});