// partidos.js ACTUALIZADO
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuración de Supabase (sin cambios)
const supabaseUrl = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- TUS FUNCIONES ORIGINALES (MODIFICADAS LIGERAMENTE) ---

const formatearFecha = fechaISO => new Date(fechaISO).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

// Tu función de crearCard es perfecta, la usaremos en el Modal.
function crearCard({ tipo, titulo, cuerpo, escudo = null, color = 'primary' }) {
    // La envolvemos en un contenedor para que funcione bien en el modal
    const container = document.createElement('div');
    const card = document.createElement('div');
    card.className = `card border-0 shadow-lg bg-${color} text-white`;

    card.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center bg-opacity-75">
        <div class="d-flex align-items-center gap-2">
          ${escudo ? `<img src="${escudo}" alt="Escudo" class="rounded shadow" style="width: 40px; height: 40px; object-fit: contain;">` : ''}
          <h5 class="mb-0 fw-bold">${titulo}</h5>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="card-body fs-6">${cuerpo}</div>
    `;
    container.appendChild(card);
    return container;
}


async function obtenerClasificacion() {
    const { data, error } = await supabase
      .from('clasificacion_categoria_2014_15')
      .select('*')
      .order('posicion', { ascending: true });

    if (error) {
        console.error('Error al obtener clasificación:', error);
        return [];
    }
    return data;
}

async function obtenerTodosLosPartidos() {
    const { data, error } = await supabase.from('partidos').select('*');
    if (error) {
        console.error('Error al obtener partidos:', error);
        return [];
    }
    return data;
}

async function obtenerTodosLosEntrenamientos() {
    const { data, error } = await supabase.from('entrenamientos').select('*');
    if (error) {
        console.error('Error al obtener entrenamientos:', error);
        return [];
    }
    return data;
}


// --- NUEVAS FUNCIONES PARA LA PÁGINA INNOVADORA ---

/**
 * INICIALIZA EL DASHBOARD: GRÁFICOS Y TABLA DE CLASIFICACIÓN
 */
async function initDashboard() {
    const clasificacionContainer = document.getElementById('clasificacion-container');
    const loadingClasificacion = document.getElementById('loading-clasificacion');

    // 1. Mostrar Tabla de Clasificación (reutilizando tu lógica)
    loadingClasificacion.style.display = 'block';
    const clasificacionData = await obtenerClasificacion();
    loadingClasificacion.style.display = 'none';

    if (clasificacionData.length > 0) {
        const tabla = document.createElement('table');
        tabla.className = 'table table-striped table-hover text-center align-middle';
        tabla.innerHTML = `
            <thead class="table-dark">
              <tr>
                <th>Pos</th><th>Equipo</th><th>Pts</th><th>J</th><th>G</th><th>E</th><th>P</th>
              </tr>
            </thead>
            <tbody>
              ${clasificacionData.map(e => `
                <tr class="${e.equipo.toLowerCase().includes('diba') ? 'table-primary fw-bold' : ''}">
                  <td>${e.posicion}</td>
                  <td class="text-start">${e.equipo}</td>
                  <td>${e.puntos}</td><td>${e.jugados}</td><td>${e.ganados}</td><td>${e.empatados}</td><td>${e.perdidos}</td>
                </tr>`).join('')}
            </tbody>`;
        clasificacionContainer.innerHTML = '';
        clasificacionContainer.appendChild(tabla);
    } else {
        clasificacionContainer.innerHTML = '<p class="text-center text-muted">No hay datos de clasificación disponibles.</p>';
    }

    // 2. Gráfico de Rendimiento (con datos de ejemplo, conéctalo a tu data)
    new Chart(document.getElementById('performanceChart'), {
        type: 'doughnut',
        data: {
            labels: ['Victorias', 'Empates', 'Derrotas'],
            datasets: [{
                data: [12, 6, 4], // Reemplazar con datos reales de Supabase
                backgroundColor: ['#0d6efd', '#ffc107', '#dc3545'],
            }]
        }
    });

    // 3. Gráfico de Goleadores (con datos de ejemplo)
    new Chart(document.getElementById('topScorersChart'), {
        type: 'bar',
        data: {
            labels: ['L. Suarez', 'E. Cavani', 'J. Rodriguez', 'Neymar JR'], // Reemplazar con datos reales
            datasets: [{
                label: 'Goles',
                data: [15, 11, 8, 5], // Reemplazar con datos reales
                backgroundColor: '#198754'
            }]
        },
        options: { indexAxis: 'y' }
    });
}

/**
 * INICIALIZA LA LÍNEA DE TIEMPO INTERACTIVA
 */
async function initTimeline() {
    const timelineContainer = document.getElementById('timeline-container');
    const eventDetailModal = new bootstrap.Modal(document.getElementById('eventDetailModal'));
    const modalBody = document.getElementById('modal-body-content');

    // 1. Cargar todos los eventos
    const [partidos, entrenamientos] = await Promise.all([
        obtenerTodosLosPartidos(),
        obtenerTodosLosEntrenamientos()
    ]);

    if (partidos.length === 0 && entrenamientos.length === 0) {
        timelineContainer.innerHTML = '<p class="text-center text-muted p-5">No hay eventos programados.</p>';
        return;
    }

    // 2. Formatear datos para Vis.js
    const items = new vis.DataSet([
        ...partidos.map(p => ({
            id: `p-${p.id}`,
            content: `${p.equipolocal} vs ${p.equipovisitante}`,
            start: `${p.fecha}T${p.hora || '12:00:00'}`,
            className: 'item-partido',
            type: 'box',
            group: 1, // Grupo para partidos
            data: p, // Guardamos el objeto completo
            esPartido: true
        })),
        ...entrenamientos.map(e => ({
            id: `e-${e.id}`,
            content: e.titulo || 'Entrenamiento',
            start: `${e.fecha}T${e.hora || '09:00:00'}`,
            className: 'item-entrenamiento',
            type: 'point',
            group: 2, // Grupo para entrenamientos
            data: e,
            esPartido: false
        }))
    ]);
    
    // 3. Crear la línea de tiempo
    timelineContainer.innerHTML = '';
    const timeline = new vis.Timeline(timelineContainer, items, {
        stack: true,
        zoomMin: 1000 * 60 * 60 * 24 * 7, // Zoom mínimo de 1 semana
        zoomMax: 1000 * 60 * 60 * 24 * 365, // Zoom máximo de 1 año
        height: '400px'
    });

    // 4. Añadir evento de clic
    timeline.on('click', properties => {
        if (properties.item) {
            const item = items.get(properties.item);
            
            // Usar tu función crearCard para generar el contenido del modal
            let cardHtml;
            if (item.esPartido) {
                const p = item.data;
                const cuerpo = `<p><i class="fas fa-align-left me-2"></i><strong>Descripción:</strong> ${p.descripcion || 'N/A'}</p><p><i class="fas fa-calendar-alt me-2"></i><strong>Fecha/Hora:</strong> ${formatearFecha(p.fecha)} - ${p.hora || 'Sin hora'}</p><p><i class="fas fa-map-marker-alt me-2"></i><strong>Estadio:</strong> ${p.Cancha || 'No especificado'}</p><p><i class="fas fa-trophy me-2"></i><strong>Resultado:</strong> ${p.resultado || 'No disponible'}</p>`;
                cardHtml = crearCard({ tipo: 'partido', titulo: `${p.equipolocal} vs ${p.equipovisitante}`, cuerpo, escudo: p.escudo, color: 'primary' });
            } else {
                const e = item.data;
                const cuerpo = `<p><i class="fas fa-align-left me-2"></i><strong>Descripción:</strong> ${e.descripcion || 'N/A'}</p><p><i class="fas fa-calendar-alt me-2"></i><strong>Fecha/Hora:</strong> ${formatearFecha(e.fecha)} - ${e.hora || 'Sin hora'}</p><p><i class="fas fa-map-marker-alt me-2"></i><strong>Lugar:</strong> ${e.lugar || 'No especificado'}</p>`;
                cardHtml = crearCard({ tipo: 'entrenamiento', titulo: e.titulo || 'Entrenamiento', cuerpo, color: 'success' });
            }

            modalBody.innerHTML = '';
            modalBody.appendChild(cardHtml);
            eventDetailModal.show();
        }
    });
}


// --- PUNTO DE ENTRADA AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initTimeline();
});