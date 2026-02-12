// Usamos ruta absoluta para que funcione en cualquier nivel de carpeta en Vercel
import { supabase } from '/scripts/supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const loginButton = document.getElementById('login-button');
            const spinner = loginButton.querySelector('.spinner');
            const btnText = loginButton.querySelector('.button-text');

            // Estado de carga UI
            loginButton.disabled = true;
            spinner?.classList.remove('hidden');
            if(btnText) btnText.textContent = "Validando...";

            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();

            try {
                // Consulta a la tabla 'usuarios'
                // Importante: La columna 'role' debe existir en tu tabla de Supabase
                const { data: user, error } = await supabase
                    .from('usuarios')
                    .select('id, username, password, role')
                    .eq('username', username)
                    .eq('password', password)
                    .single();

                if (error || !user) throw new Error("Credenciales incorrectas");

                // Guardar sesión en el navegador
                localStorage.setItem("usuario", JSON.stringify(user));

                // REDIRECCIÓN CORREGIDA:
                // Si el archivo 'MisDocumentos.html' no existe, usamos 'profile.html'
                if (user.role === 'admin') {
                    window.location.href = "/admin/GestorDocumental.html";
                } else {
                    // Redirigimos a una página que SÍ existe en tu estructura
                    window.location.href = "/admin/profile.html"; 
                }

            } catch (err) {
                alert("Error: " + err.message);
                loginButton.disabled = false;
                spinner?.classList.add('hidden');
                if(btnText) btnText.textContent = "Iniciar Sesión";
            }
        });
    }
});

/**
 * Función para proteger las páginas (Evita acceso por URL directa)
 */
export async function verificarSesion(rolRequerido = null) {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioLocal) {
        // Si no hay sesión, vuelve al login siempre con ruta absoluta
        window.location.href = "/admin/login.html";
        return;
    }

    // Validación de roles para páginas administrativas
    if (rolRequerido && usuarioLocal.role !== rolRequerido) {
        alert("Acceso restringido.");
        window.location.href = usuarioLocal.role === 'admin' 
            ? "/admin/GestorDocumental.html" 
            : "/admin/profile.html";
    }
}

/**
 * Función para cerrar sesión
 */
export async function cerrarSesion() {
    localStorage.removeItem("usuario");
    await supabase.auth.signOut();
    window.location.href = "/admin/login.html";
}