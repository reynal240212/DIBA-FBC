import { supabase, requireAdmin } from './supabaseClient.js';

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function renderRows(rows) {
  const tbody = qs('#usersTable tbody');
  tbody.innerHTML = '';
  rows.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-truncate" style="max-width:120px" title="${u.id}">${u.id.substring(0, 8)}...</td>
      <td>${u.username ?? ''}</td>
      <td>${u.full_name ?? ''}</td>
      <td><span class="badge bg-warning text-dark">${u.role}</span></td>
      <td>${new Date(u.created_at).toLocaleDateString()}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-danger" data-action="del" data-id="${u.id}">
          <i class="fas fa-trash"></i>
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
    alert('Error al cargar la lista de usuarios.');
    return;
  }
  renderRows(data);
}

// Handlers
function hookListEvents() {
  qs('#usersTable').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.dataset.action === 'del') {
      if (!confirm('¿Seguro que deseas eliminar este usuario de forma permanente?')) return;

      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: id });

      if (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar el usuario: ' + error.message);
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

    // Disable inputs while processing
    const inputs = form.querySelectorAll('input, select, button');
    inputs.forEach(i => i.disabled = true);

    try {
      const { data, error } = await supabase.rpc('admin_create_user', {
        new_username: payload.username,
        new_password: payload.password,
        new_full_name: payload.full_name,
        new_role: payload.role_name
      });

      if (error) throw error;

      alert('Usuario creado con éxito.');
      form.reset();
      window.location.href = 'usuarios.html';
    } catch (err) {
      console.error('Error al crear usuario:', err);
      alert('Error al crear usuario: ' + err.message);
    } finally {
      inputs.forEach(i => i.disabled = false);
    }
  });
}

// API pública para inicializar en cada página
window.DIBA = {
  async initUsersList() {
    await requireAdmin();
    await loadUsers();
    hookListEvents();
  },
  async initCreateUser() {
    await requireAdmin();
    hookCreateForm();
  }
};
