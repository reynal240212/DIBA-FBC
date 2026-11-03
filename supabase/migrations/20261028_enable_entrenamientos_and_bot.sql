-- ============================================================
-- DIBA FBC - MIGRACIÓN DE POLÍTICAS Y RESPUESTAS DEL BOT
-- Fecha: 2026-10-28
-- Objetivo:
-- 1. Habilitar políticas de lectura y registro en tabla 'entrenamientos'
-- 2. Asegurar respuestas automáticas por defecto para el Bot de WhatsApp
-- ============================================================

-- 1. Políticas para tabla 'entrenamientos'
ALTER TABLE IF EXISTS entrenamientos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read entrenamientos" ON entrenamientos;
CREATE POLICY "Public read entrenamientos" ON entrenamientos
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public insert entrenamientos" ON entrenamientos;
CREATE POLICY "Public insert entrenamientos" ON entrenamientos
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public update entrenamientos" ON entrenamientos;
CREATE POLICY "Public update entrenamientos" ON entrenamientos
  FOR UPDATE TO anon, authenticated
  USING (true);

-- 2. Insertar o actualizar respuestas del bot en whatsapp_auto_replies
INSERT INTO whatsapp_auto_replies (keyword, response, match_type, priority, category, active)
VALUES
('entrenamiento', '⚽ *HORARIOS DE ENTRENAMIENTO — DIBA FBC* 🏃‍♂️\n\n📅 *Lunes, Miércoles y Viernes:*\n• *Categorías 2014 / 2015 / 2016:* 4:00 PM a 5:30 PM\n• *Categorías 2012 / 2013:* 5:30 PM a 7:00 PM\n\n📍 *Sede:* Cancha Parque La Pradera, Barranquilla.\n👟 *Indumentaria:* Uniforme oficial o camiseta de entreno, guayos y canilleras.\n\n🌐 Programación web: https://diba-fbc.vercel.app/partidos.html?tab=entrenamientos', 'contains', 12, 'info', true),
('entrenamientos', '⚽ *HORARIOS DE ENTRENAMIENTO — DIBA FBC* 🏃‍♂️\n\n📅 *Lunes, Miércoles y Viernes:*\n• *Categorías 2014 / 2015 / 2016:* 4:00 PM a 5:30 PM\n• *Categorías 2012 / 2013:* 5:30 PM a 7:00 PM\n\n📍 *Sede:* Cancha Parque La Pradera, Barranquilla.\n👟 *Indumentaria:* Uniforme oficial o camiseta de entreno, guayos y canilleras.\n\n🌐 Programación web: https://diba-fbc.vercel.app/partidos.html?tab=entrenamientos', 'contains', 12, 'info', true),
('practica', '⚽ *HORARIOS DE PRÁCTICA — DIBA FBC* 🏃‍♂️\n\n📅 *Lunes, Miércoles y Viernes:*\n• *Categorías 2014 / 2015 / 2016:* 4:00 PM a 5:30 PM\n• *Categorías 2012 / 2013:* 5:30 PM a 7:00 PM\n\n📍 *Sede:* Cancha Parque La Pradera, Barranquilla.\n\n🌐 Programación web: https://diba-fbc.vercel.app/partidos.html?tab=entrenamientos', 'contains', 12, 'info', true),
('partido', '🏆 *PARTIDOS Y CONVOCATORIAS — DIBA FBC* ⚽\n\nConsulta los partidos oficiales del fin de semana, rivales, canchas y resultados en:\n👉 https://diba-fbc.vercel.app/partidos.html', 'contains', 11, 'info', true),
('partidos', '🏆 *PARTIDOS Y CONVOCATORIAS — DIBA FBC* ⚽\n\nConsulta los partidos oficiales del fin de semana, rivales, canchas y resultados en:\n👉 https://diba-fbc.vercel.app/partidos.html', 'contains', 11, 'info', true),
('horario', '📅 *Horarios de entrenamiento:*\nLunes, Miércoles y Viernes: 4:00 PM - 7:00 PM\nSábados: Partidos y prácticas matutinas desde las 7:30 AM\n\n📍 Sede: Cancha Parque La Pradera', 'contains', 10, 'info', true),
('sede', '📍 *Nuestra sede:* Cancha Parque La Pradera, Barranquilla.\n\n🗺️ Mapa interactivo: https://diba-fbc.vercel.app/partidos.html?tab=mapa', 'contains', 9, 'info', true),
('inscripciones', '📝 *¿Quieres inscribirte en DIBA FBC?*\n\n¡Forma parte de nuestra academia! Aceptamos niños y jóvenes de 5 a 15 años.\n📲 Contacta al DT Reinaldo Pérez al +57 324 665 6083 o acércate a los entrenamientos.', 'contains', 9, 'info', true)
ON CONFLICT DO NOTHING;
