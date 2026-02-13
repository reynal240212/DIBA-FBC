import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const loginButton = document.getElementById('login-button');
            const spinner = loginButton.querySelector('.spinner');
            const btnText = loginButton.querySelector('.button-text');

            loginButton.disabled = true;
            spinner?.classList.remove('hidden');
            if(btnText) btnText.textContent = "Validando...";

            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();

            try {
                // Consulta a la tabla 'usuarios'
                const { data: user, error } = await supabase
                    .from('usuarios')
                    .select('id, username, password, role')
                    .eq('username', username)
                    .eq('password', password)
                    .single();

                if (error || !user) throw new Error("Credenciales incorrectas");

                // Guardar sesión
                localStorage.setItem("usuario", JSON.stringify(user));

                // REDIRECCIÓN DINÁMICA CON RUTAS ABSOLUTAS
                // Esto busca el archivo dentro de public/admin/ sin importar dónde estés
                if (user.role === 'admin') {
                    window.location.href = "/admin/GestorDocumental.html";
                } else {
                    window.location.href = "/admin/MisDocumentos.html";
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
 * Función para proteger las páginas
 */
export async function verificarSesion(rolRequerido = null) {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioLocal) {
        // Si no hay sesión, siempre vuelve al login en la raíz de admin
        window.location.href = "/admin/login.html";
        return;
    }

    if (rolRequerido && usuarioLocal.role !== rolRequerido) {
        alert("Acceso restringido.");
        window.location.href = usuarioLocal.role === 'admin' 
            ? "/admin/GestorDocumental.html" 
            : "/admin/MisDocumentos.html";
    }
}

export async function cerrarSesion() {
    localStorage.removeItem("usuario");
    await supabase.auth.signOut();
    window.location.href = "/admin/login.html";
}