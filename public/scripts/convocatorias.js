/**
 * DIBA FBC - Convocatorias Admin Module
 */
import { initAdminLayout } from '../src/components/layout/admin-layout.js';
import { supabase, requireAdmin } from './supabaseClient.js';



        let allJugadores = [];
        let selectedDNIs = new Set();

        async function init() {
            try {
                const session = await requireAdmin();
                if (!session) return;
                await initAdminLayout();
                await loadJugadores();
                await loadHistorial();
            } catch (err) {
                console.error("Init Error:", err);
            }
        }
        init();

        const showToast = (message, type = 'info') => {
            const bar = document.getElementById('alert-bar');
            const txt = document.getElementById('alert-text');
            txt.textContent = message;
            bar.classList.remove('hidden', 'bg-red-500/10', 'text-red-500', 'bg-green-500/10', 'text-green-500');
            const isError = type === 'error';
            bar.classList.add('flex', isError ? 'bg-red-500/10' : 'bg-green-500/10', isError ? 'text-red-500' : 'text-green-500');
            setTimeout(() => bar.classList.add('hidden'), 5000);
        };

        async function loadJugadores() {
            const listContainer = document.getElementById('playersList');
            try {
                const { data, error } = await supabase.from('identificacion').select('numero, nombre, apellidos, categoria').order('apellidos');
                if (error) throw error;
                allJugadores = data || [];
                renderJugadores(allJugadores);
            } catch (e) {
                listContainer.innerHTML = `<p class="text-center text-red-500 font-black text-[0.7rem] uppercase">Error loading players: ${e.message}</p>`;
            }
        }

        function renderJugadores(jugadores) {
            const list = document.getElementById('playersList');
            if (jugadores.length === 0) {
                list.innerHTML = '<div class="text-center py-10 text-slate-300 font-black text-[0.7rem] uppercase tracking-widest">No hay jugadores disponibles</div>';
                return;
            }
            list.innerHTML = '';

            const groupedObj = {};
            jugadores.forEach(j => {
                const cat = j.categoria || 'GENERAL';
                if (!groupedObj[cat]) groupedObj[cat] = [];
                groupedObj[cat].push(j);
            });

            Object.entries(groupedObj).sort().forEach(([cat, players]) => {
                const groupCount = players.length;
                const catHeaderId = `cat-h-${cat.replace(/\s+/g, '-')}`;

                const header = document.createElement('div');
                header.className = 'cat-group-header';
                header.innerHTML = `
                    <div class="flex items-center gap-4">
                        <input type="checkbox" class="cat-master-check w-4 h-4 accent-gold cursor-pointer">
                        <span class="text-[0.65rem] font-black uppercase tracking-[0.2em] text-gold italic">${cat}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="cat-sel-count text-[0.6rem] font-black text-slate-300 uppercase">0 / ${groupCount}</span>
                        <i class="fas fa-chevron-down text-[0.6rem] text-slate-300 transition-transform duration-300"></i>
                    </div>
                `;

                const body = document.createElement('div');
                body.className = 'cat-group-body';
                body.id = `body-${catHeaderId}`;

                players.forEach(j => {
                    const item = document.createElement('div');
                    item.className = 'player-item-conv' + (selectedDNIs.has(j.numero) ? ' selected' : '');
                    item.innerHTML = `
                        <input type="checkbox" ${selectedDNIs.has(j.numero) ? 'checked' : ''} class="pointer-events-none">
                        <div class="flex-1">
                            <div class="text-[0.75rem] font-bold text-white uppercase">${j.nombre} ${j.apellidos}</div>
                            <div class="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest mt-1">DNI: ${j.numero}</div>
                        </div>
                    `;
                    item.addEventListener('click', (e) => {
                        const chk = item.querySelector('input');
                        if (selectedDNIs.has(j.numero)) {
                            selectedDNIs.delete(j.numero);
                            item.classList.remove('selected');
                            chk.checked = false;
                        } else {
                            selectedDNIs.add(j.numero);
                            item.classList.add('selected');
                            chk.checked = true;
                        }
                        updateCategoryUI(cat, players, header);
                    });
                    body.appendChild(item);
                });

                header.querySelector('.cat-master-check').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const checkState = e.target.checked;
                    players.forEach(p => {
                        if (checkState) selectedDNIs.add(p.numero);
                        else selectedDNIs.delete(p.numero);
                    });
                    renderJugadores(allJugadores); // Re-render simple for sync
                });

                list.appendChild(header);
                list.appendChild(body);
                updateCategoryUI(cat, players, header);
            });
        }

        function updateCategoryUI(catName, players, headerEl) {
            const countInCat = players.filter(p => selectedDNIs.has(p.numero)).length;
            const badge = headerEl.querySelector('.cat-sel-count');
            const mCheck = headerEl.querySelector('.cat-master-check');
            
            badge.textContent = `${countInCat} / ${players.length}`;
            badge.className = `text-[0.6rem] font-black uppercase ${countInCat > 0 ? 'text-gold' : 'text-slate-300'}`;
            
            mCheck.checked = countInCat === players.length;
            mCheck.indeterminate = countInCat > 0 && countInCat < players.length;

            document.getElementById('selected-count-badge').textContent = `${selectedDNIs.size} convocados`;
        }

        async function loadHistorial() {
            const cont = document.getElementById('historialList');
            try {
                const { data, error } = await supabase.from('convocatorias').select('*, convocatoria_jugadores(count)').order('fecha', { ascending: false }).limit(10);
                if (error) throw error;
                if (!data) return;

                cont.innerHTML = data.map(c => {
                    const d = new Date(c.fecha);
                    const dateStr = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase();
                    const timeStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                    const pCount = c.convocatoria_jugadores?.[0]?.count || 0;

                    return `
                        <div class="conv-history-card">
                            <div class="flex justify-between items-start mb-4">
                                <div class="text-[0.8rem] font-black italic uppercase tracking-tighter text-white truncate max-w-[70%]">${c.titulo}</div>
                                <span class="text-[0.5rem] font-black text-gold border border-gold/20 px-2 py-1 rounded bg-gold/5 italic uppercase">${pCount} JUGS</span>
                            </div>
                            <div class="flex flex-col gap-2 opacity-30">
                                <div class="flex items-center gap-2 text-[0.6rem] font-bold">
                                    <i class="fas fa-calendar-star text-gold"></i>
                                    <span>${dateStr} @ ${timeStr}</span>
                                </div>
                                ${c.lugar ? `
                                <div class="flex items-center gap-2 text-[0.6rem] font-bold">
                                    <i class="fas fa-map-marker-alt text-gold"></i>
                                    <span class="truncate">${c.lugar}</span>
                                </div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            } catch (e) {
                console.error("Historial error:", e);
            }
        }

        // Search Filter
        document.getElementById('searchPlayers').addEventListener('input', e => {
            const q = e.target.value.toLowerCase();
            renderJugadores(allJugadores.filter(j => 
                `${j.nombre} ${j.apellidos}`.toLowerCase().includes(q) || 
                j.categoria?.toLowerCase().includes(q) || 
                j.numero.toString().includes(q)
            ));
        });

        // Form Submission
        document.getElementById('formConvocatoria').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnConvocar');
            
            if (selectedDNIs.size === 0) {
                showToast('Debe seleccionar al menos un jugador para convocar.', 'error');
                return;
            }

            const titulo = document.getElementById('convTitulo').value.trim();
            const fecha = document.getElementById('convFecha').value;
            const lugar = document.getElementById('convLugar').value.trim();
            const descripcion = document.getElementById('convDescripcion').value.trim();

            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Procesando...';
            btn.disabled = true;

            try {
                const { data: { user } } = await supabase.auth.getUser();

                // 1. Create Convocatoria
                const { data: conv, error: convErr } = await supabase.from('convocatorias').insert({ 
                    titulo, fecha, lugar: lugar || null, descripcion: descripcion || null, created_by: user.id 
                }).select().single();

                if (convErr) throw convErr;

                // 2. Insert players
                const batch = allJugadores.filter(j => selectedDNIs.has(j.numero)).map(j => ({
                    convocatoria_id: conv.id,
                    identificacion_numero: j.numero,
                    nombre_jugador: `${j.nombre} ${j.apellidos}`,
                    categoria: j.categoria || 'GENERAL',
                    estado: 'convocado'
                }));

                const { error: batchErr } = await supabase.from('convocatoria_jugadores').insert(batch);
                if (batchErr) throw batchErr;

                // 3. Trigger Notification (Edge Function)
                try {
                    await supabase.functions.invoke('send-push-notification', {
                        body: {
                            title: `📣 Convocatoria: ${titulo}`,
                            body: `${lugar ? lugar + ' — ' : ''}${new Date(fecha).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`,
                            url: '/partidos.html'
                        }
                    });
                } catch(_) {}

                showToast(`¡Convocatoria enviada a ${selectedDNIs.size} jugadores!`, 'success');

                // Reset
                e.target.reset();
                selectedDNIs.clear();
                renderJugadores(allJugadores);
                loadHistorial();

            } catch (err) {
                console.error(err);
                showToast("Error al procesar convocatoria: " + err.message, "error");
            } finally {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        });
