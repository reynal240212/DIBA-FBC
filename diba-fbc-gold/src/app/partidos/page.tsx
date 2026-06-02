'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Dumbbell, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PartidosPage() {
  const [activeTab, setActiveTab] = useState<'partidos' | 'entrenamientos' | 'mapa'>('partidos');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    let query = supabase.from('partidos').select('*').order('fecha', { ascending: true });
    if (selectedDate) query = query.eq('fecha', selectedDate);
    const { data: matches } = await query;
    setData(matches || []);
    setLoading(false);
  };

  const fetchTrainings = async () => {
    setLoading(true);
    let query = supabase.from('entrenamientos').select('*').order('fecha', { ascending: true });
    if (selectedDate) query = query.eq('fecha', selectedDate);
    const { data: results } = await query;
    setTrainings(results || []);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'partidos') fetchMatches();
    if (activeTab === 'entrenamientos') fetchTrainings();
  }, [activeTab, selectedDate]);
  const getEscudoUrl = (url: string, equipoNombre: string) => {
    if (equipoNombre && equipoNombre.toUpperCase().includes('DIBA')) {
      return '/images/ESCUDO.png';
    }
    if (!url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(equipoNombre || 'R')}&background=1e293b&color=cbd5e1`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=https://ui-avatars.com/api/?name=R&background=1e293b&color=cbd5e1`;
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
      {/* Header */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 bg-[url('/images/estadio.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-yellow-500 font-black uppercase tracking-[0.4em] text-xs mb-6 inline-block">Temporada 2025 – 2026</span>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8">
              PARTIDOS & <span className="text-yellow-500">AGENDA</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              CONSULTA EL CALENDARIO OFICIAL, RESULTADOS Y LA TABLA DE POSICIONES DE DIBA FBC.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-slate-900/40 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl shadow-2xl">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-white/10 bg-black/40">
            {[
              { id: 'partidos', label: 'Partidos', icon: Calendar, color: 'text-yellow-500' },
              { id: 'entrenamientos', label: 'Entrenamientos', icon: Dumbbell, color: 'text-green-500' },
              { id: 'mapa', label: 'Mapa Sede', icon: MapPin, color: 'text-rose-500' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-3 px-8 py-6 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? tab.color : 'text-slate-500 hover:text-white'}`}
              >
                <tab.icon size={18} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 bg-current" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {activeTab === 'partidos' && (
                <motion.div 
                  key="partidos" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="flex flex-col md:flex-row md:items-end gap-6 bg-white/5 p-8 rounded-3xl border border-white/5">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Filtrar por Fecha</label>
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-yellow-500 transition-all" 
                      />
                    </div>
                    <button 
                      onClick={() => setSelectedDate('')}
                      className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Limpiar Filtros
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-yellow-500" size={48} /></div>
                  ) : data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {data.map((match, i) => (
                        <div key={i} className="group bg-white/5 border border-white/5 rounded-3xl p-8 hover:bg-white/10 transition-all border-l-4 border-l-yellow-500">
                          <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-black bg-yellow-500 text-black px-3 py-1 rounded-full uppercase">{match.categoria}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{match.fecha}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="text-center flex-1">
                              <img src={getEscudoUrl(match.escudo_local || match.escudo, match.equipolocal)} alt={match.equipolocal} className="w-12 h-12 object-contain mx-auto mb-2 drop-shadow-xl" />
                              <p className="font-black uppercase tracking-tighter text-[10px] line-clamp-1">{match.equipolocal}</p>
                            </div>
                            <div className="px-4 py-2 bg-black rounded-xl border border-white/5 font-black text-yellow-500 text-sm whitespace-nowrap">{match.resultado || 'VS'}</div>
                            <div className="text-center flex-1">
                              <img src={getEscudoUrl(match.escudo_visitante, match.equipovisitante)} alt={match.equipovisitante} className="w-12 h-12 object-contain mx-auto mb-2 drop-shadow-xl" />
                              <p className="font-black uppercase tracking-tighter text-[10px] line-clamp-1">{match.equipovisitante}</p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-slate-500">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                               <MapPin size={14} /> {match.Cancha}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest">{match.hora}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px]">
                      <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No hay partidos registrados para esta fecha.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'mapa' && (
                <motion.div 
                  key="mapa" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62666.549685140024!2d-74.85599378447988!3d10.989064078127402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42cdd367c2453%3A0x401e8f23384cd2a6!2sParque%20La%20Pradera!5e0!3m2!1ses-419!2sco!4v1777045527105!5m2!1ses-419!2sco"
                      className="w-full h-[500px] rounded-3xl"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Cancha Parque La Pradera</h3>
                        <p className="text-slate-400 font-medium">Sede oficial de entrenamientos y encuentros deportivos.</p>
                      </div>
                      <a href="https://www.google.com/maps/search/Parque+La+Pradera+Barranquilla+calle+114+con+carrera+31" target="_blank" className="bg-yellow-500 text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all flex items-center gap-3">
                        <MapPin size={18} /> Abrir en Google Maps
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'entrenamientos' && (
                <motion.div 
                  key="entrenamientos" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-500" size={48} /></div>
                  ) : trainings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trainings.map((ent, i) => (
                        <div key={i} className="group bg-white/5 border border-white/5 rounded-3xl p-8 hover:bg-white/10 transition-all border-l-4 border-l-green-500">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Dumbbell className="text-green-500" size={24} />
                            </div>
                            <div>
                              <p className="font-black text-white text-sm uppercase tracking-tighter">{ent.titulo || 'Entrenamiento'}</p>
                              <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-1">Sesión Técnica</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4 pt-4 border-t border-white/5 text-slate-400">
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                               <Calendar size={14} className="text-green-500" /> {ent.fecha}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                               <MapPin size={14} className="text-rose-500" /> {ent.lugar || 'Cancha Pradera'}
                            </div>
                            <div className="text-[10px] font-black text-white bg-white/5 px-3 py-2 rounded-xl inline-block">
                               ⌚ {ent.hora}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px]">
                      <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No hay entrenamientos programados.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
