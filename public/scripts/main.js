document.addEventListener("DOMContentLoaded", function () {
  configurarMenu();
  cargarJugadores();
});

let jugadores = [];

function configurarMenu() {
  document.querySelector(".menu-toggle").addEventListener("click", function () {
      document.querySelector(".nav-links").classList.toggle("active");
  });
}

function cargarJugadores() {
  fetch("data/Ficha de Registro de Jugadores DIBA FBC.csv")
      .then(response => response.text())
      .then(data => procesarCSV(data))
      .catch(error => console.error("Error al cargar el CSV:", error));
}

function procesarCSV(texto) {
  const lineas = texto.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lineas.length < 2) {
      console.error("El archivo CSV parece vacío o incorrecto.");
      return;
  }

  const separador = texto.includes(";") ? ";" : texto.includes("\t") ? "\t" : ",";
  const headers = lineas[0].split(separador).map(h => h.trim());

  jugadores = lineas.slice(1).map(linea => {
      const valores = linea.split(separador);
      let jugador = {};
      headers.forEach((header, index) => {
          jugador[header] = valores[index] ? valores[index].trim() : "";
      });
      return jugador;
  });

  console.log("Jugadores cargados:", jugadores);
}

function buscarJugador() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (query === "") {
      alert("Por favor, ingresa un nombre.");
      return;
  }

  const jugadorEncontrado = jugadores.find(jugador =>
      (jugador["Nombres"] && jugador["Nombres"].toLowerCase().includes(query)) ||
      (jugador["Apellidos"] && jugador["Apellidos"].toLowerCase().includes(query))
  );

  if (!jugadorEncontrado) {
      alert("No se encontraron jugadores con ese nombre.");
      return;
  }

  const params = new URLSearchParams();
  for (let key in jugadorEncontrado) {
      params.append(encodeURIComponent(key), encodeURIComponent(jugadorEncontrado[key]));
  }

  window.location.href = `ficha.html?${params.toString()}`;
}
// scripts/main.js

// Funcionalidad del Login
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
      // Redirige a index.html tras un login exitoso
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error en el login:", error);
      alert("Error al iniciar sesión. Inténtalo de nuevo.");
    }
  });
}

// Funcionalidad del Registro
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
      
      // Cierra el modal de registro
      const modalRegistro = bootstrap.Modal.getInstance(document.getElementById("modalRegistro"));
      if (modalRegistro) modalRegistro.hide();

      // Redirige a index.html tras un registro exitoso
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("Error al registrar usuario. Inténtalo de nuevo.");
    }
  });
}

// Manejo de inicio de sesión con Google (opcional)
function handleCredentialResponse(response) {
  try {
    const data = JSON.parse(atob(response.credential.split(".")[1]));
    console.log(data);
    localStorage.setItem("loggedUser", JSON.stringify(data));
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error al procesar la respuesta de Google:", error);
  }
}

// Función adicional de scroll (opcional)
function scrollTimeline(direction) {
  const container = document.querySelector(".timeline-scroll");
  const scrollAmount = 300;
  container.scrollLeft += direction * scrollAmount;
}
