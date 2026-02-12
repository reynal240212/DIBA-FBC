// scripts/navbar.js
function initNavbar() {
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Dropdowns desktop
  const btnClub = document.getElementById('btn-club');
  const ddClub  = document.getElementById('dropdown-club');
  const btnPartidos = document.getElementById('btn-partidos');
  const ddPartidos  = document.getElementById('dropdown-partidos');

  if (!(btnClub && ddClub && btnPartidos && ddPartidos)) return;

  function closeAllDropdowns() {
    ddClub.classList.add('hidden');
    ddPartidos.classList.add('hidden');
  }

  btnClub.addEventListener('mouseenter', () => {
    ddClub.classList.remove('hidden');
    ddPartidos.classList.add('hidden');
  });

  btnPartidos.addEventListener('mouseenter', () => {
    ddPartidos.classList.remove('hidden');
    ddClub.classList.add('hidden');
  });

  ddClub.addEventListener('mouseleave', closeAllDropdowns);
  ddPartidos.addEventListener('mouseleave', closeAllDropdowns);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('li.relative')) {
      closeAllDropdowns();
    }
  });
}
