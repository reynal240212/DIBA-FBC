// Supabase Client para uso en el navegador
// Carga única del cliente en navegador
// Las credenciales se leen del config.js centralizado (window.DIBA_CONFIG)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Protección avanzada: valida sesión, proveedor y rol antes de mostrar contenido
export async function requireAdmin() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.warn('Acceso denegado: Redirigiendo a login...');
    window.location.replace('/admin/login.html');
    return null;
  }

  const user = session.user;

  // 1. Restricción por proveedor: Bloqueamos Google para el panel administrativo
  // El usuario solicitó que Google no pueda entrar al admin, solo directivos con email
  if (user.app_metadata?.provider === 'google') {
    console.warn('Acceso denegado: Usuarios de Google no tienen permisos administrativos.');
    alert('⚠️ Acceso denegado. Las cuentas de Google no tienen permisos para el panel administrativo.');
    await supabase.auth.signOut();
    window.location.replace('/index.html');
    return null;
  }

  // 2. Validación de rol en la base de datos
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (roleError || userData?.role !== 'admin') {
    console.warn('Acceso restringido para:', user.email);
    alert('⚠️ No tienes permisos de administrador.');
    window.location.replace('/index.html');
    return null;
  }

  return session;
}

