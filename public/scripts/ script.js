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
