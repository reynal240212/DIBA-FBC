/**
 * DIBA FBC - Bento Standings Tables Loader
 * Dynamically loads and renders classification standings from data/clasificaciones.json
 */

document.addEventListener('DOMContentLoaded', () => {
  loadBentoStandings();
});

async function loadBentoStandings() {
  const container2014 = document.getElementById('tabla-bento-2014');
  const container2012 = document.getElementById('tabla-bento-2012');
  const container2013 = document.getElementById('tabla-bento-2013');

  if (!container2014 && !container2012 && !container2013) return;

  try {
    const response = await fetch('data/clasificaciones.json');
    if (!response.ok) throw new Error('No se pudo cargar el archivo de clasificaciones');
    
    const data = await response.json();

    if (container2014 && data.cat_2014_15) {
      renderBentoTable(container2014, data.cat_2014_15, true);
    }
    if (container2012 && data.cat_2012) {
      renderBentoTable(container2012, data.cat_2012, false);
    }
    if (container2013 && data.cat_2013) {
      renderBentoTable(container2013, data.cat_2013, false);
    }
  } catch (error) {
    console.error('Error al cargar clasificaciones Bento:', error);
    [container2014, container2012, container2013].forEach(c => {
      if (c) {
        c.innerHTML = `<p class="text-xs text-slate-500 py-4"><i class="fas fa-exclamation-triangle mr-2 text-yellow-500/70"></i>No se pudieron cargar los datos.</p>`;
      }
    });
  }
}

function renderBentoTable(container, dataset, isFull) {
  // Sort dataset by points DESC, then difference DESC, then goals favor DESC
  const sorted = [...dataset].sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
    return b.goles_favor - a.goles_favor;
  });

  const table = document.createElement('table');
  table.className = 'tabla-clas w-full text-left text-white';

  let headerHTML = '';
  if (isFull) {
    headerHTML = `
      <thead>
        <tr>
          <th class="text-center w-12">#</th>
          <th>Equipo</th>
          <th class="text-center w-12">Pts</th>
          <th class="text-center w-10">PJ</th>
          <th class="text-center w-10">PG</th>
          <th class="text-center w-10">PE</th>
          <th class="text-center w-10">PP</th>
          <th class="text-center w-12">GF</th>
          <th class="text-center w-12">GC</th>
          <th class="text-center w-12">DIF</th>
        </tr>
      </thead>
    `;
  } else {
    headerHTML = `
      <thead>
        <tr>
          <th class="text-center w-10">#</th>
          <th>Equipo</th>
          <th class="text-center w-10">Pts</th>
          <th class="text-center w-10">PJ</th>
          <th class="text-center w-12">DIF</th>
        </tr>
      </thead>
    `;
  }

  let bodyHTML = '<tbody>';

  sorted.forEach((item, index) => {
    const position = index + 1;
    const isDiba = item.equipo.toUpperCase().includes('DIBA');
    
    // Position/Podium badges styling
    let posBadge = '';
    if (position === 1) {
      posBadge = `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-black shadow-md shadow-yellow-500/20"><i class="fas fa-crown text-[7px] mr-0.5"></i>1</span>`;
    } else if (position === 2) {
      posBadge = `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 text-black text-[10px] font-black shadow-md shadow-slate-400/20">2</span>`;
    } else if (position === 3) {
      posBadge = `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-black shadow-md shadow-amber-700/20">3</span>`;
    } else {
      posBadge = `<span class="text-slate-500 text-[11px] font-bold">${position}</span>`;
    }

    // Team name styling
    let teamNameHTML = '';
    if (isDiba) {
      teamNameHTML = `
        <span class="flex items-center gap-1.5 text-yellow-400 font-extrabold tracking-wide drop-shadow-[0_0_8px_rgba(234,179,8,0.2)]">
          <i class="fas fa-shield-halved text-[10px] animate-pulse"></i>
          ${item.equipo}
          ${isFull ? `<span class="text-[7px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-500/30 uppercase tracking-widest font-black">Nosotros</span>` : ''}
        </span>
      `;
    } else {
      teamNameHTML = `<span class="text-slate-300 font-medium">${item.equipo}</span>`;
    }

    // Row construction
    if (isFull) {
      bodyHTML += `
        <tr class="${isDiba ? 'diba-row' : ''}">
          <td class="text-center font-bold">${posBadge}</td>
          <td class="font-semibold py-3">${teamNameHTML}</td>
          <td class="text-center font-bold text-[13px] ${isDiba ? 'text-yellow-400' : 'text-white'}">${item.puntos}</td>
          <td class="text-center text-slate-400">${item.jugados}</td>
          <td class="text-center text-green-400">${item.ganados}</td>
          <td class="text-center text-slate-400">${item.empatados}</td>
          <td class="text-center text-red-400">${item.perdidos}</td>
          <td class="text-center text-slate-500 text-[10px]">${item.goles_favor}</td>
          <td class="text-center text-slate-500 text-[10px]">${item.goles_contra}</td>
          <td class="text-center font-bold ${item.diferencia > 0 ? 'text-green-400' : item.diferencia < 0 ? 'text-red-400' : 'text-slate-400'}">${item.diferencia > 0 ? '+' : ''}${item.diferencia}</td>
        </tr>
      `;
    } else {
      bodyHTML += `
        <tr class="${isDiba ? 'diba-row' : ''}">
          <td class="text-center font-bold">${posBadge}</td>
          <td class="font-semibold py-2.5">${teamNameHTML}</td>
          <td class="text-center font-bold text-[12px] ${isDiba ? 'text-yellow-400' : 'text-white'}">${item.puntos}</td>
          <td class="text-center text-slate-400">${item.jugados}</td>
          <td class="text-center font-bold ${item.diferencia > 0 ? 'text-green-400' : item.diferencia < 0 ? 'text-red-400' : 'text-slate-400'}">${item.diferencia > 0 ? '+' : ''}${item.diferencia}</td>
        </tr>
      `;
    }
  });

  bodyHTML += '</tbody>';
  table.innerHTML = headerHTML + bodyHTML;
  container.innerHTML = '';
  container.appendChild(table);
}
