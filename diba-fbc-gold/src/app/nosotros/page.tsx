'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Trophy, Shield, Users, Heart, Star, Compass, Zap, CheckCircle2 } from 'lucide-react';

export default function NosotrosPage() {
  const valores = [
    { title: 'Disciplina', icon: Shield },
    { title: 'Respeto', icon: Users },
    { title: 'Trabajo en equipo', icon: Heart },
    { title: 'Compromiso', icon: Star },
    { title: 'Excelencia', icon: Trophy },
    { title: 'Formación', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-10 flex items-center justify-center">
          <img src="/images/ESCUDO.png" alt="DIBA FBC" className="w-[600px] grayscale" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-black tracking-widest uppercase rounded-full mb-8">
              <Compass className="inline-block mr-2 w-4 h-4" /> Nuestra Identidad
            </span>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8">
              VISIÓN <span className="text-yellow-500">&</span> MISIÓN
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              SOMOS UN ORGANISMO ADSCRITO AL <span className="text-white font-bold italic">SISTEMA NACIONAL DEL DEPORTE</span>, COMPROMETIDOS CON TRANSFORMAR VIDAS.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Triada Section */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mision */}
            <motion.div whileHover={{ y: -10 }} className="bg-slate-50 p-12 rounded-[40px] border border-slate-200">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-8 text-yellow-500">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-4 tracking-tighter">Misión</h3>
              <div className="w-12 h-1 bg-yellow-500 mb-6 rounded-full" />
              <p className="text-slate-600 font-medium leading-relaxed">
                Velar por la formación integral de jóvenes deportistas, promoviendo valores de disciplina, trabajo en equipo y respeto.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div whileHover={{ y: -10 }} className="bg-slate-950 p-12 rounded-[40px] shadow-2xl shadow-slate-900/40">
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-8 text-black shadow-lg shadow-yellow-500/30">
                <Eye size={32} />
              </div>
              <h3 className="text-2xl font-black italic uppercase text-white mb-4 tracking-tighter">Visión</h3>
              <div className="w-12 h-1 bg-yellow-500 mb-6 rounded-full" />
              <p className="text-slate-400 font-medium leading-relaxed">
                Ser un club referente a nivel regional y nacional por nuestra excelencia deportiva y administrativa, formando ciudadanos ejemplares.
              </p>
            </motion.div>

            {/* Objetivo */}
            <motion.div whileHover={{ y: -10 }} className="bg-slate-50 p-12 rounded-[40px] border border-slate-200">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 text-blue-600">
                <Trophy size={32} />
              </div>
              <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-4 tracking-tighter">Objetivo</h3>
              <div className="w-12 h-1 bg-blue-600 mb-6 rounded-full" />
              <p className="text-slate-600 font-medium leading-relaxed">
                Consolidar procesos de preparación orientados a logros competitivos y formación humana de base en cada categoría.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ejes Estratégicos */}
      <section className="py-24 bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-yellow-500 font-black uppercase tracking-widest text-[10px] mb-4 block">Plan de Acción</span>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-10">Ejes <span className="text-yellow-500 underline decoration-white/10 underline-offset-[12px]">Estratégicos</span></h2>
            
            <div className="space-y-4">
              {[
                'Instrucción técnica y preparación física avanzada por categorías.',
                'Fomento del sentido de pertenencia y trabajo colaborativo.',
                'Vinculación activa de padres y familias en el proceso.',
                'Alineación metodológica con ligas locales y nacionales.',
                'Equilibrio entre rendimiento deportivo y excelencia académica.'
              ].map((eje, i) => (
                <div key={i} className="flex items-center gap-6 bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/10 transition-all group">
                   <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={20} />
                   </div>
                   <p className="text-slate-300 font-medium text-sm">{eje}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-[100px]" />
            <img src="/images/ESCUDO.png" alt="DIBA FBC" className="w-80 h-80 object-contain drop-shadow-[0_0_50px_rgba(234,179,8,0.3)]" />
          </div>
        </div>
      </section>

      {/* Valores Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">Nuestros <span className="text-blue-600">Valores</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4">ADN DIBA FBC • Los pilares que nos guían</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {valores.map((val) => (
              <div key={val.title} className="bg-slate-50 border border-slate-200 p-10 rounded-[40px] text-center hover:border-yellow-500 transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400 group-hover:bg-yellow-500 group-hover:text-black transition-all shadow-sm">
                  <val.icon size={28} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{val.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
