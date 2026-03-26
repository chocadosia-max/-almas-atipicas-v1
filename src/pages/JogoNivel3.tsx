import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart } from 'lucide-react';
import { toast } from "sonner";
import confetti from 'canvas-confetti';

const ITEMS = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨'];

const JogoNivel3 = () => {
  const [cards, setCards] = useState<{id: number, content: string, isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [stars, setStars] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [pairsCount, setPairsCount] = useState(4); // Starts with 4 pairs

  useEffect(() => {
    const saved = localStorage.getItem("kids_estrelas");
    if (saved) setStars(parseInt(saved, 10));
    initializeGame(4);
  }, []);

  const initializeGame = (pairs: number) => {
    const selectedItems = ITEMS.slice(0, pairs);
    const gameCards = [...selectedItems, ...selectedItems]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        content: item,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
  };

  const handleCardClick = (id: number) => {
    // Prevent clicking if 2 cards are already flipped, or if card is already flipped/matched
    if (flippedCards.length === 2) return;
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip card
    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true } 
              : c
          ));
          setFlippedCards([]);
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === pairsCount) {
              handleWin();
            }
            return newMatches;
          });
        }, 800);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
        }, 1200);
      }
    }
  };

  const handleWin = () => {
    setIsWon(true);
    const newStars = stars + 3; // 3 stars for memory game win
    setStars(newStars);
    localStorage.setItem("kids_estrelas", newStars.toString());
    
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A855F7', '#C084FC', '#E879F9']
    });
  };

  const nextLevel = () => {
    const nextPairs = pairsCount < 8 ? pairsCount + 2 : 8;
    setPairsCount(nextPairs);
    initializeGame(nextPairs);
  };

  return (
    <div className="-m-4 lg:-m-8 p-6 lg:p-12 min-h-[calc(100vh-64px)] lg:min-h-screen bg-[#FAF5FF] rounded-none lg:rounded-tl-3xl shadow-inner relative flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/kids" 
          className="bg-white px-6 py-4 rounded-2xl shadow-sm text-[#6B21A8] font-extrabold text-xl flex items-center gap-2 border-b-4 border-purple-200 hover:bg-purple-50 active:border-b-0 active:translate-y-1 transition-all"
        >
          <ArrowLeft size={24} /> Voltar
        </Link>
        <div className="flex items-center gap-2 bg-yellow-100 px-6 py-3 rounded-2xl border-2 border-yellow-300 shadow-sm">
          <Star className="w-8 h-8 text-yellow-500 fill-current" />
          <span className="text-3xl font-black text-yellow-600">{stars}</span>
        </div>
      </div>

      {isWon ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
             initial={{ scale: 0 }}
             animate={{ scale: [0, 1.2, 1], rotate: [0, 10, -10, 0] }}
             transition={{ duration: 0.6 }}
          >
            <Heart className="w-48 h-48 text-purple-500 fill-current mb-8 mx-auto" />
          </motion.div>
          <h1 className="text-5xl font-black text-[#6B21A8] mb-4">Que Memória!</h1>
          <p className="text-2xl text-purple-700 font-bold mb-2">Você encontrou {pairsCount} pares</p>
          <p className="text-lg text-purple-500 font-medium mb-10">usando {moves} tentativas.</p>

          <div className="flex gap-4">
             <button onClick={() => initializeGame(pairsCount)} className="bg-white text-purple-600 border-4 border-purple-200 px-8 py-4 rounded-3xl font-black text-xl hover:bg-purple-50 transition-all">
               Repetir Nível
             </button>
             {pairsCount < 8 && (
               <button onClick={nextLevel} className="bg-[#A855F7] text-white px-8 py-4 rounded-3xl font-black text-xl shadow-[0_8px_0_#7E22CE] active:shadow-none active:translate-y-2 transition-all">
                 Mais Difícil 💪
               </button>
             )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#6B21A8] mb-4 text-center drop-shadow-sm">
            Jogo da Memória
          </h2>
          <div className="text-purple-600 font-bold mb-10 uppercase tracking-widest bg-purple-100 px-6 py-2 rounded-full">
            Tentativas: {moves}
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 w-full px-4">
            {cards.map(card => (
              <motion.div
                key={card.id}
                className="aspect-square relative cursor-pointer"
                onClick={() => handleCardClick(card.id)}
                whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Back of card (visible when initially flipped, showing ?, rotateY 0) */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-md border-4 border-purple-300 flex items-center justify-center text-white/50"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <Star size={40} className="opacity-50" />
                </div>
                
                {/* Front of card (shows emoji, rotateY 180) */}
                <div 
                  className={`absolute inset-0 bg-white rounded-2xl shadow-md border-4 flex items-center justify-center text-6xl md:text-7xl ${card.isMatched ? 'border-green-400 bg-green-50' : 'border-purple-200'}`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {card.content}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JogoNivel3;
