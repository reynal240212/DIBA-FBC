// Supabase Client para uso en el navegador
// Carga única del cliente en navegador
// Las credenciales se leen del config.js centralizado (window.DIBA_CONFIG)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;

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

