(async () => {
  // ===============================================================
  // 1. CARGA E INICIALIZACIÓN
  // ===============================================================
  let supabase;
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q";
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.error("Error crítico:", error);
    return;
  }

  // ===============================================================
  // 2. REFERENCIAS DOM
  // ===============================================================
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("newDocument");
  const selectFileBtn = document.getElementById("selectFileBtn");
  const uploadedFilesSection = document.getElementById("uploadedFilesSection");
  const fileListContainer = document.getElementById("fileListContainer");
  const logoutBtn = document.getElementById("logout-btn");

  // ===============================================================
  // 3. PROTECCIÓN Y SESIÓN
  // ===============================================================
  async function checkAccess() {
    const { data: { session } } = await supabase.auth.getSession();
    const usuarioLocal = localStorage.getItem("usuario");
    
    if (!session && !usuarioLocal) {
      window.location.href = "login.html";
      return;
    }
  }
  await checkAccess();

  logoutBtn?.addEventListener("click", async () => {
    localStorage.removeItem("usuario");
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });

  // ===============================================================
  // 4. FUNCIONES DEL GESTOR
  // ===============================================================
  
  // Cargar archivos al inicio
  async function loadInitialFiles() {
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return console.error("Error al cargar:", error);

    if (documents && documents.length > 0) {
      uploadedFilesSection.classList.remove("hidden");
      fileListContainer.innerHTML = ''; // Limpiar antes de cargar
      documents.forEach(createFileEntryElement);
    }
  }

  // Subir archivo a Storage y Base de Datos
  async function handleFileUpload(file) {
    try {
      // Mostrar feedback visual de carga si fuera necesario
      const fileName = `${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase
        .from("documents")
        .insert({ file_name: file.name, storage_path: fileName })
        .select()
        .single();

      if (dbError) throw dbError;

      createFileEntryElement(data);
    } catch (error) {
      alert("Error al subir: " + error.message);
    }
  }

  // Crear el elemento visual del archivo (Tailwind Style)
  function createFileEntryElement(doc) {
    uploadedFilesSection.classList.remove("hidden");
    
    const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(doc.storage_path);
    
    const fileEntry = document.createElement("div");
    fileEntry.dataset.id = doc.id;
    fileEntry.className = `flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl transition-all animate__animated animate__fadeIn mb-3 ${doc.is_signed ? 'border-l-8 border-l-green-500 shadow-sm' : ''}`;

    const signStatus = doc.is_signed 
      ? `<span class="flex items-center gap-1 text-green-600 font-bold text-xs uppercase"><i class="fas fa-check-circle"></i> Firmado</span>`
      : `<button class="sign-btn bg-green-50 text-green-600 hover:bg-green-600 hover:text-white px-3 py-1 rounded-lg text-xs font-black transition-all uppercase">Firmar</button>`;

    fileEntry.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
          <i class="far fa-file-pdf text-lg"></i>
        </div>
        <div>
          <p class="font-bold text-slate-700 text-sm truncate max-w-[150px] md:max-w-xs">${doc.file_name}</p>
          <p class="text-[10px] text-slate-400 uppercase font-medium">${new Date(doc.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <a href="${publicUrlData.publicUrl}" target="_blank" class="p-2 text-slate-400 hover:text-dibaBlue transition-colors">
          <i class="fas fa-eye"></i>
        </a>
        ${signStatus}
      </div>
    `;
    
    fileListContainer.prepend(fileEntry);
  }

  // ===============================================================
  // 5. EVENTOS
  // ===============================================================
  
  // Delegación de eventos para el botón de firmar
  fileListContainer?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".sign-btn");
    if (!btn) return;

    const row = btn.closest("[data-id]");
    const id = row.dataset.id;

    try {
      const { error } = await supabase.from("documents").update({ is_signed: true }).eq("id", id);
      if (error) throw error;
      
      // Actualizar visualmente sin recargar
      loadInitialFiles(); 
    } catch (err) {
      alert("Error al firmar");
    }
  });

  // Configuración de Drag & Drop
  selectFileBtn?.addEventListener("click", () => fileInput.click());
  
  dropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-dibaGold", "bg-yellow-50");
  });

  dropZone?.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-dibaGold", "bg-yellow-50");
  });

  dropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-dibaGold", "bg-yellow-50");
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileUpload(files[0]);
  });

  fileInput?.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFileUpload(fileInput.files[0]);
      fileInput.value = "";
    }
  });

  // Inicio
  loadInitialFiles();

})();