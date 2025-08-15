/* ================================
   CARGA DE COMPONENTES COMUNES
=================================== */
document.addEventListener("DOMContentLoaded", function () {

  // Función para cargar un componente en un contenedor
  function loadComponent(containerId, filePath) {
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
      })
      .catch((error) => console.error(error));
  }

  // Cargar Navbar y Footer
  loadComponent("navbar-container", "layout/navbar.html");
  loadComponent("footer-container", "layout/footer.html");
  // Cargar Patrocinadores y Hero
  loadComponent("hero-container", "layout/hero.html");
  loadComponent("patrocinadores-container", "layout/patrocinadores.html");

  // Ajustar padding del body según altura del navbar fijo
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    document.body.style.paddingTop = navbar.offsetHeight + "px";
  }

  // ================================
  // CARGA DE CARTAS DE JUGADORES
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
          "Carlos", "Zaid", "Estiben Gomez", "Cristian Marcano", "Yesid Manzano", "Sebastian Castro", "Andrés sierra"
        ]
      }
    ];

    const defaultImageUrl = "https://placehold.co/150x150/e2e8f0/000000?text=Jugador";

    // Crear cartas por categoría
    categories.forEach(category => {
      const section = document.createElement("section");
      section.id = category.id;

      const heading = document.createElement("h2");
      heading.textContent = category.title;
      section.appendChild(heading);

      const row = document.createElement("div");
      row.classList.add("row");

      category.players.forEach(playerName => {
        const player = playersData.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        const imageUrl = player ? player.imageUrl : defaultImageUrl;

        const card = document.createElement("div");
        card.classList.add("card", "m-2");
        card.style.width = "150px";

        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = playerName;
        img.classList.add("card-img-top");

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body", "p-2", "text-center");
        cardBody.innerHTML = `<strong style="font-size: 14px;">${playerName}</strong>`;

        card.appendChild(img);
        card.appendChild(cardBody);
        row.appendChild(card);
      });

      section.appendChild(row);
      playersContainer.appendChild(section);
    });
  }
});

