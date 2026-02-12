// 1. Configuración de Supabase

import { supabase } from './supabaseClient.js';

// 2. Lógica del Formulario (Se ejecuta solo si existe el formulario en la página)
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
                // Consulta a la tabla 'users'
                const { data: user, error } = await supabase
                    .from('usuarios')
                    .select('id, username, password')
                    .eq('username', username)
                    .eq('password', password)
                    .single();

                if (error || !user) throw new Error("Credenciales incorrectas");

                // Guardar sesión
                localStorage.setItem("usuario", JSON.stringify(user));

                // Redirección inteligente
                if (user.role === 'admin') {
                    window.location.href = "GestorDocumental.html";
                } else {
                    window.location.href = "MisDocumentos.html";
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

// 3. Funciones de Protección (Para usar en otras páginas)
export async function verificarSesion(rolRequerido = null) {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioLocal) {
        window.location.href = "login.html";
        return;
    }

    if (rolRequerido && usuarioLocal.role !== rolRequerido) {
        alert("Acceso restringido.");
        window.location.href = usuarioLocal.role === 'admin' 
            ? "GestorDocumental.html" 
            : "MisDocumentos.html";
    }
}

export async function cerrarSesion() {
    localStorage.removeItem("usuario");
    await supabase.auth.signOut();
    window.location.href = "login.html";
}