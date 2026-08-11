import os
from supabase import create_client, Client

SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Fetch players
players = supabase.table('identificacion').select('numero, nombre, apellidos, categoria').execute()
for p in players.data[:5]:
    print(p)

print("Players fetched:", len(players.data))
