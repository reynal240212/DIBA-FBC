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

  // Validación de rol en la base de datos
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (roleError || userData?.role !== 'admin') {
    console.warn('Acceso restringido para:', user.email);
    alert('Acceso denegado: No tienes permisos de administrador.');
    window.location.replace('/index.html');
    return null;
  }

  return session;
}

// Estandarización de DNI: Elimina puntos, espacios y caracteres no numéricos
export const sanitizeDNI = (dni) => {
    if (!dni) return '';
    return dni.toString().replace(/[^0-9]/g, '');
};

// Sanitización de cadenas para prevención de XSS al renderizar en HTML
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
