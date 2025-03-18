// loadComponents.js
// Este archivo se encarga de cargar componentes dinámicos (Navbar, Hero, Footer) desde archivos externos

document.addEventListener("DOMContentLoaded", () => {
    // Se cargan los componentes especificando el ID base y la ruta del archivo correspondiente
    loadComponent("navbar", "layout/navbar.html");
    loadComponent("hero", "layout/hero.html");
    loadComponent("footer", "layout/footer.html");
  });
  
  function loadComponent(componentId, filePath) {
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al cargar " + filePath);
        }
        return response.text();
      })
      .then(data => {
        // Se busca el contenedor con ID: [componentId]-container (por ejemplo, "navbar-container")
        const container = document.getElementById(componentId + "-container");
        if (container) {
          container.innerHTML = data;
        } else {
          console.error("No se encontró el contenedor para: " + componentId + "-container");
        }
      })
      .catch(error => console.error("Error cargando " + componentId + ":", error));
  }
  