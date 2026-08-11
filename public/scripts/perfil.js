/**
 * DIBA FBC - perfil.html Module
 */
// UI Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const welcomeName = document.getElementById('welcome-name');
    const headerAvatar = document.getElementById('header-avatar');
    const headerEmail = document.getElementById('header-user-email');
    const linkSection = document.getElementById('link-section');
    const docsTableBody = document.getElementById('docs-table-body');
    const docsFullList = document.getElementById('docs-full-list');

    let currentUser = null;
    let playerDNI = null;
    let displayName = "Jugador";

    const DOC_TYPES = [
      { id: 'ti', name: 'Tarjeta de Identidad', type: 'tarjeta_identidad', icon: 'fa-id-card', color: 'amber' },
      { id: 'cp', name: 'Cédula del Padre', type: 'cedula_padre', icon: 'fa-user-friends', color: 'blue' },
      { id: 'cm', name: 'Cédula de la Madre', type: 'cedula_madre', icon: 'fa-user-nurse', color: 'rose' },
      { id: 'rc', name: 'Registro Civil', type: 'registro_civil', icon: 'fa-file-invoice', color: 'emerald' },
      { id: 'co', name: 'Consentimiento', type: 'consentimiento_padres', icon: 'fa-file-signature', color: 'purple' }
    ];

    // Sidebar Toggle Logic
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarToggle.querySelector('i').classList.toggle('fa-bars');
      sidebarToggle.querySelector('i').classList.toggle('fa-times');
    });

    // Tab Switching
    window.switchTab = (tabId) => {
      document.querySelectorAll('#tab-content > section').forEach(s => s.classList.add('hidden'));
      document.getElementById(`tab-${tabId}`).classList.remove('hidden');

      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      event.currentTarget.classList.add('active');

      if (window.innerWidth < 1024) {
        sidebar.classList.remove('open');
        sidebarToggle.querySelector('i').classList.add('fa-bars');
      }
    };

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = 'index.html';
        return;
      }

      currentUser = session.user;
      headerEmail.innerText = currentUser.email;

      // Cargamos el perfil primero para tener el nombre preferido
      await loadProfileData();
      await loadBasicPlayerInfo();
      await loadDocuments();
    }

    async function loadBasicPlayerInfo() {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!userData) return;

      document.getElementById('header-user-role').innerText = userData.role;

      if (userData.identificacion_numero) {
        playerDNI = sanitizeDNI(userData.identificacion_numero);
        linkSection.classList.add('hidden');
        await loadFichaDeportiva(playerDNI);
      } else if (userData.role !== 'admin') {
        // Solo ponemos el nombre de bienvenida si loadProfileData no encontró uno mejor
        if (welcomeName.innerText === 'Cargando...') {
          displayName = currentUser.user_metadata.full_name || 'Nuevo Miembro';
          welcomeName.innerText = `Bienvenido, ${displayName}`;
        }
        linkSection.classList.remove('hidden');
      }
    }

    async function loadFichaDeportiva(dni) {
      const { data: ficha } = await supabase
        .from('identificacion')
        .select('*')
        .eq('numero', dni)
        .single();

      if (ficha) {
        document.getElementById('stat-category').innerText = ficha.categoria || 'Sin Categoría';
        document.getElementById('stat-birth').innerText = ficha.fecha_nacimiento || '--/--/----';
        document.getElementById('stat-dni').innerText = dni;
        displayName = ficha.nombre; // El nombre oficial del registro
        welcomeName.innerText = `Hola, ${displayName}`;
      }
    }

    async function loadProfileData() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profile) {
        document.getElementById('full_name').value = profile.full_name || '';
        document.getElementById('username').value = profile.username || '';
        document.getElementById('bio').value = profile.bio || '';
        document.getElementById('avatar_url').value = profile.avatar_url || '';

        // El nombre del perfil GUARDADO tiene máxima prioridad si existe
        if (profile.full_name) {
          displayName = profile.full_name;
          welcomeName.innerText = `Hola, ${displayName}`;
        }

        if (profile.avatar_url) {
          headerAvatar.src = profile.avatar_url;
          document.getElementById('profile-preview').src = profile.avatar_url;
        }
      } else {
        document.getElementById('full_name').value = currentUser.user_metadata.full_name || '';
        document.getElementById('username').value = currentUser.email.split('@')[0];
      }
    }

    async function loadDocuments() {
      if (!playerDNI) {
        document.getElementById('stat-docs').innerText = 'Sin vincular';
        return;
      }

      const { data: docs } = await supabase
        .from('player_documents')
        .select('*')
        .eq('identificacion_numero', playerDNI);

      const docsCount = docs ? docs.length : 0;
      const percent = Math.round((docsCount / DOC_TYPES.length) * 100);

      document.getElementById('stat-docs').innerText = `${docsCount} / ${DOC_TYPES.length}`;
      document.getElementById('doc-percent-badge').innerText = `${percent}%`;
      document.getElementById('doc-progress-bar').style.width = `${percent}%`;
      document.getElementById('doc-progress-text').innerText = `Completado ${percent}%`;

      // Build Overview Table
      docsTableBody.innerHTML = '';
      docsFullList.innerHTML = '';

      for (const type of DOC_TYPES) {
        const doc = docs?.find(d => d.doc_type === type.type);
        const statusClass = doc ? (doc.status === 'verificado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500') : 'bg-white/5 text-slate-500 italic';
        const statusText = doc ? (doc.status.charAt(0).toUpperCase() + doc.status.slice(1)) : 'No cargado';

        let signedUrl = '#';
        if (doc && doc.file_url) {
          const pathPart = doc.file_url.split('documents/')[1];
          if (pathPart) {
            const { data: sData } = await supabase.storage.from('documents').createSignedUrl(pathPart, 3600);
            if (sData) signedUrl = sData.signedUrl;
          } else {
            signedUrl = doc.file_url;
          }
        }

        // Table Row (Overview)
        const row = document.createElement('tr');
        row.className = "hover:bg-white/[0.01] transition-colors";
        row.innerHTML = `
          <td class="px-8 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-${type.color}-500/10 flex items-center justify-center text-${type.color}-500 text-xs">
                <i class="fas ${type.icon}"></i>
              </div>
              <span class="text-xs font-bold text-white uppercase">${type.name}</span>
            </div>
          </td>
          <td class="px-8 py-4 font-black">
            <span class="text-[9px] uppercase px-3 py-1 rounded-full ${statusClass}">${statusText}</span>
          </td>
          <td class="px-8 py-4">
            <button onclick="switchTab('documents')" class="text-white hover:text-amber-500 transition-colors"><i class="fas fa-external-link-alt"></i></button>
          </td>
        `;
        docsTableBody.appendChild(row);

        // Grid Card (Full View)
        const card = document.createElement('div');
        card.className = "glass p-6 rounded-[2rem] border-white/5 space-y-4";
        card.innerHTML = `
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-${type.color}-500/10 rounded-2xl flex items-center justify-center text-${type.color}-500">
              <i class="fas ${type.icon} text-xl"></i>
            </div>
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider">${type.name}</h3>
              <p class="text-[10px] uppercase font-bold text-amber-500/50">${statusText}</p>
            </div>
          </div>
          <div class="flex gap-2 pt-2">
            <input type="file" id="upload-${type.id}" class="hidden" onchange="uploadDocument('${type.type}', '${type.id}', this)">
            <button onclick="document.getElementById('upload-${type.id}').click()" class="flex-1 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest border border-white/5">
              <i class="fas fa-upload mr-2"></i> Subir
            </button>
            ${doc ? `<a href="${signedUrl}" target="_blank" class="w-12 h-12 glass flex items-center justify-center text-amber-500 rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-all border border-amber-500/20"><i class="fas fa-eye"></i></a>` : ''}
          </div>
        `;
        docsFullList.appendChild(card);
      }
    }

    // Handlers
    window.uploadDocument = async (type, id, input) => {
      const file = input.files[0];
      if (!file || !playerDNI) return;

      const fileName = `${playerDNI}/${type}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);

      if (uploadError) return alert("Error: " + uploadError.message);

      // Buckets privados no usan publicUrl para visualización inmediata
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('player_documents').upsert({
        user_id: currentUser.id,
        identificacion_numero: playerDNI,
        doc_type: type,
        file_url: publicUrl,
        status: 'pendiente'
      }, { onConflict: ['identificacion_numero', 'doc_type'] });

      if (dbError) alert("Error DB: " + dbError.message);
      else loadDocuments();
    };

    document.getElementById('link-btn').addEventListener('click', async () => {
      const dni = sanitizeDNI(document.getElementById('dni-input').value);
      if (!dni) return;

      const btn = document.getElementById('link-btn');
      const status = document.getElementById('link-status');
      btn.disabled = true;
      status.innerText = "Verificando...";
      status.className = "text-[10px] font-bold uppercase text-amber-500 mt-2 block animate-pulse";
      status.classList.remove('hidden');

      const { data: exists } = await supabase.from('identificacion').select('nombre').eq('numero', dni).single();

      if (!exists) {
        status.innerText = "DNI no encontrado en los registros oficiales.";
        status.className = "text-[10px] font-bold uppercase text-rose-500 mt-2 block";
        btn.disabled = false;
        return;
      }

      // Actualizamos ambas tablas para consistencia
      const { error: errorUsers } = await supabase.from('users').update({
        identificacion_numero: dni,
        role: 'usuario'
      }).eq('id', currentUser.id);

      const { error: errorProfiles } = await supabase.from('profiles').update({
        identificacion_numero: dni
      }).eq('id', currentUser.id);

      if (errorUsers || errorProfiles) {
        console.error("Link error:", errorUsers, errorProfiles);
        status.innerText = "Error vinculando: El documento podría estar siendo usado.";
        status.className = "text-[10px] font-bold uppercase text-rose-500 mt-2 block";
        btn.disabled = false;
      } else {
        status.innerText = "Vinculación Exitosa. Redirigiendo...";
        status.className = "text-[10px] font-bold uppercase text-emerald-500 mt-2 block";
        setTimeout(() => window.location.reload(), 1500);
      }
    });

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const profile = {
        id: currentUser.id,
        full_name: document.getElementById('full_name').value,
        username: document.getElementById('username').value,
        bio: document.getElementById('bio').value,
        avatar_url: document.getElementById('avatar_url').value,
        updated_at: new Date()
      };

      const { error } = await supabase.from('profiles').upsert(profile);
      const msg = document.getElementById('status-msg');
      msg.classList.remove('hidden');
      if (error) {
        msg.innerText = "Error: " + error.message;
        msg.className = "text-center text-[10px] mt-4 font-bold uppercase text-rose-500";
      } else {
        msg.innerText = "Perfil actualizado correctamente";
        msg.className = "text-center text-[10px] mt-4 font-bold uppercase text-emerald-500";
        setTimeout(() => { msg.classList.add('hidden'); window.location.reload(); }, 2000);
      }
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
      if (confirm('¿Cerrar sesión?')) {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
      }
    });

    document.addEventListener('DOMContentLoaded', init);

    // ── WEB PUSH TOGGLE ─────────────────────────────────────
    (async () => {
      const { isPushSupported, getPushPermission, subscribeToPush, unsubscribeFromPush, isSubscribed } =
        await import('./scripts/push-manager.js');

      const btn = document.getElementById('push-toggle-btn');
      const txt = document.getElementById('push-status-text');
      const sub = document.getElementById('push-status-sub');

      async function refreshPushUI() {
        if (!isPushSupported()) {
          txt.textContent = 'Tu navegador no soporta notificaciones push';
          sub.textContent = 'Usa Chrome, Edge o Firefox';
          btn.textContent = 'No disponible';
          btn.disabled = true;
          return;
        }
        const subscribed = await isSubscribed();
        btn.disabled = false;
        btn.style.opacity = '1';
        if (subscribed) {
          txt.textContent = '✅ Notificaciones activadas';
          sub.textContent = 'Recibirás alertas de convocatorias y partidos';
          btn.textContent = 'Desactivar';
          btn.style.background = 'rgba(239,68,68,.1)';
          btn.style.color = '#f87171';
          btn.style.borderColor = 'rgba(239,68,68,.2)';
        } else {
          txt.textContent = '🔕 Notificaciones desactivadas';
          sub.textContent = 'Actívalas para no perderte ninguna convocatoria';
          btn.textContent = 'Activar';
          btn.style.background = 'rgba(245,158,11,.1)';
          btn.style.color = '#fbbf24';
          btn.style.borderColor = 'rgba(245,158,11,.2)';
        }
      }

      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Procesando...';
        const subscribed = await isSubscribed();
        const result = subscribed
          ? await unsubscribeFromPush(supabase)
          : await subscribeToPush(supabase);
        txt.textContent = result.message;
        setTimeout(refreshPushUI, 800);
      });

      refreshPushUI();
    })();
