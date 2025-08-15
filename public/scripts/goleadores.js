// scripts/loadComponents.js

document.addEventListener("DOMContentLoaded", function () {
  // Función para cargar un componente HTML en un contenedor
  async function loadComponent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Error al cargar ${filePath}`);
      const data = await response.text();
      container.innerHTML = data;
      console.log(`✅ ${filePath} cargado correctamente`);
    } catch (error) {
      console.error(error);
    }
  }

  // Cargar todos los componentes comunes
  async function loadAllComponents() {
    // Usamos Promise.all para cargar todo en paralelo y esperar a que todo termine
    await Promise.all([
      loadComponent("navbar-container", "layout/navbar.html"),
      loadComponent("footer-container", "layout/footer.html"),
      loadComponent("hero-container", "layout/hero.html"),
      loadComponent("patrocinadores-container", "layout/patrocinadores.html"),
      loadComponent("goleadores-container-loader", "layout/goleadores.html") // Cargamos nuestra nueva sección
    ]);

    // SOLO DESPUÉS de que todos los componentes HTML estén cargados...
    // ...ejecutamos la lógica que necesita esos componentes.
    mostrarGoleadores();
  }

  // --- LÓGICA DE GOLEADORES (AHORA ESTÁ AQUÍ DENTRO) ---
  // Importante: No la definimos con 'async' aquí, sino la expresión de función
  const mostrarGoleadores = async () => {
    const container = document.getElementById('goleadores-list');
    const spinner = document.getElementById('loading-goleadores');
    if (!container || !spinner) return;

    spinner.style.display = 'block';

    try {
      // Importamos dinámicamente el cliente de Supabase
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
      const supabaseUrl = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase.from('goleadores').select('*').order('goles', { ascending: false });
      if (error) throw error;

      spinner.style.display = 'none';
      container.innerHTML = ''; 

      if (data.length > 0) {
        data.forEach(goleador => {
          const item = document.createElement('div');
          item.className = 'goleador-item';
          item.innerHTML = `
            <div class="player-info">
              <img src="${goleador.escudo_url || 'images/default_escudo.png'}" alt="Escudo" class="escudo">
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
        container.innerHTML = '<p class="text-light text-center">No hay datos disponibles.</p>';
      }
    } catch (error) {
      console.error('Error al obtener goleadores:', error);
      spinner.style.display = 'none';
      container.innerHTML = `<p class="text-light text-center">Error al cargar datos.</p>`;
    }
  };

  // Iniciar todo el proceso de carga
  loadAllComponents();
});