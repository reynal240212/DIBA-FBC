/**
 * DIBA FBC - documentos.html Module
 */
import { verificarSesion } from './scripts/auth.js';
        
        const DOC_TYPES = [
            { id: 'tarjeta_identidad', label: 'Tarjeta de Identidad', desc: 'Fotocopia ampliada del jugador' },
            { id: 'cedula_padre', label: 'Cédula del Padre', desc: 'Fotocopia del documento del acudiente masculino' },
            { id: 'cedula_madre', label: 'Cédula de la Madre', desc: 'Fotocopia del documento del acudiente femenino' },
            { id: 'registro_civil', label: 'Registro Civil', desc: 'Copia legible del registro civil de nacimiento' },
            { id: 'consentimiento_padres', label: 'Consentimiento Padres', desc: 'Formato diligenciado y firmado' }
        ];

        let currentUser = null;

        async function loadDocs() {
            const listEl = document.getElementById('docs-list');
            const progBar = document.getElementById('progress-bar');
            const progText = document.getElementById('progress-text');
            const pendingEl = document.getElementById('pending-count');

            if (!currentUser.identificacion_numero) {
                listEl.innerHTML = `
                    <div class="glass rounded-3xl p-12 text-center">
                        <i class="fas fa-user-shield text-4xl text-slate-600 mb-6"></i>
                        <h3 class="text-xl font-black text-white uppercase italic mb-4">Perfil no vinculado</h3>
                        <p class="text-slate-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">Para cargar tus documentos, primero debes vincular tu cuenta con tu número de identificación oficial.</p>
                        <a href="perfil.html" class="bg-dibaGold text-blue-900 px-8 py-3 rounded-full font-black uppercase text-xs hover:scale-105 transition-all inline-block shadow-lg shadow-dibaGold/20">Vincular Ahora</a>
                    </div>
                `;
                return;
            }

            const { data: docs } = await supabase.from('player_documents').select('*').eq('identificacion_numero', currentUser.identificacion_numero);

            let uploadedCount = 0;
            listEl.innerHTML = '';

            for (const [index, type] of DOC_TYPES.entries()) {
                const doc = docs?.find(d => d.doc_type === type.id);
                if (doc) uploadedCount++;

                let signedUrl = '#';
                if (doc && doc.file_url) {
                    const pathPart = doc.file_url.split('documents/')[1];
                    if (pathPart) {
                        const { data: sData } = await supabase.storage.from('documents').createSignedUrl(pathPart, 3600);
                        if (sData) signedUrl = sData.signedUrl;
                    } else {
                        signedUrl = doc.file_url;
                    }
                }

                const delay = 0.1 * index;
                const card = document.createElement('div');
                card.className = "glass rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.05] transition-all animate__animated animate__fadeInUp";
                card.style.animationDelay = `${delay}s`;

                card.innerHTML = `
                    <div class="flex items-center gap-5 w-full md:w-auto">
                        <div class="w-14 h-14 rounded-2xl ${doc ? 'bg-success/10 text-emerald-500' : 'bg-white/5 text-slate-500'} flex items-center justify-center text-xl shrink-0">
                            <i class="fas ${doc ? 'fa-check-circle' : 'fa-file-upload'}"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-white uppercase italic tracking-tight">${type.label}</h3>
                            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">${type.desc}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 w-full md:w-auto justify-end">
                        ${doc ? `
                            <div class="flex flex-col items-end mr-2">
                                <span class="text-[9px] font-black uppercase tracking-widest ${doc.status === 'verificado' ? 'text-emerald-500' : 'text-amber-500'} bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                    ${doc.status}
                                </span>
                            </div>
                            <a href="${signedUrl}" target="_blank" class="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-300 hover:text-dibaGold transition-all">
                                <i class="fas fa-eye"></i>
                            </a>
                        ` : ''}
                        
                        <button onclick="document.getElementById('file-${type.id}').click()" 
                                class="h-10 px-6 rounded-full font-black text-[10px] uppercase tracking-widest transition-all
                                ${doc ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-dibaGold text-blue-900 hover:scale-105 shadow-lg shadow-dibaGold/10'}">
                            ${doc ? 'Actualizar' : 'Subir Documento'}
                        </button>
                        <input type="file" id="file-${type.id}" class="hidden" accept=".pdf,.jpg,.jpeg,.webp" onchange="window.uploadDocument('${type.id}', this)">
                    </div>
                `;
                listEl.appendChild(card);
            }

            // Update progress
            const pct = Math.round((uploadedCount / DOC_TYPES.length) * 100);
            progBar.style.width = `${pct}%`;
            progText.innerText = `${pct}% Completado`;
            pendingEl.innerText = `${DOC_TYPES.length - uploadedCount} PENDIENTES`;
            pendingEl.className = (DOC_TYPES.length - uploadedCount) === 0
                ? "text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20"
                : "text-[10px] font-black bg-dibaGold/10 text-dibaGold px-3 py-1 rounded-full uppercase tracking-widest border border-dibaGold/20";
        }

        window.uploadDocument = async (typeId, input) => {
            const file = input.files[0];
            if (!file) return;

            const btn = input.previousElementSibling;
            const originalText = btn.innerText;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
            btn.disabled = true;

            try {
                const dni = currentUser.identificacion_numero;
                const path = `${dni}/${typeId}_${Date.now()}_${file.name}`;

                const { error: upError } = await supabase.storage.from('documents').upload(path, file);
                if (upError) throw upError;

                // Para buckets privados, ya no confiamos en publicUrl almacenado para visualización inmediata
                // Pero almacenamos la URL base por compatibilidad si es necesario, o el path.
                const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);

                const { error: dbError } = await supabase.from('player_documents').upsert({
                    identificacion_numero: dni,
                    user_id: currentUser.id,
                    doc_type: typeId,
                    file_url: publicUrl,
                    status: 'pendiente',
                    updated_at: new Date()
                }, { onConflict: ['identificacion_numero', 'doc_type'] });

                if (dbError) throw dbError;

                loadDocs(); // Reload UI
            } catch (err) {
                console.error(err);
                alert("Error al subir el archivo. Por favor reintenta.");
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        };

        // Initialize Page
        (async () => {
            currentUser = await verificarSesion();
            if (!currentUser) {
                window.location.href = 'index.html';
                return;
            }

            // Load Navbar/Footer
            const { initNavbar } = await import('./scripts/navbar.js');
            const { loadComponent } = await import('./scripts/loadComponents.js'); // Actually defined in the global scope but we use the one loaded by script tags inside layout if needed, though usually loadComponents is global.

            // Since loadComponents is global and already in loadComponents.js
            fetch('layout/navbar.html').then(r => r.text()).then(html => {
                document.getElementById('navbar-container').innerHTML = html;
                initNavbar();
            });

            fetch('layout/footer.html').then(r => r.text()).then(html => {
                document.getElementById('footer-container').innerHTML = html;
            });

            loadDocs();
        })();
