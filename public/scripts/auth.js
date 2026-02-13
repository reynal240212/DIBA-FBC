// auth.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://wdnlqfiwuocmmcdowjyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q"
);

/**
 * Verifica si el usuario está autenticado y si tiene el rol permitido.
 * @param {string|null} rolRequerido - El rol necesario para ver la página (opcional).
 */
export async function verificarSesion(rolRequerido = null) {
  // 1. Obtener los datos guardados en el login
  const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

  // 2. Si no hay datos en localStorage, mandarlo al login
  if (!usuarioLocal) {
    window.location.href = "/admin/login.html";
    return;
  }

  // 3. (Opcional) Si quieres restringir partes de GestorDocumental solo a admin
  if (rolRequerido && usuarioLocal.role !== rolRequerido) {
    alert("⚠️ No tienes permisos para acceder a esta sección.");
    // Redirigir a la base del gestor si intenta entrar a algo prohibido
    window.location.href = "/admin/GestorDocumental.html";
  }
}

/**
 * Limpia la sesión y redirige al login.
 */
export async function cerrarSesion() {
  // Limpiar localStorage
  localStorage.removeItem("usuario");
  
  // Cerrar sesión en Supabase (si usas Auth oficial)
  await supabase.auth.signOut();
  
  // Redirigir usando ruta absoluta para evitar errores de carpeta
  window.location.href = "/admin/login.html";
}