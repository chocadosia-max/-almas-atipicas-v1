import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ArrowLeft, Volume2, Music, 
  Wind, Sparkles, MessageSquare, Trash2, 
  Play, Pause, RefreshCw, X, Send,
  Frown, Ghost, Sun, UserPlus
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

const SUPPORT_MESSAGES = [
  "Nós te ouvimos. Seu peso agora é mais leve.",
  "Você é a melhor mãe que seu filho poderia ter.",
  "Não se culpe por estar exausta. Respire.",
  "Sua força é admirável, mas você também pode descansar.",
  "O amor que você dedica volta para você em forma de cura.",
  "Estamos juntas com você nesta caminhada.",
  "Libere a culpa. Você está fazendo o impossível todos os dias.",
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const MomentoPausa = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'intro' | 'respiro' | 'afirma' | 'desabafo'>('intro');
  const [breathingText, setBreathingText] = useState('Inspira...');
  const [affIndex, setAffIndex] = useState(0);
  
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

  // Lógica do Balão
  const handleExplode = () => {
    if (!ventText) return;
    setIsExploding(true);
    
    // Selecionar mensagem de apoio
    const msg = SUPPORT_MESSAGES[Math.floor(Math.random() * SUPPORT_MESSAGES.length)];
    setRandomSupport(msg);

    // Timeline da explosão
    setTimeout(() => {
      setIsExploding(false);
      setVentText('');
      setShowSupport(true);
    }, 1000);

    // Esconder apoio após alguns segundos
    setTimeout(() => {
      setShowSupport(false);
    }, 6000);
  };

  // Cálculo do tamanho do balão (cresce conforme digita)
  const balloonScale = 0.5 + Math.min(ventText.length / 50, 1.5);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      
      {/* Background Zen Dinâmico */}
      <div className="absolute inset-0 bg-[#4B1528] overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: `url('/zen_meditation_background_atipica_1774585593910.png')` }}
        />
        
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
                    { id: 'respiro', icon: Wind, label: 'Respiração Guiada', desc: '4 segundos para cada fase', color: 'hover:bg-blue-500/20' },
                    { id: 'afirma', icon: Sparkles, label: 'Afirmações Positivas', desc: 'Lembretes do seu valor', color: 'hover:bg-amber-500/20' },
                    { id: 'desabafo', icon: MessageSquare, label: 'Balão do Desabafo', desc: 'Libere o peso da sua mente', color: 'hover:bg-red-500/20' },
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
                        <p className="text-white/50 text-xs text-center">{btn.desc}</p>
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
                <div className="relative w-80 h-80 flex items-center justify-center mb-12">
                  <motion.div animate={{ scale: [1, 1.8], opacity: [0.6, 0] }} transition={{ repeat: Infinity, duration: 8 }} className="absolute inset-0 rounded-full border-2 border-white/30" />
                  <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 8 }} className="w-52 h-52 bg-white/20 backdrop-blur-3xl rounded-full border-2 border-white/60 flex items-center justify-center">
                    <h2 className="text-white text-4xl font-serif font-black italic">{breathingText}</h2>
                  </motion.div>
                </div>
                <button onClick={() => setMode('intro')} className="px-8 py-3 bg-white/10 hover:bg-white text-white hover:text-[var(--rosa-forte)] font-bold rounded-2xl transition-all border border-white/20">Finalizar</button>
              </motion.div>
            )}

            {/* 3. AFIRMAÇÕES */}
            {mode === 'afirma' && (
              <motion.div key="afirma" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center max-w-xl">
                <Sparkles className="text-amber-300 mb-8 opacity-50" size={48} />
                <AnimatePresence mode="wait"><motion.p key={affIndex} initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 1 }} className="text-4xl md:text-5xl font-medium text-white font-serif italic">"{AFFIRMATIONS[affIndex]}"</motion.p></AnimatePresence>
                <div className="flex gap-4 mt-12">
                   <button onClick={() => setAffIndex(prev => (prev + 1) % AFFIRMATIONS.length)} className="p-4 bg-white/10 rounded-full text-white border border-white/20"><RefreshCw size={20} /></button>
                   <button onClick={() => setMode('intro')} className="px-8 py-3 bg-white text-[var(--rosa-forte)] font-black rounded-2xl shadow-lg">Voltar</button>
                </div>
              </motion.div>
            )}

            {/* 4. BALÃO DO DESABAFO (ATUALIZADO) */}
            {mode === 'desabafo' && (
              <motion.div
                key="desabafo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center w-full relative"
              >
                {/* ÁREA DO BALÃO */}
                <div className="relative h-64 md:h-80 w-full flex items-center justify-center mb-4">
                  
                  {/* EXPLOSÃO VISUAL */}
                  <AnimatePresence>
                    {isExploding && (
                      <motion.div 
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 4, opacity: 0 }}
                        className="absolute w-32 h-32 bg-white rounded-full blur-2xl z-30"
                      />
                    )}
                  </AnimatePresence>

                  {/* O BALÃO VERMELHO */}
                  <AnimatePresence>
                    {!isExploding && ventText.length > 0 && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ 
                          scale: balloonScale, 
                          opacity: 1,
                          y: [0, -10, 0],
                        }}
                        transition={{ 
                          scale: { type: 'spring', stiffness: 100, damping: 10 },
                          y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                        }}
                        className="relative"
                      >
                        {/* Corpo do Balão */}
                        <div className="w-32 h-40 bg-red-500 rounded-t-[50%] rounded-b-[40%] shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.2),0_20px_40px_rgba(239,68,68,0.3)] border-r-4 border-red-600 relative overflow-hidden">
                           {/* Brilho */}
                           <div className="absolute top-4 left-4 w-8 h-12 bg-white/20 rounded-full blur-[2px]" />
                        </div>
                        {/* Cordinha */}
                        <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-0.5 h-16 bg-white/40" />
                        <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-4 h-2 bg-red-700 rounded-full" />
                      </motion.div>
                    )}
                    
                    {!isExploding && ventText.length === 0 && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} className="text-white/40 font-serif italic text-xl">
                          Escreva abaixo para inflar o balão do desabafo...
                       </motion.div>
                    )}
                  </AnimatePresence>

                  {/* MENSAGEM DE APOIO APÓS EXPLODIR */}
                  <AnimatePresence>
                    {showSupport && (
                      <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 1.2 }}
                        className="absolute z-40 bg-white/95 backdrop-blur-md p-6 rounded-[2rem] border-2 border-green-200 shadow-2xl max-w-sm"
                      >
                        <div className="flex flex-col items-center gap-4">
                           <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                             <Sun size={24} />
                           </div>
                           <p className="text-[var(--texto-escuro)] font-bold text-lg leading-relaxed">
                             {randomSupport}
                           </p>
                           <span className="text-xs font-black uppercase tracking-widest text-[var(--rosa-forte)] opacity-60">Você não atravessa isso sozinha</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CAIXA DE TEXTO REDUZIDA */}
                <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-5 shadow-2xl">
                  <textarea
                    disabled={isExploding}
                    value={ventText}
                    onChange={(e) => setVentText(e.target.value)}
                    className="w-full h-24 bg-transparent text-white placeholder-white/20 text-lg resize-none outline-none font-medium italic overflow-hidden"
                    placeholder="O que está tirando sua paz agora?"
                  />
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                      {ventText.length} caracteres acumulados
                    </div>
                    <button 
                      onClick={handleExplode}
                      disabled={!ventText || isExploding}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg disabled:opacity-30 transition-all hover:scale-105 active:scale-95 text-sm"
                    >
                      <Wind size={16} /> EXPLODIR PESO
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setMode('intro')}
                  className="mt-6 text-white/30 hover:text-white font-bold transition-colors flex items-center gap-1.5 text-xs uppercase tracking-widest"
                >
                  <ArrowLeft size={14} /> Voltar ao menu
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer Playlists */}
        <div className="w-full p-8 flex flex-col items-center">
          <div className="bg-white/5 backdrop-blur-2xl w-full max-w-xl rounded-[2rem] p-4 border border-white/10 flex items-center justify-between text-white">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1DB954]/20 rounded-lg flex items-center justify-center text-[#1DB954]">
                  <Volume2 size={20} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Playlist Relaxante</div>
                  <div className="text-[10px] opacity-50 uppercase tracking-widest">Lofi Zen</div>
                </div>
             </div>
             <a href="https://open.spotify.com/playlist/37i9dQZF1DWZq91oLsHZvy" target="_blank" rel="noreferrer" className="bg-[#1DB954] p-2.5 rounded-full shadow-lg">
                <Play size={14} fill="black" className="text-black" />
             </a>
          </div>
          <p className="mt-6 text-white/20 text-[9px] font-black uppercase tracking-[4px]">Pausa Purificadora • Almas Atípicas</p>
        </div>

      </div>

    </div>
  );
};

export default MomentoPausa;
