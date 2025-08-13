/* ================================
   CARGA DE COMPONENTES COMUNES
=================================== */
document.addEventListener("DOMContentLoaded", function () {
  
  // Función para cargar un componente
  function loadComponent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(filePath)
      .then((response) => {
        if (!response.ok) throw new Error(`Error al cargar ${filePath}`);
        return response.text();
      })
      .then((data) => {
        container.innerHTML = data;
        console.log(`✅ ${filePath} cargado correctamente`);
      })
      .catch((error) => console.error(error));
  }

  // Cargar Navbar
  loadComponent("navbar-container", "layout/navbar.html");

  // Cargar Footer
  loadComponent("footer-container", "layout/footer.html");

  // Otros componentes (ejemplo: cartas de jugadores)
  if (document.getElementById("players-container")) {
    fetch("layout/jugadores.html")
      .then((res) => res.text())
      .then((html) => {
        document.getElementById("players-container").innerHTML = html;
      })
      .catch((err) => console.error("Error cargando jugadores:", err));
  }

  // Ajustar padding del body para que el navbar fijo no tape el contenido
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    document.body.style.paddingTop = navbar.offsetHeight + "px";
  }
});
