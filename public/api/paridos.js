import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuración de Supabase
const supabaseUrl = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
const supabaseKey = 'TU_CLAVE_PUBLICA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Selectores
const inputFecha = document.getElementById('fecha');
const matchesContainer = document.getElementById('matches-container');
const loadingSpinner = document.getElementById('loading-spinner');
const inputFechaEntrenamiento = document.getElementById('fecha-entrenamiento');
const trainingsContainer = document.getElementById('trainings-container');
const loadingSpinnerEntrenamiento = document.getElementById('loading-spinner-entrenamiento');

// Helpers
const formatearFecha = fechaISO => new Date(fechaISO).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

function crearCard({ tipo, titulo, cuerpo, escudo = null, color = 'primary' }) {
  const card = document.createElement('div');
  card.className = `card custom-card bg-${color} text-white animate__animated animate__fadeInUp`;
  card.innerHTML = `
    <button class="btn-close-card" aria-label="Cerrar">&times;</button>
    <div class="card-header d-flex align-items-center justify-content-between">
      ${escudo ? `<img src="${escudo}" alt="Escudo" class="escudo">` : ''}
      <h5 class="mb-0">${titulo}</h5>
    </div>
    <div class="card-body">${cuerpo}</div>
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
    matchesContainer.innerHTML = '<p class="text-center">Selecciona una fecha para ver los partidos.</p>';
    return;
  }

  const partidos = await obtenerPartidos();
  loadingSpinner.style.display = 'none';

  const filtrados = partidos.filter(p => new Date(p.fecha).toISOString().split('T')[0] === fechaSeleccionada);
  if (filtrados.length === 0) {
    matchesContainer.innerHTML = '<p class="text-center">No hay partidos para la fecha seleccionada.</p>';
    return;
  }

  filtrados.forEach(p => {
    const cuerpo = `
      <p><i class="fas fa-align-left"></i> <strong>Descripción:</strong> ${p.descripcion || 'N/A'}</p>
      <p><i class="fas fa-calendar-alt"></i> <strong>Fecha/Hora:</strong> ${formatearFecha(p.fecha)} - ${p.hora || 'Sin hora'}</p>
      <p><i class="fas fa-map-marker-alt"></i> <strong>Estadio:</strong> ${p.estadio || 'No especificado'}</p>
      ${p.valor ? `<p><i class="fas fa-dollar-sign"></i> <strong>Valor:</strong> $${p.valor}</p>` : ''}
      <p><i class="fas fa-trophy"></i> <strong>Resultado:</strong> ${p.resultado || 'No disponible'}</p>
      <p><i class="fas fa-futbol"></i> <strong>Goles:</strong> ${p.goles || 'No disponible'}</p>
    `;
    const card = crearCard({ tipo: 'partido', titulo: `${p.equipoLocal} vs ${p.equipoVisitante}`, cuerpo, escudo: p.escudo, color: 'primary' });
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
    trainingsContainer.innerHTML = '<p class="text-center">Selecciona una fecha para ver los entrenamientos.</p>';
    return;
  }

  const entrenamientos = await obtenerEntrenamientos();
  loadingSpinnerEntrenamiento.style.display = 'none';

  const filtrados = entrenamientos.filter(e => new Date(e.fecha).toISOString().split('T')[0] === fechaSeleccionada);
  if (filtrados.length === 0) {
    trainingsContainer.innerHTML = '<p class="text-center">No hay entrenamientos para la fecha seleccionada.</p>';
    return;
  }

  filtrados.forEach(e => {
    const cuerpo = `
      <p><strong>Descripción:</strong> ${e.descripcion || 'N/A'}</p>
      <p><strong>Fecha/Hora:</strong> ${formatearFecha(e.fecha)} - ${e.hora || 'Sin hora'}</p>
      <p><strong>Lugar:</strong> ${e.lugar || 'No especificado'}</p>
      <p><strong>Observaciones:</strong> ${e.observaciones || 'Ninguna'}</p>
    `;
    const card = crearCard({ tipo: 'entrenamiento', titulo: e.titulo || 'Entrenamiento', cuerpo, color: 'success' });
    trainingsContainer.appendChild(card);
  });
}

inputFechaEntrenamiento.addEventListener('change', filtrarEntrenamientos);
