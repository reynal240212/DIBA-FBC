// Supabase Client para uso en el navegador
// Carga única del cliente en navegador
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://wdnlqfiwuocmmcdowjyw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbmxxZml3dW9jbW1jZG93anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjY1ODAsImV4cCI6MjA2NDEwMjU4MH0.4SCS_NRDIYLQJ1XouqW111BxkMOlwMWOjje9gFTgW_Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Protección básica: solo admins pueden entrar a /admin/*
export async function requireAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }
  // leer su perfil y validar rol
  const { data, error } = await supabase.from('v_profiles')
    .select('role_name').eq('id', user.id).maybeSingle();

  if (error || !data || data.role_name !== 'admin') {
    alert('Acceso restringido a administradores.');
    window.location.href = '/index.html';
  }
}

