/**
 * DIBA FBC - Floating AI Assistant Widget
 * Global injection and logic
 */

import { chatWithAI, checkAIStatus } from './aiClient.js';

class AIWidget {
    constructor() {
        this.isOpen = false;
        this.history = [];
        this.init();
    }

    async init() {
        this.injectStyles();
        this.injectHTML();
        this.setupEventListeners();
        this.checkStatus();
    }

    injectStyles() {
        if (!document.querySelector('link[href*="ai-widget.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/ai-widget.css';
            document.head.appendChild(link);
        }
    }

    injectHTML() {
        const html = `
            <div id="ai-widget-trigger">
                <i class="fas fa-robot"></i>
            </div>
            <div id="ai-chat-window">
                <div class="ai-header">
                    <div class="ai-header-info">
                        <i class="fas fa-shield-halved" style="color:var(--ai-primary)"></i>
                        <span class="ai-header-title">DIBA Assistant</span>
                    </div>
                    <div class="ai-header-status">
                        <div id="widget-status-dot" class="status-dot"></div>
                        <span id="widget-status-text">Online</span>
                    </div>
                </div>
                <div class="ai-messages-container" id="widget-messages">
                    <div class="ai-msg bot">¡Hola! Soy tu asistente oficial. ¿En qué puedo ayudarte hoy?</div>
                </div>
                <div class="ai-footer">
                    <form id="widget-input-form" class="ai-input-wrapper">
                        <input type="text" id="widget-input" placeholder="Escribe tu mensaje..." autocomplete="off">
                        <button type="submit" class="ai-send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        
        this.window = document.getElementById('ai-chat-window');
        this.trigger = document.getElementById('ai-widget-trigger');
        this.messages = document.getElementById('widget-messages');
        this.input = document.getElementById('widget-input');
        this.form = document.getElementById('widget-input-form');
        this.statusDot = document.getElementById('widget-status-dot');
        this.statusText = document.getElementById('widget-status-text');
    }

    setupEventListeners() {
        this.trigger.addEventListener('click', () => this.toggle());

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSend();
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.window.classList.toggle('active', this.isOpen);
        if (this.isOpen) {
            this.input.focus();
            this.trigger.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            this.trigger.innerHTML = '<i class="fas fa-robot"></i>';
        }
    }

    appendMessage(role, text) {
        const msg = document.createElement('div');
        msg.className = `ai-msg ${role}`;
        msg.innerHTML = text;
        this.messages.appendChild(msg);
        this.messages.scrollTop = this.messages.scrollHeight;
        return msg;
    }

    async handleSend() {
        const text = this.input.value.trim();
        if (!text) return;

        this.input.value = '';
        this.appendMessage('user', text);

        const loadingMsg = this.appendMessage('bot', '<i class="fas fa-spinner fa-spin"></i> Pensando...');
        
        // Rotación de mensajes para mejorar UX durante latencia
        const loadingSteps = [
            "Consultando base de datos...",
            "Buscando en memoria neuronal...",
            "Analizando tácticas...",
            "Generando respuesta final..."
        ];
        let stepIdx = 0;
        const interval = setInterval(() => {
            if (loadingMsg.parentNode) {
                loadingMsg.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingSteps[stepIdx % loadingSteps.length]}`;
                stepIdx++;
            } else {
                clearInterval(interval);
            }
        }, 3000);

        try {
            // Recoger contexto del dashboard si estamos en la página del dashboard
            let clubContext = null;
            if (window.location.pathname.includes('dashboard.html')) {
                const p = document.getElementById('kpi-players');
                if (p) {
                    clubContext = {
                        jugadores: p.textContent,
                        partidos: document.getElementById('kpi-matches')?.textContent || '—',
                        asistencia: document.getElementById('kpi-attendance')?.textContent || '—',
                        pendientes: document.getElementById('kpi-pending')?.textContent || '—'
                    };
                }
            }

            const responseData = await chatWithAI(text, this.history, clubContext);
            
            clearInterval(interval);

            // Si el backend retorna un error estructurado
            if (typeof responseData === 'object' && responseData.error) {
                throw new Error(responseData.error);
            }

            const response = typeof responseData === 'string' ? responseData : responseData.content;
            
            loadingMsg.textContent = response;
            this.history.push({ role: 'user', content: text });
            this.history.push({ role: 'assistant', content: response });
        } catch (err) {
            clearInterval(interval);
            console.error("AI Widget Error:", err);
            loadingMsg.innerHTML = `<span style="color:#ef4444">Error: ${err.message || 'No se pudo conectar.'}</span>`;
        }
    }

    async checkStatus() {
        const isOnline = await checkAIStatus();
        if (isOnline) {
            this.statusDot.classList.add('online');
            this.statusText.textContent = 'Global Online';
        } else {
            this.statusText.textContent = 'Offline';
        }
    }
}

// Auto-init with singleton check
if (typeof window !== 'undefined' && !window.dibaAI) {
    window.dibaAI = new AIWidget();
    console.log("DIBA AI Widget Initialized");
}
