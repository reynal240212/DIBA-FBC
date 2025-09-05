// Reemplaza con tus propias claves de Supabase
const SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q";

// Inicializa el cliente de Supabase
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
document.addEventListener("DOMContentLoaded", function () {
  // Referencias a los elementos del DOM (sin cambios)
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("newDocument");
  const selectFileBtn = document.getElementById("selectFileBtn");
  const uploadedFilesSection = document.getElementById("uploadedFilesSection");
  const fileListContainer = document.getElementById("fileListContainer");

  // ===============================================================
  // NUEVO: CARGAR DOCUMENTOS EXISTENTES AL INICIAR
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

  // ===============================================================
  // FUNCIÓN CENTRAL PARA PROCESAR Y SUBIR EL ARCHIVO A SUPABASE
  // ===============================================================
  async function handleFileUpload(file) {
    try {
      // 1. Crear un nombre de archivo único para evitar colisiones
      const fileName = `${Date.now()}-${file.name}`;

      // 2. Subir el archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents") // Nombre del bucket
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 3. Si la subida es exitosa, guardar la referencia en la base de datos
      const { data, error: dbError } = await supabase
        .from("documents")
        .insert({
          file_name: file.name,
          storage_path: fileName, // Guardamos la ruta para futuras referencias
        })
        .select()
        .single(); // .select().single() devuelve el objeto recién creado

      if (dbError) throw dbError;

      // 4. Crear el elemento visual en la lista
      createFileEntryElement(data);
    } catch (error) {
      console.error("Error al subir el archivo:", error.message);
      alert(
        "No se pudo subir el archivo. Revisa la consola para más detalles."
      );
    }
  }

  // ===============================================================
  // NUEVO: FUNCIÓN REUTILIZABLE PARA CREAR EL ELEMENTO HTML
  // ===============================================================
  function createFileEntryElement(doc) {
    if (uploadedFilesSection.classList.contains("d-none")) {
      uploadedFilesSection.classList.remove("d-none");
    }

    // Obtener la URL pública del archivo para el botón "Ver"
    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(doc.storage_path);

    const fileEntry = document.createElement("div");
    // Añadir el ID de la base de datos al elemento para poder encontrarlo después
    fileEntry.dataset.id = doc.id;
    fileEntry.className =
      "list-group-item d-flex justify-content-between align-items-center";

    // Lógica para mostrar el botón como "Firmar" o "Firmado"
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
    fileListContainer.prepend(fileEntry); // Usamos prepend para que los nuevos aparezcan arriba
  }

  // ===============================================================
  // LÓGICA PARA EL BOTÓN DE FIRMA (ADAPTADA A SUPABASE)
  // ===============================================================
  fileListContainer.addEventListener("click", async function (event) {
    const signButton = event.target.closest(".sign-btn");
    if (!signButton) return;

    signButton.disabled = true;
    const fileEntryRow = signButton.closest(".list-group-item");
    const docId = fileEntryRow.dataset.id; // Obtenemos el ID del documento

    try {
      // Actualizar el registro en la base de datos de Supabase
      const { error } = await supabase
        .from("documents")
        .update({ is_signed: true, signed_at: new Date() })
        .eq("id", docId);

      if (error) throw error;

      // Si la actualización es exitosa, actualizamos la UI
      signButton.classList.replace("btn-outline-success", "btn-success");
      signButton.innerHTML = `<i class="fas fa-check"></i> Firmado`;
      signButton.title = "Documento Firmado";
      fileEntryRow.classList.add("signed-success");
    } catch (error) {
      console.error("Error al firmar el documento:", error.message);
      alert("No se pudo firmar el documento.");
      signButton.disabled = false; // Habilitar de nuevo si falla
    }
  });

  // ===============================================================
  // MANEJADORES DE EVENTOS PARA LA ZONA DE "DRAG & DROP" (SIN CAMBIOS FUNCIONALES)
  // ===============================================================
  selectFileBtn.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("click", (e) => {
    if (e.target.id !== "selectFileBtn") fileInput.click();
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFileUpload(fileInput.files[0]); // Llamamos a la nueva función
      fileInput.value = "";
    }
  });
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      false
    );
  });
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(
      eventName,
      () => dropZone.classList.add("drag-over"),
      false
    );
  });
  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(
      eventName,
      () => dropZone.classList.remove("drag-over"),
      false
    );
  });
  dropZone.addEventListener(
    "drop",
    (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]); // Llamamos a la nueva función
      }
    },
    false
  );

  // Iniciar la aplicación cargando los archivos existentes
  loadInitialFiles();
});
