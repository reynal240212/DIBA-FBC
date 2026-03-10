// ============================================================
//  DIBA FBC — Push Notification Manager
//  Gestiona suscripción/desuscripción de Web Push por usuario
// ============================================================

// VAPID Public Key (la clave privada vive solo en la Edge Function de Supabase)
// Para generar nuevas: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HNFr0o2eNHV-YQQRFQ5y7C_UuJJpBRhD_kTl2dFeraqNRNvpLQOKFnBcM';

/**
 * Convierte una clave VAPID base64url a Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * Verifica si las notificaciones push están soportadas y el usuario ya tiene permiso
 */
export function isPushSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Retorna el estado actual: 'unsupported' | 'denied' | 'granted' | 'default'
 */
export function getPushPermission() {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
}

/**
 * Suscribe al usuario a notificaciones push y guarda en Supabase
 * @param {object} supabase - instancia del cliente de Supabase
 * @returns {{ success: boolean, message: string }}
 */
export async function subscribeToPush(supabase) {
    if (!isPushSupported()) return { success: false, message: 'Tu navegador no soporta push notifications.' };

    // Pedir permiso al usuario
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        return { success: false, message: 'Permiso denegado por el usuario.' };
    }

    try {
        // Obtener el Service Worker activo
        const registration = await navigator.serviceWorker.ready;

        // Suscribirse al PushManager con la clave VAPID pública
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const subJSON = subscription.toJSON();

        // Guardar suscripción en Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Debes iniciar sesión primero.' };

        const { error } = await supabase.from('push_subscriptions').upsert({
            user_id: user.id,
            endpoint: subJSON.endpoint,
            keys: subJSON.keys,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'endpoint' });

        if (error) throw error;

        return { success: true, message: '¡Notificaciones activadas correctamente!' };
    } catch (err) {
        console.error('[PushManager] Error al suscribir:', err);
        return { success: false, message: `Error: ${err.message}` };
    }
}

/**
 * Cancela la suscripción push del usuario actual
 * @param {object} supabase - instancia del cliente de Supabase
 * @returns {{ success: boolean, message: string }}
 */
export async function unsubscribeFromPush(supabase) {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) return { success: true, message: 'No había suscripción activa.' };

        // Eliminar de Supabase primero
        await supabase.from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint);

        // Desuscribir del navegador
        await subscription.unsubscribe();

        return { success: true, message: 'Notificaciones desactivadas.' };
    } catch (err) {
        console.error('[PushManager] Error al desuscribir:', err);
        return { success: false, message: `Error: ${err.message}` };
    }
}

/**
 * Comprueba si el usuario actual está suscrito a push
 * @returns {boolean}
 */
export async function isSubscribed() {
    if (!isPushSupported() || Notification.permission !== 'granted') return false;
    try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        return !!sub;
    } catch {
        return false;
    }
}
