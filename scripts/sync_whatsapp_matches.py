"""
DIBA FBC - Sync Partidos desde WhatsApp (OpenWA -> Supabase)
Conecta a la instancia local de OpenWA en port 2785, analiza los mensajes del
contacto 3128051695 (programación de partidos / torneos), extrae los detalles
de los encuentros y los sincroniza/inserta en la tabla 'partidos' de Supabase.

Cero emojis, tipografía y diseño oficial DIBA FBC.
"""

import urllib.request
import urllib.parse
import json
import re
import sys
from datetime import datetime, timezone

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


# ── Configuración ──────────────────────────────────────────────
OPENWA_BASE_URL = "http://localhost:2785"
OPENWA_API_KEY = "dev-admin-key"
OPENWA_SESSION_ID = "4c331538-1a66-4002-93d2-cb49e5fa2ad3"
TARGET_CONTACT = "573128051695@c.us"

SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q"

MESES_ES = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
    'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
}

def get_openwa_messages(chat_id=TARGET_CONTACT, limit=50):
    url = f"{OPENWA_BASE_URL}/api/sessions/{OPENWA_SESSION_ID}/messages?chatId={urllib.parse.quote(chat_id)}&limit={limit}"
    req = urllib.request.Request(url, headers={"x-api-key": OPENWA_API_KEY})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('messages', [])
    except Exception as e:
        print(f"[ERROR OpenWA] Fallo al consultar mensajes: {e}")
        return []

def parse_match_message(msg_body, msg_created_at=None):
    """
    Analiza un texto de WhatsApp y extrae los datos de un partido.
    Retorna None si el mensaje no es una convocatoria/programación de partido.
    """
    if not msg_body:
        return None
    
    text = msg_body.strip()
    text_lower = text.lower()
    
    # Solo procesar mensajes que contengan términos de programación de partidos
    if not ('partido' in text_lower or 'cancha' in text_lower or 'vs' in text_lower or 'categoria' in text_lower):
        return None
    
    # Ignorar mensajes irrelevantes de chat casual
    if len(text) < 30 or 'pizza' in text_lower or 'recarga' in text_lower or 'rifa' in text_lower or 'nequi' in text_lower and not 'partido' in text_lower:
        if not ('partido' in text_lower and ('cancha' in text_lower or 'hora' in text_lower)):
            return None

    # 1. Torneo / Descripción
    torneo = "Torneo Local"
    m_torneo = re.search(r'Torneo\s+([^\n\r]+)', text, re.IGNORECASE)
    if m_torneo:
        torneo = m_torneo.group(1).strip()
    m_fecha_jornada = re.search(r'(\d+[\s°\-]*FECHA)', text, re.IGNORECASE)
    if m_fecha_jornada:
        torneo += f" - {m_fecha_jornada.group(1).strip()}"

    # 2. Cancha / Sede
    cancha = "La Bombonera"
    m_cancha = re.search(r'(?:Cancha|Lugar|En la cancha)\s*:?[\s]*([^\n\r]+)', text, re.IGNORECASE)
    if m_cancha:
        val_cancha = m_cancha.group(1).strip()
        if len(val_cancha) > 2 and not any(w in val_cancha.lower() for w in ['hora', 'partido', 'sabado', 'domingo']):
            cancha = val_cancha.title()

    # 3. Categoría
    categoria = "2012"
    m_cat = re.search(r'CATEGORIA\s*:?[\s]*([0-9\/\-\s]+)', text, re.IGNORECASE)
    if m_cat:
        cat_clean = m_cat.group(1).strip().replace(" ", "")
        if cat_clean:
            categoria = cat_clean
    else:
        # Intento alternativo cat 2014/15
        m_cat_alt = re.search(r'cat\s+([0-9\/\-]+)', text, re.IGNORECASE)
        if m_cat_alt:
            categoria = m_cat_alt.group(1).strip()

    # Normalizar categorías comunes
    if categoria in ['2014/15', '2014/2015']:
        categoria = '2014/2015'
    elif categoria in ['2015/16', '2015/2016']:
        categoria = '2015/2016'

    # 4. Rival / Encuentro (Local y Visitante)
    equipo_local = "DIBA FBC"
    equipo_visitante = "Por definir"
    m_vs = re.search(r'Vs\s+([^\n\r]+)', text, re.IGNORECASE)
    if m_vs:
        rival = m_vs.group(1).strip()
        # Limpiar palabras extra si vienen pegadas
        rival = re.split(r'hora|cancha|categoria|\$', rival, flags=re.IGNORECASE)[0].strip()
        if rival:
            equipo_visitante = rival.upper()

    # 5. Hora
    hora = "09:00 AM"
    m_hora = re.search(r'HORA\s*:?[\s]*([0-9]{1,2}\s*:\s*[0-9]{2}(?:\s*(?:am|pm|AM|PM))?)', text, re.IGNORECASE)
    if m_hora:
        raw_h = m_hora.group(1).strip().upper()
        raw_h = re.sub(r'\s+', ' ', raw_h)
        # Normalizar espacio ej: 9:40 AM
        if not re.search(r'[A-Z]', raw_h):
            # Asumir AM si es < 12 o PM
            h_num = int(raw_h.split(':')[0])
            raw_h += " AM" if h_num < 12 else " PM"
        hora = raw_h

    # 6. Fecha (Año, Mes, Día)
    # Por defecto año actual o el del mensaje
    year = 2026
    if msg_created_at:
        try:
            year = datetime.fromisoformat(msg_created_at.replace('Z', '+00:00')).year
        except Exception:
            year = 2026

    # Buscar "Sabado 17 de octubre"
    fecha_iso = f"{year}-10-17T12:00:00+00:00"
    m_date = re.search(r'(?:partido\s+)?(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)?\s*(\d{1,2})\s+de\s+([a-zA-Z]+)', text, re.IGNORECASE)
    if m_date:
        dia = int(m_date.group(2))
        mes_str = m_date.group(3).lower()
        mes = MESES_ES.get(mes_str, 10)
        # Formar fecha
        try:
            # Calcular hora y minuto para la fecha ISO
            h_match = re.search(r'(\d{1,2}):(\d{2})\s*(am|pm)?', hora, re.IGNORECASE)
            h_val = 9
            m_val = 0
            if h_match:
                h_val = int(h_match.group(1))
                m_val = int(h_match.group(2))
                ampm = (h_match.group(3) or '').lower()
                if ampm == 'pm' and h_val < 12:
                    h_val += 12
                elif ampm == 'am' and h_val == 12:
                    h_val = 0
            dt = datetime(year, mes, dia, h_val, m_val, 0, tzinfo=timezone.utc)
            fecha_iso = dt.isoformat()
        except Exception as e:
            print(f"[WARN] Error armando fecha: {e}")

    # 7. Arbitraje / Valor
    valor = 6000
    m_val = re.search(r'\$?([0-9\.]+)\s*(?:arbitrajes|arbitraje)', text, re.IGNORECASE)
    if m_val:
        try:
            clean_val = m_val.group(1).replace('.', '')
            valor = int(clean_val)
        except Exception:
            valor = 6000

    # 8. Uniforme
    uniforme = "Nuevo de competencia"
    if 'antiguo' in text_lower:
        uniforme = "Homenaje a Barranquilla (antiguo)"
    elif 'nuevo' in text_lower:
        uniforme = "Nuevo de competencia"

    # 9. Convocados / Observaciones
    observaciones = text[:500]

    return {
        "equipolocal": equipo_local,
        "equipovisitante": equipo_visitante,
        "categoria": categoria,
        "Cancha": cancha,
        "fecha": fecha_iso,
        "hora": hora,
        "valor": valor,
        "resultado": "Pendiente",
        "descripcion": torneo,
        "uniforme": uniforme,
        "observaciones": observaciones,
        "metodo_pago": "NEQUI 3246656083 Reinaldo Pérez",
        "escudo_local": "/images/ESCUDO.webp",
        "escudo_visitante": f"https://ui-avatars.com/api/?name={urllib.parse.quote(equipo_visitante)}&background=004d98&color=FFD700&size=200"
    }

def get_existing_matches():
    url = f"{SUPABASE_URL}/rest/v1/partidos?select=id,fecha,hora,equipolocal,equipovisitante,categoria,Cancha"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"[ERROR Supabase] Fallo al leer partidos existentes: {e}")
        return []

def insert_match_to_supabase(match_data):
    url = f"{SUPABASE_URL}/rest/v1/partidos"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    body = json.dumps(match_data).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            print(f"[SUPABASE OK] Partido insertado: {match_data['equipolocal']} vs {match_data['equipovisitante']} ({match_data['categoria']})")
            return res
    except urllib.error.HTTPError as e:
        print(f"[ERROR Supabase HTTP] {e.code}: {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"[ERROR Supabase] {e}")
        return None

def sync_whatsapp_matches(chat_id=TARGET_CONTACT):
    print(f"\n=======================================================")
    print(f"DIBA FBC - SINCRONIZADOR DE PARTIDOS DESDE WHATSAPP")
    print(f"Sesión OpenWA: {OPENWA_SESSION_ID}")
    print(f"Chat objetivo: {chat_id}")
    print(f"=======================================================\n")
    
    messages = get_openwa_messages(chat_id=chat_id, limit=60)
    print(f"Mensajes recuperados de OpenWA: {len(messages)}")
    
    existing = get_existing_matches()
    print(f"Partidos existentes en Supabase: {len(existing)}")
    
    synced_count = 0
    ignored_count = 0
    duplicate_count = 0
    
    for msg in reversed(messages):
        # Solo mensajes entrantes del contacto
        if msg.get('direction') != 'incoming':
            continue
            
        body = msg.get('body') or ''
        created_at = msg.get('createdAt')
        
        parsed = parse_match_message(body, created_at)
        if not parsed:
            ignored_count += 1
            continue
            
        # Comprobar duplicados por fecha pura + hora + categoria + rival
        parsed_date_prefix = parsed['fecha'][:10]
        is_dup = False
        for ex in existing:
            ex_date_prefix = (ex.get('fecha') or '')[:10]
            if (ex_date_prefix == parsed_date_prefix and 
                ex.get('categoria') == parsed['categoria'] and
                ex.get('hora') == parsed['hora']):
                is_dup = True
                break
                
        if is_dup:
            print(f"[DUPLICADO] Partido ya registrado: {parsed_date_prefix} {parsed['hora']} - Cat {parsed['categoria']}")
            duplicate_count += 1
            continue
            
        print(f"\n[NUEVO ENCUENTRO DETECTADO]")
        print(f"  Torneo/Desc: {parsed['descripcion']}")
        print(f"  Fecha:       {parsed['fecha']}")
        print(f"  Hora:        {parsed['hora']}")
        print(f"  Categoría:   {parsed['categoria']}")
        print(f"  Cancha:      {parsed['Cancha']}")
        print(f"  Rival:       {parsed['equipovisitante']}")
        print(f"  Arbitraje:   ${parsed['valor']}")
        
        inserted = insert_match_to_supabase(parsed)
        if inserted:
            synced_count += 1
            existing.append(parsed)
            
    print(f"\n───────────────────────────────────────────────────────")
    print(f"Resumen de sincronización:")
    print(f"  Partidos nuevos insertados: {synced_count}")
    print(f"  Partidos omitidos por duplicado: {duplicate_count}")
    print(f"  Mensajes no relacionados: {ignored_count}")
    print(f"───────────────────────────────────────────────────────\n")
    return synced_count

if __name__ == "__main__":
    sync_whatsapp_matches()
