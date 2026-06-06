/**
 * Cliente para interactuar con el Asistente de IA Global
 * DIBA FBC - Gestión Deportiva Inteligente
 */

/**
 * Envía una petición de chat al asistente global en Vercel
 * @param {string} prompt - El mensaje para la IA
 * @param {Array} history - Historial de la conversación (opcional)
 * @param {Object} clubContext - Datos en tiempo real del dashboard (opcional)
 * @returns {Promise<string>} - La respuesta de la IA
 */
export async function chatWithAI(prompt, history = [], clubContext = null) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, history, clubContext })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error desconocido del servidor de IA');
        }

        if (!data || !data.content) {
            console.warn('AI: Respuesta vacía del servidor');
            return "Lo siento, mi cerebro neuronal no pudo generar una respuesta en este momento.";
        }
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
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ping: true })
        });
        const data = await response.json();
        return response.ok && data?.status === 'ok';
    } catch (e) {
        console.error('Ping AI Error:', e);
        return false;
    }
}
