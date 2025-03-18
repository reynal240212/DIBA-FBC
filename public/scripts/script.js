// script.js
// Archivo para funcionalidades específicas y dinámicas de la UI

document.addEventListener("DOMContentLoaded", () => {
    setupButtons();
});

function setupButtons() {
    const buttons = document.querySelectorAll(".dynamic-button");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            alert(`Has presionado el botón: ${button.textContent}`);
        });
    });
}
// script.js
// Archivo para funcionalidades específicas y dinámicas de la UI

document.addEventListener("DOMContentLoaded", () => {
    setupDynamicButtons();
    setupBackToTopButton();
  });
  
  /**
   * Configura los botones que tengan la clase .dynamic-button
   * para mostrar una alerta con el texto del botón.
   */
  function setupDynamicButtons() {
    const buttons = document.querySelectorAll(".dynamic-button");
    
    if (buttons.length === 0) {
      console.warn("No se encontraron elementos con la clase 'dynamic-button'.");
    }
  
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        alert(`Has presionado el botón: ${button.textContent}`);
      });
    });
  }
  
  /**
   * Configura el botón "Volver Arriba" (ID: btnBackToTop)
   * para mostrarse/ocultarse según el scroll y
   * desplazar suavemente hacia arriba al hacer clic.
   */
  function setupBackToTopButton() {
    const btnBackToTop = document.getElementById("btnBackToTop");
  
    if (!btnBackToTop) {
      console.warn("No se encontró el elemento con ID 'btnBackToTop'.");
      return;
    }
  
    // Mostrar/ocultar el botón en función del desplazamiento
    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) {
        btnBackToTop.style.display = "block";
      } else {
        btnBackToTop.style.display = "none";
      }
    });
  
    // Al hacer clic, desplazarse suavemente hacia arriba
    btnBackToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  