'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Hammer, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PlanillaDiariaPage() {
  return (
    <div className="space-y-16 max-w-[1200px] mx-auto min-h-[60vh] flex flex-col justify-center">
      {/* Header Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <span className="w-12 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
           <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px]">Módulo en Desarrollo</p>
        </div>
        <h1 className="text-6xl lg:text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.85] flex flex-col">
           <span>Planilla</span>
           <span className="text-yellow-500">Diaria</span>
        </h1>
      </div>

      {/* Main Premium Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-slate-900/40 border border-white/5 p-12 lg:p-20 rounded-[56px] overflow-hidden group shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-500/5" />
        
        {/* Decorative giant icon */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
           <FileText size={320} className="text-yellow-500" />
        </div>

        <div className="relative z-10 space-y-10 max-w-2xl">
          <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-[28px] flex items-center justify-center text-yellow-500 shadow-2xl">
            <FileText size={36} className="animate-pulse" />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white">
              SISTEMA DE ASISTENCIA Y <span className="text-yellow-500">PAGOS PRO</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Estamos integrando el generador de reportes administrativos y control diario de pagos a nivel de base de datos. Este módulo te permitirá exportar planillas de asistencia en formato PDF optimizados para impresión a doble cara con esquema táctico incorporado.
            </p>
          </div>

          {/* Features highlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {[
              { title: "Control de Mensualidad", desc: "Registro inteligente de estados de pago por jugador." },
              { title: "Generador PDF Doble Cara", desc: "Listas de cotejo oficiales listas para imprimir." },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white mb-1">{f.title}</h4>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-6">
            <Link 
              href="/admin/dashboard" 
              className="px-10 py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-400 hover:scale-105 transition-all shadow-xl shadow-yellow-500/10 flex items-center gap-3"
            >
              Volver al Inicio <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
