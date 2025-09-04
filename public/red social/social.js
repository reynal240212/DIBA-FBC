document.addEventListener('DOMContentLoaded', () => {

    // Lógica para el formulario de nuevas publicaciones
    const postForm = document.getElementById('post-form'); // Asume que tienes un formulario con este ID
    if (postForm) {
        postForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const postText = document.getElementById('post-text').value; // Asume un textarea con este ID
            const postImage = document.getElementById('post-image').files[0]; // Asume un input de tipo 'file'

            if (!postText && !postImage) {
                alert("Por favor, escribe algo o sube una imagen.");
                return;
            }

            try {
                // Simulación de la llamada a la API para crear la publicación
                const newPost = await createPost(postText, postImage);

                // Añade la nueva publicación al feed
                addPostToFeed(newPost);

                // Limpia el formulario después de la publicación
                postForm.reset();
            } catch (error) {
                console.error("Error al crear la publicación:", error);
                alert("Ocurrió un error al publicar. Inténtalo de nuevo.");
            }
        });
    }

    // Delegación de eventos para los botones de "Me gusta", "Comentar", etc.
    document.querySelector('.feed-container').addEventListener('click', (event) => {
        const targetButton = event.target.closest('.post-button');
        if (!targetButton) return;

        const postCard = targetButton.closest('.post-card');
        const postId = postCard.dataset.postId; // Asume que cada tarjeta de publicación tiene un atributo data-post-id

        if (targetButton.classList.contains('like-button')) {
            handleLike(postId, targetButton);
        } else if (targetButton.classList.contains('comment-button')) {
            handleComment(postId);
        } else if (targetButton.classList.contains('share-button')) {
            handleShare(postId);
        }
    });

    // Carga inicial del feed al cargar la página
    loadFeed();

});

/**
 * Función para cargar las publicaciones desde el backend.
 */
async function loadFeed() {
    console.log('Cargando feed de publicaciones...');
    try {
        // Simulación de la llamada a la API
        const response = await fetch('/api/posts');
        const posts = await response.json();
        const feedContainer = document.querySelector('.feed-container');

        // Limpia el contenedor del feed antes de agregar las publicaciones
        feedContainer.innerHTML = '';

        posts.forEach(post => {
            addPostToFeed(post);
        });

    } catch (error) {
        console.error("Error al cargar el feed:", error);
    }
}

/**
 * Función para renderizar una publicación en el DOM.
 * @param {object} post - El objeto de la publicación recibido de la API.
 */
function addPostToFeed(post) {
    const feedContainer = document.querySelector('.feed-container');

    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    postElement.dataset.postId = post.id; // Asigna el ID del post

    postElement.innerHTML = `
        <div class="post-header">
            <img src="${post.user.avatarUrl}" alt="Avatar de usuario" class="user-avatar">
            <div class="user-info">
                <span class="user-name">${post.user.name}</span>
                <span class="post-date">${formatDate(post.date)}</span>
            </div>
        </div>
        <div class="post-body">
            <p>${post.text}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Imagen de la publicación" class="post-image">` : ''}
        </div>
        <div class="post-footer">
            <button class="post-button like-button">👍 Me gusta (${post.likes})</button>
            <button class="post-button comment-button">💬 Comentar</button>
            <button class="post-button share-button">↪️ Compartir</button>
        </div>
    `;

    // Añade la nueva publicación al inicio del feed
    feedContainer.prepend(postElement);
}

/**
 * Maneja la acción de "Me gusta".
 * @param {string} postId - El ID de la publicación.
 * @param {HTMLElement} buttonElement - El botón presionado.
 */
async function handleLike(postId, buttonElement) {
    console.log(`Diste "Me gusta" a la publicación ${postId}`);
    try {
        // Simulación de la llamada a la API para registrar el "me gusta"
        const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
        const data = await response.json();

        // Actualiza el contador de "me gusta" en la interfaz
        buttonElement.textContent = `👍 Me gusta (${data.likes})`;

    } catch (error) {
        console.error("Error al dar me gusta:", error);
    }
}

/**
 * Maneja la acción de "Comentar".
 * @param {string} postId - El ID de la publicación.
 */
function handleComment(postId) {
    console.log(`Quieres comentar en la publicación ${postId}`);
    // Aquí puedes redirigir a una página de comentarios o mostrar un modal
    alert("Función de comentar aún no implementada.");
}

/**
 * Maneja la acción de "Compartir".
 * @param {string} postId - El ID de la publicación.
 */
function handleShare(postId) {
    console.log(`Quieres compartir la publicación ${postId}`);
    // Aquí puedes abrir un diálogo para compartir
    alert("Función de compartir aún no implementada.");
}

/**
 * Formatea una fecha para mostrarla de forma amigable.
 * @param {string} dateString - La fecha en formato ISO.
 */
function formatDate(dateString) {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.abs(now - postDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
        return "Hace menos de una hora";
    } else if (diffInHours < 24) {
        return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
        return postDate.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// **Funciones simuladas del backend** (reemplazar con llamadas a tu API real)
async function createPost(text, imageFile) {
    console.log('Simulando creación de post...');
    return {
        id: "post" + Date.now(),
        user: { name: "Usuario Actual", avatarUrl: "https://via.placeholder.com/50" },
        text: text,
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
        date: new Date().toISOString(),
        likes: 0
    };
}