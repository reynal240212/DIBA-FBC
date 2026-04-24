'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Send, Star, Zap, Trophy, ArrowRight } from 'lucide-react';

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
      {/* Hero Section */}
      <section className="relative pt-40 pb-28 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img src="/images/estadio.jpg" alt="DIBA FBC" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-yellow-500 font-black uppercase tracking-[0.4em] text-xs mb-6 inline-block">Actualidad DIBA</span>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8">
              NOTICIAS DEL <span className="text-yellow-500">CLUB</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              MANTENTE AL DÍA CON LOS ÚLTIMOS RESULTADOS, EVENTOS Y CONVOCATORIAS DE NUESTRAS CATEGORÍAS.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Destacado Section */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-950 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl flex flex-col lg:flex-row items-stretch"
          >
            <div className="p-12 lg:p-20 flex-1">
              <span className="inline-flex items-center gap-2 bg-rose-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-8 shadow-lg shadow-rose-600/20 animate-pulse">
                <Zap size={14} /> Destacado
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">
                ¡DIBA FBC ES <span className="text-yellow-500">FINALISTA!</span> 🏆
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Nuestra Categoría 2012/2013 rumbo a la gloria. El equipo selló su pase a LA GRAN FINAL del Torneo Suroccidente venciendo 3-2 a OCAM FC. ¡Orgullo total!
              </p>
              
              <div className="flex items-center gap-10 bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="text-center">
                  <p className="text-4xl font-black text-white">3</p>
                  <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest mt-2">DIBA FBC</p>
                </div>
                <div className="text-slate-600 font-black text-xl">VS</div>
                <div className="text-center">
                  <p className="text-4xl font-black text-slate-400">2</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">OCAM FC</p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-2/5 min-h-[400px] relative">
              <img src="/images/Jugador10Indumentaria.jpg" alt="Goleador" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-10 right-10 text-right">
                <p className="text-white font-black italic text-2xl uppercase tracking-tighter">Dylan Sánchez</p>
                <p className="text-yellow-500 font-bold text-xs uppercase tracking-widest">Goleador Estrella</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">Síguenos en <span className="text-blue-600">Instagram</span></h2>
            <div className="w-20 h-1.5 bg-yellow-500 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { img: '/images/DIBA_UNIFORMEHOMENAJE%20A%20BARRANQUILLA.jpg', label: 'Homenaje a Barranquilla' },
              { img: '/images/Jugador10Atrasindumentaria.jpg', label: 'Nueva Indumentaria 2025' },
              { img: '/images/Bandera.jpg', label: 'Identidad y Pasión' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square rounded-[40px] overflow-hidden shadow-2xl border border-white/10 group cursor-pointer"
              >
                <img src={item.img} alt={item.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Camera className="text-white w-10 h-10" />
                </div>
              </motion.div>
            ))}
          </div>

          <a href="https://www.instagram.com/dibafbc_/" target="_blank" className="inline-flex items-center gap-4 bg-slate-950 text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-yellow-500 hover:text-black transition-all shadow-2xl">
            <Camera size={24} />
            @dibafbc_
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Send size={48} className="text-yellow-500 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">Únete al <span className="text-yellow-500">Boletín</span></h2>
          <p className="text-slate-400 text-lg mb-12">Recibe alertas de partidos, convocatorias y noticias exclusivas directamente en tu bandeja.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input type="email" placeholder="Tu correo electrónico..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-yellow-500 transition-colors" />
            <button className="bg-yellow-500 text-black font-black uppercase tracking-widest px-10 py-4 rounded-2xl hover:bg-yellow-400 transition-all">Suscribirme</button>
          </div>
        </div>
      </section>
    </div>
  );
}
