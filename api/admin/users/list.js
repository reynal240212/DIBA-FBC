// /api/admin/users/list.js
import { createClient } from '@supabase/supabase-js';
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // perfiles + rol
  const { data, error } = await admin
    .from('v_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  // Adjuntar email desde Auth (coste extra; en panel suele ser útil)
  const usersResp = await admin.auth.admin.listUsers({ perPage: 1000, page: 1 });
  const emailMap = new Map(usersResp.data.users.map(u => [u.id, u.email]));

  const out = data.map(p => ({ ...p, email: emailMap.get(p.id) || null }));
  return res.status(200).json(out);
}
