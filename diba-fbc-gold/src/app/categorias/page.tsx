'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, Shield, ArrowRight, Star, Heart, GraduationCap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '@/components/portal/PageLayout';

export default function CategoriasPage() {
  const categoriesList = [
    {
      name: "Semilleros",
      age: "5 - 8 Años",
      format: "Fútbol Base y Recreativo",
      desc: "Introducción lúdica al fútbol. Enfocado en la estimulación motriz básica, coordinación general, compañerismo y diversión sin presión competitiva.",
      features: ["Técnica individual básica", "Coordinación psicomotriz", "Juegos de integración social", "Respeto y disciplina recreativa"],
      color: "from-blue-500/20 to-cyan-500/10",
      accent: "text-blue-400",
      border: "hover:border-blue-500/30"
    },
    {
      name: "Infantil",
      age: "9 - 12 Años",
      format: "Desarrollo y Fundamentación",
      desc: "Enseñanza técnica estructurada. Se introducen conceptos tácticos primarios (posicionamiento, pases y control) y preparación física adaptada.",
      features: ["Fundamentos tácticos colectivos", "Control y distribución de balón", "Competencia formativa regional", "Espíritu de liderazgo deportivo"],
      color: "from-emerald-500/20 to-teal-500/10",
      accent: "text-emerald-400",
      border: "hover:border-emerald-500/30"
    },
    {
      name: "Pre-Juvenil",
      age: "13 - 15 Años",
      format: "Perfeccionamiento y Táctica",
      desc: "Especialización y alto rendimiento. Entrenamiento físico riguroso, análisis de esquemas tácticos avanzados y posicionamiento en el terreno de juego.",
      features: ["Táctica avanzada y estrategia de juego", "Resistencia y potencia cardiovascular", "Torneos inter-clubes de nivel departamental", "Mentalidad ganadora y resiliencia"],
      color: "from-purple-500/20 to-pink-500/10",
      accent: "text-purple-400",
      border: "hover:border-purple-500/30"
    },
    {
      name: "Élite",
      age: "16+ Años",
      format: "Alto Rendimiento y Proyección",
      desc: "Proyección profesional y competitividad máxima. Ligas de élite regional, preparación de alto nivel físico-táctico y vitrina para visorías universitarias o profesionales.",
      features: ["Competencia de máximo nivel", "Visorías y proyección profesional", "Preparación integral física e inteligente", "Estilo de vida de deportista élite"],
      color: "from-yellow-500/20 to-orange-500/10",
      accent: "text-yellow-400",
      border: "hover:border-yellow-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
      {/* Header Banner */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-slate-950">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-block bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 text-yellow-500 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em]">
              Metodología DIBA FBC
            </span>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-white">
              NUESTRAS <span className="text-yellow-500">CATEGORÍAS</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
              Formamos el futuro del fútbol en Barranquilla desde los 5 años, ofreciendo planes adaptados al desarrollo deportivo, motriz y social de cada jugador.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Detail Cards Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {categoriesList.map((c, i) => (
            <motion.div 
              key={c.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              className={`bg-slate-900/40 border border-white/5 p-10 md:p-14 rounded-[48px] relative overflow-hidden transition-all duration-500 ${c.border} group`}
            >
              {/* Card gradient mesh */}
              <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${c.accent} bg-white/5 border border-white/10 px-4 py-2 rounded-full`}>
                    {c.age}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {c.format}
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                    Categoría <span className="text-yellow-500">{c.name}</span>
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    {c.desc}
                  </p>
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">¿Qué incluye su plan?</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {c.features.map((f, idx) => (
                      <li key={idx} className="flex gap-3 items-start text-xs text-slate-300 font-medium">
                        <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${c.accent}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enrollment Call to Action */}
      <section className="py-24 bg-slate-950/60 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <GraduationCap size={48} className="mx-auto text-yellow-500" />
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            ¿LISTO PARA FORMAR PARTE DE <span className="text-yellow-500">DIBA FBC?</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Inscribe a tu hijo hoy mismo. Realizamos pruebas y entrenamientos de cortesía para diagnosticar su categoría idónea de formación. ¡Escríbenos y reserva su sesión!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a 
              href="https://wa.me/573246656083" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-12 py-6 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_20px_40px_rgba(234,179,8,0.2)]"
            >
              Inscribirse por WhatsApp
            </a>
            <Link 
              href="/perfil"
              className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:scale-105 transition-all"
            >
              Ver Requisitos de Admisión
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
