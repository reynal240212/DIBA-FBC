// js/goleadores.js

// --- 1. CONFIGURACIÓN Y CONEXIÓN A SUPABASE ---
// Importamos la función necesaria desde la librería de Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Tus credenciales de Supabase
const supabaseUrl = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';

// Creamos el cliente de Supabase que usaremos para hacer las consultas
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 2. FUNCIÓN PARA OBTENER Y MOSTRAR GOLEADORES ---
async function mostrarGoleadores() {
  const container = document.getElementById('goleadores-list');
  const spinner = document.getElementById('loading-goleadores');

  if (!container || !spinner) {
    return; // Si no estamos en la página correcta, no hacemos nada
  }

  spinner.style.display = 'block';

  try {
    const { data, error, status } = await supabase
      .from('goleadores')
      .select('*')
      .order('goles', { ascending: false });

    if (error && status !== 406) {
      throw error;
    }

    spinner.style.display = 'none';
    container.innerHTML = ''; 

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

// --- 3. LLAMADA A LA FUNCIÓN ---
// Escuchamos cuando el DOM esté listo y llamamos a nuestra función
document.addEventListener('DOMContentLoaded', mostrarGoleadores);