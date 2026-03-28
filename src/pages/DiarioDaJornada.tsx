import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Sparkles, Save, Heart, Star, Trash2, 
  Lock, Unlock, ShieldAlert, Calendar, 
  Plus, History, StickyNote, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

type DiarioEntry = {
  id: string;
  date: string;
  type: 'Filho' | 'Maternidade' | 'Pessoal';
  emoji: string;
  text: string;
};

const EMOTIONS = [
  { emoji: '😔', label: 'Cansada', color: 'bg-blue-100 text-blue-600' },
  { emoji: '😐', label: 'Neutre', color: 'bg-gray-100 text-gray-600' },
  { emoji: '🌸', label: 'Grata', color: 'bg-pink-100 text-pink-600' },
  { emoji: '😊', label: 'Feliz', color: 'bg-yellow-100 text-yellow-600' },
  { emoji: '🥳', label: 'Radiante', color: 'bg-orange-100 text-orange-600' },
];

const INSPIRING_PHRASES = [
  "Cada pequeno passo é uma grande vitória.",
  "Você é o mundo para o seu filho.",
  "Sua força é extraordinária, mesmo quando você não sente.",
  "Não há jeito certo de ser uma mãe perfeita, mas milhões de jeitos de ser uma mãe boa.",
  "Celebre o hoje sem se cobrar pelo amanhã.",
  "Sua vulnerabilidade é sua maior coragem.",
  "Pausar não é desistir, é se preparar para continuar."
];

const DiarioDaJornada = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [entries, setEntries] = useState<DiarioEntry[]>([]);
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState<'Filho' | 'Maternidade' | 'Pessoal'>('Filho');
  const [selectedEmoji, setSelectedEmoji] = useState('🌸');
  const [phrase, setPhrase] = useState(INSPIRING_PHRASES[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('diario_entradas');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        setEntries([]);
      }
    }
    const idx = Math.floor(Math.random() * INSPIRING_PHRASES.length);
    setPhrase(INSPIRING_PHRASES[idx]);
    
    // Simular delay de conexão para exibir o skeleton feedback suave (micro-interação)
    setTimeout(() => {
        setIsLoading(false);
    }, 600);
  }, []);

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('O papel ainda está em branco... ✍️');
      return;
    }

    const newEntry: DiarioEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: activeTab,
      emoji: selectedEmoji,
      text: text.trim()
    };

    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    localStorage.setItem('diario_entradas', JSON.stringify(newEntries));
    setText('');
    toast.success('Guardado com carinho no seu diário. 💜');
  };

  const handleDelete = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('diario_entradas', JSON.stringify(updatedEntries));
    toast.success('Página removida.');
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  if (isLocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/50 shadow-2xl flex flex-col items-center text-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-30" />
          
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, -2, 2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 bg-pink-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-pink-500/30 border-4 border-white/40"
          >
            <Lock size={48} className="text-white" />
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black text-gray-800 leading-tight">Área Estritamente <span className="text-pink-500">Pessoal</span></h2>
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-100/50 rounded-full border border-pink-200">
               <ShieldAlert size={14} className="text-pink-600" />
               <span className="text-[10px] font-black text-pink-700 uppercase tracking-widest">Apenas você tem acesso</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Este espaço foi criado para ser o seu santuário. Suas palavras, suas dores e suas vitórias estão seguras aqui.
          </p>

          <button 
            onClick={handleUnlock}
            aria-label="Destrancar e abrir o diário secreto"
            className="group relative w-full py-5 bg-gray-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-pink-600 transition-all active:scale-95 overflow-hidden flex items-center justify-center gap-3 uppercase text-xs tracking-widest focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-500"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
            <Unlock size={18} className="group-hover:rotate-12 transition-transform" />
            Abrir Diário
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto pb-20 px-4">
      {/* Opening Animation Overlay */}
      <AnimatePresence>
         <motion.div 
            key="unlock-curtain"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            onAnimationComplete={() => {}}
            className="fixed inset-0 z-[999] pointer-events-none flex items-center justify-center bg-white"
         >
            <motion.div 
               initial={{ scale: 1, rotate: 0 }}
               animate={{ scale: 15, rotate: 45, opacity: 0 }}
               transition={{ duration: 1, ease: "easeInOut" }}
               className="w-40 h-40 bg-pink-500 rounded-[3rem] flex items-center justify-center"
            >
               <Unlock size={64} className="text-white" />
            </motion.div>
         </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Sidebar / Stats */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/40 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white/50 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-pink-500/20">
                <StickyNote size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Minha Jornada</span>
                <h1 className="text-2xl font-black text-gray-800">Meu Diário</h1>
              </div>
            </div>

            <div className="space-y-4">
               <div className="p-5 bg-white/60 rounded-[2rem] border border-white flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Páginas Escritas</span>
                    <span className="text-2xl font-black text-gray-800">{entries.length}</span>
                  </div>
                  <Calendar size={20} className="text-pink-400" />
               </div>
               
               <div className="p-6 bg-pink-500 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                  <Quote size={40} className="absolute -bottom-2 -right-2 opacity-10" />
                  <p className="text-sm font-bold italic leading-relaxed text-pink-50 relative z-10">"{phrase}"</p>
               </div>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-gray-900 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
             <h3 className="text-lg font-black mb-4 flex items-center gap-2"><History size={18} className="text-pink-400" /> Histórico Semanal</h3>
             <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'bg-white/10'}`} />
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: i < 3 ? '100%' : '0%' }} className="h-full bg-pink-500" transition={{ delay: 0.5 + i*0.1 }} />
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* New Entry Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-3xl p-8 lg:p-10 rounded-[4rem] border border-white shadow-2xl shadow-pink-500/5"
          >
            <div className="flex bg-gray-100/50 p-1.5 rounded-[2.5rem] mb-8 border border-gray-200/30">
              {['Filho', 'Maternidade', 'Pessoal'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  aria-label={`Mudar categoria para ${tab}`}
                  className={`flex-1 py-4 px-6 rounded-[2rem] text-[10px] font-black tracking-widest uppercase transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 ${
                    activeTab === tab 
                      ? 'bg-white text-pink-600 shadow-xl scale-[1.02]' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'Filho' ? '🧒 Pequenas Vitórias' : tab === 'Maternidade' ? '🤱 Meu Maternar' : '🧘 Momento Eu'}
                </button>
              ))}
            </div>

            <div className="mb-10 text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Como você se sente?</span>
              <div className="flex justify-center flex-wrap gap-4 lg:gap-6">
                {EMOTIONS.map(emo => (
                  <button
                    key={emo.emoji}
                    onClick={() => setSelectedEmoji(emo.emoji)}
                    aria-label={`Sentindo-se ${emo.label}`}
                    className={`group flex flex-col items-center gap-2 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 rounded-[2rem] p-1 ${
                      selectedEmoji === emo.emoji ? 'scale-110' : 'opacity-40 grayscale-[50%] hover:opacity-70 hover:grayscale-0'
                    }`}
                  >
                    <div className={`text-3xl w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all ${
                      selectedEmoji === emo.emoji ? 'bg-white shadow-2xl ring-4 ring-pink-500/20' : 'bg-gray-100 shadow-inner'
                    }`}>
                      {emo.emoji}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${selectedEmoji === emo.emoji ? 'text-pink-500' : 'text-gray-400'}`}>{emo.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
               <textarea
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 placeholder={`Escreva aqui o que o coração pedir hoje...`}
                 className="w-full h-56 p-8 bg-white/30 border-2 border-dashed border-gray-200 focus:border-pink-300 focus:bg-white rounded-[3rem] outline-none text-gray-800 placeholder:text-gray-300 transition-all resize-none mb-6 font-medium leading-relaxed shadow-inner"
               />
               <div className="absolute bottom-10 right-10 opacity-20 group-focus-within:opacity-10 transition-opacity">
                  <Plus size={40} className="text-pink-300" />
               </div>
            </div>

            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <ShieldAlert size={14} className="text-pink-400" /> Criptografado Localmente
               </div>
               <button
                 onClick={handleSave}
                 aria-label="Salvar nova página no diário"
                 className="px-10 py-5 rounded-[2rem] bg-pink-600 hover:bg-gray-900 text-white font-black flex items-center gap-3 shadow-2xl shadow-pink-500/30 transition-all active:scale-95 group focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-400"
               >
                 <Save size={18} className="group-hover:rotate-12 transition-transform" />
                 <span className="text-xs uppercase tracking-widest">Salvar no Diário</span>
               </button>
            </div>
          </motion.div>

          {/* Feed of entries */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
               <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                 Páginas de Recordação
               </h2>
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{entries.length} Entradas</div>
            </div>
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="skeleton-loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                   {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="bg-white/60 backdrop-blur-xl rounded-[3.5rem] border border-white p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                         <Skeleton className="w-20 h-20 rounded-[2.5rem] bg-pink-100/50 shrink-0" />
                         <div className="flex-1 space-y-4">
                            <Skeleton className="h-4 w-24 bg-pink-100/50 rounded-full" />
                            <div className="space-y-2">
                               <Skeleton className="h-3 w-3/4 bg-gray-100 rounded-full" />
                               <Skeleton className="h-3 w-1/2 bg-gray-100 rounded-full" />
                            </div>
                         </div>
                      </div>
                   ))}
                </motion.div>
              ) : entries.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white/20 backdrop-blur-sm rounded-[4rem] border-2 border-dashed border-white/50 text-gray-400 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center text-4xl shadow-xl shadow-pink-500/5 mb-4">📝</div>
                  <p className="font-black text-sm uppercase tracking-widest">Seu diário ainda está em silêncio...</p>
                  <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed">As memórias que você guardar hoje serão tesouros amanhã.</p>
                </motion.div>
              ) : (
                <motion.div key="entries-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-6">
                  {entries.map((entry, i) => (
                    <motion.div 
                      key={entry.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white/60 hover:bg-white backdrop-blur-xl rounded-[3.5rem] border border-white p-8 transition-all hover:shadow-2xl hover:-translate-y-1 relative"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                           <div className="text-4xl bg-pink-50 w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                             {entry.emoji}
                           </div>
                           <div className="flex flex-col">
                              <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                entry.type === 'Filho' ? 'bg-blue-50 text-blue-500 border-blue-100' : 
                                entry.type === 'Maternidade' ? 'bg-pink-50 text-pink-500 border-pink-100' : 
                                'bg-gray-50 text-gray-500 border-gray-100'
                              } mb-2 w-fit`}>
                                {entry.type === 'Filho' ? '🧒 Filho' : entry.type === 'Maternidade' ? '🤱 Maternidade' : '🧘 Pessoal'}
                              </span>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar size={12} className="text-pink-300" />
                                {format(new Date(entry.date), "dd 'de' MMMM, yyyy", { locale: ptBR })} • {format(new Date(entry.date), "HH:mm")}
                              </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(entry.id)}
                          aria-label="Excluir esta página do diário"
                          className="opacity-0 group-hover:opacity-100 p-4 text-gray-300 hover:text-red-500 bg-gray-50 rounded-full transition-all hover:bg-red-50 focus:opacity-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <article className="relative">
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-pink-500/5 rounded-full blur-xl" />
                        <p className="text-gray-700 font-medium leading-[1.8] text-sm whitespace-pre-wrap relative z-10 pl-2">
                          {entry.text}
                        </p>
                      </article>
                      
                      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                         <div className="flex gap-1 text-pink-500">
                           <Heart size={14} fill="currentColor" />
                           <Heart size={14} fill="currentColor" />
                         </div>
                         <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </main>
  );
};

export default DiarioDaJornada;
