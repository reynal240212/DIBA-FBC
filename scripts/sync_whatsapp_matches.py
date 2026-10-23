"""
DIBA FBC - Sync Partidos desde WhatsApp (OpenWA -> Supabase)
Conecta a la instancia local de OpenWA en port 2785, analiza el historial en vivo
del grupo oficial 'Deportivo internacional' (120363141323973958@g.us) y del
contacto 3128051695 (573128051695@c.us), extrae los detalles de los encuentros
y los sincroniza/inserta automáticamente en la tabla 'partidos' de Supabase.
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
TARGET_CHATS = [
    "120363141323973958@g.us",  # Grupo Oficial: Deportivo internacional
    "573128051695@c.us"         # Contacto: Reinaldo Pérez (3128051695)
]

SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q"

MESES_ES = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
    'julio': 7, 'agosto': 8, 'septiembre': 9, 'setiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
}

def get_openwa_chat_history(chat_id, limit=100):
    encoded_chat = urllib.parse.quote(chat_id, safe='')
    url = f"{OPENWA_BASE_URL}/api/sessions/{OPENWA_SESSION_ID}/messages/{encoded_chat}/history?limit={limit}"
    req = urllib.request.Request(url, headers={"x-api-key": OPENWA_API_KEY})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if isinstance(data, list):
                return data
            return data.get('messages', [])
    except Exception as e:
        print(f"[WARN OpenWA] Fallo al consultar history de {chat_id}: {e}")
        return []

def parse_match_message(msg_body, msg_timestamp=None, msg_created_at=None):
    """
    Analiza un texto de WhatsApp y extrae los datos de un partido.
    Retorna None si el mensaje no es una convocatoria/programación de partido.
    """
    if not msg_body:
        return None
    
    text = msg_body.strip()
    text_lower = text.lower()
    
    # Debe contener referencia clara a programación de partido + cancha/hora/vs/convocados
    has_partido = ('partido' in text_lower or 'vs ' in text_lower or 'convocados' in text_lower)
    has_details = ('cancha' in text_lower or 'hora' in text_lower or 'lugar' in text_lower)
    if not (has_partido and has_details):
        return None
    
    # Ignorar recordatorios cortos o mensajes administrativos largos sin programación
    if len(text) < 45 or 'quiero aclararles algo sobre los  tiempos' in text_lower:
        return None
    if text_lower.startswith('recuerden hoy') or text_lower.startswith('les recuerdo'):
        return None

    # 1. Torneo / Descripción
    torneo = "Torneo Local - WhatsApp"
    m_torneo = re.search(r'Torneo\s+([^\n\r]+)', text, re.IGNORECASE)
    if m_torneo:
        torneo = "Torneo " + m_torneo.group(1).strip()
    m_fecha_jornada = re.search(r'(\d+[\s°º\-]*FECHA)', text, re.IGNORECASE)
    if m_fecha_jornada:
        torneo += f" ({m_fecha_jornada.group(1).strip()})"

    # 2. Cancha / Sede
    cancha = "La Bombonera"
    m_cancha = re.search(r'(?:Cancha|Lugar|En la cancha)\s*:?[\s]*([^\n\r]+)', text, re.IGNORECASE)
    if m_cancha:
        val_cancha = m_cancha.group(1).strip().rstrip('.')
        if len(val_cancha) > 2 and not any(w in val_cancha.lower() for w in ['hora', 'partido', 'sabado', 'sábado', 'domingo', 'casa del profe']):
            cancha = val_cancha.title()

    # 3. Categoría
    categoria = "2012"
    m_cat = re.search(r'CATEGOR[IÍ]AS?\s*:?[\s]*([0-9\/\-\s]+)', text, re.IGNORECASE)
    if m_cat:
        cat_clean = m_cat.group(1).strip().replace(" ", "")
        if cat_clean:
            categoria = cat_clean
    else:
        m_cat_alt = re.search(r'\b(201[0-9](?:\/[0-9]{2,4})?)\b', text)
        if m_cat_alt:
            categoria = m_cat_alt.group(1).strip()

    # Normalizar categorías comunes
    if categoria in ['2012/13', '2013/12', '2012-2013']:
        categoria = '2012/2013'
    elif categoria in ['2014/15', '2014/2015', '2015/14']:
        categoria = '2014/2015'
    elif categoria in ['2015/16', '2016/15', '2015/2016']:
        categoria = '2015/2016'

    # 4. Rival / Encuentro
    equipo_local = "DIBA FBC"
    equipo_visitante = "Por definir"
    m_vs = re.search(r'\bVs\.?\s+([^\n\r]+)', text, re.IGNORECASE)
    if m_vs:
        rival = m_vs.group(1).strip()
        rival = re.split(r'hora|cancha|categoria|\$', rival, flags=re.IGNORECASE)[0].strip()
        if rival:
            equipo_visitante = rival.upper()

    # 5. Hora
    hora = "09:00 AM"
    m_hora = re.search(r'HORA\s*(?:EN LA CANCHA)?\s*:?[\s]*([0-9]{1,2}\s*[:; ]\s*[0-9]{2}(?:\s*(?:am|pm|a\s*m|p\s*m))?)', text, re.IGNORECASE)
    if m_hora:
        raw_h = m_hora.group(1).strip().upper().replace(';', ':').replace('A M', 'AM').replace('P M', 'PM')
        raw_h = re.sub(r'(\d{1,2})\s+(\d{2})', r'\1:\2', raw_h)
        raw_h = re.sub(r'\s+', ' ', raw_h)
        if not re.search(r'AM|PM', raw_h):
            h_num = int(raw_h.split(':')[0])
            raw_h += " AM" if (h_num >= 6 and h_num <= 11) else " PM"
        hora = raw_h

    # 6. Fecha (Año, Mes, Día)
    base_dt = datetime.now(timezone.utc)
    if msg_timestamp:
        try:
            # OpenWA timestamps can be offset; use 2026 as default club season year if needed
            ts_dt = datetime.fromtimestamp(int(msg_timestamp), tz=timezone.utc)
            base_dt = ts_dt
        except Exception:
            pass
    elif msg_created_at:
        try:
            base_dt = datetime.fromisoformat(msg_created_at.replace('Z', '+00:00'))
        except Exception:
            pass

    year = 2026
    fecha_iso = f"{year}-{base_dt.month:02d}-{base_dt.day:02d}T12:00:00+00:00"

    m_date = re.search(r'(\d{1,2})\s+de\s+([a-zA-Z]+)', text, re.IGNORECASE)
    if m_date:
        dia = int(m_date.group(1))
        mes_str = m_date.group(2).lower()
        mes = MESES_ES.get(mes_str, base_dt.month)
        try:
            h_match = re.search(r'(\d{1,2}):(\d{2})\s*(AM|PM)?', hora, re.IGNORECASE)
            h_val, m_val = 9, 0
            if h_match:
                h_val = int(h_match.group(1))
                m_val = int(h_match.group(2))
                ampm = (h_match.group(3) or '').upper()
                if ampm == 'PM' and h_val < 12:
                    h_val += 12
                elif ampm == 'AM' and h_val == 12:
                    h_val = 0
            dt = datetime(year, mes, dia, h_val, m_val, 0, tzinfo=timezone.utc)
            fecha_iso = dt.isoformat()
        except Exception as e:
            print(f"[WARN] Error armando fecha: {e}")

    # 7. Arbitraje / Valor
    valor = 6000
    m_val = re.search(r'\$\s*([0-9\.]+)\s*(?:arbitrajes|arbitraje)', text, re.IGNORECASE)
    if m_val:
        try:
            valor = int(m_val.group(1).replace('.', ''))
        except Exception:
            valor = 6000

    # 8. Uniforme
    uniforme = "Nuevo de competencia"
    if 'antiguo' in text_lower:
        uniforme = "Homenaje a Barranquilla (antiguo)"
    elif 'rojo' in text_lower:
        uniforme = "Uniforme Rojo"

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
        "observaciones": text[:2500],
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
            print(f"[SUPABASE OK] Partido insertado: {match_data['fecha'][:10]} {match_data['hora']} | {match_data['equipolocal']} vs {match_data['equipovisitante']} ({match_data['categoria']})")
            return res
    except urllib.error.HTTPError as e:
        print(f"[ERROR Supabase HTTP] {e.code}: {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"[ERROR Supabase] {e}")
        return None

def sync_whatsapp_matches():
    print("\n=======================================================")
    print("DIBA FBC - SINCRONIZADOR DE PARTIDOS DESDE WHATSAPP")
    print(f"Sesión OpenWA: {OPENWA_SESSION_ID}")
    print(f"Chats objetivo: {', '.join(TARGET_CHATS)}")
    print("=======================================================\n")

    all_messages = []
    for chat_id in TARGET_CHATS:
        msgs = get_openwa_chat_history(chat_id=chat_id, limit=100)
        print(f"Mensajes recuperados de {chat_id}: {len(msgs)}")
        all_messages.extend(msgs)

    existing = get_existing_matches()
    print(f"Partidos existentes en Supabase: {len(existing)}")

    synced_count = 0
    ignored_count = 0
    duplicate_count = 0

    for msg in all_messages:
        body = msg.get('body') or ''
        timestamp = msg.get('timestamp')
        created_at = msg.get('createdAt')

        parsed = parse_match_message(body, timestamp, created_at)
        if not parsed:
            ignored_count += 1
            continue

        parsed_date_prefix = parsed['fecha'][:10]
        is_dup = False
        for ex in existing:
            ex_date_prefix = (ex.get('fecha') or '')[:10]
            if (ex_date_prefix == parsed_date_prefix and
                str(ex.get('categoria', '')).strip() == parsed['categoria'] and
                str(ex.get('hora', '')).strip().upper() == parsed['hora'].upper()):
                is_dup = True
                break

        if is_dup:
            duplicate_count += 1
            continue

        inserted = insert_match_to_supabase(parsed)
        if inserted:
            synced_count += 1
            existing.append(parsed)

    print("\n───────────────────────────────────────────────────────")
    print("Resumen de sincronización:")
    print(f"  Partidos nuevos insertados: {synced_count}")
    print(f"  Partidos omitidos por duplicado: {duplicate_count}")
    print(f"  Mensajes no relacionados: {ignored_count}")
    print("───────────────────────────────────────────────────────\n")
    return synced_count

if __name__ == "__main__":
    sync_whatsapp_matches()
