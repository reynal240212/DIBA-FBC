/* ================================
   BOTÓN VOLVER ARRIBA
=================================== */
const btnVolverArriba = document.getElementById("btnVolverArriba");
window.addEventListener("scroll", () => {
  btnVolverArriba.style.display = window.scrollY > 300 ? "block" : "none";
});
btnVolverArriba?.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);

/* ================================
   FILTRO DE CATEGORÍAS
=================================== */
document.querySelectorAll(".category-buttons .btn").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.getAttribute("data-category");
    document.querySelectorAll(".player-card").forEach((card) => {
      card.style.display =
        category === "all" || card.dataset.category === category
          ? "block"
          : "none";
    });
  });
});

/* ================================
   LOGIN Y REGISTRO
=================================== */
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("email-login").value;
  const password = document.getElementById("password-login").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Error en el inicio de sesión: " + error.message);
  } else {
    alert("Inicio de sesión exitoso");
    window.location.href = "index.html";
  }
}

async function handleRegistro(event) {
  event.preventDefault();
  const email = document.getElementById("email-registro").value;
  const password = document.getElementById("password-registro").value;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert("Error en el registro: " + error.message);
  } else {
    alert("Registro exitoso. Verifica tu correo.");
  }
}

/* ================================
   LOGIN CON GOOGLE
=================================== */
function handleCredentialResponse(response) {
  console.log("Google ID Token: ", response.credential);
  alert("Inicio de sesión con Google exitoso");
}

/* ================================
   SESIÓN Y LOGOUT
=================================== */
async function checkSessionOrRedirect() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
  }
}

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

/* ================================
   CARRUSEL DE PARTIDOS
=================================== */
const partidos = document.querySelectorAll(".carousel-item");
let currentIndex = 0;

function showPartido(index) {
  partidos.forEach((partido, i) => {
    partido.classList.toggle("active", i === index);
  });
}

document.getElementById("btnPrevPartido")?.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + partidos.length) % partidos.length;
  showPartido(currentIndex);
});

document.getElementById("btnNextPartido")?.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % partidos.length;
  showPartido(currentIndex);
});

/* ================================
   EXPORTAR FUNCIONES AL GLOBAL
=================================== */
window.handleLogin = handleLogin;
window.handleRegistro = handleRegistro;
window.handleCredentialResponse = handleCredentialResponse;
window.checkSessionOrRedirect = checkSessionOrRedirect;
window.signOut = signOut;
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
function crearCard({ titulo, cuerpo, escudo = null, color = 'primary' }) {
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
  const res = await fetch('/api/getPartidos');
  return await res.json();
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

  const filtrados = partidos.filter(p =>
    new Date(p.fecha).toISOString().split('T')[0] === fechaSeleccionada
  );

  if (filtrados.length === 0) {
    matchesContainer.innerHTML = '<p class="text-center text-muted">No hay partidos para la fecha seleccionada.</p>';
    return;
  }

  filtrados.forEach(p => {
    const cuerpo = `
      <p><i class="fas fa-align-left me-2"></i><strong>Descripción:</strong> ${p.descripcion || 'N/A'}</p>
      <p><i class="fas fa-calendar-alt me-2"></i><strong>Fecha/Hora:</strong> ${formatearFecha(p.fecha)} - ${p.hora || 'Sin hora'}</p>
      <p><i class="fas fa-map-marker-alt me-2"></i><strong>Estadio:</strong> ${p.Cancha || 'No especificado'}</p>
      ${p.valor ? `<p><i class="fas fa-dollar-sign me-2"></i><strong>Valor:</strong> $${p.valor}</p>` : ''}
      <p><i class="fas fa-trophy me-2"></i><strong>Resultado:</strong> ${p.resultado || 'No disponible'}</p>
      <p><i class="fas fa-futbol me-2"></i><strong>Goles:</strong> ${p.goles || 'No disponible'}</p>
      ${p.uniforme ? `<p><i class="fas fa-tshirt me-2"></i><strong>Uniforme:</strong> ${p.uniforme}</p>` : ''}
      ${p.observaciones ? `<p><i class="fas fa-users me-2"></i><strong>Observaciones:</strong> ${p.observaciones}</p>` : ''}
      ${p.metodo_pago ? `<p><i class="fas fa-credit-card me-2"></i><strong>Método de Pago:</strong> ${p.metodo_pago}</p>` : ''}
    `;

    const card = crearCard({
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
  const res = await fetch('/api/getEntrenamientos');
  return await res.json();
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

  const filtrados = entrenamientos.filter(e => {
    const fechaLocal = new Date(e.fecha);
    const fechaISO = fechaLocal.getFullYear() + '-' +
      String(fechaLocal.getMonth() + 1).padStart(2, '0') + '-' +
      String(fechaLocal.getDate()).padStart(2, '0');
    return fechaISO === fechaSeleccionada;
  });

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
      titulo: e.titulo || 'Entrenamiento',
      cuerpo,
      color: 'success'
    });
    trainingsContainer.appendChild(card);
  });
}

inputFechaEntrenamiento.addEventListener('change', filtrarEntrenamientos);

// ----- CLASIFICACIÓN -----
async function obtenerClasificacion() {
  const res = await fetch('/api/getClasificacion');
  return await res.json();
}

async function mostrarClasificacion() {
  const container = document.getElementById('clasificacion-container');
  const spinner = document.getElementById('loading-clasificacion');

  spinner.style.display = 'block';
  container.innerHTML = '';

  const datos = await obtenerClasificacion();
  spinner.style.display = 'none';

  if (datos.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">No hay datos de clasificación disponibles.</p>';
    return;
  }

  const tabla = document.createElement('table');
  tabla.className = 'table table-striped table-hover table-bordered text-center align-middle';

  tabla.innerHTML = `
    <thead class="table-dark">
      <tr>
        <th>Pos</th>
        <th>Equipo</th>
        <th>Pts</th>
        <th>J</th>
        <th>G</th>
        <th>E</th>
        <th>P</th>
        <th>GF</th>
        <th>GC</th>
        <th>DIF</th>
      </tr>
    </thead>
    <tbody>
      ${datos.map(e => `
        <tr class="${e.equipo.toLowerCase().includes('diba') ? 'table-danger fw-bold' : ''}">
          <td>${e.posicion}</td>
          <td>${e.equipo}</td>
          <td>${e.puntos}</td>
          <td>${e.jugados}</td>
          <td>${e.ganados}</td>
          <td>${e.empatados}</td>
          <td>${e.perdidos}</td>
          <td>${e.goles_favor}</td>
          <td>${e.goles_contra}</td>
          <td>${e.diferencia}</td>
        </tr>
      `).join('')}
    </tbody>
  `;

  container.appendChild(tabla);
}

mostrarClasificacion();