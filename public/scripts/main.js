// main.js
// Archivo principal para gestionar eventos y lógica general de la aplicación

document.addEventListener("DOMContentLoaded", () => {
    console.log("Aplicación cargada correctamente");

    // Agregar eventos generales aquí
    document.getElementById("menu-toggle")?.addEventListener("click", () => {
        document.getElementById("menu")?.classList.toggle("active");
    });
});
