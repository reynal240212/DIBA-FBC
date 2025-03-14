// Botón "Volver arriba"
window.addEventListener("scroll", function () {
  let btn = document.getElementById("btnBackToTop");
  if (btn) {
    btn.style.display = window.scrollY > 300 ? "block" : "none";
  }
});

const btnBackToTop = document.getElementById("btnBackToTop");
if (btnBackToTop) {
  btnBackToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Funcionalidad de categorías (si usas .category-buttons .btn)
const btns = document.querySelectorAll(".category-buttons .btn");
const containers = document.querySelectorAll(".category-container");

if (btns.length > 0 && containers.length > 0) {
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      containers.forEach((cont) => cont.classList.remove("active"));
      btn.classList.add("active");
      const id = btn.getAttribute("data-category");
      const targetContainer = document.getElementById(id);
      if (targetContainer) {
        targetContainer.classList.add("active", "animate__animated", "animate__fadeIn");
      }
    });
  });
}

/// LOGIN
// =======================
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("loginCorreo").value.trim();
    const clave = document.getElementById("loginClave").value;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password: clave }),
      });

      // Si la respuesta no es OK (por ejemplo, 401 o 404), capturamos error
      if (!response.ok) {
        const errorText = await response.text();
        alert("Error: " + errorText);
        return;
      }

      const result = await response.json();
      alert("Bienvenido, " + result.user.nombre);

      // Guardar usuario en localStorage
      localStorage.setItem("loggedUser", JSON.stringify(result.user));

      // Redirigir a la página principal (o la que quieras)
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error en el login:", error);
      alert("Error al iniciar sesión. Inténtalo de nuevo.");
    }
  });
}

// =======================
// REGISTRO
// =======================
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("regNombre").value.trim();
    const correo = document.getElementById("regCorreo").value.trim();
    const password = document.getElementById("regPassword").value;
    const fechaNac = document.getElementById("regFechaNac").value;

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password, fechaNac }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert("Error: " + errorText);
        return;
      }

      const result = await response.json();
      alert(result.message);

      // Redirigir tras registrarse
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("Error al registrar usuario. Inténtalo de nuevo.");
    }
  });
}

// =======================
// INICIO DE SESIÓN CON GOOGLE (Opcional)
// =======================
function handleCredentialResponse(response) {
  try {
    const data = JSON.parse(atob(response.credential.split(".")[1])); // Decodificar JWT
    console.log(data);
    // Guardar la información en localStorage
    localStorage.setItem("loggedUser", JSON.stringify(data));
    // Redirigir a la página principal
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error al procesar la respuesta de Google:", error);
  }
}

// =======================
// SCROLL TIMELINE (Opcional)
// =======================
function scrollTimeline(direction) {
  const container = document.querySelector(".timeline-scroll");
  const scrollAmount = 300; 
  container.scrollLeft += direction * scrollAmount;
}
