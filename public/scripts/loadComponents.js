/* ================================
   CARGA DE COMPONENTES COMUNES
=================================== */
document.addEventListener("DOMContentLoaded", function () {
  function loadComponent(containerId, filePath, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(filePath)
      .then((response) => {
        if (!response.ok) throw new Error(`Error al cargar ${filePath}`);
        return response.text();
      })
      .then((data) => {
        container.innerHTML = data;
        if (typeof callback === "function") callback();
      })
      .catch((error) => console.error(error));
  }

  // Carga de Layout
  loadComponent("navbar-container", "layout/navbar.html", () => {
    if (typeof initNavbar === "function") initNavbar();
  });
  loadComponent("hero-container", "layout/hero.html");
  loadComponent("patrocinadores-container", "layout/patrocinadores.html");
  loadComponent("footer-container", "layout/footer.html");

  /* ==============================================
     CARGA DE JUGADORES (DATOS ACTUALIZADOS)
  ================================================= */
  const playersContainer = document.getElementById("players-container");

  if (playersContainer) {
    const playersData = [
      // Categoría 2014/2015
      { name: "Mario perez", imageUrl: "images/mario sin fondo.png" },
      { name: "Eliuth Meza", imageUrl: "images/jugadores/eliut.jpg" },
      { name: "Abraham Pérez", imageUrl: "images/jugadores/abraham.jpg" },
      { name: "Rey David Arrieta", imageUrl: "images/jugadores/rey_david.jpg" },
      { name: "Santy tobias", imageUrl: "images/jugadores/santy_t.jpg" },
      { name: "Santy Hernandez", imageUrl: "images/jugadores/santy_h.jpg" },
      { name: "ISAAC Ventura", imageUrl: "images/jugadores/isaac.jpg" },
      { name: "Carlos moreno", imageUrl: "images/jugadores/carlos.jpg" },
      { name: "Cristian Marcano", imageUrl: "images/jugadores/cristian_marcano.jpg" },
      { name: "Andrés Sierra", imageUrl: "images/jugadores/andres_sierra.jpg" },
      { name: "Juan Martínez", imageUrl: "images/jugadores/" },
      { name: "Estiben Gomez", imageUrl: "images/jugadores/estibengomez.jpg" },
      { name: "Andrés Socarras", imageUrl: "images/jugadores/default.jpg" },
      { name: "Eneldo Torregrosa", imageUrl: "images/jugadores/default.jpg" },
      { name: "Moisés Caballero", imageUrl: "images/jugadores/default.jpg" },
      { name: "Enderson Marcano", imageUrl: "images/jugadores/default.jpg" },
      { name: "JhoyFran de los Reyes", imageUrl: "images/jugadores/jhoyfran.jpg" },

      // Categoría 2012
      { name: "Dilan Sánchez", imageUrl: "images/jugadores/dilan_sanchez.jpg" },
      { name: "Larson orozco", imageUrl: "images/jugadores/default.jpg" },
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

      // Categoría 2013
      { name: "Mateo Boscán", imageUrl: "images/jugadores/mateo.jpg" },
      { name: "Daniel López", imageUrl: "images/jugadores/default.jpg" },
      { name: "Jeikham Camaño", imageUrl: "images/jugadores/default.jpg" },
      { name: "Dany Tapias", imageUrl: "images/jugadores/danny.jpg" },
      { name: "Nelson Pauline", imageUrl: "images/jugadores/nelson.png" },
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

    const defaultImageUrl = "https://placehold.co/300x400/e2e8f0/64748b?text=Jugador";

    categories.forEach((category) => {
      const section = document.createElement("section");
      section.className = "mb-12 w-full";

      section.innerHTML = `
        <div class="flex items-center mb-6 px-4">
          <h2 class="text-xl font-extrabold text-slate-800 uppercase tracking-tight">${category.title}</h2>
          <div class="flex-grow h-px bg-slate-200 ml-4"></div>
        </div>
      `;

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4 w-full";

      category.players.forEach((playerName) => {
        const player = playersData.find(p => p.name.trim().toLowerCase() === playerName.trim().toLowerCase());
        const imageUrl = player ? player.imageUrl : defaultImageUrl;

        const card = document.createElement("article");
        card.setAttribute("data-aos", "fade-up");
        card.className = "w-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300";

        card.innerHTML = `
          <div class="aspect-[3/4] overflow-hidden bg-slate-100">
            <img src="${imageUrl}" alt="${playerName}" 
                 class="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500" 
                 onerror="this.src='${defaultImageUrl}'">
          </div>
          <div class="p-3 text-center">
            <p class="text-[9px] font-black text-amber-500 uppercase mb-1">DIBA FBC</p>
            <h3 class="text-[11px] font-bold text-slate-800 uppercase leading-tight min-h-[2.2rem] flex items-center justify-center">
              ${playerName}
            </h3>
          </div>
        `;
        grid.appendChild(card);
      });
      section.appendChild(grid);
      playersContainer.appendChild(section);
    });
  }

  /* ================================
      TABLA DE GOLEADORES
  =================================== */
  async function cargarYMostrarGoleadores() {
    const container = document.getElementById("goleadores-list");
    const spinner = document.getElementById("loading-goleadores");
    if (!container || !spinner) return;

    try {
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
      const supabase = createClient("https://wdnlqfiwuocmmcdowjyw.supabase.co", "TU_SUPABASE_KEY"); // Asegúrate de usar tu key real

      const { data, error } = await supabase.from("goleadores").select("*").order("goles", { ascending: false });
      if (error) throw error;

      spinner.style.display = "none";
      container.innerHTML = "";

      data.forEach((goleador) => {
        const item = document.createElement("div");
        item.className = "flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors";
        item.innerHTML = `
          <div class="flex items-center gap-3">
            <img src="${goleador.escudo_url || 'images/ESCUDO.png'}" class="w-8 h-8 object-contain">
            <div>
              <div class="text-sm font-bold text-slate-900">${goleador.nombre_jugador}</div>
              <div class="text-[10px] text-slate-400 uppercase font-medium">${goleador.equipo}</div>
            </div>
          </div>
          <div class="bg-slate-900 text-amber-500 font-black py-1 px-3 rounded-lg text-xs shadow-sm">${goleador.goles}</div>
        `;
        container.appendChild(item);
      });
    } catch (err) {
      spinner.style.display = "none";
      container.innerHTML = `<p class="text-center text-red-500 text-xs p-4">Error al conectar con la base de datos.</p>`;
    }
  }
  cargarYMostrarGoleadores();
});