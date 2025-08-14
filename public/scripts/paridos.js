import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =================================================================================
// CONFIGURACIÓN Y CONSTANTES
// Mejora: Centralizar la configuración y los nombres clave (magic strings).
// Facilita el mantenimiento y previene errores de tipeo.
// =================================================================================

const SUPABASE_URL = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';

const TABLES = {
  PARTIDOS: 'partidos',
  ENTRENAMIENTOS: 'entrenamientos',
  CLASIFICACION: 'clasificacion_categoria_2014_15',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =================================================================================
// SELECTORES DEL DOM
// Mejora: Agrupar todos los selectores del DOM en un solo lugar.
// =================================================================================

const DOM = {
  partidos: {
    input: document.getElementById('fecha'),
    container: document.getElementById('matches-container'),
    spinner: document.getElementById('loading-spinner'),
  },
  entrenamientos: {
    input: document.getElementById('fecha-entrenamiento'),
    container: document.getElementById('trainings-container'),
    spinner: document.getElementById('loading-spinner-entrenamiento'),
  },
  clasificacion: {
    container: document.getElementById('clasificacion-container'),
    spinner: document.getElementById('loading-clasificacion'),
  },
};

// =================================================================================
// FUNCIONES DE UTILIDAD (HELPERS)
// Mejora: Pequeñas funciones reutilizables para tareas comunes.
// =================================================================================

/**
 * Formatea una fecha ISO (ej: "2024-12-31T00:00:00") a un formato legible.
 * @param {string} fechaISO - La fecha en formato ISO.
 * @returns {string} La fecha formateada (ej: "31 de diciembre de 2024").
 */
const formatearFecha = (fechaISO) => {
  // Se añade un 'T00:00:00' para asegurar que la conversión no se desfase por la zona horaria.
  const fecha = new Date(`${fechaISO.split('T')[0]}T00:00:00`);
  return fecha.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', // Importante para consistencia
  });
};

/**
 * Muestra u oculta un elemento spinner.
 * @param {HTMLElement} spinner - El elemento del spinner.
 * @param {boolean} mostrar - True para mostrar, false para ocultar.
 */
const toggleSpinner = (spinner, mostrar) => {
  spinner.style.display = mostrar ? 'block' : 'none';
};

// =================================================================================
// CREACIÓN DE COMPONENTES VISUALES
// Mejora: Funciones dedicadas a generar el HTML de cada componente.
// =================================================================================

/**
 * Crea una tarjeta genérica para mostrar un evento.
 * @param {object} config - Objeto de configuración de la tarjeta.
 * @returns {HTMLElement} El elemento de la tarjeta.
 */
function crearTarjeta({ titulo, detallesHTML, escudo = null, color = 'primary' }) {
  const card = document.createElement('div');
  card.className = `card border-0 shadow-sm mb-4 animate__animated animate__fadeInUp`;

  card.innerHTML = `
    <div class="card-header bg-${color} text-white d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        ${escudo ? `<img src="${escudo}" alt="Escudo" class="rounded-circle bg-white p-1" style="width: 40px; height: 40px; object-fit: contain;">` : ''}
        <h5 class="mb-0 fw-bold">${titulo}</h5>
      </div>
      <button class="btn btn-sm btn-close btn-close-white" aria-label="Cerrar" title="Cerrar"></button>
    </div>
    <div class="card-body">
      <ul class="list-unstyled mb-0">
        ${detallesHTML}
      </ul>
    </div>
  `;

  card.querySelector('.btn-close').addEventListener('click', () => {
    card.classList.add('animate__fadeOutDown');
    card.addEventListener('animationend', () => card.remove());
  });

  return card;
}

/**
 * Genera el HTML de los detalles para una tarjeta de partido.
 * @param {object} p - El objeto del partido.
 * @returns {string} El HTML para el cuerpo de la tarjeta.
 */
function generarDetallesPartido(p) {
  const detalles = [
    { icon: 'align-left', label: 'Descripción', value: p.descripcion || 'N/A' },
    { icon: 'calendar-alt', label: 'Fecha/Hora', value: `${formatearFecha(p.fecha)} - ${p.hora || 'Sin hora'}` },
    { icon: 'map-marker-alt', label: 'Estadio', value: p.Cancha || 'No especificado' },
    { icon: 'trophy', label: 'Resultado', value: p.resultado, condition: p.resultado },
    { icon: 'futbol', label: 'Goles', value: p.goles, condition: p.goles },
    { icon: 'tshirt', label: 'Uniforme', value: p.uniforme, condition: p.uniforme },
    { icon: 'dollar-sign', label: 'Valor', value: `$${p.valor}`, condition: p.valor },
    { icon: 'credit-card', label: 'Método de Pago', value: p.metodo_pago, condition: p.metodo_pago },
    { icon: 'users', label: 'Observaciones', value: p.observaciones, condition: p.observaciones },
  ];

  return detalles
    .filter(item => item.condition !== false && item.value) // Filtra los que no tienen valor
    .map(item => `
      <li class="mb-2 d-flex">
        <i class="fas fa-${item.icon} text-muted mt-1" style="width: 25px;"></i>
        <div><strong>${item.label}:</strong> ${item.value}</div>
      </li>`
    ).join('');
}


/**
 * Genera el HTML de los detalles para una tarjeta de entrenamiento.
 * @param {object} e - El objeto del entrenamiento.
 * @returns {string} El HTML para el cuerpo de la tarjeta.
 */
function generarDetallesEntrenamiento(e) {
  const detalles = [
    { icon: 'align-left', label: 'Descripción', value: e.descripcion || 'N/A' },
    { icon: 'calendar-alt', label: 'Fecha/Hora', value: `${formatearFecha(e.fecha)} - ${e.hora || 'Sin hora'}` },
    { icon: 'map-marker-alt', label: 'Lugar', value: e.lugar || 'No especificado' },
    { icon: 'comment-dots', label: 'Observaciones', value: e.observaciones || 'Ninguna' },
  ];

  return detalles
    .map(item => `
      <li class="mb-2 d-flex">
        <i class="fas fa-${item.icon} text-muted mt-1" style="width: 25px;"></i>
        <div><strong>${item.label}:</strong> ${item.value}</div>
      </li>`
    ).join('');
}


// =================================================================================
// LÓGICA PRINCIPAL (FETCH Y RENDER)
// =================================================================================

/**
 * MEJORA CLAVE: Función genérica para obtener, filtrar y mostrar datos por fecha.
 * Reemplaza a las antiguas `filtrarPartidos` y `filtrarEntrenamientos`.
 * @param {object} config - Configuración para la operación.
 */
async function manejarFiltroPorFecha({ input, container, spinner, tableName, titleKey, cardColor, detailsFn, escudoKey }) {
  container.innerHTML = '';
  toggleSpinner(spinner, true);

  const fechaSeleccionada = input.value;
  if (!fechaSeleccionada) {
    toggleSpinner(spinner, false);
    container.innerHTML = `<p class="text-center text-muted fst-italic mt-3">Selecciona una fecha para ver los resultados.</p>`;
    return;
  }

  try {
    const { data, error } = await supabase.from(tableName).select('*').eq('fecha', fechaSeleccionada);
    toggleSpinner(spinner, false);

    if (error) throw error; // Lanza el error para ser capturado por el catch

    if (data.length === 0) {
      container.innerHTML = `<p class="text-center text-muted fst-italic mt-3">No hay eventos para la fecha seleccionada.</p>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    data.forEach(item => {
      const card = crearTarjeta({
        titulo: typeof titleKey === 'function' ? titleKey(item) : item[titleKey],
        detallesHTML: detailsFn(item),
        escudo: escudoKey ? item[escudoKey] : null,
        color: cardColor,
      });
      fragment.appendChild(card);
    });
    container.appendChild(fragment);

  } catch (error) {
    console.error(`Error al obtener ${tableName}:`, error);
    toggleSpinner(spinner, false);
    container.innerHTML = `<p class="text-center text-danger">Ocurrió un error al cargar los datos. Inténtalo de nuevo.</p>`;
  }
}

/**
 * Obtiene y muestra la tabla de clasificación.
 */
async function mostrarClasificacion() {
  toggleSpinner(DOM.clasificacion.spinner, true);
  DOM.clasificacion.container.innerHTML = '';

  try {
    const { data, error } = await supabase
      .from(TABLES.CLASIFICACION)
      .select('*')
      .order('posicion', { ascending: true });

    toggleSpinner(DOM.clasificacion.spinner, false);

    if (error) throw error;
    
    if (data.length === 0) {
      DOM.clasificacion.container.innerHTML = '<p class="text-center text-muted">No hay datos de clasificación disponibles.</p>';
      return;
    }
    
    // MEJORA VISUAL: Se usa una clase personalizada para el resaltado, que puedes definir en tu CSS.
    const tablaHTML = `
      <div class="table-responsive">
        <table class="table table-striped table-hover table-bordered text-center align-middle shadow-sm">
          <thead class="table-dark">
            <tr>
              <th>Pos</th><th>Equipo</th><th>Pts</th><th>J</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DIF</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(e => `
              <tr class="${e.equipo.toLowerCase().includes('diba') ? 'team-diba-highlight' : ''}">
                <td>${e.posicion}</td>
                <td class="text-start">${e.equipo}</td>
                <td class="fw-bold">${e.puntos}</td>
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
        </table>
      </div>`;
    
    DOM.clasificacion.container.innerHTML = tablaHTML;

  } catch (error) {
    console.error('Error al obtener clasificación:', error);
    toggleSpinner(DOM.clasificacion.spinner, false);
    DOM.clasificacion.container.innerHTML = `<p class="text-center text-danger">No se pudo cargar la tabla de clasificación.</p>`;
  }
}


// =================================================================================
// INICIALIZACIÓN Y EVENT LISTENERS
// Mejora: Se utiliza la función genérica para los eventos.
// =================================================================================

DOM.partidos.input.addEventListener('change', () => manejarFiltroPorFecha({
  ...DOM.partidos,
  tableName: TABLES.PARTIDOS,
  titleKey: p => `${p.equipolocal} vs ${p.equipovisitante}`,
  cardColor: 'primary',
  detailsFn: generarDetallesPartido,
  escudoKey: 'escudo',
}));

DOM.entrenamientos.input.addEventListener('change', () => manejarFiltroPorFecha({
  ...DOM.entrenamientos,
  tableName: TABLES.ENTRENAMIENTOS,
  titleKey: 'titulo',
  cardColor: 'success',
  detailsFn: generarDetallesEntrenamiento,
}));

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', mostrarClasificacion);