import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Volume2 } from 'lucide-react';
import { toast } from "sonner";

// Game Phases: 1 (Color), 2 (Shape), 3 (Color+Shape)
const COLORS = [
  { id: 'red', hex: '#EF4444' },
  { id: 'blue', hex: '#3B82F6' },
  { id: 'green', hex: '#22C55E' },
  { id: 'yellow', hex: '#EAB308' },
];

const SHAPES = [
  { id: 'square', style: { borderRadius: '16px' } },
  { id: 'circle', style: { borderRadius: '50%' } },
  { id: 'triangle', style: { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius: '4px' } },
];

const JogoNivel1 = () => {
  const [phase, setPhase] = useState(1);
  const [target, setTarget] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [stars, setStars] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("kids_estrelas");
    if (saved) setStars(parseInt(saved, 10));
    generateRound();
  }, []);

  const saveStar = () => {
    const newStars = stars + 1;
    setStars(newStars);
    setSessionStars(prev => prev + 1);
    localStorage.setItem("kids_estrelas", newStars.toString());
  };

  const generateRound = () => {
    setFeedback(null);
    let newTarget: any = {};
    let newOptions: any[] = [];

    const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)];

    if (phase === 1) { // Só cor
      const targetColor = randomColor();
      newTarget = { color: targetColor.hex, shape: SHAPES[0] }; // Quadrado
      newOptions = [targetColor];
      while (newOptions.length < 3) {
        const c = randomColor();
        if (!newOptions.find(o => o.id === c.id)) newOptions.push(c);
      }
      newOptions = newOptions.sort(() => Math.random() - 0.5).map(c => ({ color: c.hex, shape: SHAPES[0], id: c.id }));
    } 
    else if (phase === 2) { // Só forma
      const targetShape = randomShape();
      const fixedColor = COLORS[1]; // Azul
      newTarget = { color: fixedColor.hex, shape: targetShape };
      newOptions = [targetShape];
      while (newOptions.length < 3) {
        const s = randomShape();
        if (!newOptions.find(o => o.id === s.id)) newOptions.push(s);
      }
      newOptions = newOptions.sort(() => Math.random() - 0.5).map(s => ({ color: fixedColor.hex, shape: s, id: s.id }));
    } 
    else { // Cor + Forma
      const targetColor = randomColor();
      const targetShape = randomShape();
      newTarget = { color: targetColor.hex, shape: targetShape, id: `${targetColor.id}-${targetShape.id}` };
      newOptions = [{ color: targetColor.hex, shape: targetShape, id: newTarget.id }];
      while(newOptions.length < 3) {
        const c = randomColor();
        const s = randomShape();
        const id = `${c.id}-${s.id}`;
        if (!newOptions.find(o => o.id === id)) {
           newOptions.push({ color: c.hex, shape: s, id });
        }
      }
      newOptions = newOptions.sort(() => Math.random() - 0.5);
    }

    setTarget(newTarget);
    setOptions(newOptions);
  };

  const handleChoice = (option: any) => {
    if (feedback) return;

    let isCorrect = false;
    if (phase === 1) isCorrect = option.color === target.color;
    else if (phase === 2) isCorrect = option.shape.id === target.shape.id;
    else isCorrect = option.color === target.color && option.shape.id === target.shape.id;

    if (isCorrect) {
      setFeedback('success');
      toast.success("Muito bem! 🌟", { duration: 2000 });
      saveStar();
      setTimeout(() => {
        if (sessionStars >= 4) {
          // You won the session
          toast("Sessão concluída! Vamos voltar?", { duration: 4000 });
        } else {
          // Next phase logic
          if (phase === 1 && sessionStars >= 1) setPhase(2);
          else if (phase === 2 && sessionStars >= 3) setPhase(3);
          generateRound();
        }
      }, 1500);
    } else {
      setFeedback('error');
      toast.error("Tente de novo 💪", { duration: 2000 });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  return (
    <div className="-m-4 lg:-m-8 p-6 lg:p-12 min-h-[calc(100vh-64px)] lg:min-h-screen bg-[#F0FDF4] rounded-none lg:rounded-tl-3xl shadow-inner relative flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/kids" 
          className="bg-white px-6 py-4 rounded-2xl shadow-sm text-[#166534] font-extrabold text-xl flex items-center gap-2 border-b-4 border-gray-200 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all"
        >
          <ArrowLeft size={24} /> Voltar
        </Link>
        <div className="flex items-center gap-2 bg-yellow-100 px-6 py-3 rounded-2xl border-2 border-yellow-300 shadow-sm">
          <Star className="w-8 h-8 text-yellow-500 fill-current" />
          <span className="text-3xl font-black text-yellow-600">{stars}</span>
        </div>
      </div>

      {sessionStars >= 5 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
             initial={{ scale: 0 }}
             animate={{ scale: 1, rotate: 360 }}
             transition={{ type: 'spring', bounce: 0.5 }}
          >
            <Star className="w-48 h-48 text-yellow-400 fill-current mb-8 mx-auto" />
          </motion.div>
          <h1 className="text-5xl font-black text-[#166534] mb-4">Parabéns!</h1>
          <p className="text-2xl text-green-700 font-bold mb-8">Você é brilhante!</p>
          <button onClick={() => { setSessionStars(0); setPhase(1); generateRound(); }} className="bg-[#22C55E] text-white px-10 py-5 rounded-3xl font-black text-2xl shadow-[0_8px_0_#166534] active:shadow-none active:translate-y-2 transition-all">
            Jogar Novamente
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#166534] mb-12 text-center drop-shadow-sm flex items-center gap-4">
            Ache o par igual <Volume2 className="text-green-500" size={36} />
          </h2>

          <div className="bg-white/80 p-8 rounded-[40px] shadow-xl border-4 border-green-100 w-full flex flex-col items-center mb-12 backdrop-blur-sm">
            {target && (
              <motion.div 
                animate={feedback === 'success' ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                className="w-40 h-40 mb-4 shadow-lg flex items-center justify-center"
                style={{
                  backgroundColor: target.shape.id === 'triangle' ? 'transparent' : target.color,
                  ...target.shape.style,
                  ...(target.shape.id === 'triangle' ? { borderBottomColor: target.color } : {})
                }}
              />
            )}
            <p className="text-2xl font-bold text-gray-400 uppercase tracking-widest mt-4">Alvo</p>
          </div>

          <div className="flex justify-center gap-6 md:gap-12 flex-wrap">
            <AnimatePresence>
              {options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0 }}
                  onClick={() => handleChoice(opt)}
                  className={`w-32 h-32 md:w-48 md:h-48 flex items-center justify-center bg-white rounded-3xl shadow-[0_8px_0_#d1d5db] active:shadow-none active:translate-y-2 transition-all p-4 ${feedback === 'error' ? 'pointer-events-none' : ''}`}
                >
                  <div 
                    className="w-20 h-20 md:w-32 md:h-32 shadow-md"
                    style={{
                      backgroundColor: opt.shape.id === 'triangle' ? 'transparent' : opt.color,
                      ...opt.shape.style,
                      ...(opt.shape.id === 'triangle' ? { borderBottomColor: opt.color } : {})
                    }}
                  />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          
          {feedback === 'error' && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-12 text-3xl font-black text-red-500 bg-red-100 px-8 py-4 rounded-full"
             >
                Ah não! Tente de novo!
             </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default JogoNivel1;
