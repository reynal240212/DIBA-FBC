import { Player } from './supabase';

/**
 * Categoriza dinámicamente a un jugador basado en su fecha de nacimiento
 * si no tiene una categoría asignada.
 */
export function getPlayerCategory(player: Player & { fecha_nacimiento?: string }): string {
  if (player.categoria && player.categoria !== 'General') {
    return player.categoria;
  }

  if (player.fecha_nacimiento) {
    try {
      const birthYear = new Date(player.fecha_nacimiento).getUTCFullYear();
      if (birthYear === 2012) return '2012';
      if (birthYear === 2013) return '2013';
      if (birthYear >= 2014 && birthYear <= 2016) return '2014/2015/2016';
    } catch (e) {
      console.error('Error parsing birth date for', player.nombre);
    }
  }

  return player.categoria || 'GENERAL';
}

/**
 * Agrupa una lista de jugadores por categoría.
 */
export function groupPlayersByCategory(players: Player[]): Record<string, Player[]> {
  return players.reduce((groups: Record<string, Player[]>, player) => {
    const cat = getPlayerCategory(player);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(player);
    return groups;
  }, {});
}
