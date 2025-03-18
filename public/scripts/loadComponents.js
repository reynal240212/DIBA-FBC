// loadComponents.js
document.addEventListener("DOMContentLoaded", () => {
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
      const container = document.getElementById(componentId + "-container");
      if (container) {
        container.innerHTML = data;
      } else {
        console.error("No se encontró el contenedor para: " + componentId + "-container");
      }
    })
    .catch(error => console.error("Error cargando " + componentId + ":", error));
}
