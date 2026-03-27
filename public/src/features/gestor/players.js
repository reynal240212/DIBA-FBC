/**
 * DIBA FBC - Gestor Players Module (Refactored for Light Mode)
 */
import { supabase, sanitizeDNI } from '../../core/supabase.js';

export async function loadPlayers(dynamicContent, pageTitle, mainTitle, setActiveFilter) {
    if (pageTitle) pageTitle.innerHTML = 'Plantilla <span>Oficial</span>';
    if (mainTitle) mainTitle.innerHTML = 'Jugadores';
    setActiveFilter('view-players-btn');
    dynamicContent.innerHTML = '<div class="flex justify-center py-32"><i class="fas fa-circle-notch animate-spin text-4xl text-diba-blue"></i></div>';

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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-up">
                ${renderStatCard('Total Jugadores', totalJugadores, 'fa-users', 'bg-diba-blue/5 text-diba-blue')}
                ${renderStatCard('Al Día', alDia, 'fa-check-double', 'bg-emerald-50 text-emerald-600')}
                ${renderStatCard('Pendientes', totalJugadores - alDia, 'fa-exclamation-triangle', 'bg-rose-50 text-rose-600')}
            </div>

            <div class="bg-white rounded-elite shadow-premium border border-slate-100 overflow-hidden animate-fade-up">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-100">
                                <th class="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Identidad del Jugador</th>
                                <th class="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">DNI / Documento</th>
                                <th class="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Estado Documental</th>
                                <th class="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${jugadores.map(j => renderPlayerRow(j, allDocs, DOC_TYPES_MAP)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="adminDocsModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-up">
                    <div class="p-10 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                        <div>
                            <h3 id="modalPlayerName" class="text-xl font-black text-diba-blue uppercase italic tracking-tight">Cargando...</h3>
                            <p id="modalPlayerDni" class="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest italic"></p>
                        </div>
                        <button onclick="window.closeAdminDocs()" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100 group">
                            <i class="fas fa-times group-hover:rotate-90 transition-transform"></i>
                        </button>
                    </div>
                    <div class="p-10 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar" id="modalDocsList"></div>
                    <div class="p-6 bg-slate-50 text-center border-t border-slate-100">
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Sistema de Gestión de Talento — DIBA FBC</p>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error(err);
        dynamicContent.innerHTML = `<div class="p-20 text-center text-rose-500 font-black uppercase text-xs">Error: ${err.message}</div>`;
    }
}

function renderStatCard(label, value, icon, colors) {
    return `
        <div class="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-premium flex items-center gap-6 group hover:shadow-xl transition-all">
            <div class="w-14 h-14 ${colors} rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"><i class="fas ${icon}"></i></div>
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">${label}</p>
                <h4 class="text-3xl font-black italic tracking-tighter text-diba-blue uppercase">${value}</h4>
            </div>
        </div>
    `;
}

function renderPlayerRow(j, allDocs, DOC_TYPES_MAP) {
    const jDocs = allDocs?.filter(d => d.identificacion_numero === j.numero) || [];
    return `
        <tr class="hover:bg-slate-50/50 transition-all group">
            <td class="p-6">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-diba-blue rounded-xl flex items-center justify-center text-diba-gold font-black text-xs italic shadow-lg uppercase">
                        ${j.nombre.charAt(0)}${j.apellidos.charAt(0)}
                    </div>
                    <div>
                        <p class="font-black text-diba-blue text-xs uppercase italic group-hover:text-diba-red transition-colors">${j.nombre} ${j.apellidos}</p>
                        <p class="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-0.5">${j.nacionalidad}</p>
                    </div>
                </div>
            </td>
            <td class="p-6 font-mono text-xs text-slate-500 font-bold italic tracking-wider">${j.numero}</td>
            <td class="p-6">
                <div class="flex gap-2">
                    ${DOC_TYPES_MAP.map(type => {
                        const doc = jDocs.find(d => d.doc_type === type.id);
                        let colorClass = 'bg-slate-100 text-slate-300';
                        if (doc) colorClass = doc.status === 'verificado' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20';
                        return `<div class="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] ${colorClass} transition-all hover:scale-110" title="${type.id}"><i class="fas ${type.icon}"></i></div>`;
                    }).join('')}
                </div>
            </td>
            <td class="p-6">
                <div class="flex justify-center">
                    <button onclick="window.openAdminDocs('${j.numero}', '${j.nombre} ${j.apellidos}')" class="px-5 py-2.5 bg-diba-blue text-white text-[9px] font-black uppercase italic tracking-widest rounded-xl hover:bg-diba-red transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10">
                        <i class="fas fa-file-medical text-diba-gold"></i> Expediente
                    </button>
                </div>
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
    dniEl.innerText = `ID de Expediente: ${sanitizedDni}`;
    modal.classList.remove('hidden');
    listEl.innerHTML = '<div class="flex justify-center py-20 text-diba-blue"><i class="fas fa-circle-notch animate-spin text-3xl"></i></div>';

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
            item.className = "group flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-diba-blue hover:shadow-premium transition-all";
            item.innerHTML = `
                <div class="flex items-center gap-5">
                    <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-diba-blue transition-colors shadow-inner"><i class="fas fa-file-alt"></i></div>
                    <div>
                        <p class="text-[11px] font-black text-diba-blue italic uppercase tracking-tighter">${type.label}</p>
                        <p class="text-[9px] uppercase font-bold py-1 px-3 mt-1 inline-block rounded-full ${doc ? (doc.status === 'verificado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600') : 'bg-slate-100 text-slate-400'}">
                            ${doc ? doc.status : 'No cargado'}
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    ${doc ? `<a href="${signedUrl}" target="_blank" class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-diba-blue border border-slate-100 hover:border-diba-blue hover:bg-diba-blue/5 shadow-sm transition-all" title="Ver"><i class="fas fa-eye"></i></a>` : ''}
                    <button onclick="document.getElementById('upload-${type.id}').click()" class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 shadow-sm transition-all" title="Cargar"><i class="fas fa-upload"></i></button>
                    <input type="file" id="upload-${type.id}" class="hidden" onchange="window.adminUploadDoc('${sanitizedDni}', '${type.id}', this)">
                </div>
            `;
            listEl.appendChild(item);
        });
    } catch (err) {
        listEl.innerHTML = `<div class="p-10 text-center text-rose-500 font-bold text-xs uppercase italic">${err.message}</div>`;
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

