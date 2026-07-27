// ============================================================
//  DIBA FBC - Configuración (Hardcoded para Despliegue Rápido)
// ============================================================

window.DIBA_CONFIG = {
  SUPABASE_URL: 'https://wdnlqfiwuocmmcdowjyw.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q',
  // WA_API_KEY removed — all WhatsApp operations now go through Supabase Edge Functions (server-side)
  // The API key is stored as a secret in Supabase Dashboard > Edge Functions > send-whatsapp / whatsapp-webhook
};
