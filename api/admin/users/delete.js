// /api/admin/users/delete.js
import { createClient } from '@supabase/supabase-js';
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id requerido' });

  // Borra user (cascade borrará profile por FK, pero hacemos ambos por claridad)
  const { error: delErr } = await admin.auth.admin.deleteUser(id);
  if (delErr) return res.status(400).json({ error: delErr.message });

  await admin.from('profiles').delete().eq('id', id); // inofensivo si ya lo borró el cascade
  return res.status(200).json({ ok: true });
}
