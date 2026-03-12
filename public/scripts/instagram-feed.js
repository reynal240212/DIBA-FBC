/**
 * DIBA FBC - Instagram Feed Manager
 * Integración dinámica usando Behold.so
 */

document.addEventListener("DOMContentLoaded", function () {
    const feedContainer = document.getElementById("instagram-feed");
    if (!feedContainer) return;

    // --- CONFIGURACIÓN ---
    // ID REAL DE DIBA FBC - Vinculado a Behold.so
    const BEHOLD_ID = '5mpGVzRLEdsEQpFCbEnH';
    const API_URL = `https://feeds.behold.so/${BEHOLD_ID}`;

    const renderSkeleton = () => {
        let skeletons = '';
        for (let i = 0; i < 6; i++) {
            skeletons += `
                <div class="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse border border-slate-100">
                    <div class="aspect-square bg-slate-200"></div>
                    <div class="p-5 space-y-3">
                        <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
            `;
        }
        feedContainer.innerHTML = skeletons;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    };

    const renderFeed = (posts) => {
        if (!posts || posts.length === 0) {
            feedContainer.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <i class="fab fa-instagram text-4xl text-slate-200 mb-4"></i>
                    <p class="text-slate-500 font-medium">No se pudieron cargar las publicaciones en este momento.</p>
                </div>
            `;
            return;
        }

        feedContainer.innerHTML = '';
        posts.slice(0, 9).forEach((post, index) => {
            const isVideo = post.mediaType === 'VIDEO';
            const postUrl = post.permalink;
            const imageUrl = post.mediaType === 'VIDEO' ? post.thumbnailUrl : post.mediaUrl;
            const caption = post.caption || 'DIBA FBC #FuerzayLealtad';

            const article = document.createElement('article');
            article.className = "group bg-white rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl";
            article.setAttribute('data-aos', 'fade-up');
            article.setAttribute('data-aos-delay', (index % 3) * 100);

            article.innerHTML = `
                <div class="relative aspect-square overflow-hidden bg-slate-900">
                    <img src="${imageUrl}" alt="Instagram Post" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100">
                    
                    ${isVideo ? `
                        <div class="absolute top-4 right-4 text-white drop-shadow-lg">
                            <i class="fas fa-play-circle text-2xl"></i>
                        </div>
                    ` : ''}

                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                    
                    <!-- Hover Overlay -->
                    <a href="${postUrl}" target="_blank" class="absolute inset-0 flex items-center justify-center bg-amber-500/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                         <span class="bg-white text-slate-900 font-black py-2 px-6 rounded-full text-xs uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            Ver en Instagram
                         </span>
                    </a>
                </div>
                
                <div class="p-6 flex-1 flex flex-col">
                    <div class="flex items-center gap-2 mb-3">
                        <img src="images/ESCUDO.png" class="w-6 h-6 object-contain" alt="DIBA">
                        <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">DIBA FBC</span>
                        <span class="text-[10px] text-slate-400 font-bold ml-auto">${formatDate(post.timestamp)}</span>
                    </div>
                    <p class="text-slate-700 text-sm leading-relaxed line-clamp-3 mb-4 italic">
                        "${caption}"
                    </p>
                    <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                        <div class="flex items-center gap-4 text-slate-400 text-xs font-bold">
                            <span><i class="far fa-heart mr-1"></i> ${post.likeCount || 0}</span>
                            <span><i class="far fa-comment mr-1"></i> ${post.commentCount || 0}</span>
                        </div>
                        <a href="${postUrl}" target="_blank" class="text-amber-500 hover:text-amber-600">
                            <i class="fab fa-instagram text-xl"></i>
                        </a>
                    </div>
                </div>
            `;
            feedContainer.appendChild(article);
        });

        // Reinicializar AOS para los nuevos elementos
        if (window.AOS) {
            window.AOS.refresh();
        }
    };

    const fetchFeed = async () => {
        renderSkeleton();
        try {
            const response = await fetch(API_URL);
            if (response.status === 404) {
                feedContainer.innerHTML = `
                    <div class="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <i class="fas fa-cog text-4xl text-amber-500 mb-4 animate-spin-slow"></i>
                        <h4 class="text-slate-900 font-black uppercase italic mb-2">Configuración Necesaria</h4>
                        <p class="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                            El Feed de Instagram está listo, pero requiere un <b>ID de Behold.so</b> válido vinculado a la cuenta del club.
                        </p>
                        <div class="flex flex-col gap-3 items-center">
                            <a href="https://behold.so/" target="_blank" class="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-all">
                                Obtener ID en Behold.so
                            </a>
                            <span class="text-[10px] text-slate-400">Instrucciones enviadas al chat de Antigravity</span>
                        </div>
                    </div>
                `;
                return;
            }
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            renderFeed(data.posts);
        } catch (error) {
            console.error('Error fetching Instagram feed:', error);
            renderFeed([]);
        }
    };

    fetchFeed();
});
zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz