/**
 * Cliente para interactuar con el Asistente de IA Global (Groq via Supabase)
 * DIBA FBC - Gestión Deportiva Inteligente
 */

import { supabase } from '../../scripts/supabaseClient.js';

/**
 * Envía una petición de chat al asistente global en Supabase
 * @param {string} prompt - El mensaje para la IA
 * @param {Array} history - Historial de la conversación (opcional)
 * @param {Object} clubContext - Datos en tiempo real del dashboard (opcional)
 * @returns {Promise<string>} - La respuesta de la IA
 */
export async function chatWithAI(prompt, history = [], clubContext = null) {
    try {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
            body: { prompt, history, clubContext },
        });

        if (error) throw error;
        return data.content;
    } catch (error) {
        console.error('Error en aiClient:', error);
        throw error;
    }
}

/**
 * Verifica si el servicio de IA está activo mediante un ping
 */
export async function checkAIStatus() {
    try {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
            body: { ping: true }
        });
        return !error && data?.status === 'ok';
    } catch (e) {
        return false;
    }
}
