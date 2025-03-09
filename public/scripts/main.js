// Inicializar AOS
AOS.init();

// Efecto de scroll en el navbar
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Botón "Volver arriba"
const btnBackToTop = document.getElementById('btnBackToTop');
window.addEventListener('scroll', () => {
  btnBackToTop.style.display = (window.scrollY > 300) ? 'block' : 'none';
});
btnBackToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
