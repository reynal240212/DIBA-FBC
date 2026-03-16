/**
 * DIBA FBC - Admin Users Feature (Reorganized)
 */
import { supabase, requireAdmin } from '../../core/supabase.js';

function qs(sel, root = document) { return root.querySelector(sel); }

function renderRows(rows) {
  const tbody = qs('#users-tbody');
  const table = qs('#usersTable');
  const loading = qs('#loading-state');
  const empty = qs('#empty-state');
  const badge = qs('#count-badge');

  if (!tbody) return;
  tbody.innerHTML = '';

  // Actualizar contador
  if (badge) badge.textContent = `${rows.length} usuarios`;

  if (rows.length === 0) {
    loading?.classList.add('hidden');
    table?.classList.add('hidden');
    empty?.classList.remove('hidden');
    return;
  }

  rows.forEach(u => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-white/[0.02] transition-all border-b border-white/5";
    tr.innerHTML = `
      <td class="px-6 py-4 text-[10px] font-mono text-slate-500" title="${u.id}">${u.id.substring(0, 8)}...</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-dibaGold/10 text-dibaGold flex items-center justify-center text-[10px] font-black uppercase">
                ${(u.username || 'U')[0]}
            </div>
            <span class="font-bold text-dibaText uppercase italic text-xs tracking-tight">${u.username ?? ''}</span>
        </div>
      </td>
      <td class="px-6 py-4"><span class="text-slate-400 font-bold text-[11px] uppercase tracking-wide">${u.full_name ?? ''}</span></td>
      <td class="px-6 py-4">
        <span class="px-3 py-1 bg-dibaGold/10 text-dibaGold text-[8px] font-black uppercase italic rounded-full tracking-widest border border-dibaGold/20">
          ${u.role}
        </span>
      </td>
      <td class="px-6 py-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">${new Date(u.created_at).toLocaleDateString('es-CO')}</td>
      <td class="px-6 py-4 text-center">
        <div class="flex items-center justify-center gap-2">
            <button class="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20" 
                    data-action="del" data-id="${u.id}" title="Eliminar Usuario">
              <i class="fas fa-trash text-[10px]"></i>
            </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  // Mostrar tabla, ocultar otros
  loading?.classList.add('hidden');
  empty?.classList.add('hidden');
  table?.classList.remove('hidden');
}

async function loadUsers() {
  const loading = qs('#loading-state');
  const alertBar = qs('#alert-bar');
  const badge = qs('#count-badge');

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    renderRows(data || []);
  } catch (err) {
    console.error('Error fetching users:', err);
    if (loading) loading.classList.add('hidden');
    if (badge) badge.textContent = 'Error';
    
    if (alertBar) {
        alertBar.textContent = '⚠️ Error de sincronización: ' + (err.message || 'Error desconocido');
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
