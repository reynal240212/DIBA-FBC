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

// scripts/main.js

// =======================
// LOGIN
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

      if (!response.ok) {
        const errorText = await response.text();
        alert("Error en el login: " + errorText);
        return;
      }

      const result = await response.json();
      alert("Bienvenido, " + result.user.nombre);
      localStorage.setItem("loggedUser", JSON.stringify(result.user));

      // Redirige a la página que quieras
      window.location.href = "profile.html";
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
        alert("Error en el registro: " + errorText);
        return;
      }

      const result = await response.json();
      alert(result.message);

      // Cierra el modal de registro (opcional) si no rediriges inmediatamente
      const modalRegistro = bootstrap.Modal.getInstance(document.getElementById("modalRegistro"));
      if (modalRegistro) {
        modalRegistro.hide();
      }

      // Redirige tras registrarse (o mantén al usuario en la misma página)
      // window.location.href = "profile.html";
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("Error al registrar usuario. Inténtalo de nuevo.");
    }
  });
}


// =======================
// SCROLL TIMELINE (Opcional)
// =======================
function scrollTimeline(direction) {
  const container = document.querySelector(".timeline-scroll");
  const scrollAmount = 300; 
  container.scrollLeft += direction * scrollAmount;
}
