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