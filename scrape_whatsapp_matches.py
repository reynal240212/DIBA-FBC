import re
import json
import time
import sys
import os
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright
from supabase import create_client, Client

SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q"

TARGET_DATE = datetime(2026, 4, 12, 15, 20, 0, tzinfo=timezone.utc)

HEADLESS = '--headless' in sys.argv or '-h' in sys.argv
STATE_FILE = 'whatsapp_state.json'

def parse_match_from_text(text):
    patterns = [
        r'(?P<local>[\w\s]+)\s+vs\s+(?P<visitante>[\w\s]+)',
        r'(?P<local>[\w\s]+)\s*-\s*(?P<visitante>[\w\s]+)',
        r'PARTIDO[:\s]+(?P<local>[\w\s]+)\s+(?P<visitante>[\w\s]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group('local').strip(), match.group('visitante').strip()
    return None, None

def parse_date_from_message(text):
    date_patterns = [
        r'(\d{1,2})[/](\d{1,2})[/](\d{4})',
        r'(\d{1,2})-(\d{1,2})-(\d{4})',
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
            try:
                return datetime(year, month, day, 12, 0, 0, tzinfo=timezone.utc)
            except:
                pass
    return None

def parse_hora(text):
    match = re.search(r'(\d{1,2}):(\d{2})\s*(am|pm)?', text, re.IGNORECASE)
    if match:
        hour = int(match.group(1))
        minute = int(match.group(2))
        period = match.group(3)
        if period and period.lower() == 'pm' and hour != 12:
            hour += 12
        return f"{hour:02d}:{minute:02d}"
    return None

def parse_cancha(text):
    match = re.search(r'cancha[:\s]+([\w\s]+?)(?:\n|$)', text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None

def parse_categoria(text):
    match = re.search(r'(?:categor[ií]a|cat)[:\s]*(\d{4})', text, re.IGNORECASE)
    if match:
        return match.group(1)
    return None

def save_state(context):
    context.storage_state(path=STATE_FILE)
    print(f"Estado guardado en {STATE_FILE}")

def load_state():
    if os.path.exists(STATE_FILE):
        return STATE_FILE
    return None

def scrape_whatsapp():
    matches = []

    print("Iniciando navegador...")
    with sync_playwright() as p:
        launch_options = {
            'headless': HEADLESS,
            'args': ['--disable-blink-features=AutomationControlled']
        }

        state_file = load_state()
        if state_file:
            print(f"Usando sesión previa: {state_file}")
            context = p.chromium.launch_persistent_context(
                user_data_dir=os.path.dirname(os.path.abspath(__file__)),
                **launch_options
            )
        else:
            context = p.chromium.launch(**launch_options)

        page = context.new_page()
        print("Abriendo WhatsApp Web: https://web.whatsapp.com")

        if HEADLESS and not state_file:
            print("En modo headless, necesitas autenticarte primero...")
            print("Ejecuta sin --headless la primera vez para escanear el QR")

        page.goto("https://web.whatsapp.com")
        
        logged_in = False
        print("Esperando QR o sesión...")
        for i in range(60):
            try:
                qr = page.locator('canvas[aria-label="Scan this QR code"]')
                if qr.count() == 0:
                    logged_in = True
                    print("Sesión activa!")
                    save_state(context)
                    break
            except:
                pass
            time.sleep(1)
            if i % 5 == 0:
                print(f"Esperando... ({i}s)")

        if not logged_in:
            print("No se detectó sesión activa.")
            print("Por favor ESCANEA EL QR en el navegador que se abrió")
            print("Luego presiona ENTER aquí...")
            input()
            time.sleep(3)

        print("Buscando grupo 'Deportivo Internacional'...")
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        
        try:
            search_box = page.locator('#search').first
            if search_box.count() > 0:
                search_box.click()
            else:
                page.locator('div[contenteditable="true"]').first.click()
        except:
            page.locator('div[contenteditable="true"]').first.click()
        
        time.sleep(1)
        page.keyboard.type("Deportivo Internacional")
        time.sleep(2)

        try:
            group = page.locator('span[title="Deportivo Internacional"]').first
            group.click()
            time.sleep(3)
            print("Grupo encontrado!")
        except:
            print("Buscando manualmente...")
            input("Busca el grupo y presiona Enter...")

        print("\nExtrayendo mensajes...")

        last_msg_text = ""
        scroll_count = 0

        while scroll_count < 15:
            messages = page.locator('div.message-in, div.message-out').all()

            for msg in messages:
                try:
                    text = msg.inner_text()
                    if text == last_msg_text or len(text) < 5:
                        continue
                    last_msg_text = text

                    msg_date = parse_date_from_message(text)

                    if msg_date and msg_date >= TARGET_DATE:
                        local, visitante = parse_match_from_text(text)

                        if local and visitante:
                            hora = parse_hora(text)
                            cancha = parse_cancha(text)
                            categoria = parse_categoria(text)

                            print(f"✓ {msg_date.strftime('%Y-%m-%d')} - {local} vs {visitante}")

                            matches.append({
                                'equipolocal': local,
                                'equipovisitante': visitante,
                                'descripcion': text[:500],
                                'fecha': msg_date.isoformat(),
                                'hora': hora,
                                'Cancha': cancha,
                                'categoria': categoria
                            })
                except:
                    continue

            page.evaluate('document.querySelector("div[tabindex=\'0\']").scrollTo(0, 0)')
            time.sleep(2)
            scroll_count += 1

        browser.close()

    return matches

def insert_to_supabase(matches):
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("\nÚltimo partido en DB:")
    existing = supabase.table('partidos').select('fecha').order('fecha', desc=True).limit(1).execute()
    if existing.data:
        print(f"  {existing.data[0]['fecha']}")

    print(f"\nInsertando {len(matches)} partidos...")
    inserted = 0
    for match in matches:
        try:
            data, error = supabase.table('partidos').insert(match).execute()
            if error:
                print(f"Error: {error}")
            else:
                inserted += 1
        except Exception as e:
            print(f"Excepción: {e}")

    print(f"Total insertados: {inserted}")
    return inserted

def main():
    print("=" * 50)
    print("SCRAPER PARTIDOS - WHATSAPP -> SUPABASE")
    print("=" * 50)
    print(f"Fecha límite: {TARGET_DATE.strftime('%Y-%m-%d %H:%M')}")
    print(f"Headless: {HEADLESS}")
    print()

    matches = scrape_whatsapp()

    print(f"\nPartidos encontrados: {len(matches)}")

    if matches:
        with open('partidos.json', 'w', encoding='utf-8') as f:
            json.dump(matches, f, ensure_ascii=False, indent=2)

        if input("\n¿Insertar en Supabase? (s/n): ").lower() == 's':
            insert_to_supabase(matches)
    else:
        print("No se encontraron partidos")

if __name__ == "__main__":
    main()