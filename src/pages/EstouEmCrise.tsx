import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, Ambulance, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const FRASES = [
  "Respire. Isso também vai passar.",
  "Você é mais forte do que imagina.",
  "É seguro pedir ajuda.",
  "Não se culpe agora. Abrace a si mesma.",
  "Estamos com você."
];

const EstouEmCrise = () => {
  const [fraseIndex, setFraseIndex] = useState(0);
  const [breathePhase, setBreathePhase] = useState<'inspire' | 'segure' | 'expire'>('inspire');

  useEffect(() => {
    const fraseInterval = setInterval(() => {
      setFraseIndex(prev => (prev + 1) % FRASES.length);
    }, 5000);

    return () => clearInterval(fraseInterval);
  }, []);

  useEffect(() => {
    // 4-7-8 Breathing Cycle
    const runBreathing = async () => {
      setBreathePhase('inspire');
      await new Promise(r => setTimeout(r, 4000));
      setBreathePhase('segure');
      await new Promise(r => setTimeout(r, 7000));
      setBreathePhase('expire');
      await new Promise(r => setTimeout(r, 8000));
      runBreathing();
    };
    runBreathing();
  }, []);

  return (
    <div className="-m-4 lg:-m-8 p-6 lg:p-12 min-h-[calc(100vh-64px)] lg:min-h-screen bg-gradient-to-b from-[#831843] to-[#4c0519] flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background Pulse */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full bg-pink-500 blur-3xl z-0"
      />

      <div className="z-10 w-full max-w-2xl flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tight mb-8">
          Você não está<br/>sozinha.
        </h1>

        <div className="w-full flex-col min-h-[80px] mb-12">
          <AnimatePresence mode="wait">
             <motion.p
               key={fraseIndex}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="text-2xl md:text-3xl text-pink-200 font-serif italic"
             >
               "{FRASES[fraseIndex]}"
             </motion.p>
          </AnimatePresence>
        </div>

        {/* Breathing Circle */}
        <div className="flex flex-col items-center mb-16">
          <motion.div 
            animate={{ 
              scale: breathePhase === 'inspire' ? 1.5 : breathePhase === 'segure' ? 1.5 : 1,
              opacity: breathePhase === 'segure' ? 0.8 : 1
            }}
            transition={{ 
              duration: breathePhase === 'inspire' ? 4 : breathePhase === 'segure' ? 7 : 8,
              ease: "linear" 
            }}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-pink-400 flex items-center justify-center bg-white/10 backdrop-blur-md mb-6 relative"
          >
            <motion.div
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl"
            />
            <span className="text-xl md:text-2xl font-bold uppercase tracking-widest text-white relative z-10 drop-shadow-md">
              {breathePhase}
            </span>
          </motion.div>
          <p className="text-pink-300 font-medium">Técnica de Respiração (4-7-8)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-4">
          <a href="tel:188" className="bg-white hover:bg-gray-100 text-[#831843] py-5 px-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95">
             <Phone className="w-8 h-8"/> Ligar CVV (188)
          </a>
          <a href="https://cvv.org.br/chat/" target="_blank" rel="noreferrer" className="bg-[#D4537E] hover:bg-[#b04066] text-white py-5 px-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95">
             <MessageCircle className="w-8 h-8"/> Chat CVV
          </a>
          <a href="tel:192" className="bg-red-500 hover:bg-red-600 text-white py-5 px-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 md:col-span-2">
             <Ambulance className="w-8 h-8"/> SAMU (192)
          </a>
          <Link to="/rede-de-maes" className="bg-transparent border-2 border-white/30 hover:bg-white/10 text-white py-5 px-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all active:scale-95 md:col-span-2 mt-4">
             <Users className="w-8 h-8"/> Preciso de uma mão amiga
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EstouEmCrise;
