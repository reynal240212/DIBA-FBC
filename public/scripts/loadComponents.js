/* ===============================================
   CARGA DE COMPONENTES Y DATOS PRINCIPALES
=============================================== */
document.addEventListener("DOMContentLoaded", function () {

  // ===============================================
  //  DECLARACIÓN DE DATOS (ARRAYS Y OBJETOS)
  // ===============================================

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

  const datosCalificaciones = [
    { numero: 1, nombre: "Juan T", pago: "x", calificacion: 8.0, observaciones: "" },
    { numero: 2, nombre: "Santiago N.", pago: "Nogue", calificacion: 7.5, observaciones: "" },
    { numero: 3, nombre: "Stiven M", pago: "x", calificacion: 7.5, observaciones: "" },
    { numero: 4, nombre: "Joseph A", pago: "x", calificacion: 7.5, observaciones: "" },
    { numero: 5, nombre: "Miguel A", pago: "x", calificacion: 7.5, observaciones: "" },
    { numero: 6, nombre: "Dilan S", pago: "Nogue", calificacion: 8.0, observaciones: "" },
    { numero: 7, nombre: "Larzon B.", pago: "x", calificacion: 7.5, observaciones: "" },
    { numero: 8, nombre: "Rodríguez", pago: "x", calificacion: 8.0, observaciones: "" },
    { numero: 9, nombre: "Yojainer", pago: "x", calificacion: 7.5, observaciones: "" },
    { numero: 10, nombre: "Dany", pago: "x", calificacion: 8.0, observaciones: "" },
    { numero: 11, nombre: "Jesús", pago: "x", calificacion: 7.5, observaciones: "" }
  ];

  // ===============================================
  //  FUNCIONES PARA CARGAR COMPONENTES Y DATOS
  // ===============================================

  // Carga componentes comunes (navbar, footer, etc.)
  function loadComponent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) return;
    fetch(filePath)
      .then(response => {
        if (!response.ok) throw new Error(`Error al cargar ${filePath}`);
        return response.text();
      })
      .then(data => {
        container.innerHTML = data;
        console.log(`✅ ${filePath} cargado correctamente`);
      })
      .catch(error => console.error(error));
  }

  // Genera las cartas de jugadores por categoría
  function generarTarjetasJugadores() {
    const playersContainer = document.getElementById("players-container");
    if (!playersContainer) return;
    const defaultImageUrl = "https://placehold.co/150x150/e2e8f0/000000?text=Jugador";
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

  // Genera la tabla de calificaciones
  function generarTablaCalificaciones() {
    const tbody = document.getElementById('tbody-calificaciones');
    if (!tbody) return;
    datosCalificaciones.forEach(jugador => {
      const fila = document.createElement('tr');
      const celdaNumero = document.createElement('td');
      celdaNumero.textContent = jugador.numero;
      fila.appendChild(celdaNumero);
      const celdaNombre = document.createElement('td');
      celdaNombre.textContent = jugador.nombre;
      fila.appendChild(celdaNombre);
      const celdaPago = document.createElement('td');
      celdaPago.textContent = jugador.pago;
      fila.appendChild(celdaPago);
      const celdaCalificacion = document.createElement('td');
      celdaCalificacion.textContent = jugador.calificacion.toFixed(1);
      fila.appendChild(celdaCalificacion);
      const celdaObservaciones = document.createElement('td');
      celdaObservaciones.textContent = jugador.observaciones;
      fila.appendChild(celdaObservaciones);
      tbody.appendChild(fila);
    });
  }

  // Carga la tabla de goleadores desde Supabase
  async function cargarYMostrarGoleadores() {
    const container = document.getElementById('goleadores-list');
    const spinner = document.getElementById('loading-goleadores');
    if (!container || !spinner) return;
    spinner.style.display = 'block';
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
      const supabaseUrl = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('goleadores')
        .select('*')
        .order('goles', { ascending: false });
      if (error) throw error;
      spinner.style.display = 'none';
      container.innerHTML = '';
      if (data.length > 0) {
        data.forEach(goleador => {
          const item = document.createElement('div');
          item.className = 'goleador-item';
          item.innerHTML = `
            <div class="player-info">
              <img src="${goleador.escudo_url || 'images/default_escudo.png'}" alt="Escudo de ${goleador.equipo}" class="escudo">
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
        container.innerHTML = '<p class="text-light text-center">No hay datos de goleadores disponibles.</p>';
      }
    } catch (error) {
      console.error('Error al obtener goleadores:', error);
      spinner.style.display = 'none';
      container.innerHTML = `<p class="text-light text-center">Error al cargar datos: ${error.message}</p>`;
    }
  }

  // ===============================================
  //  EJECUCIÓN DE FUNCIONES AL CARGAR LA PÁGINA
  // ===============================================

  // Cargar componentes de diseño
  loadComponent("navbar-container", "layout/navbar.html");
  loadComponent("footer-container", "layout/footer.html");
  loadComponent("hero-container", "layout/hero.html");
  loadComponent("patrocinadores-container", "layout/patrocinadores.html");

  // Ajustar el padding del body si hay un navbar fijo
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    document.body.style.paddingTop = navbar.offsetHeight + "px";
  }

  // Generar las tablas y tarjetas
  generarTarjetasJugadores();
  generarTablaCalificaciones();
  cargarYMostrarGoleadores();
});