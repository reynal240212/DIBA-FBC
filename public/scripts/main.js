/* ================================
   BOTÓN VOLVER ARRIBA
=================================== */
const btnVolverArriba = document.getElementById("btnVolverArriba");
window.addEventListener("scroll", () => {
  btnVolverArriba.style.display = window.scrollY > 300 ? "block" : "none";
});
btnVolverArriba?.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);

/* ================================
   FILTRO DE CATEGORÍAS
=================================== */
document.querySelectorAll(".category-buttons .btn").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.getAttribute("data-category");
    document.querySelectorAll(".player-card").forEach((card) => {
      card.style.display =
        category === "all" || card.dataset.category === category
          ? "block"
          : "none";
    });
  });
});

/* ================================
   LOGIN Y REGISTRO
=================================== */
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("email-login").value;
  const password = document.getElementById("password-login").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Error en el inicio de sesión: " + error.message);
  } else {
    alert("Inicio de sesión exitoso");
    window.location.href = "index.html";
  }
}

async function handleRegistro(event) {
  event.preventDefault();
  const email = document.getElementById("email-registro").value;
  const password = document.getElementById("password-registro").value;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert("Error en el registro: " + error.message);
  } else {
    alert("Registro exitoso. Verifica tu correo.");
  }
}

/* ================================
   LOGIN CON GOOGLE
=================================== */
function handleCredentialResponse(response) {
  console.log("Google ID Token: ", response.credential);
  alert("Inicio de sesión con Google exitoso");
}

/* ================================
   SESIÓN Y LOGOUT
=================================== */
async function checkSessionOrRedirect() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
  }
}

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

/* ================================
   CARRUSEL DE PARTIDOS
=================================== */
const partidos = document.querySelectorAll(".carousel-item");
let currentIndex = 0;

function showPartido(index) {
  partidos.forEach((partido, i) => {
    partido.classList.toggle("active", i === index);
  });
}

document.getElementById("btnPrevPartido")?.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + partidos.length) % partidos.length;
  showPartido(currentIndex);
});

document.getElementById("btnNextPartido")?.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % partidos.length;
  showPartido(currentIndex);
});

/* ================================
   EXPORTAR FUNCIONES AL GLOBAL
=================================== */
window.handleLogin = handleLogin;
window.handleRegistro = handleRegistro;
window.handleCredentialResponse = handleCredentialResponse;
window.checkSessionOrRedirect = checkSessionOrRedirect;
window.signOut = signOut;