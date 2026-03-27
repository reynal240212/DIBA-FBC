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

            status.innerHTML = `<div class="p-6 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-4 animate-fade-up shadow-sm">
                <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-check-circle text-xl"></i>
                </div>
                <div>
                    <p class="font-black uppercase italic text-[11px] leading-none mb-1">¡Enviado con éxito!</p>
                    <p class="text-[10px] font-bold opacity-80">La notificación se ha emitido a ${data.success || 0} dispositivos registrados.</p>
                </div>
            </div>`;
            status.classList.remove('hidden');
            form.reset();
        } catch (err) {
            status.innerHTML = `<div class="p-6 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center gap-4 animate-fade-up shadow-sm">
                <div class="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-xl"></i>
                </div>
                <div>
                    <p class="font-black uppercase italic text-[11px] leading-none mb-1">Error de Emisión</p>
                    <p class="text-[10px] font-bold opacity-80">${err.message}</p>
                </div>
            </div>`;
            status.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span class="relative z-10 flex items-center justify-center gap-3"><i class="fas fa-bolt"></i> Lanzar Notificación</span>';
        }
    });

    console.log("Push Admin Reorganized.");
})();
