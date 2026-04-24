'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, UserPlus, Filter, 
  MoreVertical, Edit2, Trash2, Eye,
  CheckCircle2, AlertCircle, Loader2, Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function JugadoresPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const categories = ['Todas', '2014-15', '2016-17', '2018-19', 'Elite', 'Escuela'];

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    // En un escenario real, consultaríamos la tabla de jugadores/identificacion
    const { data } = await supabase.from('identificacion').select('*').order('nombre', { ascending: true });
    setPlayers(data || []);
    setLoading(false);
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.nombre?.toLowerCase().includes(search.toLowerCase()) || p.numero?.includes(search);
    const matchesCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
            Base de <span className="text-yellow-500">Jugadores</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Gestiona el registro oficial y documentos</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o DNI..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-xs text-white outline-none focus:border-yellow-500 transition-all w-full md:w-80"
            />
          </div>
          
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-yellow-500/10">
            <UserPlus size={18} />
            Nuevo Jugador
          </button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 sm:pb-0">
          <div className="flex items-center gap-2 text-slate-500 mr-2">
            <Filter size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Categoría:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${selectedCategory === cat ? 'bg-white/10 text-yellow-500 border border-yellow-500/30' : 'text-slate-500 hover:text-white'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        <button className="text-slate-500 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
          <Download size={16} />
          Exportar Excel
        </button>
      </div>

      {/* Players Table */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Deportista</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identificación</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoría</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Docs</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <Loader2 className="animate-spin text-yellow-500" size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando base de datos...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPlayers.length > 0 ? (
                filteredPlayers.map((player, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 font-black text-xs">
                          {player.nombre?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tighter">{player.nombre}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{player.posicion || 'Jugador'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono text-xs text-slate-400">{player.numero}</td>
                    <td className="px-8 py-6">
                       <span className="text-[9px] font-black uppercase bg-white/5 px-3 py-1 rounded-full text-slate-300">
                         {player.categoria || 'Sin Cat.'}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((d) => (
                             <div key={d} className={`w-1.5 h-1.5 rounded-full ${d <= 3 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                          ))}
                          <span className="ml-2 text-[9px] font-black text-emerald-500">3/5</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"><Eye size={16} /></button>
                         <button className="p-2 bg-white/5 hover:bg-white/10 text-yellow-500 rounded-lg transition-all"><Edit2 size={16} /></button>
                         <button className="p-2 bg-white/5 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                    No se encontraron jugadores con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
