/**
 * Cliente para interactuar con Ollama (IA Local)
 * DIBA FBC - Gestión Deportiva Inteligente
 */

export const OLLAMA_CONFIG = {
    baseUrl: 'http://localhost:11434',
    model: 'llama3', // Modelo sugerido
};

/**
 * Envía una petición de chat a Ollama
 * @param {string} prompt - El mensaje para la IA
 * @param {Array} history - Historial de la conversación (opcional)
 * @returns {Promise<string>} - La respuesta de la IA
 */
export async function chatWithAI(prompt, history = []) {
    try {
        const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: OLLAMA_CONFIG.model,
                messages: [
                    ...history,
                    { role: 'user', content: prompt }
                ],
                stream: false // Desactivamos stream para simplificar la primera integración
            }),
        });

        if (!response.ok) {
            throw new Error(`Error al conectar con Ollama: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message.content;
    } catch (error) {
        console.error('Error en ollamaClient:', error);
        throw error;
    }
}

/**
 * Verifica si Ollama está disponible y configurado con CORS
 */
export async function checkOllamaAvailability() {
    try {
        const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/tags`);
        return response.ok;
    } catch (e) {
        return false;
    }
}
