// ===============================================
//           INICIALIZACIÓN Y CONFIGURACIÓN
// ===============================================
const supabaseUrl = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- Elementos del DOM y Modales ---
const loadingOverlay = document.getElementById('loading-overlay');
const playerModal = new bootstrap.Modal(document.getElementById('playerModal'));
const planillaModal = new bootstrap.Modal(document.getElementById('planillaModal'));
let playersDataTable, planillasDataTable;

// ===============================================
//           FUNCIONES AUXILIARES
// ===============================================

// --- Mostrar/Ocultar Carga ---
const showLoading = () => loadingOverlay.style.display = 'flex';
const hideLoading = () => loadingOverlay.style.display = 'none';

// --- Notificaciones Toast ---
const showToast = (message, title = 'Notificación', type = 'success') => {
    const toastEl = document.getElementById('appToast');
    const toastTitleEl = document.getElementById('toastTitle');
    const toastMessageEl = document.getElementById('toastMessage');
    
    toastTitleEl.textContent = title;
    toastMessageEl.textContent = message;
    toastEl.className = 'toast show'; // Reiniciar clases
    if(type === 'danger') toastEl.classList.add('bg-danger', 'text-white');
    if(type === 'warning') toastEl.classList.add('bg-warning', 'text-dark');
    if(type === 'success') toastEl.classList.add('bg-success', 'text-white');

    const bsToast = new bootstrap.Toast(toastEl);
    bsToast.show();
};

// --- Formateo de Fechas ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00'); // Asumir hora local
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};


// ===============================================
//                VISTAS (VIEWS)
// ===============================================
const views = {
    // --- VISTA: Dashboard ---
    dashboard: async () => {
        const view = document.getElementById('dashboard-view');
        showLoading();
        
        const { count: playerCount, error: playerError } = await supabase.from('jugadores').select('*', { count: 'exact', head: true });
        const { count: planillaCount, error: planillaError } = await supabase.from('planillas').select('*', { count: 'exact', head: true });

        view.innerHTML = `
            <h1 class="mb-4 display-6">Dashboard</h1>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="stats-card card card-body">
                        <div class="d-flex align-items-center">
                            <div class="icon me-3"><i class="fas fa-users"></i></div>
                            <div>
                                <h5 class="card-title">Total Jugadores</h5>
                                <h3 class="mb-0">${playerError ? 'Error' : playerCount}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stats-card card card-body accent-card">
                         <div class="d-flex align-items-center">
                            <div class="icon me-3"><i class="fas fa-clipboard-list"></i></div>
                            <div>
                                <h5 class="card-title">Planillas Creadas</h5>
                                <h3 class="mb-0">${planillaError ? 'Error' : planillaCount}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        hideLoading();
    },

    // --- VISTA: Jugadores ---
    players: async () => {
        const view = document.getElementById('players-view');
        view.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h1 class="display-6">Gestión de Jugadores</h1>
              <button id="newPlayerBtn" class="btn btn-success"><i class="fas fa-user-plus me-1"></i> Nuevo Jugador</button>
            </div>
            <div class="card card-body">
              <div class="table-responsive">
                <table id="playersTable" class="table table-striped table-hover w-100">
                  <thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Nacimiento</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>`;

        await loadPlayersData();
        document.getElementById('newPlayerBtn').addEventListener('click', openPlayerModal);
    },

    // --- VISTA: Planillas ---
    planillas: async () => {
        const view = document.getElementById('planillas-view');
        view.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="display-6">Gestión de Planillas</h1>
                <button id="newPlanillaBtn" class="btn btn-success"><i class="fas fa-plus me-1"></i> Nueva Planilla</button>
            </div>
            <div class="card card-body">
                <div class="table-responsive">
                    <table id="planillasTable" class="table table-hover w-100">
                        <thead><tr><th>ID</th><th>Fecha</th><th>Categoría</th><th>Acciones</th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>`;
        
        await loadPlanillasData();
        document.getElementById('newPlanillaBtn').addEventListener('click', () => planillaModal.show());
    },

    // --- VISTA: Detalle de Planilla ---
    planillaDetail: async (planillaId) => {
        showLoading();
        const view = document.getElementById('planilla-detail-view');
        
        const { data: planilla, error } = await supabase.from('planillas').select('*').eq('id', planillaId).single();
        if (error) {
            showToast('Error al cargar la planilla.', 'Error', 'danger');
            navigateTo('planillas');
            return;
        }

        view.innerHTML = `
            <div class="mb-4">
                <button id="backToPlanillasBtn" class="btn btn-outline-primary mb-3"><i class="fas fa-arrow-left me-1"></i> Volver a Planillas</button>
                <h1 class="display-6">Planilla: ${formatDate(planilla.fecha)}</h1>
                <p class="lead">Categoría: <strong>${planilla.categoria}</strong></p>
            </div>
            <div class="card card-body">
                <div class="table-responsive">
                    <table id="planillaDetailsTable" class="table w-100">
                        <thead><tr><th>Jugador</th><th>Pago</th><th>Asistencia</th><th>Observaciones</th></tr></thead>
                        <tbody><!-- Registros de jugadores se cargarán aquí --></tbody>
                    </table>
                </div>
            </div>`;
        
        await loadPlanillaDetails(planilla.id, planilla.categoria);
        document.getElementById('backToPlanillasBtn').addEventListener('click', () => navigateTo('planillas'));
        hideLoading();
    }
};

// ===============================================
//           LÓGICA DE NAVEGACIÓN
// ===============================================
const navigateTo = (view, param = null) => {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
    
    const targetView = document.getElementById(`${view}-view`);
    const targetLink = document.querySelector(`.sidebar .nav-link[data-view="${view}"]`);

    if (targetView) targetView.style.display = 'block';
    if (targetLink) targetLink.classList.add('active');

    if (view in views) {
        views[view](param); // Llama a la función de la vista correspondiente
    }
};

// ===============================================
//           LÓGICA DE DATOS (CRUD)
// ===============================================

// --- CRUD Jugadores ---
async function loadPlayersData() {
    showLoading();
    const { data, error } = await supabase.from('jugadores').select('*').order('id');
    hideLoading();
    
    if (error) return showToast(`Error: ${error.message}`, 'Error', 'danger');

    if (playersDataTable) playersDataTable.destroy();
    const tableBody = document.querySelector("#playersTable tbody");
    tableBody.innerHTML = data.map(player => `
        <tr data-id="${player.id}">
            <td>${player.id}</td>
            <td>${player.nombre_completo}</td>
            <td>${player.categoria}</td>
            <td>${formatDate(player.fecha_nacimiento)}</td>
            <td><span class="badge ${player.status === 'Activo' ? 'bg-success' : 'bg-danger'}">${player.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-btn" title="Eliminar"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
    
    playersDataTable = $('#playersTable').DataTable({ responsive: true, language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' }});
}

function openPlayerModal(player = null) {
    const form = document.getElementById('playerForm');
    form.reset();
    document.getElementById('playerId').value = player ? player.id : '';
    document.getElementById('playerModalLabel').textContent = player ? 'Editar Jugador' : 'Nuevo Jugador';
    
    if (player) {
        document.getElementById('playerName').value = player.nombre_completo;
        document.getElementById('playerCategory').value = player.categoria;
        document.getElementById('playerBirthdate').value = player.fecha_nacimiento;
        document.getElementById('playerStatus').value = player.status;
    }
    playerModal.show();
}

async function savePlayer(event) {
    event.preventDefault();
    showLoading();
    const id = document.getElementById('playerId').value;
    const playerData = {
        nombre_completo: document.getElementById('playerName').value,
        categoria: document.getElementById('playerCategory').value,
        fecha_nacimiento: document.getElementById('playerBirthdate').value || null,
        status: document.getElementById('playerStatus').value
    };

    const { error } = id
        ? await supabase.from('jugadores').update(playerData).eq('id', id)
        : await supabase.from('jugadores').insert([playerData]);
    
    hideLoading();
    if (error) return showToast(`Error: ${error.message}`, 'Error', 'danger');

    showToast('Jugador guardado con éxito.');
    playerModal.hide();
    loadPlayersData();
}

async function deletePlayer(id, name) {
    if (!confirm(`¿Seguro que quieres eliminar a ${name}?`)) return;
    showLoading();
    const { error } = await supabase.from('jugadores').delete().eq('id', id);
    hideLoading();

    if (error) return showToast(`Error: ${error.message}`, 'Error', 'danger');
    showToast('Jugador eliminado.');
    loadPlayersData();
}

// --- CRUD Planillas ---
async function loadPlanillasData() {
    showLoading();
    const { data, error } = await supabase.from('planillas').select('*').order('fecha', { ascending: false });
    hideLoading();

    if (error) return showToast(`Error: ${error.message}`, 'Error', 'danger');

    if (planillasDataTable) planillasDataTable.destroy();
    const tableBody = document.querySelector("#planillasTable tbody");
    tableBody.innerHTML = data.map(p => `
        <tr data-id="${p.id}">
            <td>${p.id}</td>
            <td>${formatDate(p.fecha)}</td>
            <td>${p.categoria}</td>
            <td>
                <button class="btn btn-sm btn-primary view-btn"><i class="fas fa-eye"></i> Ver</button>
                <button class="btn btn-sm btn-danger delete-planilla-btn"><i class="fas fa-trash"></i> Eliminar</button>
            </td>
        </tr>`).join('');
    planillasDataTable = $('#planillasTable').DataTable({ responsive: true, language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' }});
}

async function createPlanilla(event) {
    event.preventDefault();
    showLoading();
    const planillaData = {
        fecha: document.getElementById('planillaDate').value,
        categoria: document.getElementById('planillaCategoryCreate').value
    };

    const { data, error } = await supabase.from('planillas').insert(planillaData).select().single();
    hideLoading();
    
    if (error) {
        if (error.code === '23505') return showToast('Ya existe una planilla para esa fecha y categoría.', 'Error', 'danger');
        return showToast(`Error: ${error.message}`, 'Error', 'danger');
    }
    
    showToast('Planilla creada con éxito.');
    planillaModal.hide();
    document.getElementById('planillaForm').reset();
    navigateTo('planillaDetail', data.id); // Navegar a la nueva planilla
}

async function deletePlanilla(id) {
    if (!confirm(`¿Seguro que quieres eliminar esta planilla? Se borrarán todos sus registros.`)) return;
    showLoading();
    const { error } = await supabase.from('planillas').delete().eq('id', id);
    hideLoading();

    if (error) return showToast(`Error: ${error.message}`, 'Error', 'danger');
    showToast('Planilla eliminada.');
    loadPlanillasData();
}

async function loadPlanillaDetails(planillaId, categoria) {
    // 1. Obtener todos los jugadores de la categoría
    const { data: jugadores, error: jugError } = await supabase.from('jugadores').select('*').eq('categoria', categoria).eq('status', 'Activo');
    // 2. Obtener los registros ya existentes para esta planilla
    const { data: registros, error: regError } = await supabase.from('planilla_registros').select('*').eq('planilla_id', planillaId);

    if (jugError || regError) return showToast('Error al cargar datos de la planilla.', 'Error', 'danger');
    
    const registrosMap = new Map(registros.map(r => [r.jugador_id, r]));

    const tableBody = document.getElementById('planillaDetailsTable').querySelector('tbody');
    tableBody.innerHTML = jugadores.map(jugador => {
        const registro = registrosMap.get(jugador.id) || {};
        const asistencia = registro.asistencia || 'P'; // Presente por defecto
        return `
        <tr data-jugador-id="${jugador.id}">
            <td>${jugador.nombre_completo}</td>
            <td><input type="text" class="form-control form-control-sm data-input" data-field="pago" value="${registro.pago || ''}" placeholder="$0"></td>
            <td>
                <select class="form-select form-select-sm data-input status-select-${asistencia}" data-field="asistencia">
                    <option value="P" ${asistencia === 'P' ? 'selected' : ''}>Presente</option>
                    <option value="A" ${asistencia === 'A' ? 'selected' : ''}>Ausente</option>
                    <option value="E" ${asistencia === 'E' ? 'selected' : ''}>Excusa</option>
                </select>
            </td>
            <td><input type="text" class="form-control form-control-sm data-input" data-field="observacion" value="${registro.observacion || ''}" placeholder="Observaciones..."></td>
        </tr>`;
    }).join('');

    // Añadir listener para guardar cambios automáticamente
    tableBody.querySelectorAll('.data-input').forEach(input => {
        input.addEventListener('change', (e) => saveRegistroChange(e, planillaId));
    });
}

async function saveRegistroChange(event, planillaId) {
    const input = event.target;
    const jugadorId = input.closest('tr').dataset.jugadorId;
    const field = input.dataset.field;
    const value = input.value;
    
    // Cambiar color del select de asistencia
    if (field === 'asistencia') {
        input.className = `form-select form-select-sm data-input status-select-${value}`;
    }

    const { error } = await supabase.from('planilla_registros').upsert({
        planilla_id: planillaId,
        jugador_id: jugadorId,
        [field]: value
    }, { onConflict: 'planilla_id, jugador_id' });

    if (error) {
        showToast(`Error al guardar: ${error.message}`, 'Error', 'danger');
    } else {
        const savingToast = document.getElementById('appToast');
        if (!savingToast.classList.contains('show')) { // Evitar spam de notificaciones
             showToast('Cambio guardado.', 'Guardado Automático', 'success');
        }
    }
}

// ===============================================
//           AUTENTICACIÓN Y EVENTOS
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de Autenticación ---
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        hideLoading();
        if (error) showToast(`Error de inicio de sesión: ${error.message}`, 'Error', 'danger');
    });

    document.getElementById('logoutBtn').addEventListener('click', () => supabase.auth.signOut());
    
    // --- Manejo de Sesión ---
    supabase.auth.onAuthStateChange((event, session) => {
        const loginPage = document.getElementById('loginPage');
        const adminApp = document.getElementById('adminApp');

        if (session) { // Usuario ha iniciado sesión
            loginPage.style.display = 'none';
            adminApp.style.display = 'flex';
            if(document.querySelector('.view:visible') === null) {
                navigateTo('dashboard');
            }
        } else { // Usuario no ha iniciado sesión
            loginPage.style.display = 'block';
            adminApp.style.display = 'none';
        }
        hideLoading();
    });

    // --- Event Listeners Globales ---
    document.querySelector('.sidebar').addEventListener('click', (e) => {
        if (e.target.matches('.nav-link')) {
            e.preventDefault();
            navigateTo(e.target.dataset.view);
        }
    });

    // Delegación de eventos para botones en tablas dinámicas
    document.body.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        const viewPlanillaBtn = e.target.closest('.view-btn');
        const deletePlanillaBtn = e.target.closest('.delete-planilla-btn');
        
        if (editBtn) {
            const id = editBtn.closest('tr').dataset.id;
            const { data } = await supabase.from('jugadores').select('*').eq('id', id).single();
            openPlayerModal(data);
        }
        if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            deletePlayer(row.dataset.id, row.cells[1].textContent);
        }
        if (viewPlanillaBtn) {
            navigateTo('planillaDetail', viewPlanillaBtn.closest('tr').dataset.id);
        }
        if (deletePlanillaBtn) {
            deletePlanilla(deletePlanillaBtn.closest('tr').dataset.id);
        }
    });
    
    // Formularios
    document.getElementById('playerForm').addEventListener('submit', savePlayer);
    document.getElementById('planillaForm').addEventListener('submit', createPlanilla);
});

// ===============================================
// FUNCIÓN PARA POBLAR LA BASE DE DATOS (EJECUTAR MANUALMENTE)
// ===============================================
// Para usar: abre la consola del navegador y escribe poblarJugadores()
async function poblarJugadores() {
  const jugadoresData = [
    // Categoría 2014/15/16
    { nombre_completo: 'Mario Pérez', categoria: '2014/15/16' },
    { nombre_completo: 'Juan Andrés Martínez', categoria: '2014/15/16' },
    { nombre_completo: 'Nayareth Celin', categoria: '2014/15/16' },
    { nombre_completo: 'Eliuth Meza', categoria: '2014/15/16' },
    { nombre_completo: 'Abraham Perez', categoria: '2014/15/16' },
    { nombre_completo: 'Rey David Arrieta', categoria: '2014/15/16' },
    { nombre_completo: 'Santy Hernandez', categoria: '2014/15/16' },
    { nombre_completo: 'Santy Tobias', categoria: '2014/15/16' },
    { nombre_completo: 'ISAAC Ventura', categoria: '2014/15/16' },
    { nombre_completo: 'Carlos Moreno', categoria: '2014/15/16' },
    { nombre_completo: 'Zaid Ricardo', categoria: '2014/15/16' },
    { nombre_completo: 'Stiven 2014', categoria: '2014/15/16' },
    { nombre_completo: 'Cristian Marcano', categoria: '2014/15/16' },
    { nombre_completo: 'ANDRES Sierra', categoria: '2014/15/16' },
    { nombre_completo: 'YESID Manzano', categoria: '2014/15/16' },
    // Categoría 2012/2013
    { nombre_completo: 'Deiyembes Manosalva', categoria: '2012/2013' },
    { nombre_completo: 'Dinkol Noguera', categoria: '2012/2013' },
    { nombre_completo: 'Juan Tobias', categoria: '2012/2013' },
    { nombre_completo: 'Dilan Sánchez', categoria: '2012/2013' },
    { nombre_completo: 'Dany Tapias', categoria: '2012/2013' }, // Corregido "Tapiasp"
    { nombre_completo: 'Daniel Rodríguez', categoria: '2012/2013' },
    { nombre_completo: 'Nelson Pauline', categoria: '2012/2013' },
    { nombre_completo: 'Santiago Mendoza', categoria: '2012/2013' },
    { nombre_completo: 'Oscar Lopez', categoria: '2012/2013' },
    { nombre_completo: 'Miguel Aldana', categoria: '2012/2013' },
    { nombre_completo: 'Yojainer Villalobos', categoria: '2012/2013' },
    { nombre_completo: 'Jesus Ricardo', categoria: '2012/2013' },
    { nombre_completo: 'Estiben Montiel', categoria: '2012/2013' },
    { nombre_completo: 'Angel Hernández', categoria: '2012/2013' },
    { nombre_completo: 'Mateo Boscan', categoria: '2012/2013' },
    { nombre_completo: 'Larson Orozco', categoria: '2012/2013' },
    { nombre_completo: 'Josheth Aldana', categoria: '2012/2013' }
  ];

  console.log('Iniciando carga de jugadores...');
  const { error } = await supabase.from('jugadores').insert(jugadoresData);
  if (error) {
    console.error('Error al insertar jugadores:', error);
    showToast(`Error: ${error.message}`, 'Error', 'danger');
  } else {
    console.log('¡Jugadores insertados con éxito!');
    showToast('La base de datos de jugadores ha sido poblada.', 'Éxito');
    if (document.getElementById('players-view').style.display === 'block') {
        loadPlayersData();
    }
  }
}