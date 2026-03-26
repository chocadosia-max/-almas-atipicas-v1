import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, Volume2, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AFFIRMATIONS = [
  "Você é incrivelmente forte.",
  "Mães atípicas movem o mundo de maneiras silenciosas.",
  "Tudo bem se sentir cansada. Você tem feito o seu melhor.",
  "Você não está sozinha nesta jornada.",
  "Seu amor é a âncora constante e mais valiosa.",
  "Respire. Um momento ruim não define a sua maternidade."
];

const MomentoPausa = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [breathingText, setBreathingText] = useState('Inspira...');

  // Effect for affirmations
  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % AFFIRMATIONS.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // Effect for breathing text
  useEffect(() => {
    const t = setInterval(() => {
      setBreathingText(prev => prev === 'Inspira...' ? 'Expira...' : 'Inspira...');
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    // Override absolute layout to fill screen with the specific dark pink back
    <div className="absolute inset-0 z-50 bg-[#D4537E] flex flex-col justify-between overflow-y-auto">
      
      {/* Top Banner */}
      <div className="p-8 flex justify-between items-center text-white/90">
        <button 
          onClick={() => navigate('/diario')}
          className="flex items-center gap-2 hover:bg-white/20 px-4 py-2 rounded-full transition-colors font-medium border border-white/20"
        >
          <ArrowLeft size={18} /> Já me sinto melhor
        </button>
        <Heart className="opacity-50" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
        
        {/* Breathing Circle Activity */}
        <div className="relative w-80 h-80 flex items-center justify-center mb-16">
          {/* Pulsing ring 1 */}
          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border border-white/40"
          />
          {/* Pulsing ring 2 */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
            className="absolute inset-8 rounded-full border border-white/50"
          />
          {/* Main Breathing Circle */}
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="w-48 h-48 bg-white/20 backdrop-blur-md rounded-full border border-white/60 shadow-[0_0_60px_rgba(255,255,255,0.3)] flex items-center justify-center"
          >
            <motion.h2 
              className="text-white text-3xl font-serif font-bold italic drop-shadow-md"
              key={breathingText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.5 }}
            >
              {breathingText}
            </motion.h2>
          </motion.div>
        </div>

        {/* Affirmation Carousel */}
        <div className="h-32 flex items-center justify-center max-w-2xl px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="text-2xl md:text-3xl lg:text-4xl font-medium text-white drop-shadow-md leading-tight"
            >
              "{AFFIRMATIONS[index]}"
            </motion.p>
          </AnimatePresence>
        </div>

      </div>

      {/* Footer Spotify / Relaxing ambient */}
      <div className="p-8 pb-16 pt-0 flex flex-col items-center z-10 w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-md w-full rounded-2xl p-4 border border-white/20 flex flex-col items-center justify-center text-white text-sm">
           <div className="flex items-center gap-2 mb-2 font-medium opacity-80">
             <Volume2 size={16} /> <Music size={14} className="opacity-70" />
             Ouça playlists para respirar
           </div>
           
           <div className="flex gap-4 mt-2">
            <a href="https://open.spotify.com/playlist/37i9dQZF1DWZq91oLsHZvy" target="_blank" rel="noreferrer" className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-4 py-2 rounded-full transition-colors text-xs flex items-center gap-2">
              Deep Focus
            </a>
            <a href="https://open.spotify.com/playlist/37i9dQZF1DWUa8ZRTvlZ2C" target="_blank" rel="noreferrer" className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-4 py-2 rounded-full transition-colors text-xs flex items-center gap-2">
              Sleep & Relax
            </a>
           </div>
        </div>
      </div>

    </div>
  );
};

export default MomentoPausa;
