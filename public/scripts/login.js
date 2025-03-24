// scripts/login.js

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Alternar formularios con un botón, si quieres un solo HTML
// ...

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    alert('Error al iniciar sesión: ' + error.message);
    return;
  }
  // Si todo va bien, redirige
  window.location.href = 'index.html';
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });
  if (error) {
    alert('Error al registrarse: ' + error.message);
    return;
  }
  alert('Te has registrado. Revisa tu correo si se requiere confirmación.');
  window.location.href = 'index.html';
});
