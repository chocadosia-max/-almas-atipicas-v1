import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sparkles, Save, Heart, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type DiarioEntry = {
  id: string;
  date: string;
  type: 'Conquista do Filho' | 'Conquista Minha';
  emoji: string;
  text: string;
};

const EMOTIONS = ['😔', '😐', '🌸', '😊', '🥳'];
const INSPIRING_PHRASES = [
  "Cada pequeno passo é uma grande vitória.",
  "Você é o mundo para o seu filho.",
  "Sua força é extraordinária, mesmo quando você não sente.",
  "Não há jeito certo de ser uma mãe perfeita, mas milhões de jeitos de ser uma mãe boa.",
  "Celebre o hoje sem se cobrar pelo amanhã."
];

const DiarioDaJornada = () => {
  const [entries, setEntries] = useState<DiarioEntry[]>([]);
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState<'Conquista do Filho' | 'Conquista Minha'>('Conquista do Filho');
  const [selectedEmoji, setSelectedEmoji] = useState('🌸');
  const [phrase, setPhrase] = useState(INSPIRING_PHRASES[0]);

  useEffect(() => {
    const saved = localStorage.getItem('diario_entradas');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
    const idx = Math.floor(Math.random() * INSPIRING_PHRASES.length);
    setPhrase(INSPIRING_PHRASES[idx]);
  }, []);

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('Escreva algo antes de salvar!');
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
    toast.success('Página do diário salva com sucesso! 💜');
  };

  const handleDelete = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('diario_entradas', JSON.stringify(updatedEntries));
    toast.success('Registro excluído com sucesso.');
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Hero */}
      <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-8 mb-8 text-center relative overflow-hidden">
        <Sparkles className="absolute top-4 left-4 text-[var(--rosa-forte)] w-6 h-6 opacity-50" />
        <Star className="absolute bottom-4 right-4 text-[var(--rosa-forte)] w-6 h-6 opacity-50" />
        <h1 className="text-3xl lg:text-4xl font-bold text-[var(--texto-escuro)] mb-4 font-serif">
          Meu Diário Emocional
        </h1>
        <p className="text-lg text-[var(--texto-medio)] italic max-w-2xl mx-auto">"{phrase}"</p>
      </div>

      {/* Editor */}
      <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-6 lg:p-8 mb-12">
        <div className="flex bg-[var(--hover-bg)] p-1 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('Conquista do Filho')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'Conquista do Filho' 
                ? 'bg-white text-[var(--texto-escuro)] shadow-sm' 
                : 'text-[var(--texto-claro)] hover:text-[var(--texto-medio)]'
            }`}
          >
            Conquista do Filho 🧒
          </button>
          <button
            onClick={() => setActiveTab('Conquista Minha')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'Conquista Minha' 
                ? 'bg-white text-[var(--texto-escuro)] shadow-sm' 
                : 'text-[var(--texto-claro)] hover:text-[var(--texto-medio)]'
            }`}
          >
            Conquista Minha Maternidade 🤱
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center">
          <label className="text-sm font-bold text-[var(--texto-escuro)] mb-3">Como você está se sentindo sobre isso?</label>
          <div className="flex gap-4">
            {EMOTIONS.map(emo => (
              <button
                key={emo}
                onClick={() => setSelectedEmoji(emo)}
                className={`text-3xl w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                  selectedEmoji === emo ? 'bg-[var(--ativo-bg)] ring-2 ring-[var(--rosa-forte)] scale-110' : 'bg-[var(--hover-bg)] grayscale-[30%]'
                }`}
              >
                {emo}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Como foi o seu dia? O que marcou a sua jornada como ${activeTab === 'Conquista do Filho' ? 'mãe' : 'mulher'} hoje?`}
          className="w-full h-40 p-6 bg-white/50 border border-white/60 focus:border-[var(--rosa-forte)] rounded-2xl outline-none text-[var(--texto-escuro)] placeholder:text-[var(--texto-claro)] transition-colors resize-none mb-6"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-xl bg-[var(--rosa-forte)] hover:bg-[#b04066] text-white font-bold flex items-center gap-2 shadow-lg shadow-[var(--rosa-forte)]/20 transition-all active:scale-95"
          >
            <Save size={18} />
            Salvar no diário
          </button>
        </div>
      </div>

      {/* Histórico */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--texto-escuro)] mb-6 font-serif flex items-center gap-2">
          <Heart className="text-[var(--rosa-forte)]" />
          Páginas Anteriores
        </h2>
        
        {entries.length === 0 ? (
          <div className="text-center p-12 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/30 text-[var(--texto-claro)]">
            Seu diário ainda está em branco. Comece a escrever a sua jornada hoje!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map(entry => (
              <div key={entry.id} className="bg-white/65 shadow-md backdrop-blur-[8px] rounded-2xl border border-white/40 p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[var(--ativo-bg)] text-[var(--texto-escuro)] mb-2">
                      {entry.type}
                    </span>
                    <div className="text-xs text-[var(--texto-claro)] uppercase tracking-wider font-semibold">
                      {format(new Date(entry.date), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="text-3xl bg-[var(--hover-bg)] w-12 h-12 rounded-full flex items-center justify-center">
                      {entry.emoji}
                    </div>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Excluir registro"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-[var(--texto-medio)] whitespace-pre-wrap leading-relaxed">
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiarioDaJornada;
