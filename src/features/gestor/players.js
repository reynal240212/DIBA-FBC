/**
 * DIBA FBC - Gestor Players Module (Reorganized)
 */
import { supabase, sanitizeDNI } from '../../core/supabase.js';

export async function loadPlayers(dynamicContent, pageTitle, mainTitle, setActiveFilter) {
    if (pageTitle) pageTitle.innerHTML = 'Plantilla <span>Oficial</span>';
    if (mainTitle) mainTitle.innerHTML = 'Jugadores';
    setActiveFilter('view-players-btn');
    dynamicContent.innerHTML = '<div class="flex justify-center py-20"><i class="fas fa-circle-notch animate-spin text-3xl text-dibaGold"></i></div>';

    try {
        const { data: jugadores, error } = await supabase.from('identificacion').select('*').order('apellidos');
        const { data: allDocs } = await supabase.from('player_documents').select('identificacion_numero, doc_type, status');

        if (error) throw error;

        const DOC_TYPES_MAP = [
            { id: 'tarjeta_identidad', icon: 'fa-id-card' },
            { id: 'cedula_padre', icon: 'fa-user-tie' },
            { id: 'cedula_madre', icon: 'fa-user' },
            { id: 'registro_civil', icon: 'fa-baby' },
            { id: 'consentimiento_padres', icon: 'fa-file-signature' }
        ];

        const totalJugadores = jugadores.length;
        const alDia = jugadores.filter(j => {
            const jDocs = allDocs?.filter(d => d.identificacion_numero === j.numero && d.status === 'verificado');
            return jDocs?.length === 5;
        }).length;

        dynamicContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate__animated animate__fadeInDown">
                ${renderStatCard('Total Jugadores', totalJugadores, 'fa-users', 'bg-dibaBlue/5 text-dibaBlue')}
                ${renderStatCard('Al Día', alDia, 'fa-check-double', 'bg-emerald-50 text-emerald-500')}
                ${renderStatCard('Pendientes', totalJugadores - alDia, 'fa-exclamation-triangle', 'bg-amber-50 text-amber-500')}
            </div>

            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate__animated animate__fadeInUp">
                <div class="table-responsive">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th class="p-5 text-[10px] font-black uppercase text-slate-400">Jugador</th>
                                <th class="p-5 text-[10px] font-black uppercase text-slate-400">DNI</th>
                                <th class="p-5 text-[10px] font-black uppercase text-slate-400">Docs</th>
                                <th class="p-5 text-[10px] font-black uppercase text-slate-400 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${jugadores.map(j => renderPlayerRow(j, allDocs, DOC_TYPES_MAP)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="adminDocsModal" class="hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div class="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div class="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                        <div>
                            <h3 id="modalPlayerName" class="text-xl font-black text-white uppercase italic">Cargando...</h3>
                            <p id="modalPlayerDni" class="text-[10px] text-slate-400 font-bold uppercase mt-1"></p>
                        </div>
                        <button onclick="window.closeAdminDocs()" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-8 space-y-4 max-h-[60vh] overflow-y-auto" id="modalDocsList"></div>
                    <div class="p-6 bg-slate-950/50 text-center">
                        <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Gestión Administrativa DIBA FBC</p>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error(err);
        dynamicContent.innerHTML = `<p class="text-rose-500 text-center py-20 font-black">Error: ${err.message}</p>`;
    }
}

function renderStatCard(label, value, icon, colors) {
    return `
        <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 ${colors} rounded-2xl flex items-center justify-center text-xl"><i class="fas ${icon}"></i></div>
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${label}</p>
                <h4 class="text-2xl font-black text-slate-800 italic">${value}</h4>
            </div>
        </div>
    `;
}

function renderPlayerRow(j, allDocs, DOC_TYPES_MAP) {
    const jDocs = allDocs?.filter(d => d.identificacion_numero === j.numero) || [];
    return `
        <tr class="hover:bg-slate-50/50 transition-all">
            <td class="p-5">
                <p class="font-bold text-slate-700 text-xs uppercase italic">${j.nombre} ${j.apellidos}</p>
                <p class="text-[9px] text-slate-400 uppercase font-medium">${j.nacionalidad}</p>
            </td>
            <td class="p-5 font-mono text-xs text-slate-500">${j.numero}</td>
            <td class="p-5">
                <div class="flex gap-1.5">
                    ${DOC_TYPES_MAP.map(type => {
                        const doc = jDocs.find(d => d.doc_type === type.id);
                        let colorClass = 'bg-slate-100 text-slate-300';
                        if (doc) colorClass = doc.status === 'verificado' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white';
                        return `<div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${colorClass}" title="${type.id}"><i class="fas ${type.icon}"></i></div>`;
                    }).join('')}
                </div>
            </td>
            <td class="p-5 flex justify-center gap-4">
                <button onclick="window.openAdminDocs('${j.numero}', '${j.nombre} ${j.apellidos}')" class="text-emerald-600 hover:text-dibaGold transition-all font-black" title="Documentos">
                    <i class="fas fa-file-medical text-lg"></i>
                </button>
            </td>
        </tr>
    `;
}

window.openAdminDocs = async (dni, name) => {
    const sanitizedDni = sanitizeDNI(dni);
    const modal = document.getElementById('adminDocsModal');
    const nameEl = document.getElementById('modalPlayerName');
    const dniEl = document.getElementById('modalPlayerDni');
    const listEl = document.getElementById('modalDocsList');

    if (!modal) return;
    nameEl.innerText = name;
    dniEl.innerText = `DNI: ${sanitizedDni}`;
    modal.classList.remove('hidden');
    listEl.innerHTML = '<div class="flex justify-center py-10"><i class="fas fa-circle-notch animate-spin text-2xl text-dibaGold"></i></div>';

    try {
        const DOC_TYPES = [
            { id: 'tarjeta_identidad', label: 'Tarjeta de Identidad' },
            { id: 'cedula_padre', label: 'Cédula del Padre' },
            { id: 'cedula_madre', label: 'Cédula de la Madre' },
            { id: 'registro_civil', label: 'Registro Civil' },
            { id: 'consentimiento_padres', label: 'Consentimiento Padres' }
        ];

        const { data: docs } = await supabase.from('player_documents').select('*').eq('identificacion_numero', sanitizedDni);
        
        const filePaths = docs?.map(d => d.file_url.split('/documents/')[1]).filter(p => !!p) || [];
        let signedUrls = {};
        if (filePaths.length > 0) {
            const { data, error } = await supabase.storage.from('documents').createSignedUrls(filePaths, 3600);
            if (!error) data.forEach(item => signedUrls[item.path] = item.signedUrl);
        }

        listEl.innerHTML = '';
        DOC_TYPES.forEach(type => {
            const doc = docs?.find(d => d.doc_type === type.id);
            const path = doc?.file_url.split('/documents/')[1];
            const signedUrl = signedUrls[path] || '#';
            
            const item = document.createElement('div');
            item.className = "flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] transition-all";
            item.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500"><i class="fas fa-file-alt"></i></div>
                    <div>
                        <p class="text-[11px] font-black text-white italic uppercase">${type.label}</p>
                        <p class="text-[9px] uppercase font-bold ${doc ? (doc.status === 'verificado' ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-500'}">
                            ${doc ? doc.status : 'No cargado'}
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    ${doc ? `<a href="${signedUrl}" target="_blank" class="p-2 text-slate-400 hover:text-dibaGold"><i class="fas fa-eye"></i></a>` : ''}
                    <button onclick="document.getElementById('upload-${type.id}').click()" class="p-2 text-slate-400 hover:text-emerald-500"><i class="fas fa-upload"></i></button>
                    <input type="file" id="upload-${type.id}" class="hidden" onchange="window.adminUploadDoc('${sanitizedDni}', '${type.id}', this)">
                </div>
            `;
            listEl.appendChild(item);
        });
    } catch (err) {
        listEl.innerHTML = `<p class="text-rose-500 text-center font-bold text-[10px]">${err.message}</p>`;
    }
};

window.closeAdminDocs = () => {
    document.getElementById('adminDocsModal')?.classList.add('hidden');
};

window.adminUploadDoc = async (dni, docType, input) => {
    const file = input.files[0];
    if (!file) return;

    const originalBtn = input.previousElementSibling;
    const originalIcon = originalBtn.innerHTML;
    originalBtn.innerHTML = '<i class="fas fa-circle-notch animate-spin text-emerald-500"></i>';
    originalBtn.disabled = true;

    try {
        const sanitizedDni = sanitizeDNI(dni);
        const extension = file.name.split('.').pop();
        const fileName = `${sanitizedDni}/${docType}.${extension}`;

        const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);

        const { error: dbError } = await supabase.from('player_documents').upsert({
            identificacion_numero: sanitizedDni,
            doc_type: docType,
            file_url: publicUrl,
            status: 'verificado',
            updated_at: new Date()
        });

        if (dbError) throw dbError;

        const nameEl = document.getElementById('modalPlayerName').innerText;
        window.openAdminDocs(sanitizedDni, nameEl);

    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        originalBtn.innerHTML = originalIcon;
        originalBtn.disabled = false;
    }
};
