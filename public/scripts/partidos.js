/* ==============================================
   DIBA FBC - PARTIDOS ADAPTOR
   Delega toda la lógica de partidos a public/src/features/matches/manager.js
   ================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { initPartidosPage } = await import('../src/features/matches/manager.js');
    initPartidosPage();
  } catch (err) {
    console.error("Error cargando el gestor de partidos:", err);
  }
});
