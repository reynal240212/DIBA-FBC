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
  if (badge) badge.textContent = `${rows.length} USUARIOS`;

  if (rows.length === 0) {
    loading?.classList.add('hidden');
    table?.classList.add('hidden');
    empty?.classList.remove('hidden');
    return;
  }

  rows.forEach((u, i) => {
    const tr = document.createElement('tr');
    tr.className = "group hover:bg-slate-50 transition-colors border-b border-slate-50";
    tr.innerHTML = `
      <td class="px-6 py-4 text-center text-[10px] font-black text-slate-300 italic">${i + 1}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black uppercase text-diba-blue shadow-sm">
                ${(u.username || 'U')[0]}
            </div>
            <div>
              <div class="text-xs font-black text-diba-blue uppercase italic tracking-tight">${u.username ?? ''}</div>
              <div class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5" title="${u.id}">ID: ${u.id.substring(0, 8)}...</div>
            </div>
        </div>
      </td>
      <td class="px-6 py-4"><span class="text-slate-500 font-bold text-[11px] uppercase tracking-wide">${u.full_name ?? ''}</span></td>
      <td class="px-6 py-4">
        <span class="px-3 py-1 bg-diba-blue/5 text-diba-blue text-[8px] font-black uppercase italic rounded-full tracking-widest border border-diba-blue/10">
          ${u.role}
        </span>
      </td>
      <td class="px-6 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">${new Date(u.created_at).toLocaleDateString('es-CO')}</td>
      <td class="px-6 py-4 text-center">
        <div class="flex items-center justify-center gap-2">
            <button class="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm" 
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
