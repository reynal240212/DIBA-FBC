// auth.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://wdnlqfiwuocmmcdowjyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q"
);

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