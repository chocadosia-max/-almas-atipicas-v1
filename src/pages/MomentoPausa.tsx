import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ArrowLeft, Volume2, Music, 
  Wind, Sparkles, MessageSquare, Trash2, 
  Play, Pause, RefreshCw, X, Send,
  Sun, SkipForward, Settings, Upload, Save, HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── DADOS PADRÃO ─────────────────────────────────────────────────────────────
const AFFIRMATIONS = [
  "Você é incrivelmente forte.",
  "Mães atípicas movem o mundo de maneiras silenciosas.",
  "Tudo bem se sentir cansada. Você tem feito o seu melhor.",
  "Você não está sozinha nesta jornada.",
  "Seu amor é a âncora constante e mais valiosa.",
  "Respire. Um momento ruim não define a sua maternidade.",
  "Sua dedicação é o maior presente que seu filho recebeu.",
  "Você merece cuidado tanto quanto seu pequeno.",
];

const SUPPORT_MESSAGES = [
  "Nós te ouvimos. Seu peso agora é mais leve.",
  "Você é a melhor mãe que seu filho poderia ter.",
  "Não se culpe por estar exausta. Respire.",
  "Sua força é admirável, mas você também pode descansar.",
  "Estamos juntas com você nesta caminhada.",
  "Libere a culpa. Você está fazendo o impossível todos os dias.",
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const MomentoPausa = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [mode, setMode] = useState<'intro' | 'respiro' | 'afirma' | 'desabafo'>('intro');
  const [breathingText, setBreathingText] = useState('Inspira...');
  const [affIndex, setAffIndex] = useState(0);
  
  // Audio Player State
  const [audios, setAudios] = useState<any[]>(() => {
    const saved = localStorage.getItem('almas_zen_audio');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Admin Upload State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [newAudioTitle, setNewAudioTitle] = useState('');
  const [newAudioBase64, setNewAudioBase64] = useState('');

  // Desabafo State
  const [ventText, setVentText] = useState('');
  const [isExploding, setIsExploding] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [randomSupport, setRandomSupport] = useState("");

  // Sincronizar State de Áudio com o Elemento Real
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnd = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnd);
    };
  }, []);

  // Mudar de música carrega novo src e tenta manter play se já estava tocando
  useEffect(() => {
    if (audios.length > 0 && audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(e => console.warn("Auto-play bloqueado pelo browser"));
      }
    }
  }, [currentAudioIndex]);

  // Efeito Respiração
  useEffect(() => {
    if (mode !== 'respiro') return;
    const t = setInterval(() => {
      setBreathingText(prev => prev === 'Inspira...' ? 'Expira...' : 'Inspira...');
    }, 4000);
    return () => clearInterval(t);
  }, [mode]);

  // Efeito Afirmações
  useEffect(() => {
    if (mode !== 'afirma') return;
    const t = setInterval(() => {
      setAffIndex((i) => (i + 1) % AFFIRMATIONS.length);
    }, 5000);
    return () => clearInterval(t);
  }, [mode]);

  // Audio Control
  const togglePlay = () => {
    if (!audioRef.current || audios.length === 0) {
      toast.info("Nenhuma música cadastrada.");
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error("Erro ao dar play", e);
        toast.error("Erro ao reproduzir o áudio.");
      });
    }
  };

  const nextTrack = () => {
    if (audios.length <= 1) return;
    setCurrentAudioIndex((prev) => (prev + 1) % audios.length);
  };

  // Admin Actions
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewAudioFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setNewAudioBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveNewAudio = () => {
    if (!newAudioTitle || !newAudioBase64) {
      toast.error("Preencha o título e selecione um MP3!");
      return;
    }
    const novo = { id: Date.now().toString(), title: newAudioTitle, url: newAudioBase64, fileName: newAudioFile?.name || 'Musica' };
    const updated = [novo, ...audios];
    setAudios(updated);
    localStorage.setItem('almas_zen_audio', JSON.stringify(updated));
    setNewAudioTitle(''); setNewAudioBase64(''); setNewAudioFile(null);
    toast.success("Música adicionada!");
    // Forçar recarregamento do storage para outros componentes (se houver)
    window.dispatchEvent(new Event('storage'));
  };

  const deleteAudio = (id: string) => {
    const updated = audios.filter(a => a.id !== id);
    setAudios(updated);
    localStorage.setItem('almas_zen_audio', JSON.stringify(updated));
    toast.success("Música removida.");
    if (currentAudioIndex >= updated.length) setCurrentAudioIndex(0);
    window.dispatchEvent(new Event('storage'));
  };

  // Balão Logic
  const handleExplode = () => {
    if (!ventText) return;
    setIsExploding(true);
    setRandomSupport(SUPPORT_MESSAGES[Math.floor(Math.random() * SUPPORT_MESSAGES.length)]);
    setTimeout(() => { setIsExploding(false); setVentText(''); setShowSupport(true); }, 1000);
    setTimeout(() => setShowSupport(false), 6000);
  };

  const balloonScale = 0.5 + Math.min(ventText.length / 50, 1.5);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans bg-[#4B1528]">
      
      {/* Background Zen - Persistente */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url('/zen_meditation_background_atipica_1774585593910.png')` }} />
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-[#D4537E]/20 rounded-full blur-[100px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity, delay: 2 }} className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-[#F4C0D1]/15 rounded-full blur-[100px]" />
      </div>

      {/* Áudio Element - GLOBAL E ÚNICO */}
      {audios.length > 0 && (
        <audio 
          ref={audioRef} 
          src={audios[currentAudioIndex].url} 
          preload="auto"
          className="hidden"
        />
      )}

      <div className="relative z-10 h-full flex flex-col items-center">
        
        {/* Header - Apenas Botões de Ação */}
        <div className="w-full p-6 md:p-8 flex justify-between items-center text-white/90">
          <button onClick={() => navigate('/diario')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest border border-white/20">
            <ArrowLeft size={16} /> Voltar ao Diário
          </button>
          
          {isAdmin && (
            <button onClick={() => setShowAdminPanel(true)} className="p-3 bg-white/10 hover:bg-[#D4537E] rounded-2xl border border-white/20 transition-all text-white shadow-lg flex items-center gap-2 font-bold text-xs">
              <Settings size={18} /> GESTÃO DE MÚSICA
            </button>
          )}
        </div>

        {/* Conteúdo Central - Modos de Pausa */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl text-center pb-32">
          <AnimatePresence mode="wait">
            {mode === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-8">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 font-serif italic tracking-tight">Seu Momento Pausa</h1>
                <p className="text-white/70 text-lg md:text-xl max-w-xl mx-auto mb-10">Como podemos acalmar sua mente agora?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
                  {[
                    { id: 'respiro', icon: Wind, label: 'Respiração', color: 'hover:bg-blue-500/20' },
                    { id: 'afirma', icon: Sparkles, label: 'Afirmações', color: 'hover:bg-amber-500/20' },
                    { id: 'desabafo', icon: MessageSquare, label: 'Balão do Desabafo', color: 'hover:bg-red-500/20' },
                  ].map((btn) => {
                    const Ic = btn.icon;
                    return (
                      <motion.button key={btn.id} whileHover={{ y: -8, background: 'rgba(255,255,255,0.15)' }} onClick={() => setMode(btn.id as any)} className={`p-10 md:p-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] flex flex-col items-center transition-all ${btn.color} shadow-2xl`}>
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[var(--rosa-forte)] mb-6 shadow-xl"><Ic size={36} /></div>
                        <h3 className="text-white font-black text-xl tracking-tight">{btn.label}</h3>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {mode === 'respiro' && (
              <motion.div key="respiro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="relative w-80 h-80 flex items-center justify-center mb-12">
                  <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0.2, 0.6] }} transition={{ repeat: Infinity, duration: 8 }} className="absolute inset-0 rounded-full border-4 border-white/20" />
                  <div className="w-64 h-64 bg-white/20 backdrop-blur-3xl rounded-full border-2 border-white/40 flex items-center justify-center shadow-2xl">
                    <h2 className="text-white text-5xl font-serif font-black italic">{breathingText}</h2>
                  </div>
                </div>
                <button onClick={() => setMode('intro')} className="px-10 py-4 bg-white/10 hover:bg-white text-white hover:text-[var(--rosa-forte)] font-black text-sm uppercase tracking-widest rounded-3xl transition-all border border-white/20 shadow-xl">Finalizar</button>
              </motion.div>
            )}

            {mode === 'afirma' && (
              <motion.div key="afirma" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                <Sparkles className="text-amber-300 mb-8 opacity-50" size={60} />
                <AnimatePresence mode="wait">
                   <motion.p key={affIndex} initial={{ opacity: 0, filter: 'blur(15px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(15px)' }} transition={{ duration: 1.5 }} className="text-4xl md:text-6xl font-medium text-white font-serif italic max-w-3xl px-6 leading-tight">"{AFFIRMATIONS[affIndex]}"</motion.p>
                </AnimatePresence>
                <div className="flex gap-6 mt-16">
                   <button onClick={() => setAffIndex(prev => (prev + 1) % AFFIRMATIONS.length)} className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/20 flex items-center justify-center transition-all"><RefreshCw size={24} /></button>
                   <button onClick={() => setMode('intro')} className="px-10 py-4 bg-white text-[var(--rosa-forte)] font-black rounded-3xl shadow-2xl text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Finalizar</button>
                </div>
              </motion.div>
            )}

            {mode === 'desabafo' && (
              <motion.div key="desabafo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full">
                <div className="relative h-64 md:h-80 w-full flex items-center justify-center mb-8">
                  <AnimatePresence>{isExploding && <motion.div initial={{ scale: 1, opacity: 1 }} animate={{ scale: 10, opacity: 0 }} className="absolute w-32 h-32 bg-white rounded-full blur-3xl z-30" />}</AnimatePresence>
                  <AnimatePresence>
                    {!isExploding && (
                      <motion.div animate={{ scale: balloonScale, y: [0, -20, 0] }} transition={{ y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }} className="relative">
                        <div className="w-36 h-48 bg-gradient-to-br from-red-400 to-red-600 rounded-t-[50%] rounded-b-[40%] shadow-[0_30px_60px_rgba(239,68,68,0.4)] relative">
                           <div className="absolute top-6 left-6 w-10 h-16 bg-white/25 rounded-full blur-[2px] -rotate-12" />
                        </div>
                        <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-0.5 h-20 bg-white/30" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {showSupport && (
                      <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -50 }} className="absolute z-40 bg-white p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] max-w-sm border-2 border-green-50">
                         <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 mx-auto"><Sun size={32} /></div>
                         <p className="text-[#4B1528] font-black text-xl italic leading-relaxed text-center">{randomSupport}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20 p-6 shadow-2xl">
                  <textarea disabled={isExploding} value={ventText} onChange={(e) => setVentText(e.target.value)} className="w-full h-28 bg-transparent text-white placeholder-white/30 text-xl outline-none font-medium italic overflow-hidden resize-none" placeholder="O que está pesando no seu coração? Digite sem medo..." />
                  <div className="flex justify-between items-center mt-4 border-t border-white/10 pt-4">
                    <div className="text-[10px] font-black uppercase text-white/40 tracking-[3px]">{ventText.length} unidades de peso</div>
                    <button onClick={handleExplode} disabled={!ventText || isExploding} className="bg-red-500 hover:bg-red-600 text-white font-black px-8 py-3 rounded-2xl shadow-xl disabled:opacity-30 text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95">LIBERAR PESO 💨</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* PLAYER GLOBAL - Sempre Fixado no Rodapé */}
        <div className="fixed bottom-0 left-0 w-full p-8 pointer-events-none pb-12">
          <div className="max-w-xl mx-auto pointer-events-auto">
            <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] p-5 border border-white/15 flex items-center justify-between text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
               <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-white border border-white/10 ${isPlaying ? 'animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.2)]' : ''}`}>
                    <Music size={28} />
                  </div>
                  <div className="text-left overflow-hidden">
                    {audios.length > 0 ? (
                      <>
                        <div className="text-base font-black truncate max-w-[200px] leading-tight">{audios[currentAudioIndex].title}</div>
                        <div className="text-[10px] font-black opacity-40 uppercase tracking-[3px] mt-1">Sintonizando Paz</div>
                      </>
                    ) : (
                      <div className="text-sm font-black opacity-30 italic">Nenhuma música na sintonização</div>
                    )}
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                 <button onClick={togglePlay} disabled={audios.length === 0} className={`w-14 h-14 rounded-full shadow-2xl transition-all flex items-center justify-center hover:scale-110 active:scale-90 ${isPlaying ? 'bg-white text-[#D4537E]' : 'bg-[#D4537E] text-white'}`}>
                   {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                 </button>
                 <button onClick={nextTrack} disabled={audios.length <= 1} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white flex items-center justify-center transition-all hover:rotate-12">
                   <SkipForward size={22} />
                 </button>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* PAINEL ADMIN SOBREPOSTO (MODAL) */}
      <AnimatePresence>
        {showAdminPanel && (
          <div className="fixed inset-0 z-[100] bg-[#4B1528]/90 backdrop-blur-2xl flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
               <button onClick={() => setShowAdminPanel(false)} className="absolute top-10 right-10 p-3 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-400 transition-colors"><X size={24} /></button>
               
               <h2 className="text-4xl font-black text-[#4B1528] font-serif mb-2">Painel de Sintonização</h2>
               <p className="text-gray-500 mb-10 font-medium italic">Gerencie os áudios terapêuticos exclusivos de administrador.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[3px]">Título da Faixa</label>
                        <input value={newAudioTitle} onChange={e=>setNewAudioTitle(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#D4537E] font-bold" placeholder="Ex: Chuva na Floresta" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[3px]">Arquivo MP3</label>
                        <div className="relative">
                           <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" id="audio-file" />
                           <label htmlFor="audio-file" className="flex flex-col items-center justify-center gap-2 w-full p-6 bg-pink-50 text-[var(--rosa-forte)] font-black rounded-3xl border-2 border-dashed border-pink-200 cursor-pointer hover:bg-pink-100 transition-all text-sm uppercase italic">
                              <Upload size={24} />
                              {newAudioFile ? newAudioFile.name.slice(0,30) + "..." : "Carregar Áudio"}
                           </label>
                        </div>
                     </div>
                     <button onClick={saveNewAudio} className="w-full py-5 bg-[#D4537E] text-white font-black rounded-3xl shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all">
                        <Save size={20} /> ATUALIZAR PLAYLIST
                     </button>
                  </div>
                  
                  <div className="space-y-4 flex flex-col h-full">
                     <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[3px]">Biblioteca Local ({audios.length})</h3>
                     <div className="flex-1 overflow-y-auto max-h-[280px] space-y-3 pr-2 scrollbar-none">
                        {audios.map(a => (
                          <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#D4537E]/30 transition-all">
                             <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#D4537E]"><Volume2 size={18} /></div>
                                <span className="text-sm font-black truncate text-[#4B1528]">{a.title}</span>
                             </div>
                             <button onClick={() => deleteAudio(a.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                          </div>
                        ))}
                        {audios.length === 0 && <p className="text-center py-12 text-gray-400 italic text-sm font-bold opacity-50 uppercase tracking-widest">Nenhum áudio configurado.</p>}
                     </div>
                  </div>
               </div>
               
               <div className="bg-[#4B1528] p-6 rounded-3xl text-white/90 text-xs flex gap-4 border border-white/5 shadow-2xl">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/10"><HelpCircle size={20} className="text-pink-300" /></div>
                  <p className="leading-relaxed"><b>Protocolo de Administração:</b> Os áudios são salvos no cache do seu navegador atual. Use MP3s leves para garantir carregamento instantâneo para as usuárias.</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MomentoPausa;
