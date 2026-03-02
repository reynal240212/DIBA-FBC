// auth.js
// Las credenciales se leen del config.js centralizado (window.DIBA_CONFIG)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Verifica la sesión y el rol.
 */
export async function verificarSesion(rolRequerido = null) {
  const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

  // 1. Si no hay usuario, redirigir al login
  if (!usuarioLocal) {
    console.warn("Acceso denegado: No hay sesión activa.");
    // Usamos rutas relativas al root para evitar bucles según la carpeta
    window.location.replace("/admin/login.html");
    return null;
  }

  // 2. Si hay usuario pero el rol no coincide
  if (rolRequerido && usuarioLocal.role !== rolRequerido) {
    alert("⚠️ No tienes permisos para acceder a esta sección.");
    window.location.replace("/admin/GestorDocumental.html");
    return usuarioLocal;
  }

  return usuarioLocal;
}

/**
 * Cierra la sesión de forma segura
 */
export async function cerrarSesion() {
  try {
    // Limpiar datos locales primero para feedback instantáneo
    localStorage.removeItem("usuario");

    // Intentar cerrar sesión en Supabase
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
  } finally {
    // Siempre redirigir al login al final
    window.location.replace("/admin/login.html");
  }
}