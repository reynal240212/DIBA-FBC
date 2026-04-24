'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PortalNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Check Auth
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      
      return () => subscription.unsubscribe();
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Historia', href: '/historia' },
    { name: 'Noticias', href: '/noticias' },
    { name: 'Partidos', href: '/partidos' },
    { name: 'Categorías', href: '/categorias' },
    { name: 'Nosotros', href: '/nosotros' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12">
            <img src="/images/ESCUDO.png" alt="DIBA FBC" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">DIBA <span className="text-yellow-500">FBC</span></h1>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400">Club Deportivo Profesional</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-yellow-500 transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-yellow-500 transition-all group-hover:w-full" />
            </Link>
          ))}
          
          <div className="flex items-center gap-4 ml-4">
            <Link 
              href={user ? "/perfil" : "/login"} 
              className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-xl flex items-center gap-2"
            >
              {user ? <ShieldCheck size={14} /> : <User size={14} />}
              {user ? "Panel Admin" : "Mi Perfil"}
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[150] flex flex-col p-12 md:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-12">
               <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-4">
                  <img src="/images/ESCUDO.png" alt="DIBA" className="w-12 h-12" />
                  <h1 className="text-xl font-black italic text-white">DIBA <span className="text-yellow-500">FBC</span></h1>
               </Link>
               <button onClick={() => setIsOpen(false)} className="text-white"><X size={32} /></button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="text-4xl font-black uppercase tracking-tighter text-white hover:text-yellow-500 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-12 flex flex-col gap-4">
              <Link 
                href={user ? "/perfil" : "/login"} 
                onClick={() => setIsOpen(false)} 
                className="bg-yellow-500 text-black p-6 rounded-[2.5rem] font-black uppercase tracking-widest text-center text-lg flex items-center justify-center gap-4"
              >
                {user ? <ShieldCheck size={24} /> : <User size={24} />}
                {user ? "Panel Admin" : "Mi Perfil"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default PortalNavbar;
