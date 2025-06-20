import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuración de Supabase
const supabaseUrl = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';
const supabase = createClient(supabaseUrl, supabaseKey);

// Selectores
const inputFecha = document.getElementById('fecha');
const matchesContainer = document.getElementById('matches-container');
const loadingSpinner = document.getElementById('loading-spinner');
const inputFechaEntrenamiento = document.getElementById('fecha-entrenamiento');
const trainingsContainer = document.getElementById('trainings-container');
const loadingSpinnerEntrenamiento = document.getElementById('loading-spinner-entrenamiento');

// Helper para formatear fecha
const formatearFecha = fechaISO => new Date(fechaISO).toLocaleDateString('es-CO', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Crear tarjetas
function crearCard({ tipo, titulo, cuerpo, escudo = null, color = 'primary' }) {
  const card = document.createElement('div');
  card.className = `card border-0 shadow-lg mb-4 bg-${color} text-white animate__animated animate__fadeInUp`;

  card.innerHTML = `
    <div class="card-header d-flex justify-content-between align-items-center bg-opacity-75">
      <div class="d-flex align-items-center gap-2">
        ${escudo ? `<img src="${escudo}" alt="Escudo" class="rounded shadow" style="width: 40px; height: 40px; object-fit: contain;">` : ''}
        <h5 class="mb-0 fw-bold">${titulo}</h5>
      </div>
      <button class="btn btn-sm btn-outline-light rounded-circle btn-close-card" title="Cerrar">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="card-body fs-6">
      ${cuerpo}
    </div>
  `;

  card.querySelector('.btn-close-card').onclick = () => card.remove();
  return card;
}

// ----- PARTIDOS -----
async function obtenerPartidos() {
  const { data, error } = await supabase.from('partidos').select('*');
  if (error) {
    console.error('Error al obtener partidos:', error);
    return [];
  }
  return data;
}

async function filtrarPartidos() {
  matchesContainer.innerHTML = '';
  loadingSpinner.style.display = 'block';

  const fechaSeleccionada = inputFecha.value;
  if (!fechaSeleccionada) {
    loadingSpinner.style.display = 'none';
    matchesContainer.innerHTML = '<p class="text-center text-muted">Selecciona una fecha para ver los partidos.</p>';
    return;
  }

  const partidos = await obtenerPartidos();
  loadingSpinner.style.display = 'none';

  const filtrados = partidos.filter(p => new Date(p.fecha).toISOString().split('T')[0] === fechaSeleccionada);
  if (filtrados.length === 0) {
    matchesContainer.innerHTML = '<p class="text-center text-muted">No hay partidos para la fecha seleccionada.</p>';
    return;
  }

  filtrados.forEach(p => {
    const cuerpo = `
      <p><i class="fas fa-align-left me-2"></i><strong>Descripción:</strong> ${p.descripcion || 'N/A'}</p>
      <p><i class="fas fa-calendar-alt me-2"></i><strong>Fecha/Hora:</strong> ${formatearFecha(p.fecha)} - ${p.hora || 'Sin hora'}</p>
      <p><i class="fas fa-map-marker-alt me-2"></i><strong>Estadio:</strong> ${p.estadio || 'No especificado'}</p>
      ${p.valor ? `<p><i class="fas fa-dollar-sign me-2"></i><strong>Valor:</strong> $${p.valor}</p>` : ''}
      <p><i class="fas fa-trophy me-2"></i><strong>Resultado:</strong> ${p.resultado || 'No disponible'}</p>
      <p><i class="fas fa-futbol me-2"></i><strong>Goles:</strong> ${p.goles || 'No disponible'}</p>
    `;
    const card = crearCard({
      tipo: 'partido',
      titulo: `${p.equipolocal} vs ${p.equipovisitante}`,
      cuerpo,
      escudo: p.escudo,
      color: 'primary'
    });
    matchesContainer.appendChild(card);
  });
}

inputFecha.addEventListener('change', filtrarPartidos);

// ----- ENTRENAMIENTOS -----
async function obtenerEntrenamientos() {
  const { data, error } = await supabase.from('entrenamientos').select('*');
  if (error) {
    console.error('Error al obtener entrenamientos:', error);
    return [];
  }
  return data;
}

async function filtrarEntrenamientos() {
  trainingsContainer.innerHTML = '';
  loadingSpinnerEntrenamiento.style.display = 'block';

  const fechaSeleccionada = inputFechaEntrenamiento.value;
  if (!fechaSeleccionada) {
    loadingSpinnerEntrenamiento.style.display = 'none';
    trainingsContainer.innerHTML = '<p class="text-center text-muted">Selecciona una fecha para ver los entrenamientos.</p>';
    return;
  }

  const entrenamientos = await obtenerEntrenamientos();
  loadingSpinnerEntrenamiento.style.display = 'none';

  const filtrados = entrenamientos.filter(e => new Date(e.fecha).toISOString().split('T')[0] === fechaSeleccionada);
  if (filtrados.length === 0) {
    trainingsContainer.innerHTML = '<p class="text-center text-muted">No hay entrenamientos para la fecha seleccionada.</p>';
    return;
  }

  filtrados.forEach(e => {
    const cuerpo = `
      <p><i class="fas fa-align-left me-2"></i><strong>Descripción:</strong> ${e.descripcion || 'N/A'}</p>
      <p><i class="fas fa-calendar-alt me-2"></i><strong>Fecha/Hora:</strong> ${formatearFecha(e.fecha)} - ${e.hora || 'Sin hora'}</p>
      <p><i class="fas fa-map-marker-alt me-2"></i><strong>Lugar:</strong> ${e.lugar || 'No especificado'}</p>
      <p><i class="fas fa-comment-dots me-2"></i><strong>Observaciones:</strong> ${e.observaciones || 'Ninguna'}</p>
    `;
    const card = crearCard({
      tipo: 'entrenamiento',
      titulo: e.titulo || 'Entrenamiento',
      cuerpo,
      color: 'success'
    });
    trainingsContainer.appendChild(card);
  });
}

inputFechaEntrenamiento.addEventListener('change', filtrarEntrenamientos);