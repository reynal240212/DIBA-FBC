/**
 * DIBA FBC - Admin Partidos Module
 */
import { initAdminLayout } from '../src/components/layout/admin-layout.js';
import { supabase, requireAdmin } from './supabaseClient.js';


        let matches = [];

        async function init() {
            try {
                const session = await requireAdmin();
                if (!session) return;
                await initAdminLayout();
                await loadMatches();
                setupHandlers();
            } catch (error) {
                console.error("Init error:", error);
            }
        }
        init();

        async function loadMatches() {
            const tableBody = document.getElementById('matches-body');
            try {
                // Solo las columnas necesarias para la tabla — evita descargar todos los datos
                const COLS = 'id, fecha, hora, equipolocal, equipovisitante, resultado, categoria, Cancha, descripcion, escudo_local, escudo_visitante, escudo';
                const { data, error } = await supabase.from('partidos').select(COLS).order('fecha', { ascending: false });
                if (error) throw error;
                matches = data || [];
                renderMatches();
            } catch (e) {
                console.error(e);
                tableBody.innerHTML = '<tr><td colspan="6" class="px-8 py-20 text-center text-red-500 font-black uppercase tracking-widest">Error al cargar datos</td></tr>';
            }
        }

        function renderMatches() {
            const tableBody = document.getElementById('matches-body');
            const search = document.getElementById('match-search').value.toLowerCase();
            const catFilter = document.getElementById('filter-category').value;

            const filtered = matches.filter(m => {
                const matchesSearch = (m.equipolocal + m.equipovisitante + m.Cancha).toLowerCase().includes(search);
                const matchesCat = catFilter === 'ALL' || m.categoria === catFilter;
                return matchesSearch && matchesCat;
            });

            if (filtered.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="px-8 py-20 text-center text-slate-500 font-black uppercase tracking-widest">No se encontraron encuentros</td></tr>';
                return;
            }

            tableBody.innerHTML = filtered.map(m => {
                let dateStr = 'FECHA TBD';
                try {
                    if (m.fecha) {
                        const pureDate = m.fecha.includes('T') ? m.fecha.split('T')[0] : m.fecha;
                        const [y, mon, d] = pureDate.split('-').map(Number);
                        const date = new Date(y, mon - 1, d);
                        if (!isNaN(date.getTime())) {
                            dateStr = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
                        }
                    }
                } catch (e) { console.error("Date error:", e); }

                const isFinished = m.resultado && m.resultado !== '' && m.resultado !== 'Pendiente';
                const statusClass = isFinished ? 'status-finished' : 'status-upcoming';
                const statusText = isFinished ? 'Finalizado' : 'Programado';

                return `
                    <tr class="hover:bg-white/[0.02] transition-colors group">
                        <td class="px-8 py-6">
                            <div class="text-[0.75rem] font-bold text-white uppercase">${dateStr}</div>
                            <div class="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest mt-1"><i class="fas fa-clock text-gold/50 mr-1"></i> ${m.hora}</div>
                        </td>
                        <td class="px-8 py-6">
                            <div class="flex items-center gap-4">
                                <div class="flex flex-col items-center">
                                    ${m.equipolocal && m.equipolocal.toUpperCase().includes('DIBA') 
                                        ? '<img src="/images/ESCUDO.webp" class="team-shield-mini mb-1">' 
                                        : `<div class="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[0.5rem] font-black text-gold mb-1 border border-white/10">${m.equipolocal ? m.equipolocal[0].toUpperCase() : 'L'}</div>`
                                    }
                                    <span class="text-[0.65rem] font-bold text-white uppercase">${m.equipolocal}</span>
                                </div>
                                <span class="text-gold font-black italic text-xs">VS</span>
                                <div class="flex flex-col items-center">
                                    ${m.equipovisitante && m.equipovisitante.toUpperCase().includes('DIBA') 
                                        ? '<img src="/images/ESCUDO.webp" class="team-shield-mini mb-1">' 
                                        : `<div class="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[0.5rem] font-black text-gold mb-1 border border-white/10">${m.equipovisitante ? m.equipovisitante[0].toUpperCase() : 'V'}</div>`
                                    }
                                    <span class="text-[0.65rem] font-bold text-white uppercase">${m.equipovisitante}</span>
                                </div>
                            </div>
                        </td>
                        <td class="px-8 py-6">
                            <span class="px-3 py-1 rounded-lg bg-gold/5 border border-gold/10 text-gold text-[0.6rem] font-black uppercase tracking-widest">CAT. ${m.categoria}</span>
                        </td>
                        <td class="px-8 py-6">
                            <div class="text-[0.7rem] font-bold text-slate-300 uppercase">${m.Cancha}</div>
                            <div class="text-[0.55rem] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 truncate max-w-[150px]">${m.descripcion || '---'}</div>
                        </td>
                        <td class="px-8 py-6">
                            <div class="flex flex-col gap-2">
                                <div class="match-status-badge ${statusClass}">
                                    <span class="w-1.5 h-1.5 rounded-full ${isFinished ? 'bg-emerald-400' : 'bg-blue-400'}"></span>
                                    ${statusText}
                                </div>
                                ${isFinished ? `<div class="text-xl font-black italic text-white tracking-widest ml-1">${m.resultado}</div>` : ''}
                            </div>
                        </td>
                        <td class="px-8 py-6 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button
                                    class="btn-score w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold hover:bg-gold hover:text-[#004d98] transition-all"
                                    data-id="${m.id}"
                                    data-teams="${m.equipolocal} vs ${m.equipovisitante}"
                                    data-resultado="${m.resultado || ''}"
                                    title="Actualizar Marcador">
                                    <i class="fas fa-trophy text-sm"></i>
                                </button>
                                <button
                                    class="btn-delete w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                    data-id="${m.id}"
                                    title="Eliminar">
                                    <i class="fas fa-trash text-sm"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function setupHandlers() {
            document.getElementById('match-search').oninput = renderMatches;
            document.getElementById('filter-category').onchange = renderMatches;

            // Use event delegation for score + delete buttons (avoids inline onclick string escaping bugs)
            document.getElementById('matches-body').addEventListener('click', (e) => {
                const scoreBtn  = e.target.closest('.btn-score');
                const deleteBtn = e.target.closest('.btn-delete');

                if (scoreBtn) {
                    const id       = scoreBtn.dataset.id;
                    const teams    = scoreBtn.dataset.teams;
                    const current  = scoreBtn.dataset.resultado;
                    document.getElementById('scoreId').value      = id;
                    document.getElementById('scoreTeams').innerText = teams;
                    document.getElementById('scoreValue').value   = (current === 'Pendiente' || current === '') ? '' : current;
                    document.getElementById('editScoreModal').classList.remove('hidden');
                    document.getElementById('editScoreModal').classList.add('flex');
                }

                if (deleteBtn) {
                    const id = deleteBtn.dataset.id;
                    if (confirm('¿Eliminar este encuentro definitivamente?')) {
                        supabase.from('partidos').delete().eq('id', id)
                            .then(({ error }) => {
                                if (error) alert('Error al eliminar: ' + error.message);
                                else loadMatches();
                            });
                    }
                }
            });

            document.getElementById('createMatchForm').onsubmit = async (e) => {
                e.preventDefault();
                const payload = {
                    equipolocal:    document.getElementById('localTeam').value,
                    equipovisitante:document.getElementById('visitTeam').value,
                    fecha:          document.getElementById('matchDate').value,
                    hora:           document.getElementById('matchTime').value,
                    categoria:      document.getElementById('matchCat').value,
                    Cancha:         document.getElementById('matchVenue').value,
                    descripcion:    document.getElementById('matchDesc').value || null,
                    resultado:      'Pendiente'
                };
                const { error } = await supabase.from('partidos').insert([payload]);
                if (error) alert('Error al crear partido: ' + error.message);
                else { closeCreateModal(); loadMatches(); }
            };

            document.getElementById('editScoreForm').onsubmit = async (e) => {
                e.preventDefault();
                const id     = document.getElementById('scoreId').value;
                const result = document.getElementById('scoreValue').value.trim();

                console.log('Guardando resultado:', { id, result });

                const { data, error } = await supabase
                    .from('partidos')
                    .update({ resultado: result })
                    .eq('id', id)
                    .select();

                if (error) {
                    console.error('Error Supabase:', error);
                    alert('Error al guardar: ' + error.message);
                } else {
                    console.log('Guardado OK:', data);
                    closeScoreModal();
                    await loadMatches();
                }
            };

            window.openCreateModal = () => {
                document.getElementById('createMatchModal').classList.remove('hidden');
                document.getElementById('createMatchModal').classList.add('flex');
            };
            window.closeCreateModal = () => document.getElementById('createMatchModal').classList.add('hidden');
            window.closeScoreModal  = () => document.getElementById('editScoreModal').classList.add('hidden');
        }
