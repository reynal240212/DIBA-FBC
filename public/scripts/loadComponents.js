document.addEventListener("DOMContentLoaded", function () {
    // Cargar Navbar
    fetch("layout/navbar.html")
      .then(response => response.text())
      .then(data => {
        document.getElementById("navbar-container").innerHTML = data;
      })
      .catch(error => console.error("Error cargando el Navbar:", error));
  
    // Cargar Footer
    fetch("layout/footer.html")
      .then(response => response.text())
      .then(data => {
        document.getElementById("footer-container").innerHTML = data;
      })
      .catch(error => console.error("Error cargando el Footer:", error));
  });
  