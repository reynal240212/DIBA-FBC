/**
 * DIBA FBC - Common Utilities
 * Centralizes date formatting, result calculations, and image helpers.
 */

/** Formatea una fecha ISO a "14 de marzo de 2025" */
export function formatearFecha(fechaISO) {
  if (!fechaISO) return 'Sin fecha';
  return new Date(fechaISO).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

/** Formatea una fecha ISO incluyendo el día de la semana, ej: "viernes, 14 de marzo de 2025" */
export function formatearFechaLarga(fechaStr) {
    if (!fechaStr) return '';
    const parteDate = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const [year, month, day] = parteDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/** Convierte una fecha ISO a YYYY-MM-DD en hora local evitando desfases */
export function toLocalDate(fechaISO) {
  if (!fechaISO) return '';
  const parts = fechaISO.includes('T') ? fechaISO.split('T')[0].split('-') : fechaISO.split('-');
  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

/** Evalúa el resultado de un partido para DIBA FBC */
export function evaluarResultado(p) {
  const r = p.resultado;
  if (!r || r === 'Pendiente' || r === '-' || r === '—') return 'pendiente';

  const partes = r.split(/[-:]/).map(x => {
    const n = parseInt(x.trim());
    return isNaN(n) ? null : n;
  });

  if (partes.length >= 2 && partes[0] !== null && partes[1] !== null) {
    const golesL = partes[0];
    const golesV = partes[1];
    const localEsDiba = (p.equipolocal || '').toUpperCase().includes('DIBA');
    const visitaEsDiba = (p.equipovisitante || '').toUpperCase().includes('DIBA');

    if (golesL === golesV) return 'empate';
    const ganoL = golesL > golesV;
    if ((ganoL && localEsDiba) || (!ganoL && visitaEsDiba)) return 'victoria';
    if ((ganoL && visitaEsDiba) || (!ganoL && localEsDiba)) return 'derrota';
  }

  const lower = r.toLowerCase();
  if (lower.includes('victoria') || lower.includes('ganó') || lower.includes('ganamos') || lower.startsWith('w')) {
    return 'victoria';
  }
  if (lower.includes('derrota') || lower.includes('perdió') || lower.includes('perdimos') || lower.startsWith('l')) {
    return 'derrota';
  }
  if (lower.includes('empat')) {
    return 'empate';
  }

  return 'pendiente';
}

/** Helper para escudos con proxy anti-bloqueo y ui-avatars por defecto */
export function getEscudoUrl(url, equipoNombre) {
  if (equipoNombre && equipoNombre.toUpperCase().includes('DIBA')) {
    return 'images/ESCUDO.webp';
  }
  const avatarParams = `background=0f172a&color=f59e0b&size=256&bold=true&font-size=0.55&rounded=false`;
  if (!url) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(equipoNombre || 'R')}&${avatarParams}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=100&h=100&fit=contain&default=https://ui-avatars.com/api/?name=R&${avatarParams}`;
  }
  return url;
}
