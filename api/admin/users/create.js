// /api/admin/users/create.js
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, username, full_name, role_name } = req.body || {};
  if (!email || !password || !role_name) {
    return res.status(400).json({ error: 'email, password y role_name son obligatorios' });
  }

  // Buscar role_id por nombre
  const { data: role, error: roleErr } = await supabaseAdmin
    .from('roles').select('id,name').eq('name', role_name).single();

  if (roleErr || !role) return res.status(400).json({ error: 'Rol inválido' });

  // 1) Crear usuario en Auth
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true
  });
  if (createErr) return res.status(400).json({ error: createErr.message });

  const uid = created.user.id;

  // 2) Insertar perfil
  const { error: profErr } = await supabaseAdmin
    .from('profiles')
    .insert({ id: uid, username, full_name, role_id: role.id });

  if (profErr) {
    // rollback "manual": desactivar user
    await supabaseAdmin.auth.admin.deleteUser(uid);
    return res.status(400).json({ error: profErr.message });
  }

  return res.status(200).json({ ok: true, user_id: uid });
}
