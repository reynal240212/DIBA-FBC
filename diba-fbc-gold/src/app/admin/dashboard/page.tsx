'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, Shield, Activity, 
  ArrowUpRight, ArrowDownRight, TrendingUp, Clock,
  Zap, Globe, MousePointer2, CreditCard, FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Jugadores Registrados', val: '146', change: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Partidos Jugados', val: '38', change: 'En curso', icon: Globe, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Asistencia Total', val: '92%', change: '+5.4%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Docs Pendientes', val: '2', change: '-4', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const shortcuts = [
    { name: 'Planilla', icon: FileText, color: 'text-yellow-500' },
    { name: 'Partidos', icon: Calendar, color: 'text-blue-500' },
    { name: 'Usuarios', icon: Users, color: 'text-purple-500' },
    { name: 'Archivos', icon: Shield, color: 'text-emerald-500' },
    { name: 'Rifas', icon: CreditCard, color: 'text-orange-500' },
    { name: 'Push', icon: Zap, color: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-16 max-w-[1600px] mx-auto">
      {/* Hero Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <span className="w-12 h-1.5 bg-yellow-500 rounded-full" />
           <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px]">Panel de Control Maestro</p>
        </div>
        <h1 className="text-6xl lg:text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.85] flex flex-col">
           <span>Resumen</span>
           <span className="text-yellow-500">General</span>
        </h1>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
            className="group relative bg-slate-900/40 border border-white/5 p-10 rounded-[48px] overflow-hidden hover:border-yellow-500/30 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={28} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-4 py-1.5 rounded-full ${stat.change.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-400'}`}>
                  {stat.change}
                </div>
              </div>
              <h3 className="text-5xl font-black text-white italic mb-2 tracking-tighter leading-none">{stat.val}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Access Area */}
      <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[56px] relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Zap size={200} className="text-yellow-500" />
         </div>
         
         <div className="flex items-center justify-between mb-16 relative z-10">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                  <Zap size={24} />
               </div>
               <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Accesos <span className="text-yellow-500">Rápidos</span></h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gestión inmediata del ecosistema</p>
               </div>
            </div>
            <button className="bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl border border-white/10 transition-all">
               Master Control
            </button>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
            {shortcuts.map((sc, i) => (
               <button 
                  key={i}
                  className="bg-[#020617]/60 border border-white/5 p-10 rounded-[40px] flex flex-col items-center gap-6 hover:bg-white hover:text-black hover:-translate-y-2 transition-all duration-500 group/btn"
               >
                  <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${sc.color} group-hover/btn:bg-black/5 transition-colors`}>
                     <sc.icon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{sc.name}</span>
               </button>
            ))}
         </div>
      </div>

      {/* Bottom Grid: Trends & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-12 rounded-[56px]">
            <div className="flex items-center justify-between mb-12">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Flujo de <span className="text-yellow-500">Usuarios</span></h3>
               <div className="flex gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vista Semanal</span>
               </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-6 px-4">
               {[60, 45, 90, 75, 85, 65, 80].map((h, i) => (
                  <div key={i} className="flex-1 group relative">
                     <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: `${h}%` }} 
                        transition={{ delay: i * 0.1, duration: 1 }}
                        className="w-full bg-gradient-to-t from-yellow-500/5 to-yellow-500 rounded-t-2xl relative"
                     >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                     </motion.div>
                     <p className="mt-4 text-center text-[10px] font-black text-slate-600">DÍA {i + 1}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-yellow-500 p-12 rounded-[56px] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
               <TrendingUp size={240} className="text-black" />
            </div>
            <div className="relative z-10">
               <div className="w-16 h-16 bg-black/10 rounded-3xl flex items-center justify-center text-black mb-10 border border-black/10">
                  <TrendingUp size={32} />
               </div>
               <h3 className="text-4xl font-black text-black italic uppercase tracking-tighter leading-[0.9] mb-4">Eficiencia <br />Operativa</h3>
               <p className="text-black/60 text-xs font-bold uppercase tracking-widest leading-relaxed">Tu gestión ha mejorado un 15% respecto al mes anterior.</p>
            </div>
            <button className="relative z-10 w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all mt-12">
               Generar Reporte
            </button>
         </div>
      </div>
    </div>
  );
}


