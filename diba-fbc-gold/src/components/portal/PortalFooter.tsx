'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Camera, Globe } from 'lucide-react';

const PortalFooter = () => {
  return (
    <footer className="bg-black py-24 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Social Section - Matching Original style */}
        <div className="text-center mb-20">
          <h5 className="text-xl font-black mb-10 uppercase tracking-[0.3em] text-white/90">
            Únete a nuestra comunidad
          </h5>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="https://www.facebook.com/share/1BstQ1tQXQ/" target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white text-slate-100 hover:text-slate-900 text-sm font-black shadow-2xl border border-white/5 transition-all duration-500 hover:-translate-y-1">
              <Globe size={20} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
              <span className="uppercase tracking-widest">Facebook</span>
            </a>
            <a href="https://www.instagram.com/dibafbc?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white text-slate-100 hover:text-slate-900 text-sm font-black shadow-2xl border border-white/5 transition-all duration-500 hover:-translate-y-1">
              <Camera size={20} className="text-pink-400 group-hover:text-pink-600 transition-colors" />
              <span className="uppercase tracking-widest">Instagram</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-20 border-t border-white/5 pt-12">
          {/* Column 1: Brand */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <img src="/images/ESCUDO.png" alt="Logo" className="w-12 h-12" />
              <h4 className="text-xl font-black uppercase italic text-white tracking-tighter">DIBA <span className="text-yellow-500">FBC</span></h4>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto lg:mx-0">
              Formando campeones con valores y excelencia deportiva en Barranquilla.
            </p>
          </div>
          
          {/* Column 2: Sobre el Club (Original Links) */}
          <div className="space-y-6 text-center lg:text-left">
            <h5 className="text-yellow-500 font-black uppercase tracking-widest text-[10px]">Sobre el Club</h5>
            <ul className="space-y-3 text-slate-400 text-xs font-bold uppercase">
              <li><Link href="/" className="hover:text-white transition-colors">Aviso Legal</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Política de Cookies</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Accesibilidad</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Contáctenos</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Ayuda / FAQs</Link></li>
            </ul>
          </div>

          {/* Column 3: Club (Original Links) */}
          <div className="space-y-6 text-center lg:text-left">
            <h5 className="text-yellow-500 font-black uppercase tracking-widest text-[10px]">Club</h5>
            <ul className="space-y-3 text-slate-400 text-xs font-bold uppercase">
              <li><Link href="/historia" className="hover:text-white transition-colors">Historia</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Escudo</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Himno Oficial</Link></li>
              <li><Link href="/staff" className="hover:text-white transition-colors">Equipo Técnico</Link></li>
            </ul>
          </div>

          {/* Column 4: Sede */}
          <div className="space-y-6 text-center lg:text-left">
            <h5 className="text-yellow-500 font-black uppercase tracking-widest text-[10px]">Sede</h5>
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 text-slate-400">
              <MapPin className="text-yellow-500 shrink-0" size={18} />
              <p className="text-xs font-medium">Cancha de la Pradera, Barranquilla, Atlántico</p>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 h-24 w-full max-w-xs mx-auto lg:mx-0">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62666.549685140024!2d-74.85599378447988!3d10.989064078127402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42cdd367c2453%3A0x401e8f23384cd2a6!2sParque%20La%20Pradera!5e0!3m2!1ses-419!2sco!4v1777045527105!5m2!1ses-419!2sco"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">© 2026 DIBA FBC • Todos los derechos reservados</p>
          <span className="text-white font-black italic uppercase tracking-tighter text-xl">DIBA <span className="text-yellow-500">GOLD</span></span>
        </div>
      </div>
    </footer>
  );
};

export default PortalFooter;
