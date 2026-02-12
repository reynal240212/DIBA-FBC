import { supabase } from './supabaseClient.js';
import { verificarSesion, cerrarSesion } from './auth.js';

(async () => {
    // 1. SEGURIDAD: Verificar que sea admin y corregir rutas de redirección
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.role !== 'admin') {
        window.location.href = "../login.html"; // Sube un nivel desde /admin/
        return;
    }

    // 2. UI DINÁMICA: Saludo personalizado
    const navName = document.getElementById("nav-user-name");
    if (navName) navName.textContent = usuario.username;

    const fileListContainer = document.getElementById("fileListContainer");
    const uploadedFilesSection = document.getElementById("uploadedFilesSection");

    // 3. CARGA DE ARCHIVOS
    async function loadInitialFiles() {
        const { data: documents, error } = await supabase
            .from("documents")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) return console.error("Error al cargar:", error);

        fileListContainer.innerHTML = ''; 
        if (documents?.length > 0) {
            uploadedFilesSection.classList.remove("hidden");
            documents.forEach(createFileEntryElement);
        }
    }

    // 4. SUBIDA PROFESIONAL (Storage + DB)
    async function handleFileUpload(file) {
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const docType = document.getElementById('docTypeSelect').value;

            // A. Subir al Storage Bucket
            const { error: uploadError } = await supabase.storage
                .from("documents")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // B. Registrar en la tabla 'documents' con owner_id numérico
            const { data, error: dbError } = await supabase
                .from("documents")
                .insert([{ 
                    file_name: file.name, 
                    storage_path: fileName,
                    owner_id: usuario.id, // ID serial de tu tabla usuarios
                    doc_type: docType 
                }])
                .select().single();

            if (dbError) throw dbError;
            createFileEntryElement(data);
            
        } catch (error) {
            alert("Error: " + error.message);
        }
    }

    // 5. ELEMENTO VISUAL (createFileEntryElement)
    function createFileEntryElement(doc) {
        const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(doc.storage_path);
        
        const fileEntry = document.createElement("div");
        fileEntry.dataset.id = doc.id;
        fileEntry.className = `flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl animate__animated animate__fadeIn mb-3 ${doc.is_signed ? 'border-l-8 border-l-green-500 shadow-sm' : ''}`;

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

    // ... (Eventos de Logout y Drag&Drop se mantienen igual)
    document.getElementById("logout-btn")?.addEventListener("click", cerrarSesion);
    loadInitialFiles();
})();