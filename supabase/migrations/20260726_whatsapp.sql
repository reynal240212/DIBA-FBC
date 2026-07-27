-- ============================================================
-- DIBA FBC - WhatsApp Module (OpenWA Integration)
-- ============================================================

-- 1. Contactos WhatsApp (vinculados a jugadores/usuarios)
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    player_id UUID REFERENCES identificacion(numero) ON DELETE SET NULL,
    category VARCHAR(50),
    role VARCHAR(20) DEFAULT 'tutor' CHECK (role IN ('jugador', 'tutor', 'staff', 'admin')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversaciones
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mensajes
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES whatsapp_contacts(id) ON DELETE SET NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'template', 'button', 'list')),
    body TEXT NOT NULL,
    template_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Plantillas de mensajes
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('convocatoria', 'asistencia', 'llamado', 'resultado', 'info', 'general')),
    subject VARCHAR(200),
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Respuestas automáticas (bot)
CREATE TABLE IF NOT EXISTS whatsapp_auto_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword VARCHAR(100) NOT NULL,
    response TEXT NOT NULL,
    match_type VARCHAR(20) DEFAULT 'exact' CHECK (match_type IN ('exact', 'contains', 'starts_with', 'regex')),
    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    category VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Eventos de convocatoria (para tracking de asistencia)
CREATE TABLE IF NOT EXISTS whatsapp_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('convocatoria', 'llamado', 'resultado', 'informativo')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    match_date TIMESTAMPTZ,
    location VARCHAR(200),
    category_filter VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'closed')),
    total_sent INTEGER DEFAULT 0,
    total_confirmed INTEGER DEFAULT 0,
    total_declined INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Respuestas de asistencia
CREATE TABLE IF NOT EXISTS whatsapp_attendance_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES whatsapp_events(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
    response VARCHAR(10) CHECK (response IN ('si', 'no', 'tal_vez')),
    responded_at TIMESTAMPTZ DEFAULT NOW(),
    message_id UUID REFERENCES whatsapp_messages(id) ON DELETE SET NULL
);

-- 8. Configuración de OpenWA
CREATE TABLE IF NOT EXISTS whatsapp_config (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    api_url VARCHAR(500) NOT NULL,
    api_key VARCHAR(200),
    webhook_url VARCHAR(500),
    session_status VARCHAR(20) DEFAULT 'disconnected' CHECK (session_status IN ('connected', 'disconnected', 'qr_pending')),
    connected_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_phone ON whatsapp_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_category ON whatsapp_contacts(category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_events_type ON whatsapp_events(event_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auto_replies_keyword ON whatsapp_auto_replies(keyword);

-- ============================================================
-- PLANTILLAS POR DEFECTO
-- ============================================================
INSERT INTO whatsapp_templates (name, category, subject, body, variables) VALUES
('convocatoria_partido', 'convocatoria', 'Convocatoria - {{equipo}}',
'⚽ CONVOCATORIA OFICIAL DIBA FBC

📅 Fecha: {{fecha}}
🕐 Hora: {{hora}}
📍 Lugar: {{lugar}}
🏆 Competición: {{competencia}}

Equipo: {{equipo}}
Categoría: {{categoria}}

Por favor confirmar asistencia respondiendo:
✅ SÍ — Asistiré
❌ NO — No podré asistir

¡DIBA FBC! 💙💛',
'["equipo","fecha","hora","lugar","competencia","categoria"]'),

('alerta_llamado', 'llamado', 'Llamado - {{jugador}}',
'📢 LLAMADO OFICIAL DIBA FBC

{{jugador}}, has sido convocado para:

📅 {{fecha}}
🕐 {{hora}}
📍 {{lugar}}
👕 Uniforme: {{uniforme}}

Confirma tu asistencia:
✅ SÍ — Voy
❌ NO — No puedo

DIBA FBC 💙💛',
'["jugador","fecha","hora","lugar","uniforme"]'),

('reporte_resultado', 'resultado', 'Resultado - {{equipo}}',
'🏆 RESULTADO DEL PARTIDO

{{equipo}} vs {{rival}}
📅 {{fecha}}

⚽ Marcador: {{marcador}}
📝 Resumen: {{resumen}}

Equipo DIBA FBC 💙💛',
'["equipo","rival","fecha","marcador","resumen"]'),

('info_horarios', 'info', 'Información DIBA FBC',
'⚽ DIBA FBC - Información

Horarios de entrenamiento:
📅 Lunes a Viernes: {{horario_entreno}}
📅 Sábados: {{horario_sabado}}

Sede: {{sede}}
Contacto: {{contacto}}

Para más información visita nuestro sitio web.

DIBA FBC 💙💛',
'["horario_entreno","horario_sabado","sede","contacto"]'),

('confirmacion_asistencia', 'asistencia', 'Confirmación de Asistencia',
'✅ Confirmación de Asistencia

Hola {{nombre}}, tu asistencia para el evento del {{fecha}} ha sido registrada.

📍 {{lugar}}
🕐 {{hora}}

¡Te esperamos! DIBA FBC 💙💛',
'["nombre","fecha","lugar","hora"]')

ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- RESPUESTAS AUTOMÁTICAS POR DEFECTO
-- ============================================================
INSERT INTO whatsapp_auto_replies (keyword, response, match_type, priority, category) VALUES
('hola', '⚽ ¡Hola! Bienvenido al canal de DIBA FBC. ¿En qué podemos ayudarte?', 'contains', 10, 'info'),
('horario', '📅 Horarios de entrenamiento:\nLunes a Viernes: 4:00 PM - 6:00 PM\nSábados: 8:00 AM - 10:00 AM\n\n📍 Sede: Cancha DIBA FBC', 'contains', 8, 'info'),
('sede', '📍 Nuestra sede se encuentra en: Cancha DIBA FBC\n\nPara llegar consulta nuestro mapa en la página web.', 'contains', 8, 'info'),
('resultado', '⚽ Para conocer los resultados visita nuestra página web o sigue nuestras redes sociales.', 'contains', 7, 'info'),
('inscripciones', '📝 ¿Quieres inscribirte en DIBA FBC?\n\nContacta al DT al número de esta línea o acércate a nuestra sede en horarios de entrenamiento.', 'contains', 9, 'info'),
('gracias', '¡De nada! 💙💛 ¡DIBA FBC siempre contigo!', 'contains', 5, 'info')
ON CONFLICT DO NOTHING;
