/**
 * DIBA FBC — Planilla Control Admin Module
 * Maneja carga de jugadores, planillas de asistencia, pagos y exportaciones.
 */
import { initAdminLayout } from '../src/components/layout/admin-layout.js';
import { supabase, requireAdmin } from './supabaseClient.js';
import { updatePlayer, deletePlayer } from '../src/features/players/admin.js?v=2';

// ── ELEMENTOS DEL DOM ──
const tableBody = document.getElementById('planillaBody');
const dateInput = document.getElementById('planillaDate');
const playerSearch = document.getElementById('playerSearch');
const syncStatus = document.getElementById('sync-status');

// ── ESTADO ──
const appState = {
    players: [],
    currentPlanillaId: null,
    registros: {} // { dni: { db_id, pago, asistencia, obs } }
};

// ── UTILIDADES ──
const showToast = (message, isError = false) => {
    const bar = document.getElementById('alert-bar');
    const txt = document.getElementById('alert-text');
    txt.textContent = message;
    bar.classList.remove('hidden', 'bg-red-500/10', 'text-red-500', 'bg-green-500/10', 'text-green-500');
    bar.classList.add('flex', isError ? 'bg-red-500/10' : 'bg-green-500/10', isError ? 'text-red-500' : 'text-green-500');
    setTimeout(() => bar.classList.add('hidden'), 5000);
};

// ── CARGA DE DATOS ──
async function loadData() {
    try {
        tableBody.innerHTML = '<tr><td colspan="7" class="px-8 py-24 text-center"><div class="flex flex-col items-center opacity-30 animate-pulse"><div class="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4"></div><p class="text-[0.70rem] font-black uppercase tracking-widest">Sincronizando Planilla...</p></div></td></tr>';

        if (!dateInput.value) dateInput.valueAsDate = new Date();
        const fechaSeleccionada = dateInput.value;

        // 1. Cargar jugadores (solo columnas necesarias)
        const { data: players, error: pErr } = await supabase
            .from('identificacion')
            .select('numero, nombre, apellidos, categoria, foto_url')
            .order('apellidos');
        if (pErr) throw pErr;

        appState.players = players.map(p => ({
            id: p.numero,
            name: `${p.nombre} ${p.apellidos}`.trim(),
            categoria: p.categoria,
            foto: p.foto_url
        }));

        // 2. Buscar o crear planilla del dia
        const { data: planillas } = await supabase
            .from('planillas')
            .select('id')
            .eq('fecha', fechaSeleccionada);

        let planillaId;
        if (!planillas || planillas.length === 0) {
            const { data: newPl } = await supabase
                .from('planillas')
                .insert([{ fecha: fechaSeleccionada, categoria: 'General' }])
                .select('id')
                .single();
            planillaId = newPl.id;
        } else {
            planillaId = planillas[0].id;
        }
        appState.currentPlanillaId = planillaId;

        // 3. Cargar registros del dia (solo columnas necesarias)
        const { data: regs } = await supabase
            .from('planilla_registros')
            .select('id, jugador_dni, pago, asistencia, observacion')
            .eq('planilla_id', planillaId);

        appState.registros = {};
        if (regs) {
            regs.forEach(r => {
                appState.registros[r.jugador_dni] = {
                    db_id: r.id,
                    pago: r.pago || '',
                    asistencia: r.asistencia,
                    obs: r.observacion
                };
            });
        }

        render();
    } catch (e) {
        console.error(e);
        showToast('Error de conexion con Supabase', true);
    }
}

// ── RENDER DE TABLA ──
function render() {
    const q = playerSearch.value.toLowerCase();
    tableBody.innerHTML = '';
    const filtered = appState.players.filter(p => p.name.toLowerCase().includes(q));

    const order = { '2014/2015/2016': 1, '2012': 2, '2013': 3, 'General': 4 };
    filtered.sort((a, b) => {
        if (order[a.categoria] !== order[b.categoria]) return (order[a.categoria] || 99) - (order[b.categoria] || 99);
        return a.name.localeCompare(b.name);
    });

    let currentCategory = null;
    let counter = 0;

    filtered.forEach((p) => {
        if (p.categoria !== currentCategory) {
            currentCategory = p.categoria;
            counter = 0;
            const header = document.createElement('tr');
            header.className = 'category-header-row';
            header.innerHTML = `<td colspan="7"><i class="fas fa-layer-group mr-4 text-[0.8rem]"></i>CATEGORIA ${currentCategory}</td>`;
            tableBody.appendChild(header);
        }

        counter++;
        const d = appState.registros[p.id] || { pago: '', asistencia: '', obs: '' };
        const tr = document.createElement('tr');
        tr.dataset.dni = p.id;
        tr.className = 'hover:bg-white/[0.02] transition-colors';

        tr.innerHTML = `
            <td class="px-8 py-4 text-[0.7rem] font-black text-slate-300">${counter}</td>
            <td class="px-8 py-4">
                <img src="${p.foto || '/images/ESCUDO.webp'}" class="w-10 h-10 rounded-full border border-white/10 object-cover shadow-lg">
            </td>
            <td class="px-8 py-4">
                <div class="text-[0.82rem] font-bold text-white uppercase">${p.name}</div>
                <div class="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-0.5">DNI: ${p.id}</div>
            </td>
            <td class="px-8 py-4">
                <select class="premium-select in-pago w-full">
                    <option value="" ${!d.pago ? 'selected' : ''}>METODO...</option>
                    <option value="Nequi" ${d.pago === 'Nequi' ? 'selected' : ''}>Nequi</option>
                    <option value="Efectivo" ${d.pago === 'Efectivo' ? 'selected' : ''}>Efectivo</option>
                    <option value="Daviplata" ${d.pago === 'Daviplata' ? 'selected' : ''}>Daviplata</option>
                    <option value="Banco Bogota" ${d.pago === 'Banco Bogota' ? 'selected' : ''}>Banco Bogota</option>
                </select>
            </td>
            <td class="px-8 py-4">
                <select class="premium-select in-asist w-full font-black italic uppercase">
                    <option value="" ${!d.asistencia ? 'selected' : ''}>ESTADO...</option>
                    <option value="P" ${d.asistencia === 'P' ? 'selected' : ''}>Presente</option>
                    <option value="A" ${d.asistencia === 'A' ? 'selected' : ''}>Ausente</option>
                    <option value="E" ${d.asistencia === 'E' ? 'selected' : ''}>Excusa</option>
                </select>
            </td>
            <td class="px-8 py-4">
                <input type="text" class="planilla-input-obs in-obs" value="${d.obs || ''}" placeholder="...">
            </td>
            <td class="px-8 py-4 text-right">
                <div class="relative group inline-block">
                    <button class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 hover:text-gold hover:bg-white/10 transition-all">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="absolute right-0 top-full mt-2 w-48 bg-sidebar border border-white/10 rounded-2xl shadow-2xl hidden group-hover:block z-50 overflow-hidden">
                        <a href="#" onclick="openAdminDocs('${p.id}', '${p.name}')" class="flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition-all text-[0.65rem] font-black uppercase text-green-500">
                            <i class="fas fa-file-medical"></i> Documentos
                        </a>
                        <a href="#" onclick="openEditModal('${p.id}', '${p.name}', '${p.categoria}')" class="flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition-all text-[0.65rem] font-black uppercase text-gold">
                            <i class="fas fa-edit"></i> Editar
                        </a>
                        <div class="h-[1px] bg-white/5 mx-4"></div>
                        <a href="#" onclick="handleDelete('${p.id}', '${p.name}')" class="flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition-all text-[0.65rem] font-black uppercase text-red-500">
                            <i class="fas fa-trash"></i> Eliminar
                        </a>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    updateStats();
}

// ── ESTADISTICAS ──
function updateStats() {
    const total = appState.players.length;
    let p = 0, a = 0, e = 0;
    appState.players.forEach(pl => {
        const d = appState.registros[pl.id] || { asistencia: '' };
        if (d.asistencia === 'P') p++;
        else if (d.asistencia === 'A') a++;
        else if (d.asistencia === 'E') e++;
    });
    document.getElementById('stat-presentes').textContent = p;
    document.getElementById('stat-ausentes').textContent = a;
    document.getElementById('stat-excusas').textContent = e;
    document.getElementById('stat-total').textContent = total;
    const pct = total > 0 ? Math.round((p / total) * 100) : 0;
    document.getElementById('stat-pct').textContent = pct + '%';
    document.getElementById('prog-p').style.width = (total > 0 ? (p / total) * 100 : 0) + '%';
    document.getElementById('prog-a').style.width = (total > 0 ? (a / total) * 100 : 0) + '%';
    document.getElementById('prog-e').style.width = (total > 0 ? (e / total) * 100 : 0) + '%';
}

// ── GUARDADO AUTOMATICO ──
async function saveRegistro(dni) {
    syncStatus.innerHTML = '<i class="fas fa-cloud-upload-alt animate-pulse mr-2"></i> Guardando...';
    const d = appState.registros[dni];
    const payload = {
        planilla_id: appState.currentPlanillaId,
        jugador_dni: dni,
        pago: d.pago || null,
        asistencia: d.asistencia || null,
        observacion: (d.obs && d.obs.trim()) ? d.obs : null
    };
    try {
        if (d.db_id) {
            await supabase.from('planilla_registros').update(payload).eq('id', d.db_id);
        } else {
            const { data, error } = await supabase.from('planilla_registros').insert([payload]).select('id').single();
            if (!error) d.db_id = data.id;
        }
        syncStatus.innerHTML = '<i class="fas fa-check-circle text-success mr-2"></i> Sincronizado';
    } catch {
        syncStatus.innerHTML = '<i class="fas fa-times-circle text-red-500 mr-2"></i> Error';
    }
}

// ── EXPORTACION PDF ──
function renderPDFHeader(pdf, title, category) {
    pdf.setFontSize(16); pdf.setTextColor(0, 77, 152); pdf.text('DIBA FBC', 14, 15);
    pdf.setFontSize(10); pdf.text(title, 14, 22);
    pdf.setFontSize(9); pdf.setTextColor(100); pdf.text(`Categoria: ${category} | Fecha: ________________`, 14, 28);
    pdf.setDrawColor(200); pdf.line(14, 30, 202, 30);
}

// ── SETUP DE HANDLERS ──
function setupHandlers() {
    tableBody.addEventListener('change', (e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const dni = tr.dataset.dni;
        if (!appState.registros[dni]) appState.registros[dni] = { pago: '', asistencia: '', obs: '' };
        if (e.target.classList.contains('in-pago')) appState.registros[dni].pago = e.target.value;
        if (e.target.classList.contains('in-asist')) { appState.registros[dni].asistencia = e.target.value; updateStats(); }
        saveRegistro(dni);
    });

    tableBody.addEventListener('input', (e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const dni = tr.dataset.dni;
        if (!appState.registros[dni]) appState.registros[dni] = { pago: '', asistencia: '', obs: '' };
        if (e.target.classList.contains('in-obs')) {
            appState.registros[dni].obs = e.target.value;
            clearTimeout(window.saveTimer);
            window.saveTimer = setTimeout(() => saveRegistro(dni), 1000);
        }
    });

    dateInput.onchange = loadData;
    playerSearch.oninput = render;

    document.getElementById('saveAllBtn')?.addEventListener('click', async () => {
        for (const dni of Object.keys(appState.registros)) await saveRegistro(dni);
        showToast('Todos los registros guardados');
    });

    // Modales globales
    window.closeAdminDocs = () => document.getElementById('adminDocsModal').classList.add('hidden');
    window.closeEditModal = () => document.getElementById('editPlayerModal').classList.add('hidden');
    window.closeCreateModal = () => document.getElementById('createPlayerModal').classList.add('hidden');
    window.openCreateModal = () => document.getElementById('createPlayerModal').classList.remove('hidden');

    window.openAdminDocs = async (dni, name) => {
        const modal = document.getElementById('adminDocsModal');
        document.getElementById('modalPlayerName').innerText = name;
        document.getElementById('modalPlayerDni').innerText = `DNI: ${dni}`;
        modal.classList.remove('hidden'); modal.classList.add('flex');
        const listEl = document.getElementById('modalDocsList');
        listEl.innerHTML = '<div class="text-center py-10"><div class="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-2"></div><p class="text-[0.6rem] font-black uppercase text-slate-400 tracking-widest">Consultando boveda...</p></div>';

        const DOC_TYPES = [
            { id: 'tarjeta_identidad', label: 'T. Identidad' },
            { id: 'cedula_padre', label: 'C. Padre' },
            { id: 'cedula_madre', label: 'C. Madre' },
            { id: 'registro_civil', label: 'Reg. Civil' },
            { id: 'consentimiento_padres', label: 'Consentimiento' }
        ];
        const { data: docs } = await supabase.from('player_documents')
            .select('doc_type, file_url, status').eq('identificacion_numero', dni);
        listEl.innerHTML = '';
        for (const type of DOC_TYPES) {
            const doc = docs?.find(d => d.doc_type === type.id);
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all';
            item.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300"><i class="fas fa-file-alt"></i></div>
                    <div><div class="text-white">${type.label}</div><div class="${doc ? 'text-green-500' : 'text-slate-500'} mt-0.5">${doc ? 'CARGADO' : 'PENDIENTE'}</div></div>
                </div>
                ${doc ? `<a href="${doc.file_url}" target="_blank" class="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center hover:bg-gold hover:text-[#004d98] transition-all"><i class="fas fa-eye"></i></a>` : '<div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20"><i class="fas fa-times"></i></div>'}
            `;
            listEl.appendChild(item);
        }
    };

    window.openEditModal = (dni, name, cat) => {
        document.getElementById('editDni').value = dni;
        document.getElementById('editNombre').value = name;
        document.getElementById('oldName').value = name;
        document.getElementById('editCategoria').value = cat;
        const m = document.getElementById('editPlayerModal');
        m.classList.remove('hidden'); m.classList.add('flex');
    };

    window.handleDelete = async (dni, name) => {
        if (!confirm(`Eliminar permanentemente a ${name}?`)) return;
        await deletePlayer(dni);
        showToast('Jugador eliminado');
        loadData();
    };

    document.getElementById('editPlayerForm').onsubmit = async (e) => {
        e.preventDefault();
        await updatePlayer(document.getElementById('editDni').value, {
            nombre: document.getElementById('editNombre').value,
            categoria: document.getElementById('editCategoria').value,
            oldNombre: document.getElementById('oldName').value
        });
        showToast('Actualizado correctamente');
        window.closeEditModal();
        loadData();
    };

    document.getElementById('quickCreatePlayerForm').onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
            numero: document.getElementById('newDni').value,
            nombre: document.getElementById('newNombre').value,
            apellidos: document.getElementById('newApellidos').value,
            categoria: document.getElementById('newCategoria').value,
            fecha_nacimiento: document.getElementById('newFechaNac').value || null,
            sexo: document.getElementById('newSexo').value,
            nacionalidad: document.getElementById('newNacionalidad').value,
            lugar_nacimiento: document.getElementById('newLugarNac').value,
            grupo_sanguineo: document.getElementById('newGrupoSangre').value,
            celular: document.getElementById('newCelular').value
        };
        await supabase.from('jugadores').insert([{ nombre: `${payload.nombre} ${payload.apellidos}`, categoria: payload.categoria, status: 'Activo', fecha_registro: new Date() }]);
        await supabase.from('identificacion').insert([payload]);
        showToast('Jugador creado!');
        window.closeCreateModal();
        loadData();
    };

    document.getElementById('generatePDFPro').onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'letter');
        const categories = [...new Set(appState.players.map(p => p.categoria))].sort();
        categories.forEach((cat, index) => {
            if (index > 0) doc.addPage();
            const playersInCat = appState.players.filter(p => p.categoria === cat).sort((a, b) => a.name.localeCompare(b.name));
            renderPDFHeader(doc, 'PLANILLA DE CONTROL DIARIO', cat);
            doc.autoTable({
                startY: 35,
                head: [['#', 'Nombre del Jugador', 'DNI', 'Metodo de Pago', 'Asist.', 'Observaciones']],
                body: playersInCat.map((p, i) => [i + 1, p.name, p.id, '', '', '']),
                headStyles: { fillColor: [0, 77, 152], fontSize: 8 },
                styles: { fontSize: 8, cellPadding: 2, minCellHeight: 10 },
                columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 50 }, 2: { cellWidth: 25 }, 3: { cellWidth: 30 }, 4: { cellWidth: 15 }, 5: { cellWidth: 54 } },
                theme: 'grid'
            });
            doc.addPage();
            renderPDFHeader(doc, 'ESQUEMA TACTICO', cat);
        });
        window.open(URL.createObjectURL(doc.output('blob')), '_blank');
    };

    document.getElementById('generateExcel').onclick = () => {
        const rows = [['Categoria', 'Nombre', 'DNI', 'Pago', 'Asistencia', 'Observacion']];
        [...appState.players].sort((a, b) => a.name.localeCompare(b.name)).forEach(p => {
            const d = appState.registros[p.id] || { asistencia: 'P' };
            rows.push([p.categoria, p.name, p.id, d.pago || 'Ninguno', d.asistencia, d.obs || '']);
        });
        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'DIBA_Planilla');
        XLSX.writeFile(wb, `Planilla_${dateInput.value}.xlsx`);
    };
}

// ── ARRANQUE ──
async function init() {
    try {
        const session = await requireAdmin();
        if (!session) return;
        await initAdminLayout();
        setupHandlers();
        await loadData();
    } catch (error) {
        console.error('Init error:', error);
    }
}

init();
