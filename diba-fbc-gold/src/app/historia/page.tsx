'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Medal, Zap, Calendar } from 'lucide-react';

export default function HistoriaPage() {
  const timeline = [
    { year: '1999', title: 'Campeón Territorial', desc: 'Iniciamos nuestra senda ganadora con el primer título importante.', icon: Trophy, color: 'text-blue-500', img: 'https://scontent-bog2-1.xx.fbcdn.net/v/t39.30808-6/462653696_3807840056124001_6948574123012724707_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=833d8c&oh=00_AYF-gJTqxqSV8oEj1TnTPyd2W7CyJZKDFeUULbW9nn8dsA&oe=67E4003E' },
    { year: '2002', title: 'Gloria Departamental', desc: 'Consolidación del club en el departamento, obteniendo el título máximo.', icon: Star, color: 'text-yellow-500', img: '/images/2002.jpg' },
    { year: '2003', title: 'Subcampeonato Élite', desc: 'Un año de lucha constante que nos llevó hasta la gran final.', icon: Medal, color: 'text-slate-400', img: '/images/subCAP_2003.jpg' },
    { year: '2005', title: 'La Gran Remontada', desc: 'Corazón y garra en uno de los partidos más épicos de nuestra historia.', icon: Zap, color: 'text-rose-500', img: '/images/2005.jpg' },
    { year: '2014', title: 'Nueva Era', desc: 'Renovación de categorías y fortalecimiento del equipo técnico.', icon: Calendar, color: 'text-indigo-500', img: '/images/2014.jpeg' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
      {/* Header */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-yellow-500 font-black uppercase tracking-[0.4em] text-xs mb-6 inline-block">Trayectoria Oficial</span>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8">
              NUESTRA <span className="text-yellow-500">HISTORIA</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              DÉCADAS DE PASIÓN, ESFUERZO Y GLORIA DEPORTIVA DESDE EL CORAZÓN DE BARRANQUILLA.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 relative">
        <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-white/5 hidden md:block" />
        
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          {timeline.map((item, idx) => (
            <motion.div 
              key={item.year}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center justify-between gap-12`}
            >
              <div className={`md:w-[45%] ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center`}>
                <span className={`text-4xl font-black ${item.color} block mb-4`}>{item.year}</span>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">{item.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
              </div>

              <div className="w-12 h-12 bg-black border-2 border-white/10 rounded-full flex items-center justify-center relative z-20 hidden md:flex">
                <item.icon size={20} className={item.color} />
              </div>

              <div className="md:w-[45%] w-full">
                <div className="relative group rounded-[40px] overflow-hidden shadow-2xl border border-white/5">
                  <img src={item.img} alt={item.title} className="w-full h-80 object-cover transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
