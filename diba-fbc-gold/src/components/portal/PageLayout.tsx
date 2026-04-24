'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function GenericPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <main className="pt-40 pb-24 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <span className="text-yellow-500 font-black uppercase tracking-[0.4em] text-xs">DIBA FBC • Sección Oficial</span>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
            {title.split(' ').map((word, i) => i === 1 ? <span key={i} className="text-yellow-500">{word} </span> : word + ' ')}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
            {description}
          </p>
          
          <div className="h-[1px] w-full bg-white/10" />
          
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
             <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Contenido en Construcción • Próximamente</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
