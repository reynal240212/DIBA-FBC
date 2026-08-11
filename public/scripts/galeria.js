/**
 * DIBA FBC - Galeria Module
 */
// ── Items visibles
        const items = Array.from(document.querySelectorAll('.gallery-item'));
        const emptyState = document.getElementById('empty-state');

        // Construir índice de lightbox a partir de las imágenes visibles
        let lightboxItems = [];
        let currentIndex = 0;

        function buildLightboxIndex(visibleItems) {
            lightboxItems = visibleItems.map(el => ({
                src: el.dataset.src,
                caption: el.dataset.caption
            }));
        }

        // ── FILTROS ──────────────────────────────────────────────
        const filterBtns = document.querySelectorAll('.filter-btn');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.cat;

                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show / hide items
                let visibleItems = [];

                if (cat === 'all') {
                    items.forEach(item => {
                        item.classList.remove('hidden-item');
                        visibleItems.push(item);
                    });
                } else {
                    items.forEach(item => {
                        if (item.dataset.cat === cat) {
                            item.classList.remove('hidden-item');
                            visibleItems.push(item);
                        } else {
                            item.classList.add('hidden-item');
                        }
                    });
                }

                // Empty state
                const anyVisible = visibleItems.length > 0;
                emptyState.classList.toggle('hidden', anyVisible);

                buildLightboxIndex(visibleItems);
            });
        });

        // Build initial index
        buildLightboxIndex(items);

        // ── LIGHTBOX ─────────────────────────────────────────────
        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lb-img');
        const lbCap = document.getElementById('lb-caption');
        const lbCounter = document.getElementById('lb-counter');

        function openLightbox(index) {
            currentIndex = index;
            const item = lightboxItems[currentIndex];
            lbImg.src = item.src;
            lbCap.textContent = item.caption;
            lbCounter.textContent = `${currentIndex + 1} / ${lightboxItems.length}`;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + lightboxItems.length) % lightboxItems.length;
            openLightbox(currentIndex);
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % lightboxItems.length;
            openLightbox(currentIndex);
        }

        // Attach click to each gallery item
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                // Rebuild index from currently visible items
                const visible = items.filter(i => !i.classList.contains('hidden-item'));
                buildLightboxIndex(visible);
                const newIndex = visible.indexOf(item);
                if (newIndex >= 0) openLightbox(newIndex);
            });
        });

        document.getElementById('lb-close').addEventListener('click', closeLightbox);
        document.getElementById('lb-prev').addEventListener('click', showPrev);
        document.getElementById('lb-next').addEventListener('click', showNext);

        // Close on backdrop click
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', e => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });

        // Touch swipe support
        let touchStartX = 0;
        lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
        lightbox.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (dx > 60) showPrev();
            if (dx < -60) showNext();
        });
