/**
 * DIBA FBC - Global Component Loader
 * Centralizes the injection of shared UI elements (Navbar, Footer, etc.)
 */
import { APP_VERSION } from './version.js';

export function loadComponent(containerId, filePath, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Convert to absolute path if needed, assuming components are in /layout/
    const baseUrl = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const url = `${baseUrl}?v=${APP_VERSION}`;
    
    fetch(url)
        .then(r => r.text())
        .then(data => {
            container.innerHTML = data;
            if (callback) callback();
        })
        .catch(err => console.error(`Error loading component [${containerId}]:`, err));
}

export function initCommonUI() {
    // 1. Modal styles
    if (!document.getElementById('diba-common-styles')) {
        const style = document.createElement('style');
        style.id = 'diba-common-styles';
        style.innerHTML = `
            .player-modal {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.93);
                z-index: 10000;
                padding: 20px;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(10px);
            }
            .player-modal.active {
                opacity: 1;
                display: flex;
            }
            .modal-content-wrapper {
                transform: scale(0.8);
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                max-width: 480px;
                width: 100%;
                text-align: center;
            }
            .player-modal.active .modal-content-wrapper { transform: scale(1); }
            #modal-img {
                width: 100%;
                border-radius: 24px;
                border: 4px solid #f59e0b;
                box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8);
                filter: brightness(1.06) contrast(1.03) saturate(1.1) blur(0.15px);
            }
            #close-modal {
                position: absolute;
                top: 25px;
                right: 25px;
                background: #f59e0b;
                color: #000;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                font-weight: 900;
                cursor: pointer;
                transition: all 0.2s;
                z-index: 10001;
            }
            #close-modal:hover { transform: scale(1.1) rotate(90deg); background: #fff; }
        `;
        document.head.appendChild(style);
    }

    // 2. Modal Structure
    if (!document.getElementById('player-modal')) {
        const modalHTML = `
            <div id="player-modal" class="player-modal">
                <div id="close-modal">&times;</div>
                <div class="modal-content-wrapper">
                    <img id="modal-img" src="" alt="Jugador">
                    <h2 id="modal-name" class="text-3xl font-black text-white uppercase italic mt-6 tracking-tighter"></h2>
                    <p class="text-amber-500 font-bold tracking-widest uppercase text-sm">DIBA FBC</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('player-modal');
        const closeModal = document.getElementById('close-modal');
        closeModal?.addEventListener('click', () => modal.classList.remove('active'));
        modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
    }
}

export function openPlayerModal(imageUrl, playerName) {
    const modal = document.getElementById('player-modal');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    
    if (modal && modalImg && modalName) {
        modalImg.src = imageUrl;
        modalName.textContent = playerName;
        modal.classList.add('active');
    }
}
