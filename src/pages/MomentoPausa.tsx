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
    if (!audioRef.current || audios.length === 0) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Erro ao dar play", e));
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (audios.length <= 1) return;
    setCurrentAudioIndex((prev) => (prev + 1) % audios.length);
    setIsPlaying(false);
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
    toast.success("Música adicionada à playlist zen!");
  };

  const deleteAudio = (id: string) => {
    const updated = audios.filter(a => a.id !== id);
    setAudios(updated);
    localStorage.setItem('almas_zen_audio', JSON.stringify(updated));
    toast.success("Música removida.");
    if (currentAudioIndex >= updated.length) setCurrentAudioIndex(0);
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
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      
      {/* Background Zen */}
      <div className="absolute inset-0 bg-[#4B1528] overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url('/zen_meditation_background_atipica_1774585593910.png')` }} />
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-[#D4537E]/20 rounded-full blur-[100px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity, delay: 2 }} className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-[#F4C0D1]/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center">
        {audios.length > 0 && <audio ref={audioRef} src={audios[currentAudioIndex].url} onEnded={() => setIsPlaying(false)} />}
        
        {/* Header */}
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

        {/* Conteúdo Central */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl text-center">
          <AnimatePresence mode="wait">
            {mode === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif italic">Seu Momento Pausa</h1>
                <p className="text-white/70 text-lg md:text-xl max-w-xl mx-auto mb-10">Escolha como liberar sua carga emocional agora.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {[
                    { id: 'respiro', icon: Wind, label: 'Respiração', color: 'hover:bg-blue-500/20' },
                    { id: 'afirma', icon: Sparkles, label: 'Afirmações', color: 'hover:bg-amber-500/20' },
                    { id: 'desabafo', icon: MessageSquare, label: 'Balão do Desabafo', color: 'hover:bg-red-500/20' },
                  ].map((btn) => {
                    const Ic = btn.icon;
                    return (
                      <motion.button key={btn.id} whileHover={{ y: -5, background: 'rgba(255,255,255,0.15)' }} onClick={() => setMode(btn.id as any)} className={`p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex flex-col items-center transition-all ${btn.color} shadow-2xl`}>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[var(--rosa-forte)] mb-4 shadow-lg active:scale-95"><Ic size={28} /></div>
                        <h3 className="text-white font-bold text-lg">{btn.label}</h3>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {mode === 'respiro' && (
              <motion.div key="respiro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="relative w-80 h-80 flex items-center justify-center mb-12">
                  <motion.div animate={{ scale: [1, 1.8, 1] }} transition={{ repeat: Infinity, duration: 8 }} className="absolute inset-0 rounded-full border-2 border-white/30" />
                  <div className="w-56 h-56 bg-white/20 backdrop-blur-3xl rounded-full border-2 border-white/60 flex items-center justify-center">
                    <h2 className="text-white text-4xl font-serif font-black italic">{breathingText}</h2>
                  </div>
                </div>
                <button onClick={() => setMode('intro')} className="px-8 py-3 bg-white/10 hover:bg-white text-white hover:text-[var(--rosa-forte)] font-bold rounded-2xl transition-all border border-white/20">Finalizar</button>
              </motion.div>
            )}

            {mode === 'afirma' && (
              <motion.div key="afirma" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                <Sparkles className="text-amber-300 mb-8 opacity-50" size={48} />
                <AnimatePresence mode="wait"><motion.p key={affIndex} initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 1 }} className="text-4xl md:text-5xl font-medium text-white font-serif italic max-w-2xl px-6">"{AFFIRMATIONS[affIndex]}"</motion.p></AnimatePresence>
                <div className="flex gap-4 mt-12">
                   <button onClick={() => setAffIndex(prev => (prev + 1) % AFFIRMATIONS.length)} className="p-4 bg-white/10 rounded-full text-white border border-white/20"><RefreshCw size={20} /></button>
                   <button onClick={() => setMode('intro')} className="px-8 py-3 bg-white text-[var(--rosa-forte)] font-black rounded-2xl shadow-lg">Finalizar</button>
                </div>
              </motion.div>
            )}

            {mode === 'desabafo' && (
              <motion.div key="desabafo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full">
                <div className="relative h-64 md:h-80 w-full flex items-center justify-center mb-4">
                  <AnimatePresence>{isExploding && <motion.div initial={{ scale: 1, opacity: 1 }} animate={{ scale: 5, opacity: 0 }} className="absolute w-32 h-32 bg-white rounded-full blur-2xl z-30" />}</AnimatePresence>
                  <AnimatePresence>
                    {!isExploding && (
                      <motion.div animate={{ scale: balloonScale, y: [0, -10, 0] }} transition={{ y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }} className="relative">
                        <div className="w-32 h-40 bg-red-500 rounded-t-[50%] rounded-b-[40%] shadow-2xl relative">
                           <div className="absolute top-4 left-4 w-8 h-12 bg-white/20 rounded-full blur-[2px]" />
                        </div>
                        <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-0.5 h-16 bg-white/40" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {showSupport && (
                      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="absolute z-40 bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm">
                         <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 mx-auto"><Sun size={24} /></div>
                         <p className="text-[var(--texto-escuro)] font-bold text-lg italic leading-relaxed">{randomSupport}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-5 shadow-2xl">
                  <textarea disabled={isExploding} value={ventText} onChange={(e) => setVentText(e.target.value)} className="w-full h-24 bg-transparent text-white placeholder-white/20 text-lg outline-none font-medium italic overflow-hidden resize-none" placeholder="O que pesa hoje? Digite aqui para inflar o balão..." />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-[10px] uppercase text-white/40 tracking-widest">{ventText.length} tons de peso</div>
                    <button onClick={handleExplode} disabled={!ventText || isExploding} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg disabled:opacity-30 text-sm transition-all hover:scale-105 active:scale-95">LIBERAR PESO 💨</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer Player */}
        <div className="w-full p-8 flex flex-col items-center">
          <div className="bg-white/5 backdrop-blur-2xl w-full max-w-xl rounded-[2.5rem] p-5 border border-white/10 flex items-center justify-between text-white shadow-2xl">
             <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white ${isPlaying ? 'animate-pulse' : ''}`}><Music size={24} /></div>
                <div className="text-left">
                  {audios.length > 0 ? (
                    <>
                      <div className="text-sm font-bold truncate max-w-[150px]">{audios[currentAudioIndex].title}</div>
                      <div className="text-[10px] opacity-40 uppercase tracking-widest">Playlist Relaxante</div>
                    </>
                  ) : (
                    <div className="text-sm font-bold opacity-30">Nenhuma música disponível</div>
                  )}
                </div>
             </div>
             
             <div className="flex items-center gap-2">
               <button onClick={togglePlay} disabled={audios.length === 0} className={`p-4 rounded-full shadow-lg ${isPlaying ? 'bg-white text-[var(--rosa-forte)]' : 'bg-pink-500 text-white'}`}>
                 {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
               </button>
               <button onClick={nextTrack} disabled={audios.length <= 1} className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white"><SkipForward size={18} /></button>
             </div>
          </div>
        </div>
      </div>

      {/* PAINEL ADMIN SOBREPOSTO (MODAL) */}
      <AnimatePresence>
        {showAdminPanel && (
          <div className="fixed inset-0 z-[100] bg-[#4B1528]/80 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
            >
               <button onClick={() => setShowAdminPanel(false)} className="absolute top-8 right-8 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"><X size={24} /></button>
               
               <h2 className="text-3xl font-black text-[#4B1528] font-serif mb-2">Gestão de Músicas</h2>
               <p className="text-gray-500 mb-8 font-medium italic">Adicione músicas relaxantes diretamente para as mães ouvirem na pausa.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-4">
                     <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-[10px] text-gray-400"><Upload size={14} /> Nova Faixa</h3>
                     <input value={newAudioTitle} onChange={e=>setNewAudioTitle(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#D4537E]" placeholder="Nome da música..." />
                     <div className="relative">
                        <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" id="audio-file" />
                        <label htmlFor="audio-file" className="flex items-center justify-center gap-2 w-full p-4 bg-pink-50 text-[var(--rosa-forte)] font-bold rounded-2xl border-2 border-dashed border-pink-200 cursor-pointer hover:bg-pink-100 transition-all text-sm">
                           {newAudioFile ? newAudioFile.name.slice(0,25) + "..." : "Selecionar MP3"}
                        </label>
                     </div>
                     <button onClick={saveNewAudio} className="w-full py-4 bg-[#D4537E] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2">
                        <Save size={20} /> SALVAR AGORA
                     </button>
                  </div>
                  
                  <div className="space-y-4 flex flex-col h-full">
                     <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-[10px] text-gray-400"><RefreshCw size={14} /> Playlist Atual ({audios.length})</h3>
                     <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-2 scrollbar-hide">
                        {audios.map(a => (
                          <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                             <div className="flex items-center gap-3 overflow-hidden">
                                <Volume2 size={16} className="text-pink-400 shrink-0" />
                                <span className="text-sm font-bold truncate text-gray-700">{a.title}</span>
                             </div>
                             <button onClick={() => deleteAudio(a.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                          </div>
                        ))}
                        {audios.length === 0 && <p className="text-center py-8 text-gray-400 italic text-sm">Nenhuma música salva.</p>}
                     </div>
                  </div>
               </div>
               
               <div className="bg-[#4B1528] p-5 rounded-2xl text-white/90 text-xs flex gap-3">
                  <HelpCircle size={24} className="text-pink-300 shrink-0" />
                  <p><b>Dica de Performance:</b> Use arquivos MP3 pequenos (≤ 2MB) ou pedaços de sons ambientes. Como os áudios ficam no navegador, o upload é instantâneo para você!</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MomentoPausa;
