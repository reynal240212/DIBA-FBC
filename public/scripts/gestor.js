import { supabase } from './supabaseClient.js';
import { verificarSesion, cerrarSesion } from './auth.js';

(async () => {
    // 1. SEGURIDAD: Verificar sesión (pero permitir ambos roles)
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    
    if (!usuario) {
        window.location.href = "/admin/login.html";
        return;
    }

    // 2. UI DINÁMICA: Adaptar la interfaz según el rol
    const navName = document.getElementById("nav-user-name");
    if (navName) navName.textContent = usuario.username;

    const uploadSection = document.querySelector('section.mb-12'); // Sección de subir archivos
    const pageTitle = document.querySelector('h1');
    const pageSub = document.querySelector('p.text-slate-500');

    // Si NO es admin, ocultamos la zona de carga y cambiamos textos
    if (usuario.role !== 'admin') {
        if (uploadSection) uploadSection.classList.add('hidden');
        if (pageTitle) pageTitle.textContent = "Mis Documentos";
        if (pageSub) pageSub.textContent = "Consulta tus archivos oficiales";
    }

    const fileListContainer = document.getElementById("fileListContainer");
    const uploadedFilesSection = document.getElementById("uploadedFilesSection");

    // 3. CARGA DE ARCHIVOS FILTRADA
    async function loadInitialFiles() {
        let query = supabase
            .from("documents")
            .select("*")
            .order("created_at", { ascending: false });

        // FILTRO CLAVE: Si no es admin, solo ve sus documentos
        // 'owner_id' debe coincidir con el ID del usuario logueado
        if (usuario.role !== 'admin') {
            query = query.eq('owner_id', usuario.id);
        }

        const { data: documents, error } = await query;

        if (error) return console.error("Error al cargar:", error);

        fileListContainer.innerHTML = ''; 
        if (documents?.length > 0) {
            uploadedFilesSection.classList.remove("hidden");
            documents.forEach(createFileEntryElement);
        } else {
            // Opcional: Mostrar mensaje de "No hay documentos"
            fileListContainer.innerHTML = '<p class="text-center text-slate-400 py-10">No hay documentos disponibles.</p>';
            uploadedFilesSection.classList.remove("hidden");
        }
    }

    // 4. SUBIDA (Solo funcional para Admin por lógica de UI)
    async function handleFileUpload(file) {
        if (usuario.role !== 'admin') return; // Doble validación de seguridad

        try {
            const fileName = `${Date.now()}-${file.name}`;
            const docType = document.getElementById('docTypeSelect').value;

            const { error: uploadError } = await supabase.storage
                .from("documents")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data, error: dbError } = await supabase
                .from("documents")
                .insert([{ 
                    file_name: file.name, 
                    storage_path: fileName,
                    owner_id: usuario.id, 
                    doc_type: docType 
                }])
                .select().single();

            if (dbError) throw dbError;
            createFileEntryElement(data);
            
        } catch (error) {
            alert("Error: " + error.message);
        }
    }

    // 5. ELEMENTO VISUAL
    function createFileEntryElement(doc) {
        const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(doc.storage_path);
        
        const fileEntry = document.createElement("div");
        fileEntry.dataset.id = doc.id;
        fileEntry.className = `flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl animate__animated animate__fadeIn mb-3 ${doc.is_signed ? 'border-l-8 border-l-green-500 shadow-sm' : ''}`;

        // Lógica de firma: Un usuario normal podría "firmar" su propio documento
        const status = doc.is_signed 
            ? `<span class="text-green-600 font-bold text-[10px] uppercase italic"><i class="fas fa-check-circle"></i> Firmado</span>`
            : `<button class="sign-btn bg-green-50 text-green-600 hover:bg-green-600 hover:text-white px-3 py-1 rounded-lg text-[10px] font-black transition-all uppercase italic">Firmar</button>`;

        fileEntry.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <i class="far fa-file-pdf text-lg"></i>
                </div>
                <div>
                    <p class="font-bold text-slate-700 text-sm truncate max-w-[200px] italic uppercase tracking-tighter">${doc.file_name}</p>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <a href="${publicUrl}" target="_blank" class="text-slate-400 hover:text-dibaBlue transition-colors"><i class="fas fa-eye"></i></a>
                ${status}
            </div>
        `;
        fileListContainer.prepend(fileEntry);
    }

    // Eventos
    document.getElementById("logout-btn")?.addEventListener("click", cerrarSesion);
    
    // Configurar el input de archivo si existe (solo admin)
    const newDocInput = document.getElementById('newDocument');
    newDocInput?.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFileUpload(e.target.files[0]);
    });

    loadInitialFiles();
})();