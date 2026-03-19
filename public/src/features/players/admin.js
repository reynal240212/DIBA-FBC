// DIBA FBC - Player Management (Admin)
import { supabase } from '../../../scripts/supabaseClient.js';

/**
 * Handle player creation form
 */
function hookCreatePlayerForm() {
    const form = document.querySelector('#createPlayerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = Object.fromEntries(fd.entries());

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Disable inputs
        const inputs = form.querySelectorAll('input, select, button');
        inputs.forEach(i => i.disabled = true);
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Guardando...';

        try {
            // 1. Insert into jugadores
            const { data: player, error: playerError } = await supabase
                .from('jugadores')
                .insert([{
                    nombre: payload.nombre,
                    categoria: payload.categoria,
                    status: payload.status || 'Activo',
                    fecha_registro: new Date().toISOString()
                }])
                .select()
                .single();

            if (playerError) throw playerError;

            // 2. Optionally insert into identificacion if DNI is provided
            if (payload.dni) {
                const { error: idError } = await supabase
                    .from('identificacion')
                    .upsert([{
                        numero: payload.dni,
                        nombre: payload.nombre.split(' ')[0],
                        apellidos: payload.nombre.split(' ').slice(1).join(' '),
                        categoria: payload.categoria
                    }]);
                if (idError) console.error('Error syncing to identificacion:', idError);
            }

            alert('¡Jugador creado con éxito!');
            window.location.href = 'planilla.html'; // Redirigir a planilla o lista de jugadores

        } catch (err) {
            console.error('Error creating player:', err);
            alert('Error al crear jugador: ' + (err.message || 'Error desconocido'));
        } finally {
            inputs.forEach(i => i.disabled = false);
            submitBtn.innerHTML = originalText;
        }
    });
}

/**
 * Update an existing player
 */
export async function updatePlayer(dni, payload) {
    try {
        const response = await fetch(`http://localhost:8080/api/players/${dni}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: payload.nombre.split(' ')[0],
                apellidos: payload.nombre.split(' ').slice(1).join(' '),
                categoria: payload.categoria
            })
        });

        if (!response.ok) throw new Error('Error al actualizar jugador en el servidor');
        return { success: true };
    } catch (err) {
        console.error('Error updating player:', err);
        throw err;
    }
}

export async function deletePlayer(dni) {
    try {
        const response = await fetch(`http://localhost:8080/api/players/${dni}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar jugador en el servidor');
        return { success: true };
    } catch (err) {
        console.error('Error deleting player:', err);
        throw err;
    }
}

// Diagnostic Log
console.log('DIBA Admin Players Module Loaded v2');
