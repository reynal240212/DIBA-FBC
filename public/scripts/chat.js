/**
 * DIBA FBC - Chat Module
 */
const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const errorMsg = document.getElementById('error-msg'); // Assuming this element exists or will be added

        let currentChannel = 'general';
        let currentUser = null;
        let userSettings = { notification_tone: 'pop', notifications_enabled: true };
        let msgSubscription = null;
        const msgContainer = document.getElementById('messages-container');
        const input = document.getElementById('message-input');

        // Registro de Service Worker para Notificaciones
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('SW registrado', reg))
                .catch(err => console.log('Error SW', err));
        }

        // Inicializar
        async function init() {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                window.location.href = 'index.html';
                return;
            }

            currentUser = session.user;
            await loadSettings();

            // Perfil UI
            document.getElementById('self-name').innerText = currentUser.user_metadata.full_name || currentUser.email;
            document.getElementById('self-avatar').src = currentUser.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${currentUser.email}`;

            // Solicitar Permisos si están habilitados en settings
            if (userSettings.notifications_enabled && Notification.permission === 'default') {
                requestNotificationPermission();
            }

            // Suscribir canales
            await fetchMessages();
            await fetchStatuses();
            setupRealtime();
            setupPresence();
        }

        async function loadSettings() {
            const { data } = await supabaseClient
                .from('user_settings')
                .select('*')
                .eq('user_id', currentUser.id)
                .single();

            if (data) {
                userSettings = data;
                document.getElementById('sett-notif').checked = data.notifications_enabled;
                document.getElementById('sett-tone').value = data.notification_tone;
            } else {
                // Crear settings por defecto
                await supabaseClient.from('user_settings').insert([{ user_id: currentUser.id }]);
            }
        }

        async function saveSettings() {
            const notifications_enabled = document.getElementById('sett-notif').checked;
            const notification_tone = document.getElementById('sett-tone').value;

            await supabaseClient.from('user_settings').upsert({
                user_id: currentUser.id,
                notifications_enabled,
                notification_tone,
                updated_at: new Date()
            });

            userSettings.notifications_enabled = notifications_enabled;
            userSettings.notification_tone = notification_tone;

            if (notifications_enabled && Notification.permission === 'default') {
                requestNotificationPermission();
            }
        }

        function requestNotificationPermission() {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') console.log('Notificaciones habilitadas');
            });
        }

        async function fetchMessages() {
            try {
                const { data, error } = await supabaseClient
                    .from('mensajes')
                    .select('*')
                    .eq('channel_id', currentChannel)
                    .order('created_at', { ascending: true })
                    .limit(50);

                if (error) throw error;

                msgContainer.innerHTML = '';
                data?.forEach(msg => appendMessage(msg));
                scrollToBottom();
            } catch (err) {
                console.error("Error al cargar mensajes:", err);
            }
        }

        function appendMessage(msg) {
            const isMe = msg.user_id === currentUser.id;
            const div = document.createElement('div');
            div.className = `flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-left-2 duration-300`;

            div.innerHTML = `
                <div class="max-w-[75%]">
                    <div class="flex items-center gap-1.5 mb-1 ${isMe ? 'flex-row-reverse' : ''}">
                         <span class="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">${msg.full_name}</span>
                         <span class="text-[8px] text-slate-600">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none' : 'bg-white/5 text-slate-200 rounded-tl-none'} ">
                        ${msg.content}
                    </div>
                </div>
            `;
            msgContainer.appendChild(div);
        }

        function setupRealtime() {
            if (msgSubscription) {
                supabaseClient.removeChannel(msgSubscription);
            }

            msgSubscription = supabaseClient.channel(`chat_v2_${currentChannel}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `channel_id=eq.${currentChannel}` }, payload => {
                    const isMe = payload.new.user_id === currentUser.id;
                    appendMessage(payload.new);
                    scrollToBottom();
                    if (!isMe) {
                        playTone();
                        showWebNotification(payload.new);
                    }
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'estados' }, payload => {
                    fetchStatuses();
                })
                .subscribe();
        }

        function showWebNotification(msg) {
            if (!userSettings.notifications_enabled || Notification.permission !== 'granted' || document.visibilityState === 'visible') return;

            new Notification(`Nuevo mensaje de ${msg.full_name}`, {
                body: msg.content,
                icon: msg.avatar_url || '/images/ESCUDO.webp'
            });
        }

        function setupPresence() {
            const channel = supabaseClient.channel('presence_track', {
                config: { presence: { key: currentUser.id } }
            });

            channel
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState();
                    updateOnlineUI(state);
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track({
                            name: currentUser.user_metadata.full_name,
                            avatar: currentUser.user_metadata.avatar_url,
                            online_at: new Date().toISOString(),
                        });
                    }
                });
        }

        function updateOnlineUI(state) {
            const avatarsDiv = document.getElementById('online-users-avatars');
            avatarsDiv.innerHTML = '';
            Object.values(state).forEach(presences => {
                const presence = presences[0];
                const img = document.createElement('img');
                img.src = presence.avatar || `https://ui-avatars.com/api/?name=${presence.name}`;
                img.className = "w-6 h-6 rounded-full border-2 border-slate-900 ring-1 ring-green-500/50";
                avatarsDiv.appendChild(img);
            });
        }

        async function postStatus() {
            const btn = document.getElementById('btn-post-status');
            const textInput = document.getElementById('status-text');
            const fileInput = document.getElementById('status-file');
            const text = textInput.value;
            const file = fileInput.files[0];

            if (!text && !file) return;

            btn.disabled = true;
            btn.innerText = "SUBIENDO...";

            let contentUrl = text;
            let type = 'text';

            if (file) {
                const isVideo = file.type.startsWith('video/') ||
                    ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExt.toLowerCase());
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${currentUser.id}/${fileName}`;

                console.log("Subiendo archivo:", fileName, "Tipo detectado video:", isVideo);

                const { error: uploadError } = await supabaseClient.storage
                    .from('statuses')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Error upload:", uploadError);
                    alert('Error al subir contenido: ' + uploadError.message);
                    btn.disabled = false;
                    btn.innerText = "PUBLICAR";
                    return;
                }

                // Buckets privados no usan publicUrl para visualización inmediata
                // El renderizado de estados usará signedUrls en fetchStatuses
                const { data: { publicUrl } } = supabaseClient.storage
                    .from('statuses')
                    .getPublicUrl(filePath);

                contentUrl = publicUrl;
                type = isVideo ? 'video' : 'image';
            }

            const { error } = await supabaseClient.from('estados').insert([{
                user_id: currentUser.id,
                content: contentUrl,
                type: type,
                full_name: currentUser.user_metadata?.full_name || currentUser.email || 'Usuario DIBA',
                avatar_url: currentUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${currentUser.email || 'D'}`
            }]);

            btn.disabled = false;
            btn.innerText = "PUBLICAR";

            if (!error) {
                textInput.value = '';
                clearStatusPreview();
                closeStatusModal();
                fetchStatuses();
            }
        }

        function previewStatusMedia(input) {
            const file = input.files[0];
            const imgPreview = document.getElementById('status-preview-img');
            const vidPreview = document.getElementById('status-preview-vid');
            const container = document.getElementById('status-preview-container');

            if (file) {
                const fileExt = file.name.split('.').pop().toLowerCase();
                const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExt);
                const reader = new FileReader();

                reader.onload = function (e) {
                    container.classList.remove('hidden');
                    if (isVideo) {
                        vidPreview.src = e.target.result;
                        vidPreview.classList.remove('hidden');
                        imgPreview.classList.add('hidden');
                    } else {
                        imgPreview.src = e.target.result;
                        imgPreview.classList.remove('hidden');
                        vidPreview.classList.add('hidden');
                    }
                }
                reader.readAsDataURL(file);
            }
        }

        function clearStatusPreview() {
            document.getElementById('status-file').value = '';
            document.getElementById('status-preview-container').classList.add('hidden');
            document.getElementById('status-preview-img').src = '';
            document.getElementById('status-preview-vid').src = '';
        }

        async function fetchStatuses() {
            const { data, error } = await supabaseClient
                .from('estados')
                .select('*')
                .gte('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) console.error("Error estados:", error);
            console.log("Estados cargados:", data?.length);

            const list = document.getElementById('stories-list');
            list.innerHTML = '';
            data?.forEach(st => {
                const btn = document.createElement('button');
                btn.className = "flex-shrink-0 flex flex-col items-center gap-1";
                let icon = '';
                if (st.type === 'video') icon = '<i class="fas fa-play absolute text-[10px] text-white bg-amber-500/50 p-1 rounded-full"></i>';

                btn.innerHTML = `
                    <div class="story-ring relative flex items-center justify-center ${st.type !== 'text' ? 'border-amber-500' : 'border-slate-700'}">
                        ${icon}
                        <img src="${st.avatar_url || 'https://ui-avatars.com/api/?name=' + st.full_name}" class="w-12 h-12 rounded-full object-cover">
                    </div>
                    <span class="text-[9px] tracking-tight text-slate-400 font-bold">${st.full_name.split(' ')[0]}</span>
                `;
                btn.onclick = () => showStatusFullScreen(st);
                list.appendChild(btn);
            });
        }

        async function showStatusFullScreen(st) {
            const modal = document.createElement('div');
            modal.className = "fixed inset-0 z-[3000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300";

            if (st.type === 'image' || st.type === 'video') {
            let contentUrl = st.content;
            // Si es una URL de nuestro bucket privado, la firmamos
            if (contentUrl && contentUrl.includes('statuses')) {
                const pathPart = contentUrl.split('statuses/')[1];
                if (pathPart) {
                    const { data: sData } = await supabaseClient.storage.from('statuses').createSignedUrl(pathPart, 3600);
                    if (sData) contentUrl = sData.signedUrl;
                }
            }

            const mediaTag = st.type === 'image'
                ? `<img src="${contentUrl}" class="w-full h-auto rounded-3xl shadow-2xl border border-white/10">`
                : `<video src="${contentUrl}" class="w-full h-auto rounded-3xl shadow-2xl border border-white/10" autoplay controls></video>`;

                modal.innerHTML = `
                    <button class="absolute top-6 right-6 text-white text-3xl hover:text-amber-500 transition-colors" onclick="this.parentElement.remove()">&times;</button>
                    <div class="max-w-md w-full relative">
                        ${mediaTag}
                        <div class="absolute bottom-6 left-6 right-6 p-4 glass rounded-2xl">
                             <p class="text-white font-black text-sm mb-1">${st.full_name}</p>
                             <p class="text-slate-400 text-xs">${new Date(st.created_at).toLocaleTimeString()}</p>
                        </div>
                    </div>
                `;
            } else {
                modal.innerHTML = `
                    <button class="absolute top-6 right-6 text-white text-3xl" onclick="this.parentElement.remove()">&times;</button>
                    <div class="max-w-md w-full glass p-10 rounded-3xl text-center">
                        <p class="text-2xl font-bold text-white mb-6">"${st.content}"</p>
                        <hr class="border-white/10 mb-6">
                        <p class="text-amber-500 font-black uppercase text-xs tracking-widest">${st.full_name}</p>
                    </div>
                `;
            }
            document.body.appendChild(modal);
            // Click fuera para cerrar
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        }

        function switchChannel(id) {
            currentChannel = id;
            document.querySelectorAll('nav button').forEach(b => b.classList.remove('active-channel'));
            document.getElementById('chan-' + id).classList.add('active-channel');
            document.getElementById('current-channel-name').innerText = '# ' + id.charAt(0).toUpperCase() + id.slice(1);
            fetchMessages();
            setupRealtime(); // Re-suscribirse al nuevo canal
        }

        document.getElementById('chat-form').onsubmit = async (e) => {
            e.preventDefault();
            const content = input.value.trim();
            if (!content) return;
            input.value = '';

            await supabaseClient.from('mensajes').insert([{
                content,
                user_id: currentUser.id,
                channel_id: currentChannel,
                full_name: currentUser.user_metadata?.full_name || currentUser.email || 'Usuario DIBA',
                avatar_url: currentUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${currentUser.email || 'D'}`
            }]);
        };

        function scrollToBottom() { msgContainer.scrollTop = msgContainer.scrollHeight; }
        function openStatusModal() { document.getElementById('status-modal').classList.remove('hidden'); }
        function closeStatusModal() { document.getElementById('status-modal').classList.add('hidden'); }

        function playTone() {
            if (!userSettings.notifications_enabled) return;

            const tones = {
                pop: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
                whistle: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
                bell: 'https://assets.mixkit.co/active_storage/sfx/2330/2330-preview.mp3'
            };

            const audio = new Audio(tones[userSettings.notification_tone] || tones.pop);
            audio.play().catch(e => console.log('Error de audio:', e));
        }

        document.getElementById('sett-notif').addEventListener('change', saveSettings);
        document.getElementById('sett-tone').addEventListener('change', saveSettings);

        document.addEventListener('DOMContentLoaded', init);
