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

      // Fecha específica solicitada: 7 de marzo de 2026
      const targetDate = "2026-03-07";

      // Reutiliza la función toLocalDate si estuviera global, pero aquí la redefinimos para uso seguro
      const toLocalDateBanner = (fechaISO) => {
        const d = new Date(fechaISO);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      };

      const { data, error } = await supabase.from('partidos').select('*');

      if (error) throw error;

      const matches = (data || []).filter(p => toLocalDateBanner(p.fecha) === targetDate);

      if (loadingStatus) loadingStatus.style.display = 'none';

      if (matches.length === 0) {
        dynamicContainer.innerHTML = `
           <div class="w-full text-center text-slate-400 text-sm py-4 italic">
              No hay partidos programados para hoy.
           </div>
         `;
        return;
      }

      // Limpiar contenedor
      dynamicContainer.innerHTML = '';

      matches.forEach(p => {
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
             </div >


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
      if (loadingStatus) loadingStatus.innerHTML = `< span class="text-red-400 text-xs" > Error cargando banner.</span > `;
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

  // --- 4. BASE DE DATOS COMPLETA DE JUGADORES ---
  const playersContainer = document.getElementById("players-container");

  if (playersContainer) {
    const playersData = [
      // 2014 / 2015
      { name: "Mario perez", imageUrl: "images/DIBA FBC/MarioP.jpg" },
      { name: "Eliuth Meza", imageUrl: "images/DIBA FBC/Eliuth.jpg" },
      { name: "Abraham Pérez", imageUrl: "images/DIBA FBC/Abraham.jpg" },
      { name: "Rey David Arrieta", imageUrl: "images/DIBA FBC/ReyDavid.jpg" },
      { name: "Santy tobias", imageUrl: "images/DIBA FBC/SantyT.jpg" },
      { name: "Santy Hernandez", imageUrl: "images/DIBA FBC/SantyH.jpg" },
      { name: "ISAAC Ventura", imageUrl: "images/DIBA FBC/Isaac.jpg" },
      { name: "Carlos moreno", imageUrl: "images/DIBA FBC/CarlosM.jpg" },
      { name: "Cristian Marcano", imageUrl: "images/DIBA FBC/CristianM.jpg" },
      { name: "Andrés Sierra", imageUrl: "images/DIBA FBC/AndresS.jpg" },
      { name: "Juan Martínez", imageUrl: "images/DIBA FBC/Juansito.jpg" },
      { name: "Estiben Gomez", imageUrl: "images/DIBA FBC/Estiben.jpg" },
      { name: "Andrés Socarras", imageUrl: "images/jugadores/default.jpg" },
      { name: "Eneldo Torregrosa", imageUrl: "images/DIBA FBC/Eneldo.jpg" },
      { name: "Moisés Caballero", imageUrl: "images/jugadores/default.jpg" },
      { name: "Enderson Marcano", imageUrl: "images/jugadores/default.jpg" },
      { name: "JhoyFran de los Reyes", imageUrl: "images/DIBA FBC/Jhoyfran.jpg" },

      // 2012
      { name: "Dilan Sánchez", imageUrl: "images/DIBA FBC/DilanS.jpg" },
      { name: "Larson orozco", imageUrl: "images/DIBA FBC/Larson.jpg" },
      { name: "Daniel Rodríguez", imageUrl: "images/jugadores/rodriguez.jpg" },
      { name: "Maicol Villar", imageUrl: "images/jugadores/default.jpg" },
      { name: "Jair Miranda", imageUrl: "images/jugadores/default.jpg" },
      { name: "Johan Navarro", imageUrl: "images/jugadores/default.jpg" },
      { name: "Santiago Mendoza", imageUrl: "images/jugadores/mendoza.jpg" },
      { name: "Oscar López", imageUrl: "images/jugadores/oscar.jpg" },
      { name: "Miguel Aldana", imageUrl: "images/jugadores/migue.jpg" },
      { name: "Stiven cabarca", imageUrl: "images/jugadores/default.jpg" },
      { name: "Jonier Rondón", imageUrl: "images/jugadores/default.jpg" },
      { name: "Yojainer Villalobos", imageUrl: "images/jugadores/yojainer.jpg" },
      { name: "Sebastian Lugo", imageUrl: "images/jugadores/default.jpg" },
      { name: "Jose Álvarez", imageUrl: "images/jugadores/josept.jpg" },
      { name: "Antoni Ariza", imageUrl: "images/jugadores/default.jpg" },
      { name: "Luis cadena", imageUrl: "images/jugadores/default.jpg" },

      // 2013
      { name: "Mateo Boscán", imageUrl: "images/jugadores/mateo.jpg" },
      { name: "Daniel López", imageUrl: "images/jugadores/default.jpg" },
      { name: "Jeikham Camaño", imageUrl: "images/jugadores/default.jpg" },
      { name: "Dany Tapias", imageUrl: "images/jugadores/danny.jpg" },
      { name: "Nelson Pauline", imageUrl: "images/DIBA FBC/NelsonP.jpg" },
      { name: "Joseph Aldana", imageUrl: "images/jugadores/default.jpg" },
      { name: "Ces cristiano", imageUrl: "images/jugadores/default.jpg" },
      { name: "Juan Tobías", imageUrl: "images/jugadores/juan_t.jpg" },
      { name: "René Cerpa", imageUrl: "images/jugadores/default.jpg" },
      { name: "Cesar Brito", imageUrl: "images/jugadores/default.jpg" }
    ];

    const categories = [
      {
        id: "categoria-2012",
        title: "Categoría 2012",
        players: ["Dilan Sánchez", "Larson orozco", "Daniel Rodríguez", "Maicol Villar", "Jair Miranda", "Johan Navarro", "Santiago Mendoza", "Oscar López", "Miguel Aldana", "Stiven cabarca", "Jonier Rondón", "Yojainer Villalobos", "Sebastian Lugo", "Jose Álvarez", "Antoni Ariza", "Luis cadena"]
      },
      {
        id: "categoria-2013",
        title: "Categoría 2013",
        players: ["Mateo Boscán", "Daniel López", "Jeikham Camaño", "Dany Tapias", "Nelson Pauline", "Joseph Aldana", "Ces cristiano", "Juan Tobías", "René Cerpa", "Cesar Brito"]
      },
      {
        id: "categoria-2014-2015",
        title: "Categoría 2014/15",
        players: ["Mario perez", "Eliuth Meza", "Abraham Pérez", "Rey David Arrieta", "Santy tobias", "Santy Hernandez", "ISAAC Ventura", "Carlos moreno", "Cristian Marcano", "Andrés Sierra", "Juan Martínez", "Estiben Gomez", "Andrés Socarras", "Eneldo Torregrosa", "Moisés Caballero", "Enderson Marcano", "JhoyFran de los Reyes"]
      }
    ];

    const defaultImg = "https://placehold.co/300x400/e2e8f0/64748b?text=Jugador";

    categories.forEach((cat) => {
      const section = document.createElement("section");
      section.className = "mb-12 w-full";
      section.innerHTML = `
          < div class="flex items-center mb-6 px-4" >
          <h2 class="text-xl font-extrabold text-slate-800 uppercase tracking-tight">${cat.title}</h2>
          <div class="flex-grow h-px bg-slate-200 ml-4"></div>
        </div >
          `;

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4 w-full";

      cat.players.forEach((playerName) => {
        const pData = playersData.find(p => p.name.trim().toLowerCase() === playerName.trim().toLowerCase());
        const imageUrl = pData ? pData.imageUrl : defaultImg;

        const card = document.createElement("article");
        card.className = "group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer relative";

        card.innerHTML = `
          < div class="aspect-[3/4] overflow-hidden bg-slate-100" >
            <img src="${imageUrl}" class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" onerror="this.src='${defaultImg}'">
          </div>
          <div class="p-3 text-center">
            <p class="text-[9px] font-black text-amber-500 uppercase mb-1">DIBA FBC</p>
            <h3 class="text-[11px] font-bold text-slate-800 uppercase leading-tight min-h-[2.2rem] flex items-center justify-center">${playerName}</h3>
          </div>
        `;

        card.addEventListener('click', () => {
          modalImg.src = imageUrl;
          modalName.textContent = playerName;
          modal.classList.add('active');
        });

        grid.appendChild(card);
      });
      section.appendChild(grid);
      playersContainer.appendChild(section);
    });
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
          < div class="flex items-center gap-3" >
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
      container.innerHTML = `< p class="text-center text-red-500 text-xs p-4" > Error de conexión.</p > `;
    }
  }
  cargarGoleadores();
});