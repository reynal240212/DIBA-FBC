'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, LayoutDashboard, FileText, Bell, LogOut, 
  ChevronRight, Star, Shield, CreditCard, Calendar as CalendarIcon,
  Upload, Eye, CheckCircle, AlertCircle, Loader2, Menu, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setProfile(profileData);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-yellow-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-yellow-500/30">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 z-[70] 
        transition-transform duration-300 lg:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-white/5 flex flex-col items-center">
          <img src="/images/ESCUDO.png" alt="DIBA" className="w-16 h-16 mb-4 drop-shadow-2xl" />
          <h2 className="text-white font-black italic uppercase tracking-tighter text-xl">DIBA <span className="text-yellow-500">FBC</span></h2>
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Dashboard</span>
        </div>

        <nav className="p-6 space-y-2">
          {[
            { id: 'overview', label: 'Inicio', icon: LayoutDashboard },
            { id: 'profile', label: 'Mi Perfil', icon: User },
            { id: 'docs', label: 'Documentos', icon: FileText },
            { id: 'notifications', label: 'Alertas', icon: Bell },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest
                ${activeTab === item.id ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 lg:p-12 relative overflow-hidden">
        {/* Mobile Header Toggle */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-8 right-8 z-[80] w-14 h-14 bg-yellow-500 text-black rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all"
        >
          <Menu size={24} />
        </button>

        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
              Hola, <span className="text-yellow-500">{profile?.full_name?.split(' ')[0] || 'Jugador'}</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Panel de control administrativo</p>
          </motion.div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
            <div className="text-right">
              <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">
                {profile?.role === 'admin' ? 'Coordinador' : 'Deportista'}
              </p>
              <p className="text-[10px] text-slate-400 font-bold lowercase opacity-60">{user?.email}</p>
            </div>
            <img 
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=eab308&color=000`} 
              alt="Avatar" 
              className="w-12 h-12 rounded-2xl object-cover border-2 border-yellow-500/20" 
            />
          </div>
        </header>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Estado', val: 'Activo', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'Categoría', val: '2014 - 2015', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                  { label: 'Documentos', val: '0 / 5', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Identificación', val: '104245XXXX', icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] hover:border-white/10 transition-all group">
                    <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-6 ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
                    <h3 className="text-xl font-black text-white italic">{stat.val}</h3>
                  </div>
                ))}
              </div>

              {/* Main Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[40px] overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Estado de Documentación</h2>
                    <span className="text-[10px] font-black bg-yellow-500 text-black px-4 py-1.5 rounded-full uppercase">Progreso 20%</span>
                  </div>
                  <div className="p-8 space-y-6">
                    {[
                      { name: 'Tarjeta Identidad', status: 'Verificado', date: '24 Mar 2025' },
                      { name: 'Consentimiento Padres', status: 'Pendiente', date: '---' },
                      { name: 'Seguro Médico', status: 'No Cargado', date: '---' },
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-widest">{doc.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{doc.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${doc.status === 'Verificado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-500'}`}>
                            {doc.status}
                          </span>
                          <button className="text-slate-400 hover:text-white"><ChevronRight size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-500 rounded-[40px] p-10 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform">
                    <Star size={80} className="text-black" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black text-black italic uppercase tracking-tighter leading-tight mb-4">Membresía <br />DIBA Gold</h3>
                    <p className="text-black/60 text-sm font-bold uppercase tracking-widest leading-relaxed">Tu registro está vinculado oficialmente con la liga del Atlántico.</p>
                  </div>
                  <button className="mt-12 bg-black text-white w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">Ver Ficha Deportiva</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl bg-slate-900/40 border border-white/5 p-12 rounded-[40px]">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10">Configuración de Cuenta</h2>
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-6 mb-12">
                   <div className="relative">
                      <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}`} className="w-32 h-32 rounded-[40px] border-4 border-yellow-500 p-2 object-cover" />
                      <button className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-black p-3 rounded-2xl shadow-xl hover:bg-yellow-500 transition-all">
                        <Upload size={16} />
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Nombre Completo</label>
                    <input type="text" defaultValue={profile?.full_name} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-yellow-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Biografía Deportiva</label>
                    <textarea defaultValue={profile?.bio} rows={3} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-yellow-500 resize-none" />
                  </div>
                </div>

                <button className="w-full bg-yellow-500 text-black font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/10">
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'docs' && (
             <motion.div key="docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { name: 'Tarjeta Identidad', type: 'Requisito', icon: CreditCard },
                  { name: 'Seguro Médico', type: 'Obligatorio', icon: Shield },
                  { name: 'Consentimiento', type: 'Legal', icon: FileText },
                  { name: 'Registro Civil', type: 'Identidad', icon: User },
                  { name: 'Ficha Médica', type: 'Salud', icon: CheckCircle },
                ].map((doc, i) => (
                  <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] hover:bg-white/5 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-yellow-500 transition-colors">
                          <doc.icon size={24} />
                       </div>
                       <span className="text-[8px] font-black uppercase px-3 py-1 bg-white/5 text-slate-500 rounded-full">Pendiente</span>
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">{doc.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-8">{doc.type}</p>
                    <div className="flex gap-3">
                       <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-2">
                          <Upload size={14} /> Subir
                       </button>
                    </div>
                  </div>
                ))}
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
