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
        const channel = document.getElementById('push-channel').value; // 'web', 'wa', 'both'

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';

        try {
            let webPushSuccess = 0;
            let waPushSuccess = 0;
            let resultMessage = '';

            if (channel === 'web' || channel === 'both') {
                const { data, error } = await supabase.functions.invoke('send-push', { body: payload });
                if (error && channel === 'web') throw error;
                if (data) webPushSuccess = data.success || 0;
            }

            if (channel === 'wa' || channel === 'both') {
                let targetQuery = supabase.from('identificacion').select('celular').not('celular', 'is', null).neq('celular', '');
                if (payload.target !== 'all') {
                    targetQuery = targetQuery.eq('categoria', payload.target);
                }
                const { data: phonesData, error: phonesError } = await targetQuery;
                if (phonesError && channel === 'wa') throw phonesError;

                if (phonesData) {
                    const openwaEndpoint = 'http://localhost:2785/api/sessions/default/messages/send-text';
                    const waMessage = `*${payload.title}*\n\n${payload.body}\n\nEnlace: https://diba-fbc.vercel.app${payload.url || ''}`;

                    for (const p of phonesData) {
                        if (!p.celular) continue;
                        let cleanPhone = p.celular.replace(/\D/g, '');
                        if (cleanPhone.length === 10) cleanPhone = '57' + cleanPhone;
                        
                        try {
                            const waRes = await fetch(openwaEndpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    chatId: `${cleanPhone}@c.us`,
                                    text: waMessage
                                })
                            });
                            if (waRes.ok) waPushSuccess++;
                        } catch (err) {
                            console.error('Error enviando WA a', cleanPhone, err);
                        }
                    }
                }
            }

            if (channel === 'web') resultMessage = `${webPushSuccess} dispositivos web.`;
            else if (channel === 'wa') resultMessage = `${waPushSuccess} números de WhatsApp.`;
            else resultMessage = `${webPushSuccess} web push y ${waPushSuccess} WhatsApps.`;

            status.innerHTML = `<div class="p-6 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-4 animate-fade-up shadow-sm">
                <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-check-circle text-xl"></i>
                </div>
                <div>
                    <p class="font-black uppercase italic text-[11px] leading-none mb-1">¡Enviado con éxito!</p>
                    <p class="text-[10px] font-bold opacity-80">Enviado a ${resultMessage}</p>
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
