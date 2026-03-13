import { supabase, requireAdmin } from "./supabaseClient.js";

// Protection & Unified UI
requireAdmin().then(session => {
  if (session) {
    const user = session.user;
    if (user) {
      // Find elements and update
      const sbName = document.getElementById('sb-name');
      const sbAvatar = document.getElementById('sb-avatar');
      
      if (sbName && sbAvatar) {
        sbName.textContent = user.email.split('@')[0];
        sbAvatar.textContent = user.email[0].toUpperCase();
      }
    }
  }
});

const form = document.getElementById('push-form');
const btn = document.getElementById('send-btn');
const btnText = document.getElementById('btn-text');
const loader = document.getElementById('btn-loader');
const statusBox = document.getElementById('status-container');

/**
 * Muestra alertas en la interfaz de admin
 */
const showStatus = (msg, type = 'success') => {
    statusBox.className = `p-4 rounded-2xl border text-xs font-bold uppercase tracking-wider animate__animated animate__fadeIn ${
        type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
    }`;
    statusBox.textContent = msg;
    statusBox.classList.remove('hidden');
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        title: document.getElementById('push-title').value.trim(),
        body: document.getElementById('push-body').value.trim(),
        url: document.getElementById('push-url').value.trim() || '/',
        target: document.getElementById('push-target').value
    };

    // UI Feedback
    btn.disabled = true;
    loader.classList.remove('hidden');
    btnText.textContent = 'Enviando...';
    statusBox.classList.add('hidden');

    try {
        // Verificar sesión de admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Sesión de administrador no válida.');

        // Llamar a la Edge Function de Supabase
        // El nombre de la función es 'send-push' (debe estar desplegada)
        const { data, error } = await supabase.functions.invoke('send-push', {
            body: payload
        });

        if (error) throw error;

        showStatus(`¡Éxito! Notificación enviada correctamente.`);
        form.reset();
        // Reset preview
        document.getElementById('preview-title').textContent = 'Título de prueba';
        document.getElementById('preview-body').textContent = 'El contenido que escribas arriba aparecerá aquí...';

    } catch (err) {
        console.error('[AdminPush] Error:', err);
        showStatus(`Error al enviar: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
        loader.classList.add('hidden');
        btnText.textContent = 'Lanzar Notificación';
    }
});

// Logout logic
document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});
