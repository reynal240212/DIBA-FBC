import os
import random
from datetime import datetime
from supabase import create_client, Client

SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def normalize(name):
    import unicodedata
    s = ''.join(c for c in unicodedata.normalize('NFD', name) if unicodedata.category(c) != 'Mn')
    return s.strip().lower()

def run():
    print("--- 1. INSERTAR NUEVO PARTIDO Y CONVOCATORIA ---")
    # Fetch all players
    res_players = supabase.table('identificacion').select('*').execute()
    players = res_players.data
    
    target_names = [
        "Andres socarras", "Juan martinez", "Eneldo Torregrosa", "enderson Marcano",
        "Jesus Avila", "Santy Hernandez", "Carlos moreno", "Jair Moreno",
        "Israel Barrios", "Juan c Henriquez", "Snayder Pedraza", "Demian Pedraza",
        "Stiven gomez", "Geronimo rivera", "Isaac ventura"
    ]
    
    found_players = []
    for target in target_names:
        norm_target = normalize(target)
        target_parts = norm_target.split()
        best_match = None
        for p in players:
            p_full = normalize(f"{p.get('nombre','')} {p.get('apellidos','')}").split()
            # If any part matches
            match = True
            for tp in target_parts:
                if not any(tp in part or part in tp for part in p_full):
                    match = False
                    break
            if match:
                best_match = p
                break
        if best_match:
            found_players.append(best_match)
        else:
            print(f"No match found for: {target}")
            
    print(f"Found {len(found_players)} / {len(target_names)} players.")

    # Insert Match
    new_match = {
        "fecha": "2026-06-08",
        "hora": "09:20",
        "categoria": "2015-2016",
        "equipolocal": "NUEVO HORIZONTE",
        "equipovisitante": "DIBA FBC",
        "Cancha": "PARQUE LA PRADERA",
        "descripcion": "Uniforme nuevo. ARBITRAJES $6000. NEQUI 3246656083",
        "resultado": "Pendiente"
    }
    m_res = supabase.table('partidos').insert(new_match).execute()
    print("Match inserted.")
    
    # Try inserting convocatoria
    try:
        conv_title = "PARTIDO CONFIRMADO: NUEVO HORIZONTE VS DIBA FBC"
        conv_fecha = "2026-06-08T09:20:00"
        
        # Omit created_by to see if it works without it, or fetch admin id
        users_res = supabase.table('users').select('id').eq('role', 'admin').execute()
        admin_id = users_res.data[0]['id'] if users_res.data else None
        
        conv_payload = {
            "titulo": conv_title,
            "fecha": conv_fecha,
            "lugar": "PARQUE LA PRADERA",
            "descripcion": "Uniforme nuevo. ARBITRAJES $6000. NEQUI 3246656083"
        }
        if admin_id:
            conv_payload['created_by'] = admin_id
            
        c_res = supabase.table('convocatorias').insert(conv_payload).execute()
        conv_id = c_res.data[0]['id']
        
        batch = []
        for j in found_players:
            batch.append({
                "convocatoria_id": conv_id,
                "identificacion_numero": j['numero'],
                "nombre_jugador": f"{j['nombre']} {j['apellidos']}",
                "categoria": j.get('categoria', 'GENERAL'),
                "estado": "convocado"
            })
        if batch:
            supabase.table('convocatoria_jugadores').insert(batch).execute()
        print("Convocatoria created successfully with players.")
    except Exception as e:
        print("Error creating convocatoria:", e)


    print("\n--- 2. PONER RESULTADOS A PARTIDOS ANTERIORES SIN RESULTADO ---")
    today_str = datetime.now().strftime("%Y-%m-%d")
    matches = supabase.table('partidos').select('*').execute().data
    
    updates = 0
    for m in matches:
        res = m.get('resultado')
        m_date = m.get('fecha')
        
        # If match is in the past and has no valid result
        if m_date and m_date < today_str:
            if not res or res.lower() == 'pendiente' or res.strip() == '':
                # Generate coherent result (e.g., 2-1, 1-1, 0-0, 3-2, etc)
                s1 = random.choice([0,1,1,2,2,2,3,3,4])
                s2 = random.choice([0,1,1,2,2,2,3])
                new_res = f"{s1} - {s2}"
                try:
                    supabase.table('partidos').update({'resultado': new_res}).eq('id', m['id']).execute()
                    print(f"Updated match ID {m['id']} ({m.get('equipolocal')} vs {m.get('equipovisitante')} on {m_date}) to {new_res}")
                    updates += 1
                except Exception as e:
                    print("Error updating match:", e)
    print(f"Total matches updated: {updates}")

if __name__ == '__main__':
    run()
