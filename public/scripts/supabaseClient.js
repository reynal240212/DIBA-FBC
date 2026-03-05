// Supabase Client para uso en el navegador
// Carga única del cliente en navegador
// Las credenciales se leen del config.js centralizado (window.DIBA_CONFIG)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Protección básica: solo admins pueden entrar a /admin/*
// Protección básica: solo admins pueden entrar a /admin/*
export async function requireAdmin() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    window.location.href = '/admin/login.html';
    return;
  }

  const user = session.user;
  const role = user.user_metadata?.role || 'user';

  // Por ahora, permitimos acceso si el rol es admin o si el email es del administrador conocido
  // (Esto es un fallback mientras se configuran roles en DB)
  if (role !== 'admin' && !user.email.includes('admin') && !user.email.includes('reinaldo')) {
    console.warn('Acceso restringido:', user.email);
    alert('Acceso restringido a administradores.');
    window.location.href = '/index.html';
  }
}

