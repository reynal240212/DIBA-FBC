/**
 * DIBA FBC - Push Manager Module (Core Logic)
 */
import { supabase } from '../../core/supabase.js';

const VAPID_PUBLIC_KEY = "BKosD0G5j6-k8f9Z5yIu9Hl3-Hj4j6J8J9K0L1M2N3P4Q5R6S7T8U9V0W1X2Y3Z"; // Reemplazar con clave real si es dinámica

export async function subscribeToPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: VAPID_PUBLIC_KEY
        });

        const { error } = await supabase.from('push_subscriptions').upsert({
            endpoint: subscription.endpoint,
            keys: subscription.toJSON().keys,
            user_id: (await supabase.auth.getUser()).data.user?.id
        });

        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Push sub error:", err);
        return false;
    }
}

export async function checkPushStatus() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
}
