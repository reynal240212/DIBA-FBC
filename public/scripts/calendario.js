// Formatea fechas al estilo "12 de agosto de 2025"
const formatearFecha = fechaISO =>
  new Date(fechaISO).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

// Crea tarjetas Bootstrap animadas
function crearCard({ titulo, cuerpo, color = 'primary', escudo = null }) {
  const card = document.createElement('div');
  card.className = `card border-0 shadow-lg mb-4 bg-${color} text-white animate__animated animate__fadeInUp`;

  card.innerHTML = `
    <div class="card-header d-flex justify-content-between align-items-center bg-opacity-75">
      <div class="d-flex align-items-center gap-2">
        ${escudo ? `<img src="${escudo}" style="width:40px;height:40px;object-fit:contain;">` : ''}
        <h5 class="mb-0 fw-bold">${titulo}</h5>
      </div>
      <button class="btn btn-sm btn-outline-light rounded-circle" title="Cerrar">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="card-body fs-6">${cuerpo}</div>
  `;

  card.querySelector('button').onclick = () => card.remove();
  return card;
}

// ---- FILTRO PARTIDOS ----
document.getElementById('fecha').addEventListener('change', async () => {
  const matchesContainer = document.getElementById('matches-container');
  const fechaSeleccionada = document.getElementById('fecha').value;

  matchesContainer.innerHTML = '';
  if (!fechaSeleccionada) return;

  const res = await fetch('/api/getPartidos');
  const partidos = await res.json();

  const filtrados = partidos.filter(
    p => new Date(p.fecha).toISOString().split('T')[0] === fechaSeleccionada
  );

  if (filtrados.length === 0) {
    matchesContainer.innerHTML = '<p class="text-center text-muted">No hay partidos para esta fecha.</p>';
    return;
  }

  filtrados.forEach(p => {
    matchesContainer.appendChild(crearCard({
      titulo: `${p.equipolocal} vs ${p.equipovisitante}`,
      cuerpo: `
        <p><strong>Descripción:</strong> ${p.descripcion || 'N/A'}</p>
        <p><strong>Fecha/Hora:</strong> ${formatearFecha(p.fecha)} - ${p.hora || 'Sin hora'}</p>
        <p><strong>Estadio:</strong> ${p.Cancha || 'No especificado'}</p>
      `,
      escudo: p.escudo
    }));
  });
});

// ---- FILTRO ENTRENAMIENTOS ----
document.getElementById('fecha-entrenamiento').addEventListener('change', async () => {
  const trainingsContainer = document.getElementById('trainings-container');
  const fechaSeleccionada = document.getElementById('fecha-entrenamiento').value;

  trainingsContainer.innerHTML = '';
  if (!fechaSeleccionada) return;

  const res = await fetch('/api/getEntrenamientos');
  const entrenamientos = await res.json();

  const filtrados = entrenamientos.filter(e => {
    const fechaLocal = new Date(e.fecha);
    return fechaLocal.toISOString().split('T')[0] === fechaSeleccionada;
  });

  if (filtrados.length === 0) {
    trainingsContainer.innerHTML = '<p class="text-center text-muted">No hay entrenamientos para esta fecha.</p>';
    return;
  }

  filtrados.forEach(e => {
    trainingsContainer.appendChild(crearCard({
      titulo: e.titulo || 'Entrenamiento',
      cuerpo: `
        <p><strong>Descripción:</strong> ${e.descripcion || 'N/A'}</p>
        <p><strong>Fecha/Hora:</strong> ${formatearFecha(e.fecha)} - ${e.hora || 'Sin hora'}</p>
        <p><strong>Lugar:</strong> ${e.lugar || 'No especificado'}</p>
      `,
      color: 'success'
    }));
  });
});
