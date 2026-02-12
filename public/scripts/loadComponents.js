/* ================================
   CARGA DE COMPONENTES COMUNES
=================================== */
document.addEventListener("DOMContentLoaded", function () {
  // Función para cargar un componente en un contenedor
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
        console.log(`✅ ${filePath} cargado correctamente`);
        if (typeof callback === "function") {
          callback();
        }
      })
      .catch((error) => console.error(error));
  }

  // ================================
  // CARGA DE NAVBAR, HERO, PATROCINADORES Y FOOTER
  // ================================
  loadComponent("navbar-container", "layout/navbar.html", () => {
    // Inicializar comportamiento del navbar Tailwind (mobile + dropdowns)
    if (typeof initNavbar === "function") {
      initNavbar();
    } else {
      console.warn("⚠️ initNavbar no está definido. Asegúrate de incluir scripts/navbar.js antes de loadComponents.js");
    }
  });

  loadComponent("hero-container", "layout/hero.html");
  loadComponent("patrocinadores-container", "layout/patrocinadores.html");
  loadComponent("footer-container", "layout/footer.html");

  // ================================
  // CARGA DE CARTAS DE JUGADORES (Tailwind 100%)
  // ================================
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
        players: [
          "Dilan sanchez", "Juan t", "Dinkol", "Dany", "Miguel",
          "Rodríguez", "Nelson", "Santiago", "Josept", "Hernández angel",
          "Oscar", "Yojainer", "Jesus", "Mateo", "Dilan correa", "Estiben Montiel"
        ]
      },
      {
        id: "categoria-2014-2015-2016",
        title: "Categoría 2014/15/16",
        players: [
          "Mario", "Juan Andrés", "Jhoyfran", "Nayareth", "Eliuth",
          "Abraham", "Rey David", "Santy h", "Santy t", "ISAAC",
          "Carlos", "Zaid", "Estiben Gomez", "Cristian Marcano", "Yesid Manzano",
          "Sebastian Castro", "Andrés sierra"
        ]
      }
    ];

    const defaultImageUrl =
      "https://placehold.co/150x150/e2e8f0/000000?text=Jugador";

    categories.forEach((category) => {
      const section = document.createElement("section");
      section.id = category.id;
      section.className = "mb-16 animate__animated animate__fadeIn"; // Animación de entrada

      // Título de la categoría con una línea decorativa
      section.innerHTML = `
    <div class="flex items-center mb-8 px-4">
      <h2 class="text-2xl font-extrabold text-slate-800 uppercase tracking-wider">${category.title}</h2>
      <div class="flex-grow h-px bg-slate-300 ml-4"></div>
    </div>
  `;

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4";

      category.players.forEach((playerName) => {
        const player = playersData.find(
          (p) => p.name.toLowerCase() === playerName.toLowerCase()
        );
        const imageUrl = player ? player.imageUrl : defaultImageUrl;

        // Crear el elemento de la tarjeta con clases mejoradas
        const card = document.createElement("article");
        card.setAttribute("data-aos", "fade-up"); // Integración con AOS
        card.className = `
      group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl 
      transition-all duration-300 border border-slate-100 hover:-translate-y-2
    `;

        card.innerHTML = `
      <div class="aspect-[3/4] overflow-hidden bg-slate-200 relative">
        <img 
          src="${imageUrl}" 
          alt="${playerName}" 
          class="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
          onerror="this.src='${defaultImageUrl}'"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div class="p-3 text-center relative bg-white">
        <p class="text-[11px] font-bold text-blue-600 uppercase tracking-tighter mb-1">Diba FBC</p>
        <h3 class="text-sm font-bold text-slate-800 leading-tight truncate px-1">
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


  // ================================
  // CARGA DE TABLA DE GOLEADORES
  // ================================
  async function cargarYMostrarGoleadores() {
    const container = document.getElementById("goleadores-list");
    const spinner = document.getElementById("loading-goleadores");

    if (!container || !spinner) return;

    spinner.style.display = "block";

    try {
      const { createClient } = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"
      );

      const supabaseUrl = "https://wdnlqfiwuocmmcdowjyw.supabase.co";
      const supabaseKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q";

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from("goleadores")
        .select("*")
        .order("goles", { ascending: false });

      if (error) throw error;

      spinner.style.display = "none";
      container.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((goleador) => {
          const item = document.createElement("div");
          item.className = "goleador-item";
          item.innerHTML = `
            <div class="player-info">
              <img src="${goleador.escudo_url || "images/default_escudo.png"}"
                   alt="Escudo de ${goleador.equipo}" class="escudo">
              <div>
                <div class="player-name">${goleador.nombre_jugador}</div>
                <div class="team-name">${goleador.equipo}</div>
              </div>
            </div>
            <div class="goal-count">${goleador.goles}</div>
          `;
          container.appendChild(item);
        });
      } else {
        container.innerHTML =
          '<p class="text-light text-center">No hay datos de goleadores disponibles.</p>';
      }
    } catch (error) {
      console.error("Error al obtener goleadores:", error);
      spinner.style.display = "none";
      const msg = error && error.message ? error.message : "Error desconocido";
      container.innerHTML = `<p class="text-light text-center">Error al cargar datos: ${msg}</p>`;
    }
  }

  cargarYMostrarGoleadores();
});
