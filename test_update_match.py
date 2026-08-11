import os
from supabase import create_client, Client

SUPABASE_URL = "https://wdnlqfiwuocmmcdowjyw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Try to update the match we just queried
match_id = '90c413c0-7678-4ae3-8bdc-1cabeda2cfc3'
try:
    res = supabase.table('partidos').update({'resultado': 'Test 1-0'}).eq('id', match_id).execute()
    print("Update successful:", res.data)
except Exception as e:
    print("Update failed:", e)
