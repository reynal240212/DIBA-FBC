import { supabase } from './supabaseClient.js';
import { verificarSesion, cerrarSesion } from './auth.js';

(async () => {
    // 1. SEGURIDAD Y DATOS DE SESIÓN
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        window.location.href = "/admin/login";
        return;
    }

    // 2. ELEMENTOS DEL DOM
    const navName = document.getElementById("nav-user-name");
    const navRole = document.getElementById("nav-user-role");
    const mainTitle = document.getElementById("main-title");
    const dynamicContent = document.getElementById("dynamic-content");
    const searchInput = document.getElementById("searchInput");

    // Inicializar UI básica
    if (navName) navName.textContent = usuario.username;
    if (navRole) navRole.textContent = usuario.role === 'admin' ? 'Administrador' : 'Deportista';

    // ---------------------------------------------------------
    // 3. LÓGICA DEL GESTOR DE DOCUMENTOS
    // ---------------------------------------------------------
    
    async function loadDocuments() {
        mainTitle.innerHTML = 'Gestor <span class="text-slate-300">Documental</span>';
        dynamicContent.innerHTML = `
            <section id="uploadSection" class="${usuario.role !== 'admin' ? 'hidden' : ''} mb-12 animate__animated animate__fadeInUp">
                <div id="dropZone" class="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center hover:bg-yellow-50/50 hover:border-dibaGold transition-all cursor-pointer">
                    <i class="fas fa-cloud-upload-alt text-3xl text-slate-300 mb-4"></i>
                    <p class="font-bold text-slate-800 uppercase italic text-sm">Arrastra archivos aquí o haz clic</p>
                    <input type="file" id="newDocument" class="hidden" accept=".pdf,.jpg,.png">
                </div>
            </section>
            <div id="fileListContainer" class="space-y-4">
                <div class="flex justify-center py-10"><i class="fas fa-circle-notch animate-spin text-2xl text-dibaGold"></i></div>
            </div>
        `;

        const fileListContainer = document.getElementById("fileListContainer");
        const dropZone = document.getElementById("dropZone");
        const fileInput = document.getElementById("newDocument");

        // Eventos de subida (solo admin)
        dropZone?.addEventListener('click', () => fileInput.click());
        fileInput?.addEventListener('change', (e) => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); });

        let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
        if (usuario.role !== 'admin') query = query.eq('owner_id', usuario.id);

        const { data: documents, error } = await query;
        fileListContainer.innerHTML = '';

        if (error || !documents.length) {
            fileListContainer.innerHTML = '<p class="text-center text-slate-400 py-10 uppercase text-[10px] font-black italic tracking-widest">No hay archivos disponibles</p>';
            return;
        }

        documents.forEach(doc => {
            const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(doc.storage_path);
            const div = document.createElement('div');
            div.className = `flex items-center justify-between p-5 bg-white border border-slate-200 rounded-3xl animate__animated animate__fadeIn ${doc.is_signed ? 'border-l-8 border-l-green-500' : ''}`;
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><i class="far fa-file-pdf"></i></div>
                    <div>
                        <p class="font-bold text-slate-700 text-xs uppercase italic">${doc.file_name}</p>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">${new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <a href="${publicUrl}" target="_blank" class="p-2 text-slate-400 hover:text-dibaBlue transition-all"><i class="fas fa-eye"></i></a>
                    ${doc.is_signed ? '<span class="text-green-500 text-[9px] font-black italic uppercase"><i class="fas fa-check"></i></span>' : '<button class="sign-btn text-[9px] font-black uppercase italic text-green-600 bg-green-50 px-3 py-1 rounded-lg">Firmar</button>'}
                </div>
            `;
            fileListContainer.appendChild(div);
        });
    }

    // ---------------------------------------------------------
    // 4. LÓGICA DE JUGADORES (Tabla Identificación)
    // ---------------------------------------------------------
    
    async function loadPlayers() {
        mainTitle.innerHTML = 'Plantilla <span class="text-slate-300">Oficial</span>';
        dynamicContent.innerHTML = '<div class="flex justify-center py-20"><i class="fas fa-circle-notch animate-spin text-3xl text-dibaGold"></i></div>';

        const { data: jugadores, error } = await supabase.from('identificacion').select('*').order('apellidos');

        if (error) return console.error(error);

        dynamicContent.innerHTML = `
            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th class="p-5 text-[10px] font-black uppercase text-slate-400">Jugador</th>
                            <th class="p-5 text-[10px] font-black uppercase text-slate-400">ID Numero</th>
                            <th class="p-5 text-[10px] font-black uppercase text-slate-400">RH</th>
                            <th class="p-5 text-[10px] font-black uppercase text-slate-400">Acción</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        ${jugadores.map(j => `
                            <tr class="hover:bg-slate-50/50 transition-all">
                                <td class="p-5">
                                    <p class="font-bold text-slate-700 text-xs uppercase italic">${j.nombre} ${j.apellidos}</p>
                                    <p class="text-[9px] text-slate-400 uppercase font-medium">${j.nacionalidad}</p>
                                </td>
                                <td class="p-5 font-mono text-xs text-slate-500">${j.numero}</td>
                                <td class="p-5"><span class="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[9px] font-black">${j.grupo_sanguineo}</span></td>
                                <td class="p-5"><button class="text-dibaBlue hover:text-dibaGold"><i class="fas fa-info-circle"></i></button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

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

    // Navegación Sidebar
    document.getElementById("view-players-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        loadPlayers();
    });

    // Cerrar sesión
    document.getElementById("logout-btn")?.addEventListener("click", cerrarSesion);

    // Carga inicial
    loadDocuments();
})();