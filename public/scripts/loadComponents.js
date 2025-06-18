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
            // Función para normalizar nombres para URLs de imágenes
            function normalizeName(name) {
                return name.toLowerCase().replace(/ /g, '_').replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
            }

            // Lista maestra de jugadores con sus nombres y URLs de imagen locales (ejemplos)
            const playersData = [
                { name: "Dilan sanchez", imageUrl: "images/jugadores/dilan_sanchez.jpg" },
                { name: "Juan t", imageUrl: "images/jugadores/juan_t.jpg" },
                { name: "Dinkol", imageUrl: "images/jugadores/dinkol.jpg" },
                { name: "Dany", imageUrl: "images/jugadores/dany.jpg" },
                { name: "Miguel", imageUrl: "images/jugadores/miguel.jpg" },
                { name: "Rodríguez", imageUrl: "images/jugadores/rodriguez.jpg" },
                { name: "Nelson", imageUrl: "images/jugadores/nelson.jpg" },
                { name: "Santiago", imageUrl: "images/jugadores/santiago.jpg" },
                { name: "Joseth", imageUrl: "images/jugadores/joseth.jpg" },
                { name: "Hernández angel", imageUrl: "images/jugadores/hernandez_angel.jpg" },
                { name: "Oscar", imageUrl: "images/jugadores/oscar.jpg" },
                { name: "Yojainer", imageUrl: "images/jugadores/yojainer.jpg" },
                { name: "Jesus", imageUrl: "images/jugadores/jesus.jpg" },
                { name: "Mateo", imageUrl: "images/jugadores/mateo.jpg" },
                { name: "Dilan correa", imageUrl: "images/jugadores/dilan_correa.jpg" },
                { name: "Mario", imageUrl: "images/jugadores/mario.jpg" },
                { name: "Juan Andrés", imageUrl: "images/jugadores/juan_andres.jpg" },
                { name: "Jhoyfran", imageUrl: "images/jugadores/jhoyfran.jpg" },
                { name: "Nayareth", imageUrl: "images/jugadores/nayareth.jpg" },
                { name: "Eliuth", imageUrl: "images/jugadores/eliuth.jpg" },
                { name: "Abraham", imageUrl: "images/jugadores/abraham.jpg" },
                { name: "Rey David", imageUrl: "images/jugadores/rey_david.jpg" },
                { name: "Santy h", imageUrl: "images/jugadores/santy_h.jpg" },
                { name: "Santy t", imageUrl: "images/jugadores/santy_t.jpg" },
                { name: "ISAAC", imageUrl: "images/jugadores/isaac.jpg" },
                { name: "Carlos", imageUrl: "images/jugadores/carlos.jpg" },
                { name: "Zaid", imageUrl: "images/jugadores/zaid.jpg" },
                { name: "Keyner", imageUrl: "images/jugadores/keyner.jpg" },
                { name: "ALAN", imageUrl: "images/jugadores/alan.jpg" },
                { name: "Cristian Marcano", imageUrl: "images/jugadores/cristian_marcano.jpg" }
            ];

            // URL de imagen por defecto si la URL local no se encuentra
            const default_image_url = "https://placehold.co/150x150/e2e8f0/000000?text=Jugador";

            // Definición de categorías y los jugadores que pertenecen a cada una
            const categories = [
                {
                    id: "categoria-2012-2013",
                    title: "Categoría 2012/13",
                    players: [
                        "Dilan sanchez", "Juan t", "Dinkol", "Dany", "Miguel",
                        "Rodríguez", "Nelson", "Santiago", "Joseth", "Hernández angel",
                        "Oscar", "Yojainer", "Jesus", "Mateo", "Dilan correa"
                    ]
                },
                {
                    id: "categoria-2014-2015-2016",
                    title: "Categoría 2014/15/16",
                    players: [
                        "Mario", "Juan Andrés", "Jhoyfran", "Nayareth", "Eliuth",
                        "Abraham", "Rey David", "Santy h", "Santy t", "ISAAC",
                        "Carlos", "Zaid", "Keyner", "ALAN", "Cristian Marcano"
                    ]
                }
            ];