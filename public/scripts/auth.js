// scripts/auth.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://wdnlqfiwuocmmcdowjyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Tu Key
);

/**
 * Protege las páginas administrativas.
 * Se debe llamar al inicio de GestorDocumental.html, usuarios.html, etc.
 */
export async function verificarSesion() {
  const { data: { session } } = await supabase.auth.getSession();
  const usuarioLocal = localStorage.getItem("usuario");

  if (!session && !usuarioLocal) {
    window.location.href = "login.html";
  }
}

/**
 * Cierra la sesión en Supabase y limpia el navegador.
 */
export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error al salir:", error.message);
  }
  // Limpieza total
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}