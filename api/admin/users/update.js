// /api/admin/users/update.js
import { createClient } from '@supabase/supabase-js';
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const { id, username, full_name, role_name, email, password } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id requerido' });

  // rol
  let role_id;
  if (role_name) {
    const { data: role, error: roleErr } = await admin.from('roles').select('id').eq('name', role_name).single();
    if (roleErr || !role) return res.status(400).json({ error: 'Rol inválido' });
    role_id = role.id;
  }

  // actualizar perfil
  const { error: pErr } = await admin.from('profiles').update({
    ...(username && { username }),
    ...(full_name && { full_name }),
    ...(role_id && { role_id })
  }).eq('id', id);
  if (pErr) return res.status(400).json({ error: pErr.message });

  // actualizar email/contraseña (opcional)
  if (email || password) {
    const { error: aErr } = await admin.auth.admin.updateUserById(id, {
      ...(email && { email }),
      ...(password && { password })
    });
    if (aErr) return res.status(400).json({ error: aErr.message });
  }

  return res.status(200).json({ ok: true });
}
