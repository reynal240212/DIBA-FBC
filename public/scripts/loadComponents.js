
document.addEventListener("DOMContentLoaded", function () {
  // Cargar Navbar
  fetch("layout/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;
    })
    .catch(error => console.error("Error cargando el Navbar:", error));

  // Cargar Footer
  fetch("layout/footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch(error => console.error("Error cargando el Footer:", error));

  // Cargar Cartas de Jugadores
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
      { name: "Joseth", imageUrl: "images/jugadores/josept.jpg" },
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
      { name: "Cristian Marcano", imageUrl: "images/jugadores/cristian_marcano.jpg" }
      { name: "Yesid Manzano", imageUrl: "images/jugadores/yesid.jpg" }
    ];

    const categories = [
      {
        id: "categoria-2012-2013",
        title: "Categoría 2012/13",
        players: [
          "Dilan sanchez", "Juan t", "Dinkol", "Dany", "Miguel",
          "Rodríguez", "Nelson", "Santiago", "Joseth", "Hernández angel",
          "Oscar", "Yojainer", "Jesus", "Mateo", "Dilan correa","Estiben Montiel"
        ]
      },
      {
        id: "categoria-2014-2015-2016",
        title: "Categoría 2014/15/16",
        players: [
          "Mario", "Juan Andrés", "Jhoyfran", "Nayareth", "Eliuth",
          "Abraham", "Rey David", "Santy h", "Santy t", "ISAAC",
          "Carlos", "Zaid", "Estiben Gomez", "Cristian Marcano","yesid Manzano"
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
document.addEventListener("DOMContentLoaded", () => {
    if (!navigator.geolocation) {
      alert("⚠ Tu navegador no soporta geolocalización.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      posicion => {
        const { latitude, longitude } = posicion.coords;

        const mapa = L.map('mapa').setView([latitude, longitude], 16);

        // Capa de mapa base (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapa);

        // Marcador de la posición actual
        L.marker([latitude, longitude])
          .addTo(mapa)
          .bindPopup("📍 Estás aquí")
          .openPopup();
      },
      error => {
        alert("🚫 No se pudo obtener tu ubicación.");
        console.error(error);
      }
    );
  });
  // Análisis de Rendimiento
  fetch("EstadisticasCat2012.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("analisis-container").innerHTML = data;
    });
