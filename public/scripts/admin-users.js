
import { supabase, requireAdmin } from './supabaseClient.js';

const API_BASE = '/api/admin/users';

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

async function fetchJSON(url, opts) {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await r.json().catch(()=> ({}));
  if (!r.ok) throw new Error(data.error || 'Error de red');
  return data;
}

function renderRows(rows) {
  const tbody = qs('#usersTable tbody');
  tbody.innerHTML = '';
  rows.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-truncate" style="max-width:120px">${u.id}</td>
      <td>${u.username ?? ''}</td>
      <td>${u.full_name ?? ''}</td>
      <td>${u.email ?? ''}</td>
      <td><span class="badge bg-warning text-dark">${u.role_name}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-primary me-1" data-action="edit" data-id="${u.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" data-action="del" data-id="${u.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function loadUsers() {
  const data = await fetchJSON(`${API_BASE}/list`);
  renderRows(data);
}

// Handlers
function hookListEvents() {
  qs('#usersTable').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.dataset.action === 'del') {
      if (!confirm('¿Eliminar este usuario?')) return;
      await fetchJSON(`${API_BASE}/delete?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      await loadUsers();
    }

    if (btn.dataset.action === 'edit') {
      // Abre modal con datos
      const row = btn.closest('tr').children;
      const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
      qs('#editUserForm [name="id"]').value = id;
      qs('#editUserForm [name="username"]').value = row[1].textContent.trim();
      qs('#editUserForm [name="full_name"]').value = row[2].textContent.trim();
      qs('#editUserForm [name="email"]').value = row[3].textContent.trim();
      qs('#editUserForm [name="role_name"]').value = row[4].innerText.trim();
      qs('#editUserForm [name="password"]').value = '';
      modal.show();
    }
  });

  qs('#editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    if (!payload.password) delete payload.password; // opcional
    await fetchJSON(`${API_BASE}/update`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
    await loadUsers();
  });
}

function hookCreateForm() {
  const form = qs('#createUserForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    await fetchJSON(`${API_BASE}/create`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    alert('Usuario creado con éxito.');
    form.reset();
    window.location.href = '/admin/usuarios.html';
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
