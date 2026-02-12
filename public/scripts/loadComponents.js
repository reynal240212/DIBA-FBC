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

  /* ================================
     CARGA DE JUGADORES (CORREGIDO)
  =================================== */
  const playersContainer = document.getElementById("players-container");
  if (playersContainer) {
    const playersData = [
      { name: "Dilan sanchez", imageUrl: "images/jugadores/dilan_sanchez.jpg" },
      { name: "Juan t", imageUrl: "images/jugadores/juan_t.jpg" },
      { name: "Dinkol", imageUrl: "images/jugadores/dinkol.jpg" },
      { name: "Dany", imageUrl: "images/jugadores/danny.jpg" },
      { name: "Miguel", imageUrl: "images/jugadores/migue.jpg" },
      { name: "Rodríguez", imageUrl: "images/jugadores/rodriguez.jpg" },
      { name: "Nelson", imageUrl: "images/jugadores/nelson.png" },
      { name: "Santiago", imageUrl: "images/jugadores/mendoza.jpg" },
      { name: "Josept", imageUrl: "images/jugadores/josept.jpg" },
      { name: "Hernández angel", imageUrl: "images/jugadores/hernandez_angel.jpg" },
      { name: "Oscar", imageUrl: "images/jugadores/oscar.jpg" },
      { name: "Yojainer", imageUrl: "images/jugadores/yojainer.jpg" },
      { name: "Jesus", imageUrl: "images/jugadores/jesus.jpg" },
      { name: "Mateo", imageUrl: "images/jugadores/mateo.jpg" },
      { name: "Dilan correa", imageUrl: "images/jugadores/dilan_correa.jpg" },
      { name: "Estiben Montiel", imageUrl: "images/jugadores/EstibenMontiel.jpg" },
      { name: "Mario", imageUrl: "images/mario sin fondo.png" },
      { name: "Juan Andrés", imageUrl: "images/jugadores/juan_andres.jpg" },
      { name: "Jhoyfran", imageUrl: "images/jugadores/jhoyfran.jpg" },
      { name: "Nayareth", imageUrl: "images/jugadores/nayareth.jpg" },
      { name: "Eliuth", imageUrl: "images/jugadores/eliut.jpg" },
      { name: "Abraham", imageUrl: "images/jugadores/abraham.jpg" },
      { name: "Rey David", imageUrl: "images/jugadores/rey_david.jpg" },
      { name: "Santy h", imageUrl: "images/jugadores/santy_h.jpg" },
      { name: "Santy t", imageUrl: "images/jugadores/santy_t.jpg" },
      { name: "ISAAC", imageUrl: "images/jugadores/isaac.jpg" },
      { name: "Carlos", imageUrl: "images/jugadores/carlos.jpg" },
      { name: "Zaid", imageUrl: "images/jugadores/zaid.jpg" },
      { name: "Estiben Gomez", imageUrl: "images/jugadores/estibengomez.jpg" },
      { name: "Cristian Marcano", imageUrl: "images/jugadores/cristian_marcano.jpg" },
      { name: "Yesid Manzano", imageUrl: "images/jugadores/yesid.jpg" },
      { name: "Sebastian Castro", imageUrl: "images/jugadores/sebastian_castro.jpg" },
      { name: "Andrés sierra", imageUrl: "images/jugadores/andres_sierra.jpg" }
    ];

    const categories = [
      {
        id: "categoria-2012-2013",
        title: "Categoría 2012/13",
        players: ["Dilan sanchez", "Juan t", "Dinkol", "Dany", "Miguel", "Rodríguez", "Nelson", "Santiago", "Josept", "Hernández angel", "Oscar", "Yojainer", "Jesus", "Mateo", "Dilan correa", "Estiben Montiel"]
      },
      {
        id: "categoria-2014-2015-2016",
        title: "Categoría 2014/15/16",
        players: ["Mario", "Juan Andrés", "Jhoyfran", "Nayareth", "Eliuth", "Abraham", "Rey David", "Santy h", "Santy t", "ISAAC", "Carlos", "Zaid", "Estiben Gomez", "Cristian Marcano", "Yesid Manzano", "Sebastian Castro", "Andrés sierra"]
      }
    ];

    const defaultImageUrl = "https://placehold.co/300x400/e2e8f0/64748b?text=Jugador";

    categories.forEach((category) => {
      const section = document.createElement("section");
      section.className = "mb-12";
      section.innerHTML = `
        <div class="flex items-center mb-6 px-4">
          <h2 class="text-xl font-bold text-slate-800 uppercase tracking-tight">${category.title}</h2>
          <div class="flex-grow h-px bg-slate-200 ml-4"></div>
        </div>
      `;

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4 w-full";

      category.players.forEach((playerName) => {
        const player = playersData.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        const imageUrl = player ? player.imageUrl : defaultImageUrl;

        const card = document.createElement("article");
        card.className = "bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all";
        card.innerHTML = `
          <div class="h-40 sm:h-48 overflow-hidden bg-slate-100">
            <img src="${imageUrl}" alt="${playerName}" class="w-full h-full object-cover object-top" onerror="this.src='${defaultImageUrl}'">
          </div>
          <div class="p-2 text-center">
            <p class="text-[9px] font-bold text-blue-600 uppercase">Diba FBC</p>
            <h3 class="text-xs font-bold text-slate-800 truncate uppercase">${playerName}</h3>
          </div>
        `;
        grid.appendChild(card);
      });
      section.appendChild(grid);
      playersContainer.appendChild(section);
    });
  }

  /* ================================
     TABLA DE GOLEADORES (CORREGIDO)
  =================================== */
  async function cargarYMostrarGoleadores() {
    const container = document.getElementById("goleadores-list");
    const spinner = document.getElementById("loading-goleadores");
    if (!container || !spinner) return;

    try {
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
      const supabase = createClient("https://wdnlqfiwuocmmcdowjyw.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");

      const { data, error } = await supabase.from("goleadores").select("*").order("goles", { ascending: false });
      if (error) throw error;

      spinner.style.display = "none";
      container.innerHTML = "";

      data.forEach((goleador) => {
        const item = document.createElement("div");
        // CORRECCIÓN: Clases de Tailwind en lugar de CSS externo
        item.className = "flex items-center justify-between p-3 border-b border-slate-100 hover:bg-slate-50";
        item.innerHTML = `
          <div class="flex items-center gap-3">
            <img src="${goleador.escudo_url || 'images/default_escudo.png'}" class="w-8 h-8 object-contain">
            <div>
              <div class="text-sm font-bold text-slate-900">${goleador.nombre_jugador}</div>
              <div class="text-[10px] text-slate-500 uppercase">${goleador.equipo}</div>
            </div>
          </div>
          <div class="bg-blue-600 text-white font-bold py-1 px-3 rounded-full text-xs">${goleador.goles}</div>
        `;
        container.appendChild(item);
      });
    } catch (err) {
      spinner.style.display = "none";
      container.innerHTML = `<p class="text-center text-red-500 text-sm">Error: ${err.message}</p>`;
    }
  }
  cargarYMostrarGoleadores();
});