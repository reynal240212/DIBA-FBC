/* ==============================================
   DIBA FBC - GESTIÓN DE JUGADORES Y COMPONENTES
================================================= */
document.addEventListener("DOMContentLoaded", async function () {
  // --- 0. CLIENTE SUPABASE ÚNICO ---
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabase = supabase; // Compartir instancia

  // --- 1. ESTILOS MOVIDOS A main-dynamic.css ---

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
      // Usa la instancia única de supabase definida al inicio

      // Obtener la fecha actual del sistema dinámicamente
      const today = new Date();
      const targetDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

      // Reutiliza la función toLocalDate si estuviera global, pero aquí la redefinimos para uso seguro
      const toLocalDateBanner = (fechaISO) => {
        if (!fechaISO) return '';
        // Usar split para evitar el desfase de zona horaria de JavaScript
        const parts = fechaISO.includes('T') ? fechaISO.split('T')[0].split('-') : fechaISO.split('-');
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
      };

      const { data: displayMatches, error } = await supabase
        .from('partidos')
        .select('*')
        .gte('fecha', targetDate)
        .order('fecha', { ascending: true })
        .limit(10);

      if (error) throw error;

      if (loadingStatus) loadingStatus.style.display = 'none';

      if (!displayMatches || displayMatches.length === 0) {
        dynamicContainer.innerHTML = `
           <div class="w-full text-center text-slate-400 text-sm py-4 italic">
              No hay partidos programados próximamente.
           </div>
         `;
        return;
      }

      // Limpiar contenedor
      dynamicContainer.innerHTML = '';

      displayMatches.forEach(p => {
        const card = document.createElement("div");
        card.className = "flex-none w-80 sm:w-96 snap-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-500 group/card relative overflow-hidden";

        // Obtener estado real del partido
        const esHoy = toLocalDateBanner(p.fecha) === targetDate;
        const tieneResultado = p.resultado && p.resultado !== '' && p.resultado !== '-';
        
        let statusBadge = '';
        if (tieneResultado) {
          statusBadge = '<span class="bg-slate-700 text-slate-300 text-[8px] font-black px-2 py-0.5 rounded-full ring-1 ring-white/10 uppercase tracking-widest">Finalizado</span>';
        } else if (esHoy) {
          statusBadge = '<span class="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-500/20"><span class="w-1 h-1 bg-white rounded-full"></span> En Vivo</span>';
        } else {
          statusBadge = '<span class="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Próximo</span>';
        }

        const escudoImg = (url, equipoNombre) => {
          if (equipoNombre && equipoNombre.toUpperCase().includes('DIBA')) return "images/ESCUDO.png";
          if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(equipoNombre || 'Rival')}&background=1e293b&color=cbd5e1&bold=true`;
          return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=https://ui-avatars.com/api/?name=${encodeURIComponent(equipoNombre || 'R')}&background=1e293b&color=cbd5e1`;
        };

        card.innerHTML = `
             <!-- Glow background -->
             <div class="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover/card:bg-amber-500/10 transition-all duration-700"></div>

             <div class="flex items-center justify-between mb-1">
               <span class="text-[9px] font-black text-amber-500/80 uppercase tracking-[0.2em]">CAT. ${p.categoria || 'GENERAL'}</span>
               ${statusBadge}
             </div>

             <div class="flex items-center justify-between gap-4 w-full relative z-10">
                 <!-- Local -->
                 <div class="flex flex-col items-center w-[35%]">
                     <div class="relative mb-3">
                       <div class="absolute inset-0 bg-white/5 rounded-full blur-xl scale-150 group-hover/card:bg-white/10 transition-all duration-700"></div>
                       <img src="${escudoImg(p.escudo_local || p.escudo, p.equipolocal)}" 
                            alt="${p.equipolocal}" 
                            class="w-14 h-14 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover/card:scale-110 transition-transform duration-500" 
                            onerror="this.src='${escudoImg(null, p.equipolocal)}'">
                     </div>
                     <span class="text-white font-black text-[10px] sm:text-[11px] uppercase text-center line-clamp-2 leading-tight tracking-tight">${p.equipolocal || 'DIBA FBC'}</span>
                 </div>

                 <!-- VS / Score -->
                 <div class="flex flex-col items-center justify-center w-[30%] px-1">
                     <div class="mb-2 relative">
                       ${tieneResultado 
                         ? `<span class="text-2xl font-black text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">${p.resultado}</span>`
                         : `<div class="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg shadow-[0_4px_20px_-5px_rgba(245,158,11,0.5)] transform -rotate-2 group-hover/card:rotate-0 transition-all duration-500">${p.hora || 'VS'}</div>`
                       }
                     </div>
                     <span class="text-slate-400 text-[9px] font-bold text-center w-full truncate tracking-tighter uppercase opacity-60">${p.Cancha || 'Cancha'}</span>
                 </div>

                 <!-- Visitante -->
                 <div class="flex flex-col items-center w-[35%]">
                     <div class="relative mb-3">
                       <div class="absolute inset-0 bg-white/5 rounded-full blur-xl scale-150 group-hover/card:bg-white/10 transition-all duration-700"></div>
                       <img src="${escudoImg(p.escudo_visitante, p.equipovisitante)}" 
                            alt="${p.equipovisitante}" 
                            class="w-14 h-14 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover/card:scale-110 transition-transform duration-500" 
                            onerror="this.src='${escudoImg(null, p.equipovisitante)}'">
                     </div>
                     <span class="text-white font-black text-[10px] sm:text-[11px] uppercase text-center line-clamp-2 leading-tight tracking-tight">${p.equipovisitante || 'Rival'}</span>
                 </div>
             </div>

          <div class="mt-2 flex items-center justify-between gap-4">
            <div class="flex items-center gap-1.5 opacity-40">
              <i class="fas fa-calendar-day text-[9px] text-amber-500"></i>
              <span class="text-[9px] font-bold text-white uppercase italic tracking-tighter">${toLocalDateBanner(p.fecha)}</span>
            </div>
            <a href="partidos.html" class="flex-grow inline-flex justify-center items-center gap-2 bg-white/5 hover:bg-amber-500 hover:text-slate-950 border border-white/5 py-2 rounded-xl text-[9px] font-black text-white uppercase tracking-[0.2em] transition-all duration-300">
              Ficha Técnica <i class="fas fa-chevron-right text-[8px]"></i>
            </a>
          </div>
        `;
        dynamicContainer.appendChild(card);
      });

      // --- NAVEGACIÓN MEJORADA ---
      dynamicContainer.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          dynamicContainer.scrollLeft += e.deltaY;
        }
      });

      let isDown = false;
      let startX;
      let scrollLeft;

      dynamicContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        dynamicContainer.style.scrollSnapType = 'none';
        dynamicContainer.style.cursor = 'grabbing';
        startX = e.pageX - dynamicContainer.offsetLeft;
        scrollLeft = dynamicContainer.scrollLeft;
      });

      const stopDragging = () => {
        isDown = false;
        dynamicContainer.style.scrollSnapType = 'x mandatory';
        dynamicContainer.style.cursor = 'grab';
      };

      dynamicContainer.addEventListener('mouseleave', stopDragging);
      dynamicContainer.addEventListener('mouseup', stopDragging);

      dynamicContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - dynamicContainer.offsetLeft;
        const walk = (x - startX) * 2;
        dynamicContainer.scrollLeft = scrollLeft - walk;
      });

      // --- LOGICA DE BOTONES DE NAVEGACION (Desktop) ---
      const btnPrev = document.getElementById('banner-prev');
      const btnNext = document.getElementById('banner-next');

      if (btnPrev && btnNext) {
        const scrollAmount = 300;
        btnPrev.addEventListener('click', () => {
          dynamicContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        btnNext.addEventListener('click', () => {
          dynamicContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        // Ocultar flechas si no hay scroll
        const updateArrows = () => {
          btnPrev.style.display = dynamicContainer.scrollLeft <= 0 ? 'none' : 'flex';
          btnNext.style.display = (dynamicContainer.scrollLeft + dynamicContainer.clientWidth >= dynamicContainer.scrollWidth - 10) ? 'none' : 'flex';
        };

        dynamicContainer.addEventListener('scroll', updateArrows);
        window.addEventListener('resize', updateArrows);
        setTimeout(updateArrows, 500);
      }

    } catch (err) {
      console.error("Match banner fetch error:", err);
      if (loadingStatus) loadingStatus.innerHTML = `<span class="text-red-400 text-xs">Error cargando banner.</span>`;
    }
  }); loadComponent("hero-container", "layout/hero.html");
  loadComponent("stats-container", "layout/stats_counter.html", async () => {
    try {
      // Usa la instancia única de supabase definida al inicio

      async function fetchAndSetValues() {
        const startYear = 2012;
        const currentYear = new Date().getFullYear();
        const yearsOfHistory = currentYear - startYear > 0 ? currentYear - startYear : 14;

        const totalTrophies = 13 + 3 + 2;

        let totalPlayers = 0;
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

  // --- 3.1 CARGA GLOBAL DE IA ASSISTANT (WIDGET) ---
  const loadAIWidget = async () => {
    try {
      await import('/src/core/aiWidget.js');
    } catch (err) {
      console.error("Error loading AI Widget:", err);
    }
  };
  loadAIWidget();

  // --- 4. JUGADORES DINÁMICOS DESDE SUPABASE (ÚNICA FUENTE DE VERDAD) ---
  const playersContainer = document.getElementById("players-container");

  if (playersContainer) {
    async function loadPlayersFromSupabase() {
      // Estado de carga elegante (Skeleton UI sutil)
      playersContainer.innerHTML = `
        <div class="col-span-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 py-20 px-4">
          ${Array(12).fill(0).map(() => `
            <div class="skeleton-box h-64 rounded-[2rem] opacity-20"></div>
          `).join('')}
          <div class="col-span-full text-center mt-6">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Sincronizando Plantilla Oficial...</p>
          </div>
        </div>
      `;

      try {
        // Usar la instancia única

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
      // Usa la instancia única de supabase definida al inicio

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