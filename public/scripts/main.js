// main.js
// Archivo principal para gestionar eventos y la lógica general de la aplicación

document.addEventListener("DOMContentLoaded", () => {
    console.log("Aplicación cargada correctamente");
  
    // Selecciona el botón para activar el menú y el contenedor del menú
    const menuToggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu");
  
    // Si ambos elementos existen, añade el evento para alternar la clase 'active'
    if (menuToggle && menu) {
      menuToggle.addEventListener("click", () => {
        menu.classList.toggle("active");
      });
    } else {
      console.warn("No se encontró el elemento 'menu-toggle' o 'menu'. Verifica que existan en el HTML.");
    }
  });
  