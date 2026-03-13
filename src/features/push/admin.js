/**
 * DIBA FBC - Admin Push Feature Entry Point
 */
import { supabase, requireAdmin } from '../../core/supabase.js';

(async () => {
    const session = await requireAdmin();
    if (!session) return;
    const user = session.user;

    // Update UI session data
    const sbName = document.getElementById('sb-name');
    const sbAvatar = document.getElementById('sb-avatar');
    if (sbName && user) sbName.textContent = user.email.split('@')[0];
    if (sbAvatar && user) sbAvatar.textContent = user.email[0].toUpperCase();

    const form = document.getElementById('push-form');
    const btn = document.getElementById('send-btn');
    const status = document.getElementById('status-container');
    
    // Live Preview Logic
    const titleInput = document.getElementById('push-title');
    const bodyInput = document.getElementById('push-body');
    const previewTitle = document.getElementById('preview-title');
    const previewBody = document.getElementById('preview-body');

    titleInput?.addEventListener('input', (e) => {
        if (previewTitle) previewTitle.textContent = e.target.value || 'Título de prueba';
    });
    bodyInput?.addEventListener('input', (e) => {
        if (previewBody) previewBody.textContent = e.target.value || 'El contenido aparecerá aquí...';
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: titleInput.value,
            body: bodyInput.value,
            url: document.getElementById('push-url').value,
            target: document.getElementById('push-target').value
        };

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';

        try {
            const { data, error } = await supabase.functions.invoke('send-push', { body: payload });
            if (error) throw error;

            status.innerHTML = `<div class="p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center gap-3 animate__animated animate__fadeIn">
                <i class="fas fa-check-circle text-xl"></i>
                <div>
                    <p class="font-black uppercase italic text-[10px]">¡Enviado con éxito!</p>
                    <p class="text-[9px] font-bold">La notificación se ha enviado a ${data.success || 0} dispositivos.</p>
                </div>
            </div>`;
            status.classList.remove('hidden');
            form.reset();
        } catch (err) {
            status.innerHTML = `<div class="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-bold text-[10px] uppercase">Error: ${err.message}</div>`;
            status.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Notificación';
        }
    });

    console.log("Push Admin Reorganized.");
})();
