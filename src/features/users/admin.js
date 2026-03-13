/**
 * DIBA FBC - Admin Users Feature (Reorganized)
 */
import { supabase, requireAdmin } from '../../core/supabase.js';

function qs(sel, root = document) { return root.querySelector(sel); }

function renderRows(rows) {
  const tbody = qs('#usersTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  rows.forEach(u => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50/50 transition-all";
    tr.innerHTML = `
      <td class="p-4 text-[11px] font-mono text-slate-400" title="${u.id}">${u.id.substring(0, 8)}...</td>
      <td class="p-4"><span class="font-bold text-slate-700 uppercase italic text-xs">${u.username ?? ''}</span></td>
      <td class="p-4"><span class="text-slate-500 font-medium text-xs">${u.full_name ?? ''}</span></td>
      <td class="p-4">
        <span class="px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase italic rounded-full tracking-widest border border-amber-100">
          ${u.role}
        </span>
      </td>
      <td class="p-4 text-[10px] text-slate-400 font-bold uppercase">${new Date(u.created_at).toLocaleDateString()}</td>
      <td class="p-4 text-center">
        <button class="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all" data-action="del" data-id="${u.id}">
          <i class="fas fa-trash text-[10px]"></i>
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function loadUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  renderRows(data);
}

function hookListEvents() {
  const table = qs('#usersTable');
  if (!table) return;
  table.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.dataset.action === 'del') {
      if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;

      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: id });

      if (error) {
        alert('Error al eliminar: ' + error.message);
      } else {
        await loadUsers();
      }
    }
  });
}

function hookCreateForm() {
  const form = qs('#createUserForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    const inputs = form.querySelectorAll('input, select, button');
    inputs.forEach(i => i.disabled = true);

    try {
      const { error } = await supabase.rpc('admin_create_user', {
        new_username: payload.username,
        new_password: payload.password,
        new_full_name: payload.full_name,
        new_role: payload.role_name
      });

      if (error) throw error;

      alert('Usuario creado con éxito.');
      window.location.href = 'usuarios.html';
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      inputs.forEach(i => i.disabled = false);
    }
  });
}

// Global initialization
(async () => {
    await requireAdmin();
    if (qs('#usersTable')) {
        await loadUsers();
        hookListEvents();
    }
    if (qs('#createUserForm')) {
        hookCreateForm();
    }
})();
