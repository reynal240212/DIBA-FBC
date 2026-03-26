// DIBA FBC - Core Supabase Client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG || {};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("DIBA_CONFIG is missing. Ensure config.js is loaded before core services.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Standard security check for admin pages
 */
export async function requireAdmin() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        window.location.replace('/admin/login.html'); // Keeping absolute for now as admin is a top-level folder in public
        return null;
    }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (userData?.role !== 'admin') {
        alert('⚠️ Acceso restringido.');
        window.location.replace('/index.html'); // Keeping absolute for now
        return null;
    }

    return session;
}

/**
 * Global utilities moved to core
 */
export const sanitizeDNI = (dni) => {
    if (!dni) return '';
    return dni.toString().replace(/[^0-9]/g, '');
};
