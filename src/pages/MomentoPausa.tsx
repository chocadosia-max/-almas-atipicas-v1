import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ArrowLeft, Volume2, Music, 
  Wind, Sparkles, MessageSquare, Trash2, 
  Play, Pause, RefreshCw, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── DADOS ────────────────────────────────────────────────────────────────────
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

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const MomentoPausa = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'intro' | 'respiro' | 'afirma' | 'desabafo'>('intro');
  const [breathingText, setBreathingText] = useState('Inspira...');
  const [affIndex, setAffIndex] = useState(0);
  const [ventText, setVentText] = useState('');
  const [ventingActive, setVentingActive] = useState(false);

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

  const handleDesabafar = () => {
    if (!ventText) return;
    setVentingActive(true);
    // Animação de sumir o texto após 3 segundos
    setTimeout(() => {
      setVentText('');
      setVentingActive(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      
      {/* Background Zen Dinâmico */}
      <div className="absolute inset-0 bg-[#4B1528] overflow-hidden">
        {/* Camada de Imagem Gerada (Base) */}
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: `url('/zen_meditation_background_atipica_1774585593910.png')` }}
        />
        
        {/* Gradientes Animados Orbitais */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-[#D4537E]/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-[#F4C0D1]/15 rounded-full blur-[100px]"
        />
        
        {/* Partículas (Pontos de Luz) */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
              animate={{ 
                opacity: [0, 1, 0], 
                y: ["0%", "-10%"],
                scale: [0, 1.2, 0]
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity, 
                delay: Math.random() * 5 
              }}
              className="absolute w-2 h-2 bg-white rounded-full blur-[2px]"
            />
          ))}
        </div>
      </div>

      {/* Interface */}
      <div className="relative z-10 h-full flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full p-6 md:p-8 flex justify-between items-center text-white/90">
          <button 
            onClick={() => navigate('/diario')}
            className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest border border-white/20"
          >
            <ArrowLeft size={16} /> Voltar para o Diário
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase opacity-60 tracking-[2px]">Ambiente Seguro</span>
          </div>
        </div>

        {/* Conteúdo Dinâmico Central */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl text-center">
          <AnimatePresence mode="wait">
            
            {/* 1. INTRO / MENU DE PAUSA */}
            {mode === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8"
              >
                <div className="flex flex-col items-center">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-20 h-20 bg-white shadow-[0_0_40px_rgba(255,255,255,0.2)] rounded-3xl flex items-center justify-center mb-6 text-[var(--rosa-forte)]"
                  >
                    <Heart size={40} fill="currentColor" />
                  </motion.div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif italic">Seu Momento Pausa</h1>
                  <p className="text-white/70 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                    Escolha uma forma de renovar suas energias para continuar sua jornada hoje.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {[
                    { id: 'respiro', icon: Wind, label: 'Respiração Guiada', desc: '4 segundos para cada fase', color: 'hover:bg-blue-500/20 shadow-blue-500/10' },
                    { id: 'afirma', icon: Sparkles, label: 'Afirmações Positivas', desc: 'Lembretes do seu valor', color: 'hover:bg-amber-500/20 shadow-amber-500/10' },
                    { id: 'desabafo', icon: MessageSquare, label: 'Desabafo Digital', desc: 'Escreva e veja a carga sumir', color: 'hover:bg-emerald-500/20 shadow-emerald-500/10' },
                  ].map((btn) => {
                    const Icon = btn.icon;
                    return (
                      <motion.button
                        key={btn.id}
                        whileHover={{ y: -5, background: 'rgba(255,255,255,0.15)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMode(btn.id as any)}
                        className={`p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex flex-col items-center transition-all ${btn.color} shadow-2xl`}
                      >
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[var(--rosa-forte)] mb-4 shadow-lg active:scale-95">
                          <Icon size={24} />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">{btn.label}</h3>
                        <p className="text-white/50 text-xs">{btn.desc}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 2. RESPIRAÇÃO */}
            {mode === 'respiro' && (
              <motion.div
                key="respiro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center mb-12">
                  <motion.div
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border-2 border-white/30"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="w-44 h-44 md:w-52 md:h-52 bg-white/20 backdrop-blur-3xl rounded-full border-2 border-white/60 shadow-[0_0_80px_rgba(255,255,255,0.4)] flex items-center justify-center"
                  >
                    <motion.h2 
                      key={breathingText}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-white text-3xl md:text-4xl font-serif font-black italic"
                    >
                      {breathingText}
                    </motion.h2>
                  </motion.div>
                </div>
                <button 
                  onClick={() => setMode('intro')}
                  className="px-8 py-3 bg-white/10 hover:bg-white text-white hover:text-[var(--rosa-forte)] font-bold rounded-2xl transition-all border border-white/20"
                >
                  Concluir Exercício
                </button>
              </motion.div>
            )}

            {/* 3. AFIRMAÇÕES */}
            {mode === 'afirma' && (
              <motion.div
                key="afirma"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center max-w-xl"
              >
                <Sparkles className="text-amber-300 mb-8 opacity-50" size={48} />
                <div className="min-h-[200px] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={affIndex}
                      initial={{ opacity: 0, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, filter: 'blur(10px)' }}
                      transition={{ duration: 1 }}
                      className="text-3xl md:text-4xl lg:text-5xl font-medium text-white drop-shadow-2xl leading-tight font-serif italic"
                    >
                      "{AFFIRMATIONS[affIndex]}"
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="flex gap-4 mt-12">
                   <button onClick={() => setAffIndex(prev => (prev + 1) % AFFIRMATIONS.length)} className="p-4 bg-white/10 rounded-full text-white border border-white/20"><RefreshCw size={20} /></button>
                   <button onClick={() => setMode('intro')} className="px-8 py-3 bg-white text-[var(--rosa-forte)] font-black rounded-2xl shadow-lg">Finalizar</button>
                </div>
              </motion.div>
            )}

            {/* 4. DESABAFO DIGITAL */}
            {mode === 'desabafo' && (
              <motion.div
                key="desabafo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center w-full"
              >
                <h2 className="text-2xl font-bold text-white mb-4">O que está pesando hoje?</h2>
                <p className="text-white/60 text-sm mb-6">Escreva abaixo tudo o que você gostaria de colocar pra fora. Ao clicar em liberar, as palavras vão sumir, simbolizando você soltando esse peso. 🧘‍♀️</p>
                
                <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-6 shadow-2xl">
                  <AnimatePresence>
                    {!ventingActive ? (
                      <motion.textarea
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -50, filter: 'blur(20px)', scale: 1.1 }}
                        transition={{ duration: 3 }}
                        value={ventText}
                        onChange={(e) => setVentText(e.target.value)}
                        className="w-full h-48 bg-transparent text-white placeholder-white/30 text-xl md:text-2xl resize-none outline-none font-medium italic"
                        placeholder="Ex: Estou cansada da burocracia do plano de saúde..."
                      />
                    ) : (
                      <motion.div 
                        key="cleaning"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0, y: -100, filter: 'blur(30px)' }}
                        transition={{ duration: 3.5 }}
                        className="w-full h-48 flex items-center justify-center text-white/40 text-2xl italic px-4"
                      >
                         Deixando ir... {ventText}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {!ventingActive && (
                    <div className="flex justify-end mt-4">
                      <button 
                        onClick={handleDesabafar}
                        disabled={!ventText}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                      >
                        <Wind size={18} /> LIBERAR ESTE PESO
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setMode('intro')}
                  className="mt-12 text-white/50 hover:text-white font-bold transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Voltar ao menu de pausa
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer Playlists */}
        <div className="w-full p-8 flex flex-col items-center">
          <div className="bg-white/5 backdrop-blur-2xl w-full max-w-xl rounded-[2rem] p-5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1DB954]/20 rounded-xl flex items-center justify-center text-[#1DB954]">
                  <Volume2 size={24} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold opacity-100">Playlist Relaxante</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-50">Sons da Natureza & Lofi</div>
                </div>
             </div>
             
             <div className="flex gap-2">
               <a href="https://open.spotify.com/playlist/37i9dQZF1DWZq91oLsHZvy" target="_blank" rel="noreferrer" className="bg-[#1DB954] hover:bg-[#1ed760] transition-transform active:scale-95 p-3 rounded-full shadow-lg">
                 <Play size={16} fill="black" className="text-black" />
               </a>
               <a href="https://open.spotify.com/playlist/37i9dQZF1DWUa8ZRTvlZ2C" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 p-3 rounded-full border border-white/20">
                 <Music size={16} />
               </a>
             </div>
          </div>
          
          <p className="mt-8 text-white/30 text-[10px] font-black uppercase tracking-[4px]">Pausa Purificadora • Almas Atípicas</p>
        </div>

      </div>

    </div>
  );
};

export default MomentoPausa;
