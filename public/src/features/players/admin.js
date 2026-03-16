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
        // 1. Update in jugadores (searching by name or adding a way to link)
        // Since we might not have the jugadores.id easily, we can try to find it via name/category or use a better mapping.
        // For now, let's update identificacion which is the source for Planilla.
        const { error: idError } = await supabase
            .from('identificacion')
            .update({
                nombre: payload.nombre.split(' ')[0],
                apellidos: payload.nombre.split(' ').slice(1).join(' '),
                categoria: payload.categoria
            })
            .eq('numero', dni);

        if (idError) throw idError;

        // Also update in jugadores if possible
        // Note: This relies on name matching which is fragile, but without a clear FK in jugadores it's a best effort.
        await supabase
            .from('jugadores')
            .update({
                nombre: payload.nombre,
                categoria: payload.categoria
            })
            .eq('nombre', payload.oldNombre); // We'll need the old name to match

        return { success: true };
    } catch (err) {
        console.error('Error updating player:', err);
        throw err;
    }
}

/**
 * Delete a player
 */
export async function deletePlayer(dni) {
    try {
        // Warning: This will fail if there are foreign key constraints (asistencias, planillas)
        // A better approach would be to delete those first or use a 'status = Inactivo'
        const { error } = await supabase
            .from('identificacion')
            .delete()
            .eq('numero', dni);

        if (error) throw error;

        // Also delete from jugadores if we can find them
        // (Best effort since no direct link)
        // We might want to pass the name too.
        
        return { success: true };
    } catch (err) {
        console.error('Error deleting player:', err);
        throw err;
    }
}

// Diagnostic Log
console.log('DIBA Admin Players Module Loaded v2');
