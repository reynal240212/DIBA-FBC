'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Dumbbell, MapPin, Loader2, Clock, Shield, Search, RefreshCw, ChevronRight, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Mock standings data in case standings table is needed
const STANDINGS_MOCK = [
  { pos: 1, equipo: 'DIBA FBC', pj: 10, pg: 8, pe: 1, pp: 1, gf: 24, gc: 8, dg: '+16', pts: 25, isDiba: true },
  { pos: 2, equipo: 'Atlético Barranquilla', pj: 10, pg: 7, pe: 2, pp: 1, gf: 21, gc: 9, dg: '+12', pts: 23, isDiba: false },
  { pos: 3, equipo: 'Real Pradera', pj: 10, pg: 6, pe: 1, pp: 3, gf: 18, gc: 12, dg: '+6', pts: 19, isDiba: false },
  { pos: 4, equipo: 'Academia Caribe', pj: 10, pg: 4, pe: 3, pp: 3, gf: 15, gc: 14, dg: '+1', pts: 15, isDiba: false },
  { pos: 5, equipo: 'Deportivo Sur', pj: 10, pg: 3, pe: 2, pp: 5, gf: 11, gc: 17, dg: '-6', pts: 11, isDiba: false },
  { pos: 6, equipo: 'Jolpar FC', pj: 10, pg: 2, pe: 1, pp: 7, gf: 9, gc: 20, dg: '-11', pts: 7, isDiba: false },
];

export default function PartidosPage() {
  const [activeTab, setActiveTab] = useState<'partidos' | 'entrenamientos' | 'posiciones' | 'mapa'>('partidos');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    try {
      let query = supabase.from('partidos').select('*').order('fecha', { ascending: true });
      if (selectedDate) query = query.eq('fecha', selectedDate);
      if (selectedCategory) query = query.ilike('categoria', `%${selectedCategory}%`);
      const { data: matches } = await query;
      setData(matches || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      let query = supabase.from('entrenamientos').select('*').order('fecha', { ascending: true });
      if (selectedDate) query = query.eq('fecha', selectedDate);
      const { data: results } = await query;
      setTrainings(results || []);
    } catch (err) {
      console.error('Error fetching trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'entrenamientos' || tab === 'partidos' || tab === 'posiciones' || tab === 'mapa') {
        setActiveTab(tab as any);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'partidos') fetchMatches();
    if (activeTab === 'entrenamientos') fetchTrainings();
  }, [activeTab, selectedDate, selectedCategory]);

  const getEscudoUrl = (url: string, equipoNombre: string) => {
    if (equipoNombre && equipoNombre.toUpperCase().includes('DIBA')) {
      return '/images/ESCUDO.png?v=2';
    }
    if (!url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(equipoNombre || 'DIBA')}&background=0f172a&color=eab308&bold=true`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=https://ui-avatars.com/api/?name=R&background=0f172a&color=eab308`;
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-yellow-500/30 flex flex-col">
      {/* HERO SECTION (Sincronizado con index.html) */}
      <section className="relative py-28 bg-slate-900 text-white overflow-hidden text-center">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img src="/images/estadio.webp" className="w-full h-full object-cover" alt="Estadio DIBA FBC" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block px-6 py-2 border border-yellow-500/30 bg-yellow-500/10 rounded-full backdrop-blur-md mb-4">
              <span className="text-yellow-400 text-xs font-black tracking-[0.3em] uppercase">Calendario Oficial • Temporada 2025 – 2026</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">
              PARTIDOS & <span className="text-yellow-500 drop-shadow-[0_0_25px_rgba(234,179,8,0.3)]">AGENDA</span>
            </h1>

            <p className="text-slate-200 text-base md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
              Consulta los próximos encuentros, resultados en vivo, entrenamientos de la semana y la tabla de posiciones del club.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {/* TAB NAVIGATION PILLS */}
        <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-md max-w-4xl mx-auto mb-12 flex overflow-x-auto gap-2">
          {[
            { id: 'partidos', label: 'Partidos & Resultados', icon: Calendar, activeBg: 'bg-yellow-500 text-slate-950' },
            { id: 'entrenamientos', label: 'Entrenamientos', icon: Dumbbell, activeBg: 'bg-emerald-600 text-white' },
            { id: 'posiciones', label: 'Tabla Posiciones', icon: Trophy, activeBg: 'bg-blue-600 text-white' },
            { id: 'mapa', label: 'Sede & Ubicación', icon: MapPin, activeBg: 'bg-slate-900 text-white' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
                  isActive ? `${tab.activeBg} shadow-md` : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* TAB PARTIDOS */}
          {activeTab === 'partidos' && (
            <motion.div
              key="partidos"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* FILTROS DE BÚSQUEDA */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Filtrar por Fecha</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs font-semibold outline-none focus:border-yellow-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Categoría</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs font-semibold outline-none focus:border-yellow-500 focus:bg-white transition-all"
                    >
                      <option value="">Todas las categorías</option>
                      <option value="2002">Categoría 2002 / 2003</option>
                      <option value="2004">Categoría 2004 / 2005</option>
                      <option value="2010">Categoría 2010</option>
                      <option value="2014">Categoría 2014 / 2015</option>
                      <option value="Libre">Libre / Abierta</option>
                    </select>
                  </div>
                </div>

                {(selectedDate || selectedCategory) && (
                  <button
                    onClick={() => { setSelectedDate(''); setSelectedCategory(''); }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 self-end"
                  >
                    <RefreshCw size={14} /> Limpiar Filtros
                  </button>
                )}
              </div>

              {/* LISTA DE PARTIDOS */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-yellow-500" size={40} />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cargando Encuentros...</span>
                </div>
              ) : data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.map((match, i) => {
                    const isDibaLocal = (match.equipolocal || '').toUpperCase().includes('DIBA');
                    const isDibaVisit = (match.equipovisitante || '').toUpperCase().includes('DIBA');

                    return (
                      <div
                        key={i}
                        className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md hover:shadow-2xl hover:border-yellow-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                      >
                        <div>
                          <!-- Header del Partido -->
                          <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 text-[10px] font-black rounded-full uppercase tracking-wider">
                              {match.categoria || 'DIBA FBC'}
                            </span>
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                              <Calendar size={14} className="text-slate-400" /> {match.fecha}
                            </span>
                          </div>

                          <!-- Enfrentamiento Equipos -->
                          <div className="flex items-center justify-between gap-3 mb-6">
                            <!-- Local -->
                            <div className="flex-1 text-center">
                              <img
                                src={getEscudoUrl(match.escudo_local || match.escudo, match.equipolocal)}
                                alt={match.equipolocal}
                                className="w-14 h-14 object-contain mx-auto mb-2 drop-shadow-md group-hover:scale-105 transition-transform"
                              />
                              <p className={`text-xs font-black uppercase tracking-tight line-clamp-1 ${isDibaLocal ? 'text-yellow-600' : 'text-slate-900'}`}>
                                {match.equipolocal || 'Equipo Local'}
                              </p>
                            </div>

                            <!-- VS o Resultado -->
                            <div className="flex flex-col items-center justify-center px-3 py-2 bg-slate-900 text-yellow-400 font-black rounded-2xl shadow-inner min-w-[70px] text-center border border-slate-800">
                              <span className="text-sm tracking-widest">{match.resultado || 'VS'}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-semibold">
                                {match.resultado ? 'Final' : 'Programado'}
                              </span>
                            </div>

                            <!-- Visitante -->
                            <div className="flex-1 text-center">
                              <img
                                src={getEscudoUrl(match.escudo_visitante, match.equipovisitante)}
                                alt={match.equipovisitante}
                                className="w-14 h-14 object-contain mx-auto mb-2 drop-shadow-md group-hover:scale-105 transition-transform"
                              />
                              <p className={`text-xs font-black uppercase tracking-tight line-clamp-1 ${isDibaVisit ? 'text-yellow-600' : 'text-slate-900'}`}>
                                {match.equipovisitante || 'Equipo Visitante'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- Footer con Cancha y Hora -->
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                          <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-[65%]" title={match.Cancha}>
                            <MapPin size={14} className="text-rose-500 shrink-0" />
                            <span className="truncate">{match.Cancha || 'Cancha Pradera'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-800 border border-yellow-200 px-2.5 py-1 rounded-lg">
                            <Clock size={12} className="text-yellow-600" />
                            <span>{match.hora || 'Por definir'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto text-2xl">
                    <Calendar />
                  </div>
                  <h3 className="text-lg font-black uppercase text-slate-900">No hay partidos registrados</h3>
                  <p className="text-slate-500 text-xs font-medium max-w-sm mx-auto">
                    No encontramos encuentros para la fecha o categoría seleccionada. Intenta limpiar los filtros.
                  </p>
                  <button
                    onClick={() => { setSelectedDate(''); setSelectedCategory(''); }}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    Ver Todos los Partidos
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB ENTRENAMIENTOS */}
          {activeTab === 'entrenamientos' && (
            <motion.div
              key="entrenamientos"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-emerald-600" size={40} />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cargando Entrenamientos...</span>
                </div>
              ) : trainings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trainings.map((ent, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md hover:shadow-xl transition-all border-l-4 border-l-emerald-500 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-xl shrink-0">
                            <Dumbbell size={22} />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 text-base uppercase tracking-tight line-clamp-1">
                              {ent.titulo || 'Sesión de Entrenamiento'}
                            </h3>
                            <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-md mt-0.5">
                              {ent.categoria || 'Todas las Categorías'}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-600 text-xs font-medium leading-relaxed">
                          {ent.descripcion || 'Entrenamiento táctico, trabajo físico y preparación para próximos partidos oficiales.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 font-medium">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-600">
                            <Calendar size={14} className="text-emerald-600" /> {ent.fecha}
                          </span>
                          <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <Clock size={12} className="text-slate-500" /> {ent.hora}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin size={14} className="text-rose-500" />
                          <span className="truncate">{ent.lugar || 'Cancha Parque La Pradera'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                    <Dumbbell />
                  </div>
                  <h3 className="text-lg font-black uppercase text-slate-900">No hay entrenamientos programados</h3>
                  <p className="text-slate-500 text-xs font-medium max-w-sm mx-auto">
                    Los horarios de entrenamiento se publican semanalmente en el sistema.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB POSICIONES */}
          {activeTab === 'posiciones' && (
            <motion.div
              key="posiciones"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Tabla de Posiciones</h3>
                    <p className="text-xs text-slate-500 font-medium">Torneo Departamental de Barranquilla</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-black rounded-full uppercase border border-yellow-200">
                    DIBA FBC En la Cima
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4 text-center">Pos</th>
                        <th className="py-3.5 px-4">Equipo</th>
                        <th className="py-3.5 px-3 text-center">PJ</th>
                        <th className="py-3.5 px-3 text-center">PG</th>
                        <th className="py-3.5 px-3 text-center">PE</th>
                        <th className="py-3.5 px-3 text-center">PP</th>
                        <th className="py-3.5 px-3 text-center">GF</th>
                        <th className="py-3.5 px-3 text-center">GC</th>
                        <th className="py-3.5 px-3 text-center">DG</th>
                        <th className="py-3.5 px-4 text-center">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {STANDINGS_MOCK.map((row) => (
                        <tr
                          key={row.pos}
                          className={`transition-colors ${
                            row.isDiba
                              ? 'bg-yellow-50/80 font-bold border-l-4 border-l-yellow-500 text-slate-900'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-4 px-4 text-center font-black">{row.pos}</td>
                          <td className="py-4 px-4 flex items-center gap-3 font-bold text-slate-900">
                            {row.isDiba && <img src="/images/ESCUDO.png?v=2" alt="DIBA" className="w-6 h-6 object-contain" />}
                            <span>{row.equipo}</span>
                          </td>
                          <td className="py-4 px-3 text-center">{row.pj}</td>
                          <td className="py-4 px-3 text-center text-emerald-600 font-bold">{row.pg}</td>
                          <td className="py-4 px-3 text-center">{row.pe}</td>
                          <td className="py-4 px-3 text-center text-rose-500">{row.pp}</td>
                          <td className="py-4 px-3 text-center">{row.gf}</td>
                          <td className="py-4 px-3 text-center">{row.gc}</td>
                          <td className="py-4 px-3 text-center font-bold">{row.dg}</td>
                          <td className="py-4 px-4 text-center font-black text-sm text-slate-900">{row.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB MAPA Y SEDE */}
          {activeTab === 'mapa' && (
            <motion.div
              key="mapa"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl overflow-hidden space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">Sede Oficial de Entrenamientos</h3>
                    <p className="text-xs text-slate-500 font-medium">Cancha Parque La Pradera — Barranquilla</p>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/Parque+La+Pradera+Barranquilla+calle+114+con+carrera+31"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    <MapPin size={16} /> Abrir en Google Maps
                  </a>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62666.549685140024!2d-74.85599378447988!3d10.989064078127402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42cdd367c2453%3A0x401e8f23384cd2a6!2sParque%20La%20Pradera!5e0!3m2!1ses-419!2sco!4v1777045527105!5m2!1ses-419!2sco"
                    className="w-full h-[450px] border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
