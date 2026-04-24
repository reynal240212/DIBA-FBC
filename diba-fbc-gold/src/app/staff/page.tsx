'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, Trophy, Dumbbell, Code } from 'lucide-react';

export default function StaffPage() {
  const staff = [
    {
      name: 'Reinaldo Perez',
      role: 'Director Técnico y Deportivo',
      img: '/images/profesor.jpg',
      icon: Trophy,
      bio: 'Con más de 15 años de experiencia en la dirección técnica, ha liderado múltiples proyectos deportivos enfocándose en el desarrollo integral de jugadores.',
      email: 'reinaldo@dibafbc.com'
    },
    {
      name: 'Reinaldo Perez Navas',
      role: 'Asistente Técnico / Software Dev',
      img: '/images/reinaldoNavas.png',
      icon: Code,
      bio: 'Joven estratega que combina tecnología y deporte para optimizar entrenamientos y análisis de rendimiento digital del equipo.',
      email: 'reinaldonavas@dibafbc.com'
    },
    {
      name: 'Carlos Daniel Arias Montiel',
      role: 'Preparador Físico',
      img: '/images/carlos.png',
      icon: Dumbbell,
      bio: 'Especialista en acondicionamiento físico y prevención de lesiones, mejorando el rendimiento de los jugadores temporada tras temporada.',
      email: 'carlosarias@dibafbc.com'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
      {/* Header */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/fondo.jpg')] bg-cover bg-center opacity-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-yellow-500 font-black uppercase tracking-[0.4em] text-xs mb-6 inline-block">Liderazgo DIBA</span>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8">
              CUERPO <span className="text-yellow-500">TÉCNICO</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              PROFESIONALES COMPROMETIDOS CON LA EXCELENCIA DEPORTIVA Y LA FORMACIÓN HUMANA.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {staff.map((member, idx) => (
              <motion.div 
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white/5 border border-white/10 rounded-[40px] p-10 hover:bg-white/10 transition-all text-center flex flex-col items-center"
              >
                <div className="relative w-48 h-48 mb-8">
                  <div className="absolute inset-0 bg-yellow-500 rounded-[60px] rotate-3 opacity-20 group-hover:rotate-12 transition-transform" />
                  <img src={member.img} alt={member.name} className="relative z-10 w-full h-full object-cover rounded-[60px] shadow-2xl border-4 border-yellow-500/50" />
                </div>
                
                <div className="w-12 h-12 bg-yellow-500 text-black rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
                   <member.icon size={24} />
                </div>
                
                <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-2">{member.name}</h3>
                <p className="text-yellow-500 font-bold uppercase tracking-widest text-[10px] mb-6">{member.role}</p>
                
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 flex-1">
                  {member.bio}
                </p>
                
                <a href={`mailto:${member.email}`} className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-500 transition-all">
                  <Mail size={14} /> Contactar
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section Refined */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ShieldCheck size={48} className="text-yellow-500 mx-auto mb-8" />
          <h2 className="text-4xl font-black italic uppercase text-white mb-6">Misión del <span className="text-yellow-500">Staff</span></h2>
          <p className="text-slate-400 text-lg italic leading-relaxed">
            "No solo formamos jugadores de fútbol, formamos ciudadanos íntegros. Nuestra misión es guiar cada paso con disciplina, técnica y el corazón puesto en la comunidad."
          </p>
        </div>
      </section>
    </div>
  );
}
