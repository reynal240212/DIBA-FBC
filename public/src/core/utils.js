/**
 * DIBA FBC - Common Utilities
 * Centralizes date formatting, result calculations, and image helpers.
 */

/** Formatea una fecha ISO a "14 de marzo de 2025" */
export function formatearFecha(fechaISO) {
  if (!fechaISO) return 'Sin fecha';
  try {
    return new Date(fechaISO).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return fechaISO;
  }
}

/** Formatea una fecha ISO incluyendo el día de la semana, ej: "viernes, 14 de marzo de 2025" */
export function formatearFechaLarga(fechaStr) {
  if (!fechaStr) return '';
  try {
    const parteDate = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const [year, month, day] = parteDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return fechaStr;
  }
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

/** Helper para escudos con mapeo a escudos locales y fallback optimizado */
export function getEscudoUrl(url, equipoNombre) {
  const norm = (equipoNombre || '').toUpperCase();
  if (norm.includes('DIBA')) return 'images/ESCUDO.webp';
  if (norm.includes('JOLPARR')) return 'images/torneo/escudo-jolparr-fc.webp';
  if (norm.includes('OCAM')) return 'images/torneo/escudo-ocam-fc.webp';
  if (norm.includes('PHOTOS') || norm.includes('PHOTO')) return 'images/torneo/escudo-photos-fc.webp';
  if (norm.includes('REDIMIDO')) return 'images/torneo/escudo-redimidos.webp';
  if (norm.includes('CAYENA')) return 'images/torneo/escudo-cayenas-fc.webp';
  if (norm.includes('AMIGOS')) return 'images/torneo/escudo-amigos-kids.webp';
  if (norm.includes('FUDAVIS') || norm.includes('FUVADIS')) return 'images/torneo/escudo-fudavis.webp';

  if (url && (url.startsWith('/') || url.startsWith('images/'))) {
    return url.startsWith('/') ? url.slice(1) : url;
  }

  const avatarParams = `background=002a40&color=eab308&size=256&bold=true&font-size=0.45&rounded=false`;
  if (!url) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(equipoNombre || 'Rival')}&${avatarParams}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=100&h=100&fit=contain&default=https://ui-avatars.com/api/?name=${encodeURIComponent(equipoNombre || 'R')}&${avatarParams}`;
  }
  return url;
}
