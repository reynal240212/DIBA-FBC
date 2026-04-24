/**
 * DIBA FBC - Admin Users Feature (Reorganized)
 */
import { supabase, requireAdmin } from '../../core/supabase.js';

function qs(sel, root = document) { return root.querySelector(sel); }

function renderRows(rows) {
  const tbody = qs('#users-tbody');
  const badge = qs('#user-count');

  if (!tbody) return;
  tbody.innerHTML = '';

  // Actualizar contador
  if (badge) badge.textContent = `${rows.length} USUARIOS REGISTRADOS`;

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-8 py-20 text-center">
            <div class="flex flex-col items-center opacity-30">
                <i class="fas fa-users-slash text-4xl mb-4"></i>
                <p class="text-[0.7rem] font-black uppercase tracking-widest">No se encontraron usuarios</p>
            </div>
        </td>
      </tr>
    `;
    return;
  }

  rows.forEach((u, i) => {
    const tr = document.createElement('tr');
    tr.className = "group hover:bg-white/[0.02] transition-colors border-b border-white/5";
    
    const isDeletable = u.role !== 'admin'; // Ejemplo: no dejar borrar admins principales fácilmente

    tr.innerHTML = `
      <td class="px-8 py-6">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-xs font-black uppercase text-gold shadow-lg shadow-gold/5">
                ${(u.username || 'U')[0]}
            </div>
            <div class="min-w-0">
              <div class="text-[0.85rem] font-black text-white uppercase italic tracking-tight truncate">${u.username ?? ''}</div>
              <div class="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5" title="${u.id}">ID: ${u.id.substring(0, 8)}...</div>
            </div>
        </div>
      </td>
      <td class="px-8 py-6">
        <span class="text-white font-bold text-[0.8rem] uppercase tracking-wide truncate max-w-[200px] block">${u.full_name ?? '---'}</span>
      </td>
      <td class="px-8 py-6">
        <span class="px-3 py-1 bg-gold/10 text-gold text-[0.6rem] font-black uppercase italic rounded-lg tracking-widest border border-gold/20">
          ${u.role}
        </span>
      </td>
      <td class="px-8 py-6">
         <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
            <span class="text-[0.65rem] font-black text-emerald-500 uppercase tracking-widest italic">Activo</span>
         </div>
      </td>
      <td class="px-8 py-6 text-right">
        <div class="flex items-center justify-end gap-3">
            <button class="w-10 h-10 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5" 
                    title="Editar Perfil">
              <i class="fas fa-edit text-xs"></i>
            </button>
            <button class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20" 
                    data-action="del" data-id="${u.id}" title="Eliminar Usuario">
              <i class="fas fa-trash text-xs"></i>
            </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}


async function loadUsers() {
  const alertBar = qs('#alert-bar');
  const alertText = qs('#alert-text');
  const badge = qs('#user-count');

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    renderRows(data || []);
  } catch (err) {
    console.error('Error fetching users:', err);
    if (badge) badge.textContent = 'Error';
    
    if (alertBar && alertText) {
        alertText.textContent = 'Error de sincronización: ' + (err.message || 'Error desconocido');
        alertBar.classList.remove('hidden');
        alertBar.classList.add('flex');
    }
  }
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

      try {
        const { error } = await supabase.rpc('admin_delete_user', { target_user_id: id });
        if (error) throw error;
        await loadUsers();
      } catch (err) {
        alert('Error al eliminar: ' + err.message);
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
    try {
        const session = await requireAdmin();
        if (!session) return; // Redirección ya manejada en requireAdmin

        if (qs('#usersTable')) {
            await loadUsers();
            hookListEvents();
        }
        if (qs('#createUserForm')) {
            hookCreateForm();
        }
    } catch (err) {
        console.error('Error in auth check:', err);
        const loading = qs('#loading-state');
        if (loading) loading.classList.add('hidden');
    }
})();
