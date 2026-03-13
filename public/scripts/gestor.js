import { supabase, requireAdmin, sanitizeDNI } from './supabaseClient.js';
import { cerrarSesion } from './auth.js';

(async () => {
    // 1. SEGURIDAD Y DATOS DE SESIÓN
    const session = await requireAdmin();
    if (!session) return;
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // 2. ELEMENTOS DEL DOM
    const navName = document.getElementById("nav-user-name");
    const navRole = document.getElementById("nav-user-role");
    const mainTitle = document.getElementById("main-title");
    const dynamicContent = document.getElementById("dynamic-content");
    const searchInput = document.getElementById("searchInput");

    // Inicializar UI básica
    if (navName) navName.textContent = usuario.username;
    if (navRole) navRole.textContent = usuario.role === 'admin' ? 'Administrador' : 'Técnico';

    // ---------------------------------------------------------
    // 3. LÓGICA DEL GESTOR DE DOCUMENTOS & STORAGE UNIVERSAL
    // ---------------------------------------------------------

    let currentBucket = 'documents'; // Default display

    async function loadStorageBuckets() {
        mainTitle.innerHTML = 'Storage <span class="text-slate-300">Universal</span>';
        setActiveFilter('filter-club-btn');
        dynamicContent.innerHTML = `
            <div id="buckets-container" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate__animated animate__fadeIn">
                <div class="flex justify-center py-10 col-span-full"><i class="fas fa-circle-notch animate-spin text-2xl text-dibaGold"></i></div>
            </div>
            <div id="fileListContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
        `;

        const bucketsContainer = document.getElementById("buckets-container");
        const fileListContainer = document.getElementById("fileListContainer");

        try {
            const { data: buckets, error } = await supabase.storage.listBuckets();
            if (error) throw error;

            bucketsContainer.innerHTML = '';
            buckets.forEach(bucket => {
                const card = document.createElement('div');
                card.className = `p-6 bg-white border border-slate-200 rounded-[2rem] hover:shadow-xl transition-all cursor-pointer group flex items-center gap-4 ${currentBucket === bucket.id ? 'border-dibaGold bg-yellow-50/10' : ''}`;
                card.onclick = () => {
                    currentBucket = bucket.id;
                    loadStorageBuckets(); // Reload to refresh active state
                };
                card.innerHTML = `
                    <div class="w-12 h-12 ${currentBucket === bucket.id ? 'bg-dibaGold text-blue-900 border-dibaGold' : 'bg-slate-50 text-slate-400 group-hover:bg-dibaGold/10 group-hover:text-dibaGold'} rounded-2xl flex items-center justify-center text-xl transition-all">
                        <i class="fas fa-archive"></i>
                    </div>
                    <div>
                        <h4 class="font-black text-slate-800 text-xs uppercase italic tracking-tight mb-1">${bucket.name}</h4>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${bucket.public ? 'Público' : 'Privado'}</p>
                    </div>
                `;
                bucketsContainer.appendChild(card);
            });

            // Load files for the currently selected bucket
            loadFilesFromBucket(currentBucket);

        } catch (err) {
            console.error(err);
            bucketsContainer.innerHTML = `<p class="text-rose-500 font-bold uppercase text-[10px] text-center col-span-full">Error al listar buckets: ${err.message}</p>`;
        }
    }

    async function loadFilesFromBucket(bucketId, path = '') {
        const fileListContainer = document.getElementById("fileListContainer");
        fileListContainer.innerHTML = '<div class="flex justify-center py-20 col-span-full"><i class="fas fa-circle-notch animate-spin text-3xl text-dibaGold"></i></div>';

        try {
            const { data: files, error } = await supabase.storage.from(bucketId).list(path, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'desc' }
            });

            if (error) throw error;
            fileListContainer.innerHTML = '';

            if (!files || files.length === 0) {
                fileListContainer.innerHTML = `<p class="text-center text-slate-400 py-10 uppercase text-[10px] font-black italic tracking-widest col-span-full italic">No hay archivos en "${bucketId}"</p>`;
                return;
            }

            files.forEach(file => {
                if (file.name === '.emptyFolderPlaceholder') return;
                
                const isFolder = !file.metadata;
                const { data: { publicUrl } } = supabase.storage.from(bucketId).getPublicUrl(file.name);
                const isImg = /\.(jpg|jpeg|png|gif)$/i.test(file.name);
                
                const div = document.createElement('div');
                div.className = `flex flex-col p-6 bg-white border border-slate-200 rounded-[2rem] hover:shadow-xl transition-all animate__animated animate__fadeIn group`;
                div.innerHTML = `
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-dibaGold/10 group-hover:text-dibaGold transition-colors">
                            <i class="fas ${isFolder ? 'fa-folder' : (isImg ? 'fa-image' : 'fa-file-alt')} text-xl"></i>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-black text-slate-800 text-xs uppercase italic tracking-tight line-clamp-1 mb-1">${file.name}</h4>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                            ${isFolder ? 'Carpeta' : `${(file.metadata.size / 1024).toFixed(1)} KB — ${new Date(file.created_at).toLocaleDateString()}`}
                        </p>
                    </div>
                    <div class="pt-4 border-t border-slate-50 mt-auto">
                        <a href="${publicUrl}" target="_blank" class="w-full py-3 flex items-center justify-center gap-2 bg-dibaBlue text-white text-[10px] font-black uppercase italic rounded-xl hover:bg-dibaGold hover:text-dibaBlue transition-all">
                            <i class="fas ${isFolder ? 'fa-folder-open' : 'fa-download'}"></i> ${isFolder ? 'Abrir' : 'Ver / Descargar'}
                        </a>
                    </div>
                `;
                fileListContainer.appendChild(div);
            });
        } catch (err) {
            console.error(err);
            fileListContainer.innerHTML = `<p class="col-span-full py-20 text-center text-rose-500 font-black uppercase text-[10px]">Error al cargar archivos de ${bucketId}: ${err.message}</p>`;
        }
    }

    async function loadDocuments() {
        mainTitle.innerHTML = 'Gestor <span class="text-slate-300">Documental</span>';
        setActiveFilter('filter-docs-btn');
        dynamicContent.innerHTML = `
            <section id="uploadSection" class="${usuario.role !== 'admin' ? 'hidden' : ''} mb-12 animate__animated animate__fadeInUp">
                <div id="dropZone" class="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center hover:bg-yellow-50/50 hover:border-dibaGold transition-all cursor-pointer">
                    <i class="fas fa-cloud-upload-alt text-3xl text-slate-300 mb-4"></i>
                    <p class="font-bold text-slate-800 uppercase italic text-sm">Arrastra archivos aquí o haz clic</p>
                    <input type="file" id="newDocument" class="hidden" accept=".pdf,.jpg,.png">
                </div>
            </section>
            <div id="fileListContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="flex justify-center py-10"><i class="fas fa-circle-notch animate-spin text-2xl text-dibaGold"></i></div>
            </div>
        `;

        const fileListContainer = document.getElementById("fileListContainer");
        const dropZone = document.getElementById("dropZone");
        const fileInput = document.getElementById("newDocument");

        dropZone?.addEventListener('click', () => fileInput.click());
        fileInput?.addEventListener('change', (e) => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); });

        let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
        if (usuario.role !== 'admin') query = query.eq('owner_id', usuario.id);

        const { data: documents, error } = await query;
        fileListContainer.innerHTML = '';

        if (error || !documents.length) {
            fileListContainer.innerHTML = '<p class="text-center text-slate-400 py-10 uppercase text-[10px] font-black italic tracking-widest col-span-full">No hay archivos disponibles</p>';
            return;
        }

        documents.forEach(doc => {
            const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(doc.storage_path);
            const div = document.createElement('div');
            div.className = `flex flex-col p-6 bg-white border border-slate-200 rounded-[2rem] hover:shadow-xl transition-all animate__animated animate__fadeIn group ${doc.is_signed ? 'border-l-8 border-l-emerald-500' : ''}`;
            div.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-dibaGold/10 group-hover:text-dibaGold transition-colors">
                        <i class="far fa-file-pdf text-xl"></i>
                    </div>
                    ${doc.is_signed ? '<span class="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase italic rounded-full tracking-widest border border-emerald-100"><i class="fas fa-signature mr-1"></i> Firmado</span>' : ''}
                </div>
                <div>
                    <h4 class="font-black text-slate-800 text-xs uppercase italic tracking-tight line-clamp-1 mb-1">${doc.file_name}</h4>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">${new Date(doc.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <div class="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <a href="${publicUrl}" target="_blank" class="text-[9px] font-black uppercase italic text-dibaBlue hover:text-dibaGold flex items-center gap-1.5 transition-all">
                        <i class="fas fa-eye"></i> Visualizar
                    </a>
                    ${!doc.is_signed ? '<button class="sign-btn text-[9px] font-black uppercase italic text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 transition-all">Firmar Documento</button>' : ''}
                </div>
            `;
            fileListContainer.appendChild(div);
        });
    }

    // ---------------------------------------------------------
    // 3.8 ELIMINADO:loadBucketFiles (Reemplazado por explorador universal)
    // ---------------------------------------------------------

    // ---------------------------------------------------------
    // 3.6 LÓGICA DE ASISTENCIAS
    // ---------------------------------------------------------

    async function loadAsistencias() {
        mainTitle.innerHTML = 'Registro de <span class="text-slate-300">Asistencias</span>';
        setActiveFilter('filter-asistencias-btn');
        dynamicContent.innerHTML = `<div id="fileListContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex justify-center py-20 col-span-full"><i class="fas fa-circle-notch animate-spin text-3xl text-dibaGold"></i></div>
        </div>`;

        const fileListContainer = document.getElementById("fileListContainer");

        try {
            const { data: asistencias, error } = await supabase
                .from('asistencias')
                .select('*, identificacion(nombre, apellidos)')
                .order('fecha', { ascending: false })
                .limit(50);

            if (error) throw error;
            fileListContainer.innerHTML = '';

            if (!asistencias || asistencias.length === 0) {
                fileListContainer.innerHTML = '<p class="text-center text-slate-400 py-10 uppercase text-[10px] font-black italic tracking-widest col-span-full">No se encontraron registros de asistencias</p>';
                return;
            }

            asistencias.forEach(reg => {
                const playerName = reg.identificacion ? `${reg.identificacion.nombre} ${reg.identificacion.apellidos}` : reg.identificacion_numero;
                const dateStr = new Date(reg.fecha).toLocaleDateString();
                
                const div = document.createElement('div');
                div.className = `flex flex-col p-6 bg-white border border-slate-200 rounded-[2rem] hover:shadow-xl transition-all animate__animated animate__fadeIn group ${reg.foto_tomada_url ? 'border-amber-200' : ''}`;
                div.innerHTML = `
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 ${reg.asistio ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} rounded-2xl flex items-center justify-center">
                            <i class="fas ${reg.asistio ? 'fa-check' : 'fa-times'} text-xl"></i>
                        </div>
                        <span class="text-[8px] font-black uppercase px-2 py-1 rounded-lg ${reg.fuente === 'reconocimiento_facial' ? 'bg-indigo-50 text-indigo-500 border border-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}">
                            ${reg.fuente || 'Manual'}
                        </span>
                    </div>
                    <div>
                        <h4 class="font-black text-slate-800 text-xs uppercase italic tracking-tight line-clamp-1 mb-1">${playerName}</h4>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">${reg.tipo_evento || 'Entrenamiento'} — ${dateStr}</p>
                    </div>
                    <div class="pt-4 border-t border-slate-50 mt-auto">
                        ${reg.foto_tomada_url ? `
                            <a href="${reg.foto_tomada_url}" target="_blank" class="w-full py-3 flex items-center justify-center gap-2 bg-amber-500 text-white text-[10px] font-black uppercase italic rounded-xl hover:bg-dibaBlue transition-all">
                                <i class="fas fa-camera"></i> Ver Foto de Asistencia
                            </a>
                        ` : `
                            <div class="w-full py-3 text-center text-slate-300 text-[10px] font-black uppercase italic">Sin captura visual</div>
                        `}
                    </div>
                `;
                fileListContainer.appendChild(div);
            });
        } catch (err) {
            console.error(err);
            fileListContainer.innerHTML = `<p class="text-center text-red-500 py-10 uppercase text-[10px] font-black italic tracking-widest col-span-full">Error al cargar asistencias: ${err.message}</p>`;
        }
    }

    function setActiveFilter(btnId) {
        const buttons = document.querySelectorAll('#filter-container button');
        buttons.forEach(btn => {
            if (btn.id === btnId) {
                btn.className = "px-6 py-2 rounded-full bg-dibaGold text-blue-900 text-[10px] font-black uppercase italic border border-dibaGold transition-all whitespace-nowrap";
            } else {
                btn.className = "px-6 py-2 rounded-full bg-white/5 text-slate-400 text-[10px] font-black uppercase italic border border-white/10 hover:border-dibaGold transition-all whitespace-nowrap";
            }
        });
    }

    // ---------------------------------------------------------
    // 4. LÓGICA DE JUGADORES (Tabla Identificación)
    // ---------------------------------------------------------

    async function loadPlayers() {
        mainTitle.innerHTML = 'Plantilla <span class="text-slate-300">Oficial</span>';
        setActiveFilter('view-players-btn');
        dynamicContent.innerHTML = '<div class="flex justify-center py-20"><i class="fas fa-circle-notch animate-spin text-3xl text-dibaGold"></i></div>';

        const { data: jugadores, error } = await supabase.from('identificacion').select('*').order('apellidos');
        const { data: allDocs } = await supabase.from('player_documents').select('identificacion_numero, doc_type, status');

        if (error) return console.error(error);

        const DOC_TYPES_MAP = [
            { id: 'tarjeta_identidad', icon: 'fa-id-card' },
            { id: 'cedula_padre', icon: 'fa-user-tie' },
            { id: 'cedula_madre', icon: 'fa-user' },
            { id: 'registro_civil', icon: 'fa-baby' },
            { id: 'consentimiento_padres', icon: 'fa-file-signature' }
        ];

        // Calcular estadísticas para el dashboard
        const totalJugadores = jugadores.length;
        const alDia = jugadores.filter(j => {
            const jDocs = allDocs?.filter(d => d.identificacion_numero === j.numero && d.status === 'verificado');
            return jDocs?.length === 5;
        }).length;

        dynamicContent.innerHTML = `
            <!-- Dashboard de Documentación -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate__animated animate__fadeInDown">
                <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 bg-dibaBlue/5 text-dibaBlue rounded-2xl flex items-center justify-center text-xl"><i class="fas fa-users"></i></div>
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Jugadores</p>
                        <h4 class="text-2xl font-black text-slate-800 italic">${totalJugadores}</h4>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-xl"><i class="fas fa-check-double"></i></div>
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documentación al Día</p>
                        <h4 class="text-2xl font-black text-slate-800 italic">${alDia}</h4>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-xl"><i class="fas fa-exclamation-triangle"></i></div>
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes</p>
                        <h4 class="text-2xl font-black text-slate-800 italic">${totalJugadores - alDia}</h4>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate__animated animate__fadeInUp">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th class="p-5 text-[10px] font-black uppercase text-slate-400">Jugador</th>
                            <th class="p-5 text-[10px] font-black uppercase text-slate-400">DNI</th>
                            <th class="p-5 text-[10px] font-black uppercase text-slate-400">Documentación (TI|P|M|RC|C)</th>
                            <th class="p-5 text-[10px] font-black uppercase text-slate-400">Acción</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        ${jugadores.map(j => {
            const jDocs = allDocs?.filter(d => d.identificacion_numero === j.numero) || [];
            return `
                            <tr class="hover:bg-slate-50/50 transition-all">
                                <td class="p-5">
                                    <p class="font-bold text-slate-700 text-xs uppercase italic">${j.nombre} ${j.apellidos}</p>
                                    <p class="text-[9px] text-slate-400 uppercase font-medium">${j.nacionalidad}</p>
                                </td>
                                <td class="p-5 font-mono text-xs text-slate-500">${j.numero}</td>
                                <td class="p-5">
                                    <div class="flex gap-1.5">
                                        ${DOC_TYPES_MAP.map(type => {
                const doc = jDocs.find(d => d.doc_type === type.id);
                let colorClass = 'bg-slate-100 text-slate-300';
                if (doc) {
                    colorClass = doc.status === 'verificado' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white';
                }
                return `<div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${colorClass}" title="${type.id}"><i class="fas ${type.icon}"></i></div>`;
            }).join('')}
                                    </div>
                                </td>
                                <td class="p-5 flex gap-2">
                                    <button class="text-dibaBlue hover:text-dibaGold" title="Info"><i class="fas fa-info-circle"></i></button>
                                    <button onclick="openAdminDocs('${j.numero}', '${j.nombre} ${j.apellidos}')" class="text-emerald-600 hover:text-emerald-700" title="Documentos"><i class="fas fa-file-medical"></i></button>
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Modal de Gestión Documental Admin (Se mantiene igual pero con estilos Tailwind) -->
            <div id="adminDocsModal" class="hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div class="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate__animated animate__zoomIn animate__faster">
                    <div class="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                        <div>
                            <h3 id="modalPlayerName" class="text-xl font-black text-white italic uppercase">Cargando...</h3>
                            <p id="modalPlayerDni" class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1"></p>
                        </div>
                        <button onclick="closeAdminDocs()" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-rose-500/20 hover:text-rose-500 transition-all">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-8 space-y-4 max-h-[60vh] overflow-y-auto" id="modalDocsList">
                        <!-- Items de documentos se insertan aquí -->
                    </div>
                    <div class="p-6 bg-slate-950/50 text-center">
                        <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Panel de Gestión Administrativa - DIBA FBC</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Funciones globales para el modal (disponibles para los botones de la tabla)
    window.openAdminDocs = async (dni, name) => {
        const sanitizedDni = sanitizeDNI(dni);
        const modal = document.getElementById('adminDocsModal');
        const nameEl = document.getElementById('modalPlayerName');
        const dniEl = document.getElementById('modalPlayerDni');
        const listEl = document.getElementById('modalDocsList');

        nameEl.innerText = name;
        dniEl.innerText = `DNI: ${sanitizedDni}`;
        modal.classList.remove('hidden');
        listEl.innerHTML = '<div class="flex justify-center py-10"><i class="fas fa-circle-notch animate-spin text-2xl text-dibaGold"></i></div>';

        const DOC_TYPES = [
            { id: 'tarjeta_identidad', label: 'Tarjeta de Identidad' },
            { id: 'cedula_padre', label: 'Cédula del Padre' },
            { id: 'cedula_madre', label: 'Cédula de la Madre' },
            { id: 'registro_civil', label: 'Registro Civil' },
            { id: 'consentimiento_padres', label: 'Consentimiento Padres' }
        ];

        // Cargar documentos existentes
        const { data: docs } = await supabase.from('player_documents').select('*').eq('identificacion_numero', sanitizedDni);

        listEl.innerHTML = '';
        DOC_TYPES.forEach(type => {
            const doc = docs?.find(d => d.doc_type === type.id);
            const item = document.createElement('div');
            item.className = "flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] transition-all";
            item.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500"><i class="fas fa-file-alt"></i></div>
                    <div>
                        <p class="text-[11px] font-black text-white italic uppercase">${type.label}</p>
                        <p class="text-[9px] uppercase font-bold ${doc ? (doc.status === 'verificado' ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-500'}">
                            ${doc ? doc.status : 'No cargado'}
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    ${doc ? `<a href="${doc.file_url}" target="_blank" class="p-2 text-slate-400 hover:text-dibaGold"><i class="fas fa-eye"></i></a>` : ''}
                    <button onclick="document.getElementById('upload-${type.id}').click()" class="p-2 text-slate-400 hover:text-emerald-500"><i class="fas fa-upload"></i></button>
                    <input type="file" id="upload-${type.id}" class="hidden" onchange="adminUploadDoc('${sanitizedDni}', '${type.id}', this)">
                </div>
            `;
            listEl.appendChild(item);
        });
    };

    window.closeAdminDocs = () => {
        document.getElementById('adminDocsModal').classList.add('hidden');
    };

    window.adminUploadDoc = async (dni, docType, input) => {
        const sanitizedDni = sanitizeDNI(dni);
        const file = input.files[0];
        if (!file) return;

        const originalBtn = input.previousElementSibling;
        const originalIcon = originalBtn.innerHTML;
        originalBtn.innerHTML = '<i class="fas fa-circle-notch animate-spin text-emerald-500"></i>';
        originalBtn.disabled = true;

        try {
            const extension = file.name.split('.').pop();
            const fileName = `${sanitizedDni}/${docType}.${extension}`;

            // 1. Storage
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);

            // 2. DB (Upsert por DNI)
            const { error: dbError } = await supabase.from('player_documents').upsert({
                identificacion_numero: sanitizedDni,
                doc_type: docType,
                file_url: publicUrl,
                status: 'verificado', // Admin sube y queda verificado automáticamente
                updated_at: new Date()
            }, { onConflict: ['identificacion_numero', 'doc_type'] });

            if (dbError) throw dbError;

            // Recargar modal
            const nameEl = document.getElementById('modalPlayerName').innerText;
            window.openAdminDocs(sanitizedDni, nameEl);

        } catch (err) {
            console.error(err);
            alert("Error al subir: " + err.message);
        } finally {
            originalBtn.innerHTML = originalIcon;
            originalBtn.disabled = false;
        }
    };

    // ---------------------------------------------------------
    // 5. MANEJO DE EVENTOS Y BUSCADOR
    // ---------------------------------------------------------

    // Buscador universal (Filtra lo que esté en pantalla)
    searchInput?.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const rows = dynamicContent.querySelectorAll('#fileListContainer > div, tbody tr');
        rows.forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none';
        });
    });

    // Navegación Sidebar / Filtros
    document.getElementById("view-players-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        loadPlayers();
    });

    document.getElementById("filter-docs-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        loadDocuments();
    });

    document.getElementById("filter-club-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        loadStorageBuckets();
    });

    document.getElementById("filter-asistencias-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        loadAsistencias();
    });

    // Cerrar sesión
    document.getElementById("logout-btn")?.addEventListener("click", cerrarSesion);

    // Carga inicial
    loadDocuments();
})();