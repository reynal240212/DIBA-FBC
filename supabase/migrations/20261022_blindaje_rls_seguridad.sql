-- ============================================================
-- DIBA FBC - MIGRACIÓN DE SEGURIDAD Y BLINDAJE RLS
-- Fecha: 2026-10-22
-- Objetivo: Evitar la fuga de datos personales en DevTools Network
-- ============================================================

-- 1. Habilitar RLS en tablas críticas y de mensajería
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_auto_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_attendance_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas previas si existieran
DROP POLICY IF EXISTS "Admin full access whatsapp_contacts" ON whatsapp_contacts;
DROP POLICY IF EXISTS "Admin full access whatsapp_conversations" ON whatsapp_conversations;
DROP POLICY IF EXISTS "Admin full access whatsapp_messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Admin full access whatsapp_templates" ON whatsapp_templates;
DROP POLICY IF EXISTS "Admin full access whatsapp_auto_replies" ON whatsapp_auto_replies;
DROP POLICY IF EXISTS "Admin full access whatsapp_events" ON whatsapp_events;
DROP POLICY IF EXISTS "Admin full access whatsapp_attendance_responses" ON whatsapp_attendance_responses;
DROP POLICY IF EXISTS "Admin full access whatsapp_config" ON whatsapp_config;
DROP POLICY IF EXISTS "Users self and admin read" ON users;
DROP POLICY IF EXISTS "Users admin modify" ON users;

-- 3. Políticas para administradores autenticados
-- Acceso completo a módulos de WhatsApp únicamente para usuarios autenticados con rol admin
CREATE POLICY "Admin full access whatsapp_contacts" ON whatsapp_contacts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admin full access whatsapp_conversations" ON whatsapp_conversations
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admin full access whatsapp_messages" ON whatsapp_messages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admin full access whatsapp_templates" ON whatsapp_templates
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admin full access whatsapp_auto_replies" ON whatsapp_auto_replies
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admin full access whatsapp_events" ON whatsapp_events
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admin full access whatsapp_attendance_responses" ON whatsapp_attendance_responses
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Admin full access whatsapp_config" ON whatsapp_config
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- 4. Blindaje de la tabla users: cada usuario solo ve su propio registro, y los admins pueden ver y gestionar todo
CREATE POLICY "Users self and admin read" ON users
  FOR SELECT TO authenticated
  USING (users.id = auth.uid() OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

CREATE POLICY "Users admin modify" ON users
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- 5. Creación de vista pública sanitizada para deportistas (evita filtrar DNI, teléfono y datos biográficos)
CREATE OR REPLACE VIEW vista_deportistas_publica AS
SELECT 
    numero,
    nombre,
    apellidos,
    categoria,
    foto_url
FROM identificacion;

GRANT SELECT ON vista_deportistas_publica TO anon, authenticated;
