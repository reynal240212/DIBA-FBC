export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Si viene solo { ping: true } (como hace checkAIStatus)
    if (req.body.ping) {
      return res.status(200).json({ status: 'ok' });
    }

    const { prompt, history, clubContext } = req.body;
    
    // System Prompt que define la "personalidad" de la IA
    const systemPrompt = `Eres el asistente virtual oficial de DIBA FBC (Fuerza y Lealtad), una academia de fútbol juvenil en Barranquilla, Colombia (Categorías: 2012, 2013, 2014/15).
Tu tono es amable, apasionado por el fútbol formativo y profesional.
Ayudas a padres de familia y jugadores con información sobre partidos, clasificaciones, inscripciones y la filosofía del club.
Evita usar formato markdown complejo. Sé directo, inspirador y servicial.
Contexto actual de la academia: ${JSON.stringify(clubContext || 'Múltiples categorías jugando torneos locales, destacando la Generación Victoriosa en Cancha Calancala.')}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: prompt }
    ];

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'El administrador aún no ha configurado la API Key de Groq en el servidor.' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemma2-9b-it',
        messages: messages,
        temperature: 0.6,
        max_tokens: 400
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en la API de Groq');
    }

    const aiMessage = data.choices[0]?.message?.content || 'No pude generar una respuesta.';

    return res.status(200).json({ content: aiMessage });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    return res.status(500).json({ error: 'Error interno del servidor de IA.' });
  }
}
