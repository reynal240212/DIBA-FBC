import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Datos de prueba
    const partidosDummy = [
      { id: 1, equipoLocal: "DIBA FBC", equipoVisitante: "Rival FC", fecha: "2025-08-20", resultado: "2-1" },
      { id: 2, equipoLocal: "DIBA FBC", equipoVisitante: "Otro FC", fecha: "2025-08-27", resultado: "1-3" }
    ];
    
    res.status(200).json(partidosDummy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}