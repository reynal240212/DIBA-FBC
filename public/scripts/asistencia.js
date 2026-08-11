/**
 * DIBA FBC - Asistencia Inteligente (Face API Module)
 */
import { initAdminLayout } from '../src/components/layout/admin-layout.js';
import { supabase, requireAdmin } from './supabaseClient.js';



        const FACE_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        let modelsLoaded = false;
        let isStreaming = false;
        let stream = null;
        let captureMode = 'attendance';
        let players = [];
        let activePlayerId = null;
        let activityLogs = [];
        let settings = JSON.parse(localStorage.getItem('diba-face-settings') || '{"mirrorCamera":true,"audioEnabled":true}');
        let animationFrame = null;

        const els = {
            cameraPlaceholder: document.getElementById('camera-placeholder'),
            cameraError: document.getElementById('camera-error'),
            cameraStreaming: document.getElementById('camera-streaming'),
            cameraFeed: document.getElementById('camera-feed'),
            faceCanvas: document.getElementById('face-canvas'),
            startBtn: document.getElementById('start-camera-btn'),
            stopBtn: document.getElementById('stop-camera-btn'),
            statusText: document.getElementById('camera-status-text'),
            errorText: document.getElementById('camera-error-text'),
            modelStatus: document.getElementById('model-status-c'),
            playerList: document.getElementById('player-list-container'),
            playerSearch: document.getElementById('player-search'),
            activityLog: document.getElementById('activity-log'),
            logCount: document.getElementById('log-count'),
            totalPlayers: document.getElementById('total-players'),
            sectionTitle: document.getElementById('player-section-title'),
            toggleMirror: document.getElementById('toggle-mirror'),
            toggleSound: document.getElementById('toggle-sound'),
            modeAttM: document.getElementById('mode-att-btn-m'),
            modeRegM: document.getElementById('mode-reg-btn-m'),
        };

        // ─── LOAD FACE-API MODELS ───
        async function loadFaceModels() {
            try {
                els.modelStatus.textContent = 'Cargando modelos IA...';
                await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL);
                await faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL);
                modelsLoaded = true;
                els.modelStatus.textContent = 'Sistema Listo';
                els.modelStatus.className = 'text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500';
            } catch (err) {
                console.error('Model load error:', err);
                els.modelStatus.textContent = 'Error: ' + (err.message || 'No se pudieron cargar los modelos');
                els.modelStatus.className = 'text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500';
            }
        }

        // ─── CAMERA ───
        async function startCamera() {
            try {
                els.cameraPlaceholder.classList.add('hidden');
                els.cameraError.classList.add('hidden');
                els.cameraStreaming.classList.remove('hidden');
                
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                els.cameraFeed.srcObject = stream;
                await els.cameraFeed.play();
                isStreaming = true;
                applyMirrorMode();
                startFaceDetection();
            } catch (err) {
                isStreaming = false;
                els.cameraStreaming.classList.add('hidden');
                els.cameraError.classList.remove('hidden');
                els.errorText.textContent = err.name === 'NotFoundError' 
                    ? 'No se detectó ninguna cámara.' 
                    : `Error: ${err.message}`;
            }
        }

        function stopCamera() {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
            isStreaming = false;
            els.cameraStreaming.classList.add('hidden');
            els.cameraPlaceholder.classList.remove('hidden');
        }

        function applyMirrorMode() {
            if (settings.mirrorCamera) {
                els.cameraFeed.classList.add('mirror');
            } else {
                els.cameraFeed.classList.remove('mirror');
            }
        }

        // ─── FACE DETECTION ───
        async function startFaceDetection() {
            if (!isStreaming || !modelsLoaded) return;

            const canvas = els.faceCanvas;
            const video = els.cameraFeed;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            async function detect() {
                if (!isStreaming) return;
                try {
                    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
                        .withFaceLandmarks()
                        .withFaceDescriptors();

                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    if (settings.mirrorCamera) {
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                    }

                    const dims = { width: video.videoWidth, height: video.videoHeight };
                    const resized = faceapi.resizeResults(detections, dims);
                    faceapi.draw.drawDetections(canvas, resized);

                    // Match faces with registered players
                    if (captureMode === 'attendance' && players.length > 0) {
                        for (const detection of resized) {
                            const registered = players.filter(p => p.face_token);
                            for (const player of registered) {
                                try {
                                    const storedDesc = new Float32Array(JSON.parse(player.face_token));
                                    const distance = faceapi.euclideanDistance(detection.descriptor, storedDesc);
                                    if (distance < settings.sensitivity || 0.55) {
                                        markAttendance(player);
                                    }
                                } catch (e) {}
                            }
                        }
                    }

                    if (settings.mirrorCamera) {
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                    }
                } catch (e) {}
                animationFrame = requestAnimationFrame(detect);
            }

            detect();
        }

        // ─── SUPABASE ───
        async function fetchPlayers() {
            const { data, error } = await supabase
                .from('identificacion')
                .select('numero, nombre, apellidos, categoria, face_token, foto_url, fecha_nacimiento');
            if (data) {
                players = data;
                els.totalPlayers.textContent = players.length;
                renderPlayerList();
            }
        }

        async function markAttendance(player) {
            if (activePlayerId === player.numero) return;
            activePlayerId = player.numero;

            const today = new Date().toISOString().split('T')[0];
            const { error } = await supabase
                .from('asistencias')
                .insert([{
                    identificacion_numero: player.numero,
                    fecha: today,
                    asistio: true,
                    fuente: 'reconocimiento_facial'
                }]);

            if (!error) {
                if (settings.audioEnabled) {
                    new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play().catch(() => {});
                }
                addLog(player, 'ASISTENCIA MARCADA');
                setTimeout(() => { activePlayerId = null; }, 3000);
            } else {
                activePlayerId = null;
            }
        }

        async function registerFaceToken(player) {
            if (!isStreaming || !modelsLoaded) return;
            try {
                const detections = await faceapi.detectSingleFace(els.cameraFeed, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                
                if (!detections) {
                    alert('No se detectó un rostro claro. Asegúrate de estar bien iluminado.');
                    return;
                }

                const token = JSON.stringify(Array.from(detections.descriptor));
                const { error } = await supabase
                    .from('identificacion')
                    .update({ face_token: token })
                    .eq('numero', player.numero);

                if (!error) {
                    alert(`Rostro registrado exitosamente para ${player.nombre} ${player.apellidos}`);
                    addLog(player, 'ROSTRO REGISTRADO');
                    fetchPlayers();
                } else {
                    alert('Error al guardar: ' + error.message);
                }
            } catch (err) {
                alert('Error al procesar rostro: ' + err.message);
            }
        }

        // ─── UI ───
        function renderPlayerList() {
            const search = els.playerSearch.value.toLowerCase();
            const filtered = players.filter(p => 
                (p.nombre || '').toLowerCase().includes(search) || 
                p.apellidos?.toLowerCase().includes(search) ||
                p.numero?.includes(search)
            );

            const grouped = {};
            filtered.forEach(p => {
                const cat = p.categoria || 'Sin categoría';
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(p);
            });

            const sortedCats = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
            
            if (filtered.length === 0) {
                els.playerList.innerHTML = `
                    <div class="flex items-center justify-center h-full text-slate-500">
                        <div class="text-center">
                            <i class="fas fa-user-slash text-3xl mb-4 opacity-30"></i>
                            <p class="text-[10px] font-black uppercase tracking-widest">No se encontraron jugadores</p>
                        </div>
                    </div>`;
                return;
            }

            els.playerList.innerHTML = sortedCats.map(cat => `
                <div class="mb-8">
                    <div class="flex items-center gap-4 px-2 mb-4">
                        <div class="h-0.5 flex-1 bg-white/5"></div>
                        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-gold bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20">
                            Categoría ${cat}
                        </span>
                        <div class="h-0.5 flex-1 bg-white/5"></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${grouped[cat].map(p => `
                            <div class="player-entry group p-5 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden flex items-center ${activePlayerId === p.numero ? 'bg-gold border-gold shadow-2xl shadow-gold/40' : 'bg-slate-900 border-white/10 hover:border-gold/50 hover:bg-slate-800'}"
                                 data-numero="${p.numero}">
                                <div class="flex items-center gap-5 relative z-10 w-full">
                                    <div class="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-black overflow-hidden flex-shrink-0">
                                        ${p.foto_url ? `<img src="${p.foto_url}" class="w-full h-full object-cover">` : `<span class="text-slate-400">${(p.nombre || '?')[0]}</span>`}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-black text-base leading-tight text-white truncate">${p.nombre || ''} ${p.apellidos || ''}</h4>
                                        <p class="text-[10px] text-slate-500 font-bold">ID: ${p.numero}</p>
                                    </div>
                                    ${p.face_token ? 
                                        `<div class="w-7 h-7 rounded-full bg-gold text-black flex items-center justify-center text-[10px]"><i class="fas fa-check"></i></div>` :
                                        `<div class="w-7 h-7 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px]"><i class="fas fa-user"></i></div>`
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.player-entry').forEach(el => {
                el.addEventListener('click', () => {
                    const num = el.dataset.numero;
                    const player = players.find(p => p.numero === num);
                    if (!player) return;
                    
                    if (captureMode === 'attendance') {
                        markAttendance(player);
                    } else {
                        registerFaceToken(player);
                    }
                });
            });
        }

        function addLog(player, status) {
            const time = new Date().toLocaleTimeString();
            activityLogs.unshift({ time, player: `${player.nombre || ''} ${player.apellidos || ''}`, status });
            if (activityLogs.length > 10) activityLogs.pop();
            renderLogs();
        }

        function renderLogs() {
            els.logCount.textContent = activityLogs.length;
            if (activityLogs.length === 0) {
                els.activityLog.innerHTML = `<div class="flex items-center justify-center h-full text-slate-500 text-[10px] font-black uppercase tracking-widest">Sin actividad registrada</div>`;
                return;
            }
            els.activityLog.innerHTML = activityLogs.map(log => `
                <div class="p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex items-start gap-4 animate-fade-up">
                    <div class="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 flex-shrink-0">
                        <i class="fas fa-user-check text-gold text-sm"></i>
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-black text-white truncate">${log.player}</p>
                        <p class="text-[10px] text-slate-500">${log.time} · ${log.status}</p>
                    </div>
                </div>
            `).join('');
        }

        function setMode(mode) {
            captureMode = mode;
            const attBtn = els.modeAttM;
            const regBtn = els.modeRegM;
            
            if (mode === 'attendance') {
                attBtn.className = 'flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 bg-gold text-black shadow-lg shadow-gold/20';
                regBtn.className = 'flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all text-slate-400 hover:bg-white/5 flex items-center justify-center gap-2';
                els.sectionTitle.textContent = 'Búsqueda Manual';
            } else {
                regBtn.className = 'flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 bg-gold text-black shadow-lg shadow-gold/20';
                attBtn.className = 'flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all text-slate-400 hover:bg-white/5 flex items-center justify-center gap-2';
                els.sectionTitle.textContent = 'Registro Facial';
            }
        }

        // ─── SETTINGS UI ───
        function updateUIFromSettings() {
            const mirrorToggle = els.toggleMirror;
            const soundToggle = els.toggleSound;

            mirrorToggle.className = settings.mirrorCamera 
                ? 'w-12 h-6 rounded-full relative transition-all bg-gold' 
                : 'w-12 h-6 rounded-full relative transition-all bg-slate-700';
            mirrorToggle.innerHTML = settings.mirrorCamera 
                ? '<div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all left-7"></div>' 
                : '<div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all left-1"></div>';

            soundToggle.className = settings.audioEnabled 
                ? 'w-12 h-6 rounded-full relative transition-all bg-gold' 
                : 'w-12 h-6 rounded-full relative transition-all bg-slate-700';
            soundToggle.innerHTML = settings.audioEnabled 
                ? '<div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all left-7"></div>' 
                : '<div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all left-1"></div>';

            applyMirrorMode();
        }

        // ─── EVENTS ───
        els.startBtn.addEventListener('click', startCamera);
        els.stopBtn.addEventListener('click', stopCamera);
        els.playerSearch.addEventListener('input', renderPlayerList);

        els.toggleMirror.addEventListener('click', () => {
            settings.mirrorCamera = !settings.mirrorCamera;
            localStorage.setItem('diba-face-settings', JSON.stringify(settings));
            updateUIFromSettings();
        });

        els.toggleSound.addEventListener('click', () => {
            settings.audioEnabled = !settings.audioEnabled;
            localStorage.setItem('diba-face-settings', JSON.stringify(settings));
            updateUIFromSettings();
        });

        els.modeAttM.addEventListener('click', () => setMode('attendance'));
        els.modeRegM.addEventListener('click', () => setMode('registration'));

        // ─── INIT ───
        async function init() {
            try {
                const session = await requireAdmin();
                if (!session) return;
                await initAdminLayout();
                await loadFaceModels();
                await fetchPlayers();
                updateUIFromSettings();
                setMode('attendance');
            } catch (err) {
                console.error('Init error:', err);
            }
        }
        init();
