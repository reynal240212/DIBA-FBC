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
                const { data: user, error } = await supabase
                    .from('usuarios')
                    .select('id, username, password, role')
                    .eq('username', username)
                    .eq('password', password)
                    .single();

                if (error || !user) throw new Error("Credenciales incorrectas");

                // Guardar sesión en el navegador
                localStorage.setItem("usuario", JSON.stringify(user));

                // REDIRECCIÓN ÚNICA: Todos van al mismo archivo
                window.location.href = "/admin/GestorDocumental.html";

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
        window.location.href = "/admin/login.html";
        return;
    }

    // Si la página requiere un rol específico (ej. 'admin') y el usuario no lo tiene
    if (rolRequerido && usuarioLocal.role !== rolRequerido) {
        alert("No tienes permisos para acceder a esta sección.");
        // Lo devolvemos a la página principal del gestor
        window.location.href = "/admin/GestorDocumental.html";
    }
}

export async function cerrarSesion() {
    localStorage.removeItem("usuario");
    await supabase.auth.signOut();
    window.location.href = "/admin/login.html";
}