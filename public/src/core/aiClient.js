/**
 * Cliente para interactuar con el Asistente de IA Global (Groq via Supabase)
 * DIBA FBC - Gestión Deportiva Inteligente
 */

import { supabase } from '../../scripts/supabaseClient.js';

/**
 * Envía una petición de chat al asistente global en Supabase
 * @param {string} prompt - El mensaje para la IA
 * @param {Array} history - Historial de la conversación (opcional)
 * @returns {Promise<string>} - La respuesta de la IA
 */
export async function chatWithAI(prompt, history = []) {
    try {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
            body: { prompt, history },
        });

        if (error) throw error;
        return data.content;
    } catch (error) {
        console.error('Error en aiClient:', error);
        throw error;
    }
}

/**
 * Verifica si el servicio de IA está activo
 */
export async function checkAIStatus() {
    try {
        const { error } = await supabase.functions.invoke('ai-assistant', {
            method: 'OPTIONS'
        });
        return !error;
    } catch (e) {
        return false;
    }
}
