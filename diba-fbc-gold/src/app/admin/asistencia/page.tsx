'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, UserCheck, UserPlus, ClipboardList, Settings, Loader2, AlertCircle, CameraOff, Scan, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Player } from '@/lib/supabase';
import FaceRecognition from '@/components/camera/FaceRecognition';
import { groupPlayersByCategory } from '@/lib/categorization';

const MODEL_URL = '/models';

export default function Home() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'attendance' | 'registration'>('attendance');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Iniciando...');
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [logs, setLogs] = useState<{ time: string; player: string; status: string }[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      audioEnabled: true,
      sensitivity: 0.55,
      mirrorCamera: true,
      autoAttendance: true,
      facingMode: 'user', 
      quality: 'high'
    };
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('diba-face-settings-gold');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('diba-face-settings-gold', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus('Cargando modelos de IA...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        setStatus('Sistema Listo');
      } catch (err: any) {
        console.error('CRITICAL ERROR loading models:', err);
        setStatus(`Error: ${err.message || 'No se pudieron cargar los modelos'}`);
      }
    };
    loadModels();
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('identificacion')
      .select('numero, nombre, apellidos, categoria, face_token, foto_url, fecha_nacimiento');
    if (data) setPlayers(data as Player[]);
    setLoading(false);
  };

  const handleAttendance = async (player: Player) => {
    if (activePlayer?.numero === player.numero) return;
    setActivePlayer(player);
    
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('asistencias')
      .insert([{
        identificacion_numero: player.numero,
        fecha: today,
        asistio: true,
        fuente: 'reconocimiento_facial'
      }]);

    if (!error) {
      if (settings.audioEnabled) {
        new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play().catch(() => {});
      }
      setLogs(prev => [{
        time: new Date().toLocaleTimeString(),
        player: `${player.nombre} ${player.apellidos}`,
        status: 'ASISTENCIA MARCADA'
      }, ...prev].slice(0, 10));
      
      setTimeout(() => setActivePlayer(null), 3000);
    }
  };

  const handleRegisterFace = async (player: Player, descriptor: Float32Array) => {
    const token = JSON.stringify(Array.from(descriptor));
    const { error } = await supabase
      .from('identificacion')
      .update({ face_token: token })
      .eq('numero', player.numero);

    if (!error) {
      alert(`Rostro registrado para ${player.nombre}`);
      fetchPlayers();
    }
  };

  const handleCameraError = (err: any) => {
    setIsStreaming(false);
    setCameraError(err.name === 'NotFoundError' ? 'No se detectó ninguna cámara.' : `Error de cámara: ${err.message}`);
    setStatus('Error de hardware');
  };

  const filteredPlayers = players.filter(p => 
    (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.numero.includes(searchTerm)
  );

  const categorizedPlayers = groupPlayersByCategory(filteredPlayers);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-600/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <nav className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Camera className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                DIBA <span className="text-yellow-500">GOLD</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">AI Performance Hub v3.0</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-1 bg-slate-950/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
              <button 
                onClick={() => { setCaptureMode('attendance'); setCameraError(null); }}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${captureMode === 'attendance' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:bg-white/5'}`}
              >
                <Scan className="w-4 h-4" /> Asistencia
              </button>
              <button 
                onClick={() => { setCaptureMode('registration'); setCameraError(null); }}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${captureMode === 'registration' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
              >
                <UserPlus className="w-4 h-4" /> Registro
              </button>
            </div>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group relative overflow-hidden"
            >
              <Settings className="w-5 h-5 text-slate-300 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Left Column: Camera Feed & Player List */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Main Viewport */}
          <div className="relative aspect-video bg-black rounded-[40px] border border-white/10 overflow-hidden shadow-2xl group ring-1 ring-white/5 transition-all">
            {cameraError ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-12 bg-slate-900/50">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                  <CameraOff className="w-12 h-12 text-red-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Hardware no detectado</h3>
                  <p className="text-slate-400 max-w-sm">{cameraError}</p>
                </div>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-2xl hover:bg-yellow-400 transition-all flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" /> Reintentar
                </button>
              </div>
            ) : !isStreaming ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-900 overflow-hidden">
                <div className="relative z-10 flex flex-col items-center text-center gap-8">
                  <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 flex items-center justify-center shadow-2xl">
                    <Camera className="w-12 h-12 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">DIBA <span className="text-yellow-500">GOLD</span> AI</h3>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest max-w-xs">Hardware listo para escaneo facial.</p>
                  </div>
                  <button 
                    onClick={() => setIsStreaming(true)}
                    className="px-10 py-5 bg-yellow-500 text-black font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_20px_40px_rgba(234,179,8,0.3)] flex items-center gap-4 group"
                  >
                    <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                    Iniciar Cámara
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <FaceRecognition 
                  mode={captureMode}
                  players={players}
                  onMatch={handleAttendance}
                  onRegister={handleRegisterFace}
                  activePlayer={activePlayer}
                  selectedPlayer={selectedPlayer}
                  onCameraError={handleCameraError}
                  settings={settings}
                />
                <button 
                  onClick={() => setIsStreaming(false)}
                  className="absolute top-6 right-6 z-30 p-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl hover:bg-red-500 text-white transition-all"
                >
                  <CameraOff className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Player Search Section */}
          <div className="bg-slate-900/30 border border-white/5 backdrop-blur-md rounded-[32px] p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-yellow-500" /> 
                  {captureMode === 'registration' ? 'Gestión de Jugadores' : 'Búsqueda Manual'}
                </h3>
              </div>
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Nombre o ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-yellow-500/50 transition-all outline-none"
                />
                <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              </div>
            </div>

            <div className="h-[450px] overflow-y-auto pr-3 custom-scrollbar flex flex-col gap-10">
              {Object.entries(categorizedPlayers).sort((a, b) => a[0].localeCompare(b[0])).map(([category, catPlayers]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-4 px-2">
                    <div className="h-0.5 flex-1 bg-white/5" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20">
                      Categoría {category}
                    </h4>
                    <div className="h-0.5 flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {catPlayers.map((player) => (
                      <div 
                        key={player.numero}
                        className={`group p-6 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden flex items-center ${
                          selectedPlayer?.numero === player.numero 
                            ? 'bg-yellow-600 border-yellow-400 shadow-2xl shadow-yellow-500/40' 
                            : 'bg-slate-900 border-white/10 hover:border-yellow-500/50 hover:bg-slate-800'
                        }`}
                        onClick={() => captureMode === 'attendance' ? handleAttendance(player) : setSelectedPlayer(player)}
                      >
                        <div className="flex items-center gap-6 relative z-10 w-full">
                          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-black">
                            {player.foto_url ? <img src={player.foto_url} className="w-full h-full object-cover rounded-2xl" /> : player.nombre.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-lg leading-tight text-white truncate">{player.nombre} {player.apellidos}</h4>
                            <p className="text-xs text-slate-500">ID: {player.numero}</p>
                          </div>
                          {player.face_token && (
                            <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center">
                              <UserCheck className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity & Stats */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-slate-900/30 border border-white/5 backdrop-blur-md rounded-[40px] overflow-hidden flex flex-col h-[520px] shadow-2xl">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-yellow-500" /> Registro en Vivo
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {logs.map((log, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                    <UserCheck className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{log.player}</p>
                    <p className="text-[10px] text-slate-500">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-orange-700 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
             <h4 className="font-black text-[10px] uppercase tracking-widest mb-2 opacity-70 text-black">Total Jugadores</h4>
             <p className="text-5xl font-black tracking-tighter text-black">{players.length}</p>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowSettings(false)} />
            <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 p-8">
              <h3 className="text-xl font-black uppercase mb-6">Configuración</h3>
              <div className="grid grid-cols-1 gap-4">
                <button 
                   onClick={() => setSettings({...settings, mirrorCamera: !settings.mirrorCamera})}
                   className={`p-4 rounded-3xl border transition-all flex items-center justify-between ${settings.mirrorCamera ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/[0.02] border-white/5'}`}
                >
                  <span className="text-xs font-black uppercase">Modo Espejo</span>
                  <div className={`w-10 h-5 rounded-full relative ${settings.mirrorCamera ? 'bg-yellow-500' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.mirrorCamera ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
              </div>
              <button onClick={() => setShowSettings(false)} className="mt-8 w-full py-4 bg-yellow-500 text-black font-black uppercase rounded-2xl">Cerrar</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
