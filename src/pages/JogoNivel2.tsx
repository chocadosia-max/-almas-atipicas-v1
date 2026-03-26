import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

const PATTERNS = [
  { seq: ['🐱', '🐶', '🐱'], answer: '🐶', options: ['🐶', '🐰', '🐸', '🐷'] },
  { seq: ['🚗', '🚗', '🚌'], answer: '🚗', options: ['🚗', '🚜', '🚲', '🚌'] },
  { seq: ['🍎', '🍌', '🍎'], answer: '🍌', options: ['🍎', '🍇', '🍉', '🍌'] },
  { seq: ['☀️', '🌙', '⭐', '☀️', '🌙'], answer: '⭐', options: ['☀️', '☁️', '⭐', '🌙'] },
  { seq: ['🟥', '🟦', '🟨', '🟥', '🟦'], answer: '🟨', options: ['🟩', '🟨', '🟧', '🟪'] },
  { seq: ['🚀', '🛸', '🚀', '🛸'], answer: '🚀', options: ['🌎', '⭐', '🚀', '🛸'] },
  { seq: ['🐸', '🐸', '🐷', '🐸', '🐸'], answer: '🐷', options: ['🐱', '🐷', '🐶', '🐭'] },
  { seq: ['🍦', '🍩', '🍪', '🍦', '🍩'], answer: '🍪', options: ['🍫', '🍬', '🍪', '🍩'] },
];

const JogoNivel2 = () => {
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kids_estrelas");
    if (saved) setStars(parseInt(saved, 10));
  }, []);

  const currentPattern = PATTERNS[round];

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3B82F6', '#60A5FA', '#93C5FD']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3B82F6', '#60A5FA', '#93C5FD']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const saveStar = () => {
    const newStars = stars + 1;
    setStars(newStars);
    localStorage.setItem("kids_estrelas", newStars.toString());
  };

  const handleChoice = (emoji: string) => {
    if (feedback) return;

    if (emoji === currentPattern.answer) {
      setFeedback('success');
      saveStar();
      setSessionScore(prev => prev + 1);
      
      if (round === PATTERNS.length - 1) {
        triggerConfetti();
      } else {
        setTimeout(() => {
          setRound(r => r + 1);
          setFeedback(null);
        }, 1500);
      }
    } else {
      setFeedback('error');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const resetGame = () => {
    setRound(0);
    setSessionScore(0);
    setFeedback(null);
  };

  return (
    <div className="-m-4 lg:-m-8 p-6 lg:p-12 min-h-[calc(100vh-64px)] lg:min-h-screen bg-[#EFF6FF] rounded-none lg:rounded-tl-3xl shadow-inner relative flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/kids" 
          className="bg-white px-6 py-4 rounded-2xl shadow-sm text-[#1E3A8A] font-extrabold text-xl flex items-center gap-2 border-b-4 border-blue-200 hover:bg-blue-50 active:border-b-0 active:translate-y-1 transition-all"
        >
          <ArrowLeft size={24} /> Voltar
        </Link>
        <div className="flex items-center gap-2 bg-yellow-100 px-6 py-3 rounded-2xl border-2 border-yellow-300 shadow-sm">
          <Star className="w-8 h-8 text-yellow-500 fill-current" />
          <span className="text-3xl font-black text-yellow-600">{stars}</span>
        </div>
      </div>

      {round === PATTERNS.length - 1 && feedback === 'success' ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <PartyPopper className="w-48 h-48 text-blue-500 mb-8 mx-auto animate-bounce" />
          <h1 className="text-5xl font-black text-[#1E3A8A] mb-4">Incrível!</h1>
          <p className="text-2xl text-blue-700 font-bold mb-8">Você completou todos os desafios!</p>
          <button onClick={resetGame} className="bg-[#3B82F6] text-white px-10 py-5 rounded-3xl font-black text-2xl shadow-[0_8px_0_#1E3A8A] active:shadow-none active:translate-y-2 transition-all">
            Jogar Novamente
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <div className="mb-4 bg-blue-100 text-blue-800 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm">
            Fase {round + 1} de {PATTERNS.length}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1E3A8A] mb-12 text-center drop-shadow-sm">
            O que vem depois?
          </h2>

          <div className="flex items-center justify-center gap-4 bg-white/80 p-8 md:p-12 rounded-[40px] shadow-xl border-4 border-blue-100 w-full mb-12 backdrop-blur-sm">
             {currentPattern.seq.map((emoji, idx) => (
               <div key={idx} className="text-5xl md:text-7xl">{emoji}</div>
             ))}
             <div className="text-5xl md:text-7xl w-16 md:w-24 h-16 md:h-24 bg-gray-100 border-4 border-dashed border-gray-300 rounded-3xl flex items-center justify-center animate-pulse">
               {feedback === 'success' ? currentPattern.answer : '?'}
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl px-4">
            <AnimatePresence>
              {currentPattern.options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice(opt)}
                  className={`aspect-square flex items-center justify-center text-6xl md:text-7xl bg-white rounded-3xl shadow-[0_8px_0_#93C5FD] active:shadow-none active:translate-y-2 transition-all p-4 border-2 border-blue-50 ${feedback === 'error' ? 'opacity-80' : ''}`}
                >
                  {opt}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          
          {feedback === 'error' && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="mt-8 text-2xl font-black text-red-500 bg-red-100 px-8 py-4 rounded-full"
             >
                Você consegue! Tente outro.
             </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default JogoNivel2;
