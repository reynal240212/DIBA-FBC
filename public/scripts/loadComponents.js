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
      section.className = "max-w-6xl mx-auto px-4 mb-10";

      const heading = document.createElement("h2");
      heading.textContent = category.title;
      heading.className =
        "text-2xl font-bold text-slate-900 mb-4 text-center md:text-left";
      section.appendChild(heading);

      const grid = document.createElement("div");
      grid.className =
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4";

      category.players.forEach((playerName) => {
        const player = playersData.find(
          (p) => p.name.toLowerCase() === playerName.toLowerCase()
        );
        const imageUrl = player ? player.imageUrl : defaultImageUrl;

        const card = document.createElement("article");
        card.className =
          "bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden " +
          "hover:shadow-lg hover:-translate-y-1 transition transform duration-200";

        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = playerName;
        img.className = "w-full h-32 object-cover";

        const cardBody = document.createElement("div");
        cardBody.className = "px-2 py-2 text-center bg-slate-100";

        const nameEl = document.createElement("p");
        nameEl.textContent = playerName;
        nameEl.className = "text-xs font-semibold text-slate-900 leading-tight";

        cardBody.appendChild(nameEl);
        card.appendChild(img);
        card.appendChild(cardBody);
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
