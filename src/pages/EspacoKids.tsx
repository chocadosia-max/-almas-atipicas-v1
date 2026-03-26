import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Rocket, Trophy, Play } from 'lucide-react';

const EspacoKids = () => {
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("kids_estrelas");
    if (saved) setStars(parseInt(saved, 10));
  }, []);

  const cards = [
    {
      id: 1,
      path: "/kids/nivel-1",
      color: "bg-green-400",
      title: "Primeiros Passos",
      desc: "Cores, formas e sons",
      icon: <Star className="w-12 h-12 text-white" />
    },
    {
      id: 2,
      path: "/kids/nivel-2",
      color: "bg-blue-400",
      title: "Explorando",
      desc: "Sequências e padrões",
      icon: <Rocket className="w-12 h-12 text-white" />
    },
    {
      id: 3,
      path: "/kids/nivel-3",
      color: "bg-purple-400",
      title: "Desafios",
      desc: "Memória e atenção",
      icon: <Trophy className="w-12 h-12 text-white" />
    }
  ];

  return (
    <div className="-m-4 lg:-m-8 p-6 lg:p-12 min-h-[calc(100vh-64px)] lg:min-h-screen bg-gradient-to-br from-[#E8D5FF] to-[#D5E8FF] rounded-none lg:rounded-tl-3xl shadow-inner relative overflow-hidden">
      {/* Animated stars in background */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white/60 p-6 lg:p-8 rounded-3xl shadow-sm backdrop-blur-md border border-white/50">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#5B21B6] tracking-tight drop-shadow-sm flex items-center gap-4 text-center md:text-left">
            🧩 Espaço Kids
          </h1>
          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-yellow-100 px-6 py-3 rounded-2xl border-2 border-yellow-300 shadow-sm">
            <Star className="w-8 h-8 text-yellow-500 fill-current" />
            <span className="text-3xl font-black text-yellow-600">{stars}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <Link key={card.id} to={card.path}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className={`${card.color} rounded-3xl p-8 text-center text-white shadow-xl cursor-pointer border-4 border-white/20 relative overflow-hidden group h-full flex flex-col items-center`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                
                <div className="flex justify-center mb-6 mt-4">
                  <div className="bg-white/20 p-5 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                </div>
                
                <h2 className="text-3xl font-black mb-3 drop-shadow-md">{card.title}</h2>
                <p className="text-white/90 font-bold text-xl mb-8 flex-1">{card.desc}</p>
                
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white text-black rounded-full shadow-lg group-hover:bg-yellow-400 group-hover:text-white transition-colors">
                  <Play className="w-8 h-8 ml-1" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EspacoKids;
