/**
 * DIBA FBC - KidsSoccerPradera.html Module
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.DIBA_CONFIG;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const container = document.getElementById('clasificacion-container');
    const spinner = document.getElementById('loading-clasificacion');

    function renderTable(data) {
      const tablaHTML = `
        <div class="table-responsive">
          <table class="table table-striped table-hover mb-0 text-center align-middle">
            <thead>
              <tr>
                <th>Pos</th><th class="text-start">Equipo</th><th>Pts</th><th>J</th>
                <th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DIF</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(e => `
                <tr class="${e.equipo.toLowerCase().includes('diba') ? 'team-diba-highlight' : ''}">
                  <td class="fw-bold">${e.posicion}</td>
                  <td class="text-start">${e.equipo}</td>
                  <td class="fw-bold">${e.puntos}</td>
                  <td>${e.jugados}</td>
                  <td>${e.ganados}</td>
                  <td>${e.empatados}</td>
                  <td>${e.perdidos}</td>
                  <td>${e.goles_favor}</td>
                  <td>${e.goles_contra}</td>
                  <td>${e.diferencia}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
      container.innerHTML = tablaHTML;
    }

    async function obtenerClasificacion() {
      try {
        const { data, error } = await supabase
          .from('clasificacion_categoria_2014_15')
          .select('*')
          .order('posicion', { ascending: true });

        if (error) throw new Error('No se pudieron cargar los datos.');
        if (!data || data.length === 0) {
          container.innerHTML = '<div class="alert alert-info text-center">No hay datos de clasificación disponibles en este momento.</div>';
          return;
        }

        renderTable(data);
      } catch (error) {
        console.error('Error al obtener clasificación:', error);
        container.innerHTML = '<div class="alert alert-danger text-center">Ocurrió un error al cargar la clasificación.</div>';
      } finally {
        spinner.style.display = 'none';
      }
    }

    // Lógica del botón "Volver arriba"
    const btnBackToTop = document.getElementById('btnBackToTop');
    window.addEventListener('scroll', () => {
      btnBackToTop.style.display = window.scrollY > 200 ? 'block' : 'none';
    });
    btnBackToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Iniciar carga de datos
    document.addEventListener('DOMContentLoaded', obtenerClasificacion);
