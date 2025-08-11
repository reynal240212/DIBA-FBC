// ===============================================
//           INICIALIZACIÓN Y CONFIGURACIÓN
// ===============================================
const { createClient } = supabase;
const supabaseClient = createClient(
    'https://wdnlqfiwuocmmcdowjyw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q'
);

const loadingOverlay = document.getElementById('loading-overlay');
const playerModal = new bootstrap.Modal(document.getElementById('playerModal'));
const planillaModal = new bootstrap.Modal(document.getElementById('planillaModal'));
let playersDataTable, planillasDataTable;

// ===============================================
//           FUNCIONES AUXILIARES
// ===============================================
const showLoading = () => loadingOverlay.style.display = 'flex';
const hideLoading = () => loadingOverlay.style.display = 'none';

const showToast = (message, title = 'Notificación', type = 'success') => {
    const toastEl = document.getElementById('appToast');
    const toastTitleEl = document.getElementById('toastTitle');
    const toastMessageEl = document.getElementById('toastMessage');
    toastTitleEl.textContent = title;
    toastMessageEl.textContent = message;
    toastEl.className = 'toast';
    toastEl.classList.add('show', `bg-${type}`, type === 'warning' ? 'text-dark' : 'text-white');
    new bootstrap.Toast(toastEl).show();
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ===============================================
//                VISTAS (VIEWS)
// ===============================================
const views = {
    dashboard: async () => {
        const view = document.getElementById('dashboard-view');
        showLoading();
        const { count: playerCount, error: playerError } = await supabaseClient.from('jugadores').select('*', { count: 'exact', head: true });
        const { count: planillaCount, error: planillaError } = await supabaseClient.from('planillas').select('*', { count: 'exact', head: true });
        view.innerHTML = `<h1 class="mb-4 display-6">Dashboard</h1><div class="row g-4"><div class="col-lg-4 col-md-6"><div class="stats-card card card-body h-100"><div class="d-flex align-items-center"><div class="icon me-3"><i class="fas fa-users"></i></div><div><h5 class="card-title">Total Jugadores</h5><h3 class="mb-0">${playerError ? 'Error' : playerCount}</h3></div></div></div></div><div class="col-lg-4 col-md-6"><div class="stats-card card card-body h-100 accent-card"><div class="d-flex align-items-center"><div class="icon me-3"><i class="fas fa-clipboard-list"></i></div><div><h5 class="card-title">Planillas Creadas</h5><h3 class="mb-0">${planillaError ? 'Error' : planillaCount}</h3></div></div></div></div></div>`;
        hideLoading();
    },
    players: async () => {
        const view = document.getElementById('players-view');
        view.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-4"><h1 class="display-6">Gestión de Jugadores</h1><button id="newPlayerBtn" class="btn btn-success"><i class="fas fa-user-plus me-1"></i> Nuevo Jugador</button></div><div class="card card-body"><div class="table-responsive"><table id="playersTable" class="table table-striped table-hover w-100"><thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></div></div>`;
        await loadPlayersData();
        document.getElementById('newPlayerBtn').addEventListener('click', () => openPlayerModal());
    },
    planillas: async () => {
        const view = document.getElementById('planillas-view');
        view.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-4"><h1 class="display-6">Gestión de Planillas</h1><button id="newPlanillaBtn" class="btn btn-success"><i class="fas fa-plus me-1"></i> Nueva Planilla</button></div><div class="card card-body"><div class="table-responsive"><table id="planillasTable" class="table table-hover w-100"><thead><tr><th>ID</th><th>Fecha</th><th>Categoría</th><th>Acciones</th></tr></thead><tbody></tbody></table></div></div>`;
        await loadPlanillasData();
        document.getElementById('newPlanillaBtn').addEventListener('click', () => planillaModal.show());
    },
    planillaDetail: async (planillaId) => {
        showLoading();
        const view = document.getElementById('planilla-detail-view');
        const { data: planilla, error } = await supabaseClient.from('planillas').select('*').eq('id', planillaId).single();
        if (error) { showToast('Error al cargar la planilla.', 'Error', 'danger'); navigateTo('planillas'); return; }
        // Se añade un data-attribute al h1 para almacenar el ID de la planilla
        view.innerHTML = `<div class="mb-4"><button id="backToPlanillasBtn" class="btn btn-outline-primary mb-3"><i class="fas fa-arrow-left me-1"></i> Volver</button><h1 class="display-6" data-planilla-id="${planilla.id}">Planilla: ${formatDate(new Date(planilla.fecha + 'T00:00:00'))}</h1><p class="lead">Categoría: <strong>${planilla.categoria}</strong></p></div><div class="card card-body"><div class="table-responsive"><table id="planillaDetailsTable" class="table w-100"><thead><tr><th>Jugador</th><th>Pago</th><th>Asistencia</th><th>Observaciones</th></tr></thead><tbody></tbody></table></div></div>`;
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
    if (views[view]) views[view](param);
};

// ===============================================
//           LÓGICA DE DATOS (CRUD)
// ===============================================
async function loadPlayersData() {
    showLoading();
    const { data, error } = await supabaseClient.from('jugadores').select('*').order('id');
    hideLoading();
    if (error) return showToast(`Error: ${error.message}`, 'Error', 'danger');
    if (playersDataTable) playersDataTable.destroy();
    document.querySelector("#playersTable tbody").innerHTML = data.map(p => `<tr data-id="${p.id}"><td>${p.id}</td><td>${p.nombre}</td><td>${p.categoria}</td><td><span class="badge ${p.status === 'Activo' ? 'bg-success' : 'bg-danger'}">${p.status}</span></td><td><button class="btn btn-sm btn-primary edit-btn" title="Editar"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger delete-btn" title="Eliminar"><i class="fas fa-trash"></i></button></td></tr>`).join('');
    playersDataTable = $('#playersTable').DataTable({ responsive: true, language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' }});
}

function openPlayerModal(player = null) {
    document.getElementById('playerForm').reset();
    document.getElementById('playerId').value = player ? player.id : '';
    document.getElementById('playerModalLabel').textContent = player ? `Editar Jugador: ${player.nombre}` : 'Nuevo Jugador';
    if (player) {
        document.getElementById('playerName').value = player.nombre;
        document.getElementById('playerCategory').value = player.categoria;
        document.getElementById('playerStatus').value = player.status;
    }
    playerModal.show();
}

async function savePlayer(event) {
    event.preventDefault(); showLoading();
    const id = document.getElementById('playerId').value;
    const playerData = { nombre: document.getElementById('playerName').value, categoria: document.getElementById('playerCategory').value, status: document.getElementById('playerStatus').value };
    const { error } = id ? await supabaseClient.from('jugadores').update(playerData).eq('id', id) : await supabaseClient.from('jugadores').insert([playerData]);
    hideLoading();
    if (error) return showToast(`Error: ${error.message}`, 'Error', 'danger');
    showToast('Jugador guardado.'); playerModal.hide(); loadPlayersData();
}

async function deletePlayer(id, name) {
    if (!confirm(`¿Seguro que quieres eliminar a ${name}?`)) return; showLoading();
    const { error } = await supabaseClient.from('jugadores').delete().eq('id', id);
    hideLoading();
    if (error) return showToast(`Error: ${error.message}`, 'Error', 'danger');
    showToast('Jugador eliminado.'); loadPlayersData();
}

async function loadPlanillasData() {
    showLoading();
    const { data, error } = await supabaseClient.from('planillas').select('*').order('fecha', { ascending: false });
    hideLoading();
    if (error) return showToast(`Error: ${error.message}`, 'Error', 'danger');
    if (planillasDataTable) planillasDataTable.destroy();
    document.querySelector("#planillasTable tbody").innerHTML = data.map(p => `<tr data-id="${p.id}"><td>${p.id}</td><td>${formatDate(new Date(p.fecha + 'T00:00:00'))}</td><td>${p.categoria}</td><td><button class="btn btn-sm btn-primary view-btn"><i class="fas fa-eye"></i> Ver</button> <button class="btn btn-sm btn-danger delete-planilla-btn"><i class="fas fa-trash"></i> Eliminar</button></td></tr>`).join('');
    planillasDataTable = $('#planillasTable').DataTable({ responsive: true, language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' }});
}

async function createPlanilla(event) {
    event.preventDefault(); showLoading();
    const { data, error } = await supabaseClient.from('planillas').insert({ fecha: document.getElementById('planillaDate').value, categoria: document.getElementById('planillaCategoryCreate').value }).select().single();
    hideLoading();
    if (error) return showToast(error.code === '23505' ? 'Ya existe una planilla para esa fecha y categoría.' : `Error: ${error.message}`, 'Error', 'danger');
    showToast('Planilla creada.'); planillaModal.hide(); document.getElementById('planillaForm').reset(); navigateTo('planillaDetail', data.id);
}

async function deletePlanilla(id) {
    if (!confirm(`¿Seguro que quieres eliminar esta planilla?`)) return; showLoading();
    const { error } = await supabaseClient.from('planillas').delete().eq('id', id);
    hideLoading();
    if (error) return showToast(`Error: ${error.message}`, 'Error', 'danger');
    showToast('Planilla eliminada.'); loadPlanillasData();
}

async function loadPlanillaDetails(planillaId, categoria) {
    const { data: jugadores, error: jugError } = await supabaseClient.from('jugadores').select('*').eq('categoria', categoria).eq('status', 'Activo');
    const { data: registros, error: regError } = await supabaseClient.from('planilla_registros').select('*').eq('planilla_id', planillaId);
    if (jugError || regError) return showToast('Error al cargar datos.', 'Error', 'danger');
    const registrosMap = new Map(registros.map(r => [r.jugador_id, r]));
    document.querySelector('#planillaDetailsTable tbody').innerHTML = jugadores.map(jugador => {
        const registro = registrosMap.get(jugador.id) || {};
        const asistencia = registro.asistencia || 'P';
        return `<tr data-jugador-id="${jugador.id}"><td>${jugador.nombre}</td><td><input type="text" class="form-control form-control-sm data-input" data-field="pago" value="${registro.pago || ''}" placeholder="$0"></td><td><select class="form-select form-select-sm data-input status-select-${asistencia}" data-field="asistencia"><option value="P" ${asistencia === 'P' ? 'selected' : ''}>Presente</option><option value="A" ${asistencia === 'A' ? 'selected' : ''}>Ausente</option><option value="E" ${asistencia === 'E' ? 'selected' : ''}>Excusa</option></select></td><td><input type="text" class="form-control form-control-sm data-input" data-field="observacion" value="${registro.observacion || ''}" placeholder="..."></td></tr>`;
    }).join('');
}

async function saveRegistroChange(event) {
    const input = event.target;
    // Se busca el ID de la planilla desde el H1
    const planillaId = document.querySelector('h1[data-planilla-id]').dataset.planillaId;
    const jugadorId = input.closest('tr').dataset.jugadorId;
    const { error } = await supabaseClient.from('planilla_registros').upsert({ planilla_id: planillaId, jugador_id: jugadorId, [input.dataset.field]: input.value }, { onConflict: 'planilla_id, jugador_id' });
    if (input.dataset.field === 'asistencia') input.className = `form-select form-select-sm data-input status-select-${input.value}`;
    if (error) showToast(`Error: ${error.message}`, 'Error', 'danger');
}

// ===============================================
//           AUTENTICACIÓN Y EVENTOS
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        document.getElementById('loginPage').style.display = session ? 'none' : 'block';
        document.getElementById('adminApp').style.display = session ? 'flex' : 'none';
        if (session && !document.querySelector('.view[style*="display: block"]')) {
            navigateTo('dashboard');
        }
        hideLoading();
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault(); showLoading();
        const { error } = await supabaseClient.auth.signInWithPassword({ email: document.getElementById('email').value, password: document.getElementById('password').value });
        hideLoading();
        if (error) showToast(`Error: ${error.message}`, 'Error', 'danger');
    });

    document.getElementById('logoutBtn').addEventListener('click', () => supabaseClient.auth.signOut());
    
    document.querySelector('.sidebar').addEventListener('click', (e) => {
        if (e.target.matches('.nav-link')) { e.preventDefault(); navigateTo(e.target.dataset.view); }
    });

    document.body.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        const viewPlanillaBtn = e.target.closest('.view-btn');
        const deletePlanillaBtn = e.target.closest('.delete-planilla-btn');
        if (editBtn) {
            const { data } = await supabaseClient.from('jugadores').select('*').eq('id', editBtn.closest('tr').dataset.id).single();
            openPlayerModal(data);
        }
        if (deleteBtn) deletePlayer(deleteBtn.closest('tr').dataset.id, deleteBtn.closest('tr').cells[1].textContent);
        if (viewPlanillaBtn) navigateTo('planillaDetail', viewPlanillaBtn.closest('tr').dataset.id);
        if (deletePlanillaBtn) deletePlanilla(deletePlanillaBtn.closest('tr').dataset.id);
    });
    
    document.body.addEventListener('change', (e) => {
        if (e.target.matches('#planillaDetailsTable .data-input')) {
            saveRegistroChange(e);
        }
    });
    
    document.getElementById('playerForm').addEventListener('submit', savePlayer);
    document.getElementById('planillaForm').addEventListener('submit', createPlanilla);
});