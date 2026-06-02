import os
from supabase import create_client, Client

# Configuración de Supabase (extraída de tu proyecto)
SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q"

def insert_matches():
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Datos de los partidos
    fecha = "2026-05-16"
    torneo = "TORNEO GENERACION VICTORIOSA"
    encuentro = "Casa del profesor Rocky - 11:00 am"
    obs_general = "Encuentro: Casa Rocky 11:00 am. Bus contratado. Nequi 3246656083"
    uniforme = "NUEVO (HOMENAJE A BARRANQUILLA)"
    valor = "14000"
    
    partidos = [
        {
            "fecha": fecha,
            "hora": "12:00",
            "categoria": "2014",
            "equipolocal": "esc Diba",
            "equipovisitante": "esc hnos acosta",
            "descripcion": torneo,
            "uniforme": uniforme,
            "valor": valor,
            "observaciones": obs_general
        },
        {
            "fecha": fecha,
            "hora": "12:50",
            "categoria": "2012-11",
            "equipolocal": "esc Diba",
            "equipovisitante": "esc Compañeros fc",
            "descripcion": torneo,
            "uniforme": uniforme,
            "valor": valor,
            "observaciones": obs_general
        },
        {
            "fecha": fecha,
            "hora": "13:50", # 1:50 pm
            "categoria": "2013",
            "equipolocal": "esc Diba",
            "equipovisitante": "esc hnos acosta",
            "descripcion": torneo,
            "uniforme": uniforme,
            "valor": valor,
            "observaciones": obs_general
        }
    ]
    
    print(f"Insertando {len(partidos)} partidos para el {fecha}...")
    
    for p in partidos:
        try:
            response = supabase.table('partidos').insert(p).execute()
            print(f"✓ Insertado: {p['hora']} - {p['equipovisitante']} ({p['categoria']})")
        except Exception as e:
            print(f"✗ Error insertando partido {p['hora']}: {e}")

if __name__ == "__main__":
    insert_matches()
