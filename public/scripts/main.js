// Botón "Volver arriba"
window.addEventListener("scroll", function () {
  let btn = document.getElementById("btnBackToTop");
  if (window.scrollY > 300) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
});
document.getElementById("btnBackToTop").addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// (Eliminado: Funcionalidad de cambio de fondo del navbar al hacer scroll)
// const navbar = document.querySelector('.navbar');
// window.addEventListener('scroll', () => {
//   if (window.scrollY > 50) {
//     navbar.classList.remove('transparent');
//     navbar.classList.add('solid', 'navbar-dark');
//   } else {
//     navbar.classList.add('transparent');
//     navbar.classList.remove('solid', 'navbar-dark');
//   }
// });

// Botón "Volver arriba" (segunda vez; puedes eliminar duplicados)
const btnBackToTop = document.getElementById('btnBackToTop');
window.addEventListener('scroll', () => {
  btnBackToTop.style.display = (window.scrollY > 300) ? 'block' : 'none';
});
btnBackToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Funcionalidad de categorías (si usas .category-buttons .btn)
const btns = document.querySelectorAll('.category-buttons .btn');
const containers = document.querySelectorAll('.category-container');
btns.forEach(btn => {
  btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    containers.forEach(cont => cont.classList.remove('active'));
    btn.classList.add('active');
    const id = btn.getAttribute('data-category');
    document.getElementById(id).classList.add('active', 'animate__animated', 'animate__fadeIn');
  });
});

// Funcionalidad del Login (Vercel Functions)
const formLogin = document.getElementById('formLogin');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('loginCorreo').value.trim();
    const clave = document.getElementById('loginClave').value;
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password: clave })
      });
      const result = await response.json();
      if (response.ok) {
        alert('Bienvenido, ' + result.user.nombre);
        localStorage.setItem('loggedUser', JSON.stringify(result.user));
        window.location.href = 'profile.html';
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error en el login:', error);
      alert('Error al iniciar sesión. Inténtalo de nuevo.');
    }
  });
}

// Funcionalidad del Registro (Vercel Functions)
const formRegistro = document.getElementById('formRegistro');
if (formRegistro) {
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim();
    const correo = document.getElementById('regCorreo').value.trim();
    const password = document.getElementById('regPassword').value;
    const fechaNac = document.getElementById('regFechaNac').value;
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, password, fechaNac })
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        // Cerrar modal de registro
        const modalRegistro = bootstrap.Modal.getInstance(document.getElementById('modalRegistro'));
        modalRegistro.hide();
        window.location.href = 'login.html'; // O a profile.html, según prefieras
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      alert('Error al registrar usuario. Inténtalo de nuevo.');
    }
  });
}
// Script para alternar categorías y otros efectos 

  // Alternar categorías
  const btns = document.querySelectorAll('.category-buttons .btn');
  const containers = document.querySelectorAll('.category-container');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      containers.forEach(cont => cont.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.getAttribute('data-category');
      document.getElementById(id).classList.add('active', 'animate__animated', 'animate__fadeIn');
    });
  });
