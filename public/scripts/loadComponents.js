/* ================================
   CARGA DE COMPONENTES Y LÓGICA PRINCIPAL
=================================== */
document.addEventListener("DOMContentLoaded", function () {

  // --- CARGA DE COMPONENTES COMUNES (NAVBAR, FOOTER, ETC.) ---
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

  loadComponent("navbar-container", "layout/navbar.html");
  loadComponent("footer-container", "layout/footer.html");
  loadComponent("hero-container", "layout/hero.html");
  loadComponent("patrocinadores-container", "layout/patrocinadores.html");

  const navbar = document.querySelector(".navbar");
  if (navbar) {
    document.body.style.paddingTop = navbar.offsetHeight + "px";
  }


  // --- CARGA DE CARTAS DE JUGADORES ---
  const playersContainer = document.getElementById("players-container");
  if (playersContainer) {
    // ... (Tu código de playersData y categories no necesita cambios, lo omito por brevedad)
    const playersData = [
      { name: "Dilan sanchez", imageUrl: "images/jugadores/dilan_sanchez.jpg" },
      // ... resto de jugadores
    ];
    const categories = [
      { id: "categoria-2012-2013", title: "Categoría 2012/13", players: [ /* ... */] },
      { id: "categoria-2014-2015-2016", title: "Categoría 2014/15/16", players: [ /* ... */] }
    ];
    // ... (Tu bucle forEach para crear las cartas tampoco necesita cambios)
  }


  // --- CARGA DE GOLEADORES DESDE SUPABASE ---
  async function mostrarGoleadores() {
    // Primero, asegúrate de que el contenedor exista en la página actual
    const container = document.getElementById('goleadores-list');
    const spinner = document.getElementById('loading-goleadores');

    // Si no hay contenedor, no hagas nada.
    if (!container || !spinner) {
      return;
    }

    spinner.style.display = 'block';

    try {
      // 'supabase' debería ser visible aquí porque se define antes de que este script se ejecute
      const { data, error, status } = await supabase
        .from('goleadores')
        .select('*')
        .order('goles', { ascending: false });

      if (error && status !== 406) {
        throw error;
      }

      spinner.style.display = 'none';
      container.innerHTML = ''; // Limpiar contenedor

      if (data && data.length > 0) {
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

  // Ahora, llama a la función para cargar los goleadores.
  // Esta se ejecutará solo si la página tiene el contenedor de goleadores.
  mostrarGoleadores();

}); // <-- AQUÍ CIERRA EL ÚNICO Y GRAN 'DOMContentLoaded'