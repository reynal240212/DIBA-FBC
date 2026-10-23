// DIBA FBC - Player Management (Admin)
import { supabase } from '../../../scripts/supabaseClient.js';
import { optimizeImageToWebP } from '../gestor/docs.js';

/**
 * Handle player creation form
 */
export function hookCreatePlayerForm() {
    const form = document.querySelector('#createPlayerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = Object.fromEntries(fd.entries());
        const fileInput = document.getElementById('playerPhotoInput');
        const rawFile = fileInput?.files?.[0] || null;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Disable inputs
        const inputs = form.querySelectorAll('input, select, button');
        inputs.forEach(i => i.disabled = true);
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Guardando...';

        try {
            let uploadedPath = null;
            if (rawFile) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Optimizando archivo...';
                const optimized = await optimizeImageToWebP(rawFile);
                const safeDni = (payload.dni || Date.now()).toString().replace(/[^a-zA-Z0-9_-]/g, '');
                const safeName = optimized.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const storageName = `jugador_${safeDni}_${Date.now()}_${safeName}`;

                const { error: upErr } = await supabase.storage
                    .from('documents')
                    .upload(storageName, optimized, { cacheControl: '3600', upsert: false });

                if (!upErr) {
                    uploadedPath = storageName;
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user?.id) {
                        await supabase.from('documents').insert({
                            file_name: `${payload.nombre} - ${optimized.name}`,
                            storage_path: storageName,
                            owner_id: session.user.id,
                            is_signed: true
                        });
                    }
                }
            }

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Guardando ficha...';

            // 1. Insert into jugadores
            const { error: playerError } = await supabase
                .from('jugadores')
                .insert([{
                    nombre: payload.nombre,
                    categoria: payload.categoria,
                    status: payload.status || 'Activo',
                    fecha_registro: new Date().toISOString()
                }]);

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

            alert(uploadedPath
                ? 'Jugador registrado y documento/fotografia optimizado en el Gestor Documental.'
                : 'Jugador creado con éxito.');
            window.location.href = 'planilla.html';

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
        const { error: idError } = await supabase
            .from('identificacion')
            .update({
                nombre: payload.nombre.split(' ')[0],
                apellidos: payload.nombre.split(' ').slice(1).join(' '),
                categoria: payload.categoria
            })
            .eq('numero', dni);

        if (idError) throw idError;

        await supabase
            .from('jugadores')
            .update({
                nombre: payload.nombre,
                categoria: payload.categoria
            })
            .eq('nombre', payload.oldNombre);

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
        const { error } = await supabase
            .from('identificacion')
            .delete()
            .eq('numero', dni);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error('Error deleting player:', err);
        throw err;
    }
}

console.log('DIBA Admin Players Module Loaded v3');
