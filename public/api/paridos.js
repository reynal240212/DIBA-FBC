import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuración de Supabase
const supabaseUrl = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';
const supabase = createClient(supabaseUrl, supabaseKey);

/* --- PARTIDOS --- */
const inputFecha = document.getElementById('fecha');
const matchesContainer = document.getElementById('matches-container');
const loadingSpinner = document.getElementById('loading-spinner');

async function obtenerPartidos() {
  try {
    const { data, error } = await supabase.from('partidos').select('*');
    if (error) {
      console.error('Error al obtener partidos:', error);
      return [];
    }
    return data;
  } catch (error) {
    console.error('Error en la consulta de partidos:', error);
    return [];
  }
}

async function filtrarPartidos() {
  const fechaSeleccionada = inputFecha.value;
  matchesContainer.innerHTML = '';
  loadingSpinner.style.display = 'block';

  if (!fechaSeleccionada) {
    loadingSpinner.style.display = 'none';
    matchesContainer.innerHTML = '<p class="text-center">Selecciona una fecha para ver los partidos.</p>';
    return;
  }

  const partidos = await obtenerPartidos();
  loadingSpinner.style.display = 'none';

  const partidosFiltrados = partidos.filter(partido => {
    const fechaPartido = new Date(partido.fecha).toISOString().split('T')[0];
    return fechaPartido === fechaSeleccionada;
  });

  if (partidosFiltrados.length === 0) {
    matchesContainer.innerHTML = '<p class="text-center">No hay partidos para la fecha seleccionada.</p>';
    return;
  }

  partidosFiltrados.forEach(partido => {
    const card = document.createElement('div');
    card.classList.add('card', 'custom-card', 'match-card', 'bg-primary', 'text-white', 'animate__animated', 'animate__fadeInUp');
    card.innerHTML = `
      <button class="btn-close-card">&times;</button>
      <div class="card-header d-flex align-items-center">
        ${partido.escudo ? `<img src="${partido.escudo}" alt="Escudo" class="escudo">` : ''}
        <h5 class="mb-0">${partido.equipoLocal} vs ${partido.equipoVisitante}</h5>
      </div>
      <div class="card-body">
        <p><strong>Descripción:</strong> ${partido.descripcion}</p>
        <p><strong>Fecha/Hora:</strong> ${new Date(partido.fecha).toISOString().split('T')[0]} - ${partido.hora || 'Sin hora'}</p>
        <p><strong>Estadio:</strong> ${partido.estadio || 'No especificado'}</p>
        ${partido.valor ? `<p><strong>Valor:</strong> $${partido.valor}</p>` : ''}
        <p><strong>Resultado:</strong> ${partido.resultado || 'No disponible'}</p>
        <p><strong>Goles:</strong> ${partido.goles || 'No disponible'}</p>
      </div>
    `;
    // Agregar funcionalidad para cerrar la tarjeta
    card.querySelector('.btn-close-card').addEventListener('click', () => {
      card.remove();
    });
    matchesContainer.appendChild(card);
  });
}

inputFecha.addEventListener('change', filtrarPartidos);

/* --- ENTRENAMIENTOS --- */
const inputFechaEntrenamiento = document.getElementById('fecha-entrenamiento');
const trainingsContainer = document.getElementById('trainings-container');
const loadingSpinnerEntrenamiento = document.getElementById('loading-spinner-entrenamiento');

async function obtenerEntrenamientos() {
  try {
    const { data, error } = await supabase.from('entrenamientos').select('*');
    if (error) {
      console.error('Error al obtener entrenamientos:', error);
      return [];
    }
    return data;
  } catch (error) {
    console.error('Error en la consulta de entrenamientos:', error);
    return [];
  }
}

async function filtrarEntrenamientos() {
  const fechaSeleccionada = inputFechaEntrenamiento.value;
  trainingsContainer.innerHTML = '';
  loadingSpinnerEntrenamiento.style.display = 'block';

  if (!fechaSeleccionada) {
    loadingSpinnerEntrenamiento.style.display = 'none';
    trainingsContainer.innerHTML = '<p class="text-center">Selecciona una fecha para ver los entrenamientos.</p>';
    return;
  }

  const entrenamientos = await obtenerEntrenamientos();
  loadingSpinnerEntrenamiento.style.display = 'none';

  const entrenamientosFiltrados = entrenamientos.filter(ent => {
    const fechaEnt = new Date(ent.fecha).toISOString().split('T')[0];
    return fechaEnt === fechaSeleccionada;
  });

  if (entrenamientosFiltrados.length === 0) {
    trainingsContainer.innerHTML = '<p class="text-center">No hay entrenamientos para la fecha seleccionada.</p>';
    return;
  }

  entrenamientosFiltrados.forEach(ent => {
    const card = document.createElement('div');
    card.classList.add('card', 'custom-card', 'training-card', 'bg-success', 'text-white', 'animate__animated', 'animate__fadeInUp');
    card.innerHTML = `
      <button class="btn-close-card">&times;</button>
      <div class="card-header">
        <h5 class="mb-0">${ent.titulo || 'Entrenamiento'}</h5>
      </div>
      <div class="card-body">
        <p><strong>Descripción:</strong> ${ent.descripcion || 'N/A'}</p>
        <p><strong>Fecha/Hora:</strong> ${new Date(ent.fecha).toISOString().split('T')[0]} - ${ent.hora || 'Sin hora'}</p>
        <p><strong>Lugar:</strong> ${ent.lugar || 'No especificado'}</p>
        <p><strong>Observaciones:</strong> ${ent.observaciones || 'Ninguna'}</p>
      </div>
    `;
    card.querySelector('.btn-close-card').addEventListener('click', () => {
      card.remove();
    });
    trainingsContainer.appendChild(card);
  });
}

inputFechaEntrenamiento.addEventListener('change', filtrarEntrenamientos);