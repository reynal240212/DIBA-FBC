/**
 * DIBA FBC - Floating AI Assistant Widget
 * Global injection and logic
 */

// Versión de respaldo si falla el import
let APP_VERSION = '1.1.0_fallback';
try {
    const versionModule = await import('./version.js');
    APP_VERSION = versionModule.APP_VERSION;
} catch (e) {
    console.warn("DIBA AI: Version file not found, using fallback.");
}

import { chatWithAI, checkAIStatus } from './aiClient.js';

class AIWidget {
    constructor() {
        this.isOpen = false;
        this.history = [];
        this.isListening = false;
        this.isSpeaking = false;
        this.speechEnabled = localStorage.getItem('diba-ai-speech') === 'true';
        
        // Voice configuration
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.initVoice();
        
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
            link.href = `/styles/ai-widget.css?v=${APP_VERSION}`;
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
                        <button type="button" id="ai-mic-btn" class="ai-mic-btn" title="Hablar">
                            <i class="fas fa-microphone"></i>
                        </button>
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

        this.micBtn = document.getElementById('ai-mic-btn');
        this.micBtn?.addEventListener('click', () => this.toggleListening());
        
        // Add speech toggle to header
        const header = document.querySelector('.ai-header-status');
        if (header) {
            const voiceToggle = document.createElement('div');
            voiceToggle.className = 'ai-voice-toggle';
            voiceToggle.innerHTML = `
                <i class="fas ${this.speechEnabled ? 'fa-volume-up' : 'fa-volume-mute'}" id="speech-icon"></i>
            `;
            voiceToggle.title = "Activar/Desactivar lectura en voz alta";
            voiceToggle.onclick = () => this.toggleSpeech();
            header.prepend(voiceToggle);
        }
    }

    initVoice() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRec();
            this.recognition.lang = 'es-CO';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.micBtn.classList.add('listening');
                this.input.placeholder = "Escuchando...";
            };

            this.recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                this.input.value = text;
                this.handleSend();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.micBtn.classList.remove('listening');
                this.input.placeholder = "Escribe tu mensaje...";
            };

            this.recognition.onerror = (e) => {
                console.error("Speech Rec Error:", e);
                this.isListening = false;
                this.micBtn.classList.remove('listening');
                
                if (e.error === 'not-allowed') {
                    alert("🎙️ Acceso al micrófono denegado.\n\nPor favor, haz clic en el icono del candado en la barra de direcciones y permite el uso del micrófono para este sitio.");
                } else if (!window.isSecureContext) {
                    alert("⚠️ Error de Seguridad:\n\nEl reconocimiento de voz requiere una conexión segura (HTTPS) para funcionar. Por favor, asegúrate de estar usando HTTPS.");
                }
            };
        }
    }

    toggleListening() {
        if (!this.recognition) {
            alert("Tu navegador no soporta reconocimiento de voz.");
            return;
        }
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.synth.cancel(); // Stop talking before listening
            this.recognition.start();
        }
    }

    toggleSpeech() {
        this.speechEnabled = !this.speechEnabled;
        localStorage.setItem('diba-ai-speech', this.speechEnabled);
        const icon = document.getElementById('speech-icon');
        if (icon) icon.className = `fas ${this.speechEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`;
        if (!this.speechEnabled) this.synth.cancel();
    }

    speak(text) {
        if (!this.speechEnabled || !this.synth) return;
        this.synth.cancel(); // Stop current speech
        
        // Clean markdown for speech
        const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1')
                               .replace(/\*(.*?)\*/g, '$1')
                               .replace(/<li>/g, ' ')
                               .replace(/<\/li>/g, '.')
                               .replace(/<[^>]*>/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'es-CO';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        this.isSpeaking = true;
        this.synth.speak(utterance);
        
        utterance.onend = () => { this.isSpeaking = false; };
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
        
        // Formateo básico de Markdown
        const formatted = this.formatMarkdown(text);
        
        if (role === 'bot' && !text.includes('fa-spinner')) {
            msg.innerHTML = ''; // Se llenará con el efecto de escritura
            this.messages.appendChild(msg);
            this.typeMessage(msg, formatted);
        } else {
            msg.innerHTML = formatted;
            this.messages.appendChild(msg);
        }
        
        this.messages.scrollTop = this.messages.scrollHeight;
        return msg;
    }

    formatMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
            .replace(/<\/ul><ul>/gim, '') // Unir listas consecutivas
            .replace(/\n/g, '<br>');
    }

    typeMessage(element, html) {
        let i = 0;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const fullContent = tempDiv.innerHTML;
        
        // Efecto de aparición suave por palabras para mejor UX "premium"
        const words = fullContent.split(' ');
        let currentWord = 0;
        
        const timer = setInterval(() => {
            if (currentWord < words.length) {
                element.innerHTML = words.slice(0, currentWord + 1).join(' ');
                currentWord++;
                this.messages.scrollTop = this.messages.scrollHeight;
            } else {
                clearInterval(timer);
            }
        }, 30); // Velocidad equilibrada
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
            
            loadingMsg.remove(); // Quitamos el de carga
            this.appendMessage('bot', response); // El nuevo con efecto typewriter
            
            this.speak(response); // Leer en voz alta si está activado

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
