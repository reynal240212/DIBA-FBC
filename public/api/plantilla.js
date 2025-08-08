document.addEventListener('DOMContentLoaded', () => {

    const swiperWrapper = document.getElementById('player-swiper-wrapper');
    // Si el contenedor no existe en la página, no hacemos nada.
    if (!swiperWrapper) {
      return;
    }

    // --- REUTILIZANDO TUS DATOS ---
    const playersData = [
        { name: "Dilan sanchez", imageUrl: "images/jugadores/dilan_sanchez.jpg", category: "2012/13" },
        { name: "Juan t", imageUrl: "images/jugadores/juan_t.jpg", category: "2012/13" },
        { name: "Dinkol", imageUrl: "images/jugadores/dinkol.jpg", category: "2012/13" },
        { name: "Dany", imageUrl: "images/jugadores/danny.jpg", category: "2012/13" },
        { name: "Miguel", imageUrl: "images/jugadores/migue.jpg", category: "2012/13" },
        // ... (completa aquí con el resto de tus jugadores, añadiendo la propiedad "category")
        { name: "Estiben Montiel", imageUrl: "images/jugadores/EstibenMontiel.jpg", category: "2012/13" },
        { name: "Mario", imageUrl: "images/mario sin fondo.png", category: "2014/15/16" },
        { name: "Juan Andrés", imageUrl: "images/jugadores/juan_andres.jpg", category: "2014/15/16" },
        { name: "Jhoyfran", imageUrl: "images/jugadores/jhoyfran.jpg", category: "2014/15/16" },
        // ... (y así sucesivamente con todos los demás)
        { name: "Andrés sierra", imageUrl: "images/jugadores/andres_sierra.jpg", category: "2014/15/16" }
    ];
    // NOTA: Para una mejor escalabilidad, en el futuro estos datos deberían venir de Supabase.

    if (playersData.length === 0) {
      swiperWrapper.innerHTML = '<p class="text-center text-white">No hay jugadores para mostrar.</p>';
      return;
    }
    
    swiperWrapper.innerHTML = ''; // Limpiar el contenedor
    
    // Crear una slide por cada jugador
    playersData.forEach(player => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        // Usamos la URL de la imagen como fondo de la tarjeta
        slide.innerHTML = `
            <div class="player-slide-card" style="background-image: url('${player.imageUrl}');">
              <div class="player-info-overlay">
                <span class="last-name">${player.name}</span>
                <span class="category-tag">Categoría ${player.category}</span>
              </div>
            </div>`;
        swiperWrapper.appendChild(slide);
    });

    // --- Inicialización de Swiper.js ---
    // Esto crea la magia del carrusel
    const swiper = new Swiper('.swiper', {
        loop: true,
        effect: 'coverflow', // Efecto visual 3D
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: {
          rotate: 0,       // Sin rotación
          stretch: 80,     // Espacio entre slides
          depth: 200,      // Profundidad del efecto 3D
          modifier: 1,
          slideShadows: false, // Quitar sombras automáticas
        },
        breakpoints: {
          768: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

});