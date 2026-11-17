// DIBA FBC - Core Authentication Service
import { supabase } from "./supabase.js";

/**
 * Log in with Supabase Auth
 */
export async function iniciarSesion(username, password) {
    const email = username.includes('@') ? username : `${username}@diba.com`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

    const usuarioLocal = {
        id: data.user.id,
        username,
        email: data.user.email,
        role: userData?.role || 'authenticated'
    };

    localStorage.setItem("usuario", JSON.stringify(usuarioLocal));
    return { ...data, role: usuarioLocal.role };
}

/**
 * Check if role belongs to staff (admin or tecnico)
 */
export function esRolStaff(role) {
    return role === 'admin' || role === 'tecnico';
}

/**
 * Resolve dashboard path based on user role
 */
export function obtenerRutaPorRol(role) {
    return esRolStaff(role) ? '/admin/dashboard.html' : '/perfil.html';
}

/**
 * Log in with Google (OAuth)
 */
export async function iniciarSesionGoogle(redirectPath = '/perfil.html') {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + redirectPath }
    });
    if (error) throw error;
    return data;
}

/**
 * Sign out and clean local state
 */
export async function cerrarSesion() {
    try {
        localStorage.removeItem("usuario");
        await supabase.auth.signOut();
    } catch (err) {
        console.error("Logout error:", err);
    } finally {
        window.location.replace("/admin/login.html");
    }
}

/**
 * Real-time session verification
 */
export async function verificarSesion(rolRequerido = null) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        if (rolRequerido) window.location.replace("/admin/login.html");
        return null;
    }

    const { user } = session;
    const { data: userData } = await supabase
        .from('users')
        .select('role, full_name, username')
        .eq('id', user.id)
        .single();

    const usuarioLocal = {
        id: user.id,
        email: user.email,
        username: userData?.username || user.email.split('@')[0],
        full_name: userData?.full_name || user.user_metadata?.full_name || '',
        role: userData?.role || 'authenticated'
    };

    localStorage.setItem("usuario", JSON.stringify(usuarioLocal));

    const tienePermiso = !rolRequerido
        || usuarioLocal.role === rolRequerido
        || usuarioLocal.role === 'admin'
        || (esRolStaff(rolRequerido) && esRolStaff(usuarioLocal.role));

    if (!tienePermiso) {
        alert("⚠️ Acceso denegado.");
        window.location.replace(obtenerRutaPorRol(usuarioLocal.role));
        return usuarioLocal;
    }

    return usuarioLocal;
}
