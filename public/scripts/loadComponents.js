// loadComponents.js
// Este archivo se encarga de cargar componentes dinámicos en la página

document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    loadFooter();
});

function loadHeader() {
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header").innerHTML = data;
        })
        .catch(error => console.error("Error cargando el header:", error));
}

function loadFooter() {
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;
        })
        .catch(error => console.error("Error cargando el footer:", error));
}
