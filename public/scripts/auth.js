import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
      if (btnText) btnText.textContent = "Validando...";

      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();

      try {
        // CAMBIO CLAVE: Se usa 'password_hash' para coincidir con tu tabla 'users'
        const { data: user, error } = await supabase
          .from('users')
          .select('id, username, password_hash, role, full_name')
          .eq('username', username)
          .eq('password_hash', password)
          .single();

        if (error || !user) throw new Error("Credenciales incorrectas");

        localStorage.setItem("usuario", JSON.stringify(user));

        if (user.role === 'admin') {
          window.location.href = "GestorDocumental.html";
        } else {
          window.location.href = "MisDocumentos.html";
        }

      } catch (err) {
        alert("Error: " + err.message);
        loginButton.disabled = false;
        spinner?.classList.add('hidden');
        if (btnText) btnText.textContent = "Iniciar Sesión";
      }
    });
  }
});

export async function verificarSesion(rolRequerido = null) {
  const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
  if (!usuarioLocal) {
    window.location.href = "login.html";
    return;
  }
  if (rolRequerido && usuarioLocal.role !== rolRequerido) {
    window.location.href = usuarioLocal.role === 'admin' ? "GestorDocumental.html" : "MisDocumentos.html";
  }
}

export async function cerrarSesion() {
  localStorage.removeItem("usuario");
  await supabase.auth.signOut();
  window.location.href = "login.html";
}