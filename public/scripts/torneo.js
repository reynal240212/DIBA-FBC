/**
 * DIBA FBC - Torneo Module
 */
/* --- Funcionalidad para cerrar secciones completas --- */
        document.getElementById('btn-close-partidos').addEventListener('click', () => {
            document.querySelector('#matches-container').innerHTML = '';
        });
        document.getElementById('btn-close-entrenamientos').addEventListener('click', () => {
            document.querySelector('#trainings-container').innerHTML = '';
        });
