// Configuración de Supabase
const SUPABASE_URL = "https://wfssnnhewzchttudpsex.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmc3Nubmhld3pjaHR0dWRwc2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5ODExNTQsImV4cCI6MjA1NzU1NzE1NH0.j2uEikVy5cM0yY7Rdr4D5BKv95xrn1j48IOuVdbI0Mg";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Lógica de Login con Email y Contraseña
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    
    if (error) {
        document.getElementById("login-error").textContent = "Error: " + error.message;
    } else {
        alert("Bienvenido, " + data.user.email);
        localStorage.setItem("loggedUser", JSON.stringify(data.user));
        window.location.href = "index.html";  // Redirige a la página principal
    }
});

// Lógica de Registro con Email y Contraseña
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    
    if (error) {
        document.getElementById("register-error").textContent = "Error: " + error.message;
    } else {
        alert("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
        localStorage.setItem("loggedUser", JSON.stringify(data.user));
        window.location.href = "index.html";  // Redirige a la página principal
    }
});

// Lógica de Inicio de Sesión con Google
document.getElementById("google-login-btn").addEventListener("click", async () => {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
        alert("Error al iniciar sesión con Google: " + error.message);
    }
    // Google se encargará de redirigir a la Callback URL configurada en Supabase
});
