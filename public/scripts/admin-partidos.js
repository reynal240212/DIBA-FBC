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
                // Auto-sincronizar en segundo plano al abrir y cada 60 segundos
                syncWhatsAppMatches({ silent: true });
                setInterval(() => syncWhatsAppMatches({ silent: true }), 60000);
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

            const btnSync = document.getElementById('btn-sync-wa');
            if (btnSync) {
                btnSync.addEventListener('click', () => syncWhatsAppMatches({ silent: false }));
            }
        }

        async function syncWhatsAppMatches({ silent = false } = {}) {
            const btnSync = document.getElementById('btn-sync-wa');
            const originalHtml = btnSync ? btnSync.innerHTML : '';
            if (btnSync && !silent) {
                btnSync.disabled = true;
                btnSync.innerHTML = '<i class="fas fa-spinner fa-spin text-sm"></i> Sincronizando...';
            }

            try {
                const cfg = window.DIBA_CONFIG || {};
                const baseUrl = cfg.OPENWA_URL || 'http://localhost:2785';
                const sessId = cfg.OPENWA_SESSION_ID || '4c331538-1a66-4002-93d2-cb49e5fa2ad3';
                const apiKey = cfg.OPENWA_API_KEY || 'dev-admin-key';
                const headers = apiKey ? { 'x-api-key': apiKey } : {};

                const targetChats = [
                    '120363141323973958@g.us', // Grupo oficial Deportivo internacional
                    '573128051695@c.us'        // Reinaldo Pérez (3128051695)
                ];

                let allMessages = [];
                for (const chatId of targetChats) {
                    const historyUrl = `${baseUrl}/api/sessions/${sessId}/messages/${encodeURIComponent(chatId)}/history?limit=80`;
                    const res = await fetch(historyUrl, { headers, signal: AbortSignal.timeout(6000) });
                    if (res.ok) {
                        const data = await res.json();
                        const list = Array.isArray(data) ? data : (data.messages || []);
                        allMessages = allMessages.concat(list);
                    }
                }

                if (!allMessages.length) {
                    if (!silent) throw new Error('No se pudo conectar a OpenWA local (puerto 2785) o no hay mensajes.');
                    return 0;
                }

                const MESES = { enero:1, febrero:2, marzo:3, abril:4, mayo:5, junio:6, julio:7, agosto:8, septiembre:9, setiembre:9, octubre:10, noviembre:11, diciembre:12 };
                let newCount = 0;

                const existingKeys = new Set(matches.map(m => {
                    const d = (m.fecha || '').split('T')[0];
                    return `${d}_${(m.hora || '').trim().toUpperCase()}_${(m.categoria || '').trim()}`;
                }));

                for (const msg of allMessages) {
                    const body = (msg.body || '').trim();
                    const lower = body.toLowerCase();

                    const hasPartido = lower.includes('partido') || lower.includes('vs ') || lower.includes('convocados');
                    const hasDetails = lower.includes('cancha') || lower.includes('hora') || lower.includes('lugar');
                    if (!hasPartido || !hasDetails) continue;
                    if (body.length < 45) continue;
                    if (lower.startsWith('recuerden hoy') || lower.startsWith('les recuerdo') || lower.includes('quiero aclararles algo')) continue;

                    // Parse rival
                    let rival = 'Por definir';
                    const vsMatch = body.match(/\bvs\.?\s+([^\n\r]+)/i);
                    if (vsMatch) {
                        const rClean = vsMatch[1].split(/hora|cancha|categoria|\$/i)[0].trim().toUpperCase();
                        if (rClean) rival = rClean;
                    }

                    // Parse categoria
                    let cat = '2012';
                    const catMatch = body.match(/categor[ií]as?\s*:?[\s]*([0-9\/\-\s]+)/i) || body.match(/\b(201[0-9](?:\/[0-9]{2,4})?)\b/i);
                    if (catMatch) {
                        cat = catMatch[1].replace(/\s+/g, '');
                        if (cat === '2012/13' || cat === '2013/12') cat = '2012/2013';
                        if (cat === '2014/15' || cat === '2015/14') cat = '2014/2015';
                        if (cat === '2015/16' || cat === '2016/15') cat = '2015/2016';
                    }

                    // Parse hora
                    let hora = '09:00 AM';
                    const horaMatch = body.match(/hora\s*(?:en la cancha)?\s*:?[\s]*([0-9]{1,2}\s*[:; ]\s*[0-9]{2}(?:\s*(?:am|pm|a\s*m|p\s*m))?)/i);
                    if (horaMatch) {
                        hora = horaMatch[1].trim().toUpperCase().replace(';', ':').replace('A M', 'AM').replace('P M', 'PM').replace(/(\d{1,2})\s+(\d{2})/, '$1:$2').replace(/\s+/g, ' ');
                        if (!/AM|PM/.test(hora)) {
                            const h = parseInt(hora.split(':')[0]);
                            hora += (h >= 6 && h <= 11) ? ' AM' : ' PM';
                        }
                    }

                    // Parse cancha
                    let cancha = 'La Bombonera';
                    const canchaMatch = body.match(/(?:cancha|lugar|en la cancha)\s*:?[\s]*([^\n\r]+)/i);
                    if (canchaMatch) {
                        const cVal = canchaMatch[1].trim().replace(/\.$/, '');
                        if (cVal.length > 2 && !/hora|partido|sabado|sábado|domingo|casa del profe/i.test(cVal)) {
                            cancha = cVal.charAt(0).toUpperCase() + cVal.slice(1);
                        }
                    }

                    // Parse fecha
                    const year = 2026;
                    let fechaIso = `${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}T12:00:00+00:00`;
                    const dateMatch = body.match(/(\d{1,2})\s+de\s+([a-zA-Z]+)/i);
                    if (dateMatch) {
                        const diaNum = Math.min(31, Math.max(1, parseInt(dateMatch[1], 10)));
                        const dia = String(diaNum).padStart(2, '0');
                        const mes = String(MESES[dateMatch[2].toLowerCase()] || 10).padStart(2, '0');
                        fechaIso = `${year}-${mes}-${dia}T12:00:00+00:00`;
                    }

                    // Deduplicación
                    const key = `${fechaIso.split('T')[0]}_${hora.trim().toUpperCase()}_${cat.trim()}`;
                    if (existingKeys.has(key)) continue;

                    // Torneo / Descripción
                    let torneo = 'Torneo Local - WhatsApp';
                    const tMatch = body.match(/Torneo\s+([^\n\r]+)/i);
                    if (tMatch) torneo = 'Torneo ' + tMatch[1].trim();

                    const payload = {
                        equipolocal: 'DIBA FBC',
                        equipovisitante: rival,
                        fecha: fechaIso,
                        hora: hora,
                        categoria: cat,
                        Cancha: cancha,
                        descripcion: torneo,
                        resultado: 'Pendiente',
                        valor: 6000,
                        uniforme: lower.includes('antiguo') ? 'Homenaje a Barranquilla (antiguo)' : 'Nuevo de competencia',
                        observaciones: body.slice(0, 500),
                        metodo_pago: 'NEQUI 3246656083 Reinaldo Pérez',
                        escudo_local: '/images/ESCUDO.webp',
                        escudo_visitante: `https://ui-avatars.com/api/?name=${encodeURIComponent(rival)}&background=004d98&color=FFD700&size=200`
                    };

                    const { error: insErr } = await supabase.from('partidos').insert([payload]);
                    if (!insErr) {
                        existingKeys.add(key);
                        newCount++;
                    }
                }

                if (newCount > 0) {
                    await loadMatches();
                }

                if (!silent) {
                    alert(newCount > 0 
                        ? `Sincronización exitosa: Se agregaron ${newCount} partidos nuevos a la base de datos.` 
                        : 'El calendario ya está al día. No hay partidos nuevos pendientes por sincronizar.');
                }
                return newCount;
            } catch (err) {
                if (!silent) {
                    console.error('Error sincronizando WhatsApp:', err);
                    alert(`Error al sincronizar: ${err.message}`);
                }
                return 0;
            } finally {
                if (btnSync && !silent) {
                    btnSync.disabled = false;
                    btnSync.innerHTML = originalHtml;
                }
            }
        }

