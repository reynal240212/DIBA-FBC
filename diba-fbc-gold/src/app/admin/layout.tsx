'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, Calendar, FileText, 
  Settings, LogOut, Menu, X, Shield, Bell, Search,
  ChevronRight, Globe, Zap, Database, Award, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.role !== 'admin') {
        router.push('/perfil');
        return;
      }
      
      setUser({ ...session.user, ...profile });
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const menuGroups = [
    {
      title: 'Panel Central',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Operaciones',
      items: [
        { name: 'Planilla Diaria', href: '/admin/planilla', icon: FileText },
        { name: 'Partidos & Eventos', href: '/admin/partidos', icon: Calendar },
        { name: 'Asistencia APP', href: '/admin/asistencia', icon: Zap, badge: 'APP' },
        { name: 'Convocatorias', href: '/admin/convocatorias', icon: Users },
        { name: 'Gestión Usuarios', href: '/admin/jugadores', icon: Database },
        { name: 'Archivos & Docs', href: '/admin/documentos', icon: Shield },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { name: 'Notificaciones Push', href: '/admin/push', icon: Bell },
      ]
    }
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 bg-yellow-500/10 rounded-[40px] flex items-center justify-center border border-yellow-500/20 animate-pulse">
           <img src="/images/ESCUDO.png" className="w-16 h-16" alt="Logo" />
        </div>
        <p className="text-yellow-500 font-black uppercase tracking-[0.5em] text-[10px]">Cargando Sistema...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      {/* Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[180px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[180px] translate-y-1/2 -translate-x-1/4" />
      </div>

      {/* Sidebar - More refined */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 bg-slate-900/60 backdrop-blur-3xl border-r border-white/5 z-[100] 
        transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-12 border-b border-white/5 flex flex-col items-center gap-4">
           <div className="w-20 h-20 bg-yellow-500 rounded-[32px] p-4 shadow-2xl shadow-yellow-500/20 group cursor-pointer transition-transform hover:rotate-12">
              <img src="/images/ESCUDO.png" alt="DIBA" className="w-full h-full object-contain" />
           </div>
           <div className="text-center">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">DIBA <span className="text-yellow-500">ADMIN</span></h2>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 opacity-50">Master Control Hub</p>
           </div>
        </div>

        <nav className="p-10 space-y-12 h-[calc(100vh-360px)] overflow-y-auto custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4 border-l-2 border-yellow-500/20 pl-4">{group.title}</h3>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        w-full flex items-center justify-between px-6 py-4 rounded-[2rem] transition-all group relative overflow-hidden
                        ${isActive ? 'bg-yellow-500 text-black shadow-2xl shadow-yellow-500/20 translate-x-2' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                      `}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <item.icon size={18} className={isActive ? 'text-black' : 'text-slate-500 group-hover:text-yellow-500 transition-colors'} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md relative z-10 ${isActive ? 'bg-black/10' : 'bg-yellow-500 text-black'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-8 border-t border-white/5 bg-slate-900/40 backdrop-blur-3xl">
           <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/10 mb-6">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black italic">R</div>
              <div className="overflow-hidden">
                 <p className="text-[10px] font-black text-white uppercase truncate">{user?.full_name || 'REINALDO J.'}</p>
                 <p className="text-[8px] text-yellow-500 font-black uppercase tracking-widest">Administrador</p>
              </div>
           </div>
           <button 
             onClick={async () => { await supabase.signOut(); router.push('/login'); }}
             className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest group"
           >
             <LogOut size={16} /> Salir del Sistema
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-80 min-h-screen relative z-10 flex flex-col">
        {/* Navbar - The "Feo" part fix */}
        <header className="h-28 flex items-center justify-between px-8 lg:px-16 sticky top-0 bg-[#020617]/90 backdrop-blur-3xl z-50 border-b border-white/5">
           <div className="flex items-center gap-8">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all">
                 <Menu size={24} />
              </button>
              
              <div className="relative group hidden sm:block">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                 <input 
                    type="text" 
                    placeholder="BUSCAR EN EL SISTEMA..." 
                    className="bg-white/5 border border-white/10 rounded-full pl-14 pr-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white w-80 focus:w-96 focus:border-yellow-500/50 outline-none transition-all duration-500"
                 />
              </div>
           </div>

           <div className="flex items-center gap-6 lg:gap-10">
              <div className="hidden xl:flex items-center gap-6">
                 <div className="flex flex-col items-end">
                    <span className="text-[12px] font-black text-white italic tracking-tighter uppercase">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} a.m.</span>
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Horario Local</span>
                 </div>
                 <div className="w-px h-8 bg-white/10" />
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Sincronizado</span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Cloud Supabase</span>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="relative cursor-pointer group">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-yellow-500 group-hover:bg-yellow-500/10 transition-all border border-white/10">
                       <Bell size={20} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full text-[9px] font-black text-black flex items-center justify-center border-2 border-[#020617] shadow-lg">2</span>
                 </div>
                 <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-black font-black text-xl italic shadow-xl shadow-yellow-500/30 hover:scale-105 transition-all cursor-pointer">
                    {user?.full_name?.charAt(0) || 'R'}
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 lg:p-20 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
