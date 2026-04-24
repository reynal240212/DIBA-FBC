'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Trophy, Users, Dumbbell, Shield, Heart, ArrowRight, Star, Calendar, Info, MapPin } from 'lucide-react';
import PortalNavbar from '@/components/portal/PortalNavbar';

export default function PortalHome() {
  return (
    <div className="min-h-screen bg-black font-sans selection:bg-yellow-500/30">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/estadio.jpg" 
            alt="DIBA FBC" 
            className="w-full h-full object-cover opacity-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 text-yellow-500 px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.4em] mb-10">
              Orgullo Barranquillero • Desde 2012
            </span>
            <h1 className="text-7xl md:text-9xl font-black text-white italic uppercase tracking-tighter leading-none mb-10">
              MÁS QUE UN <span className="text-yellow-500 underline decoration-white/20 underline-offset-[16px]">CLUB</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-300 font-medium max-w-3xl mx-auto mb-14 leading-relaxed">
              Descubre la historia, el talento y la pasión que define a la familia <span className="text-white font-black italic">DIBA FBC</span> en cada rincón de la cancha.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/historia" className="px-12 py-6 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-yellow-400 transition-all shadow-[0_20px_50px_rgba(234,179,8,0.3)]">
                Nuestra Historia
              </Link>
              <Link href="/partidos" className="px-12 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-all">
                Ver Partidos
              </Link>
              <Link href="/perfil" className="px-12 py-6 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all">
                Únete al Equipo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid de Accesos Rápidos */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Historia', icon: Info, desc: 'Nuestra trayectoria desde 2012.', link: '/historia' },
              { title: 'Noticias', icon: Star, desc: 'Actualidad y novedades del club.', link: '/noticias' },
              { title: 'Partidos', icon: Calendar, desc: 'Próximos encuentros y resultados.', link: '/partidos' },
              { title: 'Staff', icon: Users, desc: 'Conoce a nuestro cuerpo técnico.', link: '/staff' },
            ].map((card, idx) => (
              <Link key={idx} href={card.link} className="bg-white/5 border border-white/5 p-10 rounded-[40px] hover:bg-yellow-500 group transition-all cursor-pointer">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black transition-colors">
                  <card.icon className="text-white group-hover:text-yellow-500" size={28} />
                </div>
                <h3 className="text-2xl font-black italic uppercase text-white mb-2 group-hover:text-black transition-colors">{card.title}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-black/60 transition-colors">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-xs mb-4 inline-block">Nuestros Equipos</span>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Categorías de <span className="text-yellow-500">Formación</span></h2>
            </div>
            <Link href="/categorias" className="text-sm font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">Ver requisitos de inscripción →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { cat: 'Semilleros', age: '5-8 Años', img: '/images/Jugador10Indumentaria.jpg' },
              { cat: 'Infantil', age: '9-12 Años', img: '/images/profesor.jpg' },
              { cat: 'Pre-Juvenil', age: '13-15 Años', img: '/images/Jugador10Atrasindumentaria.jpg' },
              { cat: 'Élite', age: '16+ Años', img: '/images/DIBA_UNIFORMEHOMENAJE A BARRANQUILLA.jpg' },
            ].map((item, idx) => (
              <Link key={idx} href="/categorias" className="relative group aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl">
                <img src={item.img} alt={item.cat} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="bg-yellow-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3 inline-block">{item.age}</span>
                  <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">{item.cat}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Section */}
      <section className="py-24 bg-slate-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Cuerpo <span className="text-yellow-500">Técnico</span></h2>
            <div className="w-20 h-1.5 bg-yellow-500 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-4xl mx-auto">
            {[
              { name: 'Reinaldo Perez', role: 'Director Técnico y Deportivo', img: '/images/profesor.jpg' },
              { name: 'Reinaldo Perez Navas', role: 'Asistente / Desarrollador', img: '/images/reinaldoNavas.png' },
            ].map((member, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative w-56 h-56 mx-auto mb-10">
                  <div className="absolute inset-0 bg-yellow-500 rounded-[60px] rotate-6 opacity-20 group-hover:rotate-12 transition-transform" />
                  <img src={member.img} alt={member.name} className="relative z-10 w-full h-full object-cover rounded-[60px] shadow-2xl transition-all duration-700" />
                </div>
                <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">{member.name}</h3>
                <p className="text-yellow-500 font-bold uppercase tracking-widest text-[11px] mt-4">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
