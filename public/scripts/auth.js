// auth.js
import { supabase } from "./supabaseClient.js";

/**
 * Inicia sesión con Supabase Auth
 */
export async function iniciarSesion(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Guardar datos básicos en localStorage para compatibilidad con código existente
  localStorage.setItem("usuario", JSON.stringify({
    id: data.user.id,
    email: data.user.email,
    role: data.user.user_metadata?.role || 'admin' // Por defecto admin si no hay meta
  }));

  return data;
}

/**
 * Verifica la sesión real en Supabase
 */
export async function verificarSesion(rolRequerido = null) {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    console.warn("Acceso denegado: No hay sesión activa.");
    if (!window.location.pathname.includes('login.html')) {
      window.location.replace("/admin/login.html");
    }
    return null;
  }

  const user = session.user;
  const usuarioLocal = {
    id: user.id,
    email: user.email,
    role: user.user_metadata?.role || 'admin'
  };

  // Guardar en local para rapidez en UI
  localStorage.setItem("usuario", JSON.stringify(usuarioLocal));

  if (rolRequerido && usuarioLocal.role !== rolRequerido) {
    alert("⚠️ No tienes permisos para acceder a esta sección.");
    window.location.replace("/admin/GestorDocumental.html");
    return usuarioLocal;
  }

  return usuarioLocal;
}

/**
 * Cierra la sesión
 */
export async function cerrarSesion() {
  try {
    localStorage.removeItem("usuario");
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
  } finally {
    window.location.replace("/admin/login.html");
  }
}

/**
 * Envia un correo de recuperación de contraseña
 */
export async function enviarCorreoRecuperacion(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/update-password.html`,
  });
  if (error) throw error;
  return data;
}

/**
 * Actualiza la contraseña del usuario (requiere haber llegado desde el link del correo)
 */
export async function actualizarPassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}
