import { supabase, requireAdmin } from './supabaseClient.js';
import { setupAdminUI } from './admin-ui.js';

(async () => {
    // 1. SEGURIDAD Y CONFIGURACIÓN UI COMÚN
    const session = await requireAdmin();
    if (!session) return;

    // Importante: setupAdminUI maneja el sidebar, reloj y info del usuario.
    document.getElementById('admin-body').style.display = 'flex';
    setupAdminUI();

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // 2. ELEMENTOS DEL DOM
    const mainTitle = document.getElementById("main-title");
    const dynamicContent = document.getElementById("dynamic-content");
    const searchInput = document.getElementById("searchInput");

    // ---------------------------------------------------------
    // 3. LÓGICA DEL GESTOR DE DOCUMENTOS
    // ---------------------------------------------------------

    async function loadDocuments() {
        mainTitle.innerHTML = 'Documentos <span>Cargados</span>';
        dynamicContent.innerHTML = `
            <section id="uploadSection" class="${usuario.role !== 'admin' ? 'hidden' : ''}" style="margin-bottom: 2.5rem;">
                <div id="dropZone" class="drop-zone">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: var(--gold); margin-bottom: 1rem; display: block;"></i>
                    <p style="font-size: .75rem; font-weight: 800; color: var(--text); text-transform: uppercase; letter-spacing: .1em;">
                        Arrastra archivos aquí o haz clic para subir
                    </p>
                    <p style="font-size: .6rem; color: var(--slate); margin-top: .5rem;">Formatos aceptados: PDF, JPG, PNG</p>
                    <input type="file" id="newDocument" style="display: none;" accept=".pdf,.jpg,.png">
                </div>
            </section>
            <div id="fileListContainer">
                <div style="text-align:center; padding:3rem;"><i class="fas fa-circle-notch fa-spin" style="color:var(--gold)"></i></div>
            </div>
        `;

        const fileListContainer = document.getElementById("fileListContainer");
        const dropZone = document.getElementById("dropZone");
        const fileInput = document.getElementById("newDocument");

        // Eventos de subida (solo admin)
        dropZone?.addEventListener('click', () => fileInput.click());
        fileInput?.addEventListener('change', (e) => {
            if (e.target.files[0]) handleFileUpload(e.target.files[0]);
        });

        let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
        if (usuario.role !== 'admin') query = query.eq('owner_id', usuario.id);

        try {
            const { data: documents, error } = await query;
            fileListContainer.innerHTML = '';

            if (error || !documents || !documents.length) {
                fileListContainer.innerHTML = '<div style="text-align:center; padding:4rem; color:var(--slate); font-weight:700; font-size:.7rem; text-transform:uppercase;">No hay archivos disponibles</div>';
                return;
            }

            documents.forEach(doc => {
                const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(doc.storage_path);
                const div = document.createElement('div');
                div.className = `file-item animate-fade-up ${doc.is_signed ? 'signed' : ''}`;
                if (doc.is_signed) div.style.borderLeft = '4px solid #4ade80';

                div.innerHTML = `
                    <div class="file-info">
                        <div class="file-icon"><i class="far fa-file-pdf"></i></div>
                        <div>
                            <div class="file-name">${doc.file_name}</div>
                            <div class="file-meta">${new Date(doc.created_at).toLocaleDateString()} · ${doc.is_signed ? 'FIRMADO' : 'PENDIENTE'}</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:.8rem; align-items:center">
                        <a href="${publicUrl}" target="_blank" class="btn btn-outline" style="padding:.5rem; border-radius:10px; font-size:.8rem"><i class="fas fa-eye"></i></a>
                        ${doc.is_signed
                        ? '<span style="color:#4ade80; font-size:.9rem"><i class="fas fa-check-circle"></i></span>'
                        : '<button class="sign-btn btn btn-primary" style="font-size:.6rem; padding:.4rem .8rem; border-radius:8px; font-weight:800">FIRMAR</button>'}
                    </div>
                `;
                fileListContainer.appendChild(div);
            });
        } catch (err) {
            console.error(err);
            fileListContainer.innerHTML = '<p style="color:var(--red); text-align:center;">Error al cargar documentos</p>';
        }
    }

    async function handleFileUpload(file) {
        const dropZone = document.getElementById("dropZone");
        const originalContent = dropZone.innerHTML;
        dropZone.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';

        try {
            const filePath = `${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file);

            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase.from("documents").insert([{
                file_name: file.name,
                storage_path: filePath,
                owner_id: usuario.id
            }]);

            if (dbError) throw dbError;

            loadDocuments();
        } catch (e) {
            alert("Error: " + e.message);
            dropZone.innerHTML = originalContent;
        }
    }

    // ---------------------------------------------------------
    // 4. LÓGICA DE JUGADORES (Tabla Identificación)
    // ---------------------------------------------------------

    async function loadPlayers() {
        mainTitle.innerHTML = 'Plantilla <span>Oficial</span>';
        dynamicContent.innerHTML = '<div style="text-align:center; padding:5rem;"><i class="fas fa-circle-notch fa-spin" style="color:var(--gold)"></i></div>';

        try {
            const { data: jugadores, error } = await supabase.from('identificacion').select('*').order('apellidos');
            if (error) throw error;

            dynamicContent.innerHTML = `
                <div class="table-responsive">
                    <table id="players-table">
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th style="width:150px">Número ID</th>
                                <th style="width:80px">RH</th>
                                <th style="width:80px; text-align:right">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${jugadores.map(j => `
                                <tr>
                                    <td>
                                        <div style="font-weight:700; color:var(--text); text-transform:uppercase; font-size:.75rem">${j.nombre} ${j.apellidos}</div>
                                        <div style="font-size:.65rem; color:var(--slate); font-weight:600">${j.nacionalidad}</div>
                                    </td>
                                    <td style="font-family:monospace; color:var(--slate)">${j.numero}</td>
                                    <td><span style="background:rgba(244,63,94,.1); color:#fb7185; padding:.2rem .5rem; border-radius:6px; font-size:.65rem; font-weight:800">${j.grupo_sanguineo}</span></td>
                                    <td style="text-align:right"><button class="btn btn-outline" style="padding:.4rem; border-radius:8px;"><i class="fas fa-info-circle"></i></button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (e) {
            console.error(e);
            dynamicContent.innerHTML = '<p style="color:var(--red); text-align:center;">Error al cargar jugadores</p>';
        }
    }

    // ---------------------------------------------------------
    // 5. MANEJO DE EVENTOS
    // ---------------------------------------------------------

    searchInput?.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const items = dynamicContent.querySelectorAll('.file-item, tbody tr');
        items.forEach(item => {
            item.style.display = item.innerText.toLowerCase().includes(val) ? '' : 'none';
        });
    });

    document.getElementById("view-players-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        loadPlayers();
    });

    document.getElementById("view-gestor-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        loadDocuments();
    });

    loadDocuments();
})();