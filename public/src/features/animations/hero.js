/**
 * DIBA FBC - Hero Animations Feature
 * Powered by Anime.js (CDN ESM)
 */
import anime from 'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.es.js';

/**
 * Robust Text Splitting Helper
 * Splits a DOM element's text content into individual characters wrapped in spans,
 * while perfectly preserving HTML elements like <span> tags and classes.
 */
function splitElementText(element) {
    if (!element) return;

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const fragment = document.createDocumentFragment();
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const span = document.createElement('span');
                span.className = 'hero-letter';
                span.style.display = 'inline-block';
                span.style.opacity = '0';
                span.style.transformOrigin = 'center center';
                
                if (char === ' ') {
                    span.innerHTML = '&nbsp;';
                } else {
                    span.textContent = char;
                }
                fragment.appendChild(span);
            }
            return fragment;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Clone parent element (e.g. <span class="text-yellow-500">) without children
            const clone = node.cloneNode(false);
            
            // Recursively process child nodes
            const childNodes = Array.from(node.childNodes);
            childNodes.forEach(child => {
                const processed = processNode(child);
                if (processed) clone.appendChild(processed);
            });
            return clone;
        }
        return null;
    }

    const childNodes = Array.from(element.childNodes);
    element.innerHTML = '';
    childNodes.forEach(child => {
        const processed = processNode(child);
        if (processed) element.appendChild(processed);
    });
}

/**
 * Initializes animations for the primary Hero section of the homepage (index.html)
 */
export function initPrimaryHeroAnimations() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    // 1. Prepare text splitting for title
    const titleElement = document.getElementById('hero-title');
    if (titleElement) {
        splitElementText(titleElement);
        // Force opacity of title element container to 1 so the split spans inside can fade in
        titleElement.style.opacity = '1';
    }

    // 2. Set up initial visual states
    const badge = document.getElementById('hero-badge');
    const desc = document.getElementById('hero-desc');
    const cta = document.getElementById('hero-cta');
    const scrollIndicator = document.getElementById('hero-scroll');

    if (badge) badge.style.opacity = '0';
    if (desc) desc.style.opacity = '0';
    if (cta) cta.style.opacity = '0';
    if (scrollIndicator) scrollIndicator.style.opacity = '0';

    // 3. Main Entrance Timeline
    const timeline = anime.timeline({
        autoplay: true
    });

    timeline
        // Badge Entry (Slide down + spring bounce)
        .add({
            targets: '#hero-badge',
            translateY: [-50, 0],
            opacity: [0, 1],
            easing: 'easeOutElastic(1, 0.75)',
            duration: 1200
        })
        // Title Letters Entry (Staggered scale, rotate & rise)
        .add({
            targets: '#hero-title .hero-letter',
            opacity: [0, 1],
            scale: [0.4, 1],
            translateY: [60, 0],
            rotateZ: [12, 0],
            easing: 'easeOutElastic(1.1, 0.65)',
            duration: 1100,
            delay: anime.stagger(35),
            changeBegin: () => {
                if (titleElement) titleElement.classList.add('not-italic'); // maintain visual consistency
            }
        }, '-=900')
        // Description Paragraph Entry (Smooth slide up + fade)
        .add({
            targets: '#hero-desc',
            opacity: [0, 1],
            translateY: [35, 0],
            easing: 'easeOutExpo',
            duration: 900
        }, '-=750')
        // CTA Buttons Box Entry (Bounce scale up)
        .add({
            targets: '#hero-cta',
            opacity: [0, 1],
            translateY: [25, 0],
            scale: [0.95, 1],
            easing: 'easeOutExpo',
            duration: 800
        }, '-=700')
        // Scroll Indicator Entry (Fade in gently)
        .add({
            targets: '#hero-scroll',
            opacity: [0, 0.4],
            translateY: [20, 0],
            easing: 'easeOutExpo',
            duration: 800,
            complete: () => {
                // Infinite gentle bobbing loop for the scroll indicator
                anime({
                    targets: '#hero-scroll',
                    translateY: [0, 12, 0],
                    opacity: [0.4, 0.8, 0.4],
                    loop: true,
                    duration: 1800,
                    easing: 'easeInOutSine'
                });
            }
        }, '-=500');

    // 4. Ambient floating loop for background mesh orbs
    anime({
        targets: '#hero-orb-blue',
        translateX: () => anime.random(-150, 150),
        translateY: () => anime.random(-120, 120),
        scale: () => anime.random(0.9, 1.3),
        opacity: [0.2, 0.4, 0.2],
        duration: () => anime.random(15000, 22000),
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate'
    });

    anime({
        targets: '#hero-orb-yellow',
        translateX: () => anime.random(-150, 150),
        translateY: () => anime.random(-120, 120),
        scale: () => anime.random(0.9, 1.3),
        opacity: [0.15, 0.3, 0.15],
        duration: () => anime.random(18000, 25000),
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate'
    });
}

/**
 * Initializes animations for the shared Hero header (layout/hero.html) in subpages
 */
export function initSharedHeroAnimations() {
    const sharedBadge = document.getElementById('shared-hero-badge');
    const sharedTitle = document.getElementById('shared-hero-title');
    const sharedDesc = document.getElementById('shared-hero-desc');
    const sharedCta = document.getElementById('shared-hero-cta');

    if (!sharedTitle) return;

    // 1. Splitting for subtitle / badge
    splitElementText(sharedTitle);
    sharedTitle.style.opacity = '1';

    // 2. Set initial values
    if (sharedBadge) sharedBadge.style.opacity = '0';
    if (sharedDesc) sharedDesc.style.opacity = '0';
    if (sharedCta) sharedCta.style.opacity = '0';

    // 3. Shared Entrance Timeline
    const timeline = anime.timeline({
        autoplay: true
    });

    timeline
        // Badge Entry
        .add({
            targets: '#shared-hero-badge',
            translateY: [-30, 0],
            opacity: [0, 1],
            easing: 'easeOutElastic(1, 0.8)',
            duration: 1000
        })
        // Title Letters Entry (Staggered)
        .add({
            targets: '#shared-hero-title .hero-letter',
            opacity: [0, 1],
            scale: [0.5, 1],
            translateY: [40, 0],
            easing: 'easeOutElastic(1, 0.7)',
            duration: 900,
            delay: anime.stagger(30)
        }, '-=800')
        // Description Entry
        .add({
            targets: '#shared-hero-desc',
            opacity: [0, 1],
            translateY: [20, 0],
            easing: 'easeOutExpo',
            duration: 800
        }, '-=650')
        // Button Entry
        .add({
            targets: '#shared-hero-cta',
            opacity: [0, 1],
            translateY: [15, 0],
            easing: 'easeOutExpo',
            duration: 700
        }, '-=600');
}
