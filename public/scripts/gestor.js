// Usamos una función asíncrona que se ejecuta a sí misma (IIFE).
// Esto crea un "entorno" privado y seguro para nuestro código.
(async () => {
  // ===============================================================
  // PASO 1: CARGA E INICIALIZACIÓN DE DEPENDENCIAS
  // El código esperará aquí hasta que Supabase esté listo.
  // ===============================================================
  let supabase;
  try {
    // Importamos dinámicamente la función 'createClient' desde la librería de Supabase.
    // El 'await' pausa la ejecución hasta que la librería se haya cargado.
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');

    // Ahora que es seguro, inicializamos el cliente.
    const SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q";
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  } catch (error) {
    // Si la librería o la inicialización fallan, la app no puede funcionar.
    console.error("Error fatal: No se pudo cargar o inicializar Supabase.", error);
    alert("Error crítico: No se pudo conectar con la base de datos. Por favor, recarga la página.");
    return; // Detenemos la ejecución del script.
  }

  // ===============================================================
  // PASO 2: REFERENCIAS A LOS ELEMENTOS DEL DOM
  // Se ejecutan solo si Supabase se inicializó correctamente.
  // ===============================================================
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("newDocument");
  const selectFileBtn = document.getElementById("selectFileBtn");
  const uploadedFilesSection = document.getElementById("uploadedFilesSection");
  const fileListContainer = document.getElementById("fileListContainer");

  // ===============================================================
  // PASO 3: DEFINICIÓN DE FUNCIONES DE LA APLICACIÓN
  // (El código de tus funciones no cambia, solo vive aquí dentro)
  // ===============================================================

  async function loadInitialFiles() {
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error al cargar los documentos:", error);
      return;
    }
    if (documents.length > 0) {
      uploadedFilesSection.classList.remove("d-none");
      documents.forEach(createFileEntryElement);
    }
  }

  async function handleFileUpload(file) {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data, error: dbError } = await supabase.from("documents").insert({ file_name: file.name, storage_path: fileName }).select().single();
      if (dbError) throw dbError;
      createFileEntryElement(data);
    } catch (error) {
      console.error("Error al subir el archivo:", error.message);
      alert("No se pudo subir el archivo. Revisa la consola.");
    }
  }

  function createFileEntryElement(doc) {
    if (uploadedFilesSection.classList.contains("d-none")) {
      uploadedFilesSection.classList.remove("d-none");
    }
    const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(doc.storage_path);
    const fileEntry = document.createElement("div");
    fileEntry.dataset.id = doc.id;
    fileEntry.className = "list-group-item d-flex justify-content-between align-items-center";
    const signButtonHtml = doc.is_signed
      ? `<button type="button" class="btn btn-success btn-sm" title="Documento Firmado" disabled><i class="fas fa-check"></i> Firmado</button>`
      : `<button type="button" class="btn btn-outline-success btn-sm sign-btn" title="Firmar documento"><i class="fas fa-pen-to-square"></i></button>`;
    if (doc.is_signed) {
      fileEntry.classList.add("signed-success");
    }
    fileEntry.innerHTML = `
      <span><i class="far fa-file-alt me-2"></i>${doc.file_name}</span>
      <div class="btn-group" role="group">
        <a href="${publicUrlData.publicUrl}" target="_blank" class="btn btn-outline-secondary btn-sm" title="Ver documento"><i class="fas fa-eye"></i></a>
        ${signButtonHtml}
      </div>
    `;
    fileListContainer.prepend(fileEntry);
  }

  // ===============================================================
  // PASO 4: ASIGNACIÓN DE MANEJADORES DE EVENTOS
  // ===============================================================

  fileListContainer.addEventListener("click", async function (event) {
    const signButton = event.target.closest(".sign-btn");
    if (!signButton) return;
    signButton.disabled = true;
    const fileEntryRow = signButton.closest(".list-group-item");
    const docId = fileEntryRow.dataset.id;
    try {
      const { error } = await supabase.from("documents").update({ is_signed: true, signed_at: new Date() }).eq("id", docId);
      if (error) throw error;
      signButton.classList.replace("btn-outline-success", "btn-success");
      signButton.innerHTML = `<i class="fas fa-check"></i> Firmado`;
      signButton.title = "Documento Firmado";
      fileEntryRow.classList.add("signed-success");
    } catch (error) {
      console.error("Error al firmar el documento:", error.message);
      alert("No se pudo firmar el documento.");
      signButton.disabled = false;
    }
  });

  selectFileBtn.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("click", (e) => {
    if (e.target.id !== "selectFileBtn") fileInput.click();
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFileUpload(fileInput.files[0]);
      fileInput.value = "";
    }
  });
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
  });
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add("drag-over"), false);
  });
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove("drag-over"), false);
  });
  dropZone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileUpload(files[0]);
  }, false);

  // ===============================================================
  // PASO 5: INICIAR LA APLICACIÓN
  // ===============================================================
  loadInitialFiles();

})(); // Los paréntesis finales () ejecutan la función inmediatamente.