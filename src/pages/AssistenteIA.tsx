import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Scale, BookOpen, Stethoscope, 
  HelpCircle, ChevronRight, User, Bot, MapPin, 
  FileText, Briefcase, Heart, AlertCircle, Info, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  category?: string;
}

const SUGGESTIONS = [
  { id: 'direitos', label: 'Direitos na Escola', icon: Scale, color: 'bg-blue-500' },
  { id: 'saude', label: 'Plano de Saúde/ANS', icon: Stethoscope, color: 'bg-green-500' },
  { id: 'rotina', label: 'Dicas de Rotina', icon: BookOpen, color: 'bg-orange-500' },
  { id: 'crise', label: 'Manejo de Crise', icon: AlertCircle, color: 'bg-red-500' },
];

const INITIAL_MESSAGE = "Olá, mamãe! Sou a Comi, sua assistente inteligente. Estou aqui para te ajudar com dúvidas sobre leis, direitos, rotinas e acolhimento. Como posso te apoiar hoje?";

const AssistenteIA = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat_messages');
    return saved ? JSON.parse(saved).map((m: any) => ({...m, timestamp: new Date(m.timestamp)})) : [
      { id: '1', type: 'bot', content: INITIAL_MESSAGE, timestamp: new Date() }
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string, category?: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      category
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulando Resposta da IA (RAG fake por enquanto)
    setTimeout(() => {
      let botResponse = "Interessante sua pergunta! Deixa eu verificar no meu banco de dados de leis e cartilhas... ";
      
      if (content.toLowerCase().includes("escola") || content.toLowerCase().includes("apoio")) {
        botResponse = "Segundo a Lei Berenice Piana (12.764/12) e a LBI, seu filho tem direito a um acompanhante terapêutico ou professor de apoio especializado sem custo extra na mensalidade escolar. A escola não pode recusar a matrícula!";
      } else if (content.toLowerCase().includes("plano") || content.toLowerCase().includes("ans")) {
        botResponse = "A ANS determinou que não há mais limites de sessões de fono, T.O. e psicologia para autismo e neurodivergências. O plano de saúde deve cobrir 100% das terapias prescritas pelo seu médico.";
      } else if (content.toLowerCase().includes("sono") || content.toLowerCase().includes("dormir")) {
        botResponse = "Para o sono, o ideal é criar uma 'higiene sensorial' 1 hora antes: luz baixa, nada de telas e talvez um banho morno com sabonete de lavanda. Quer que eu te ajude a montar um quadro de rotina visual para o sono?";
      } else {
        botResponse = "Entendi sua preocupação. Esta é uma jornada desafiadora mas você não está sozinha. Como este é um protótipo, no futuro eu terei acesso a todos os PDFs de leis que você me enviar para dar respostas 100% precisas!";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const clearChat = () => {
    if (window.confirm("Deseja apagar todo o histórico de conversa?")) {
      setMessages([{ id: '1', type: 'bot', content: INITIAL_MESSAGE, timestamp: new Date() }]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white/50 p-4 rounded-3xl border border-pink-100 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--rosa-forte)] to-[var(--rosa-medio)] flex items-center justify-center text-white shadow-lg shadow-pink-200">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--texto-escuro)]">Assistente Comigo</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Inteligência Ativa</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-3 text-[var(--texto-claro)] hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          title="Limpar Conversa"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white/40 rounded-[2.5rem] border border-white/60 shadow-inner overflow-hidden flex flex-col relative mb-4">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-pink-200"
        >
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    message.type === 'user' ? 'bg-white text-[var(--rosa-forte)]' : 'bg-[var(--rosa-forte)] text-white'
                  }`}>
                    {message.type === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div>
                    <div className={`p-4 md:p-5 rounded-3xl shadow-sm leading-relaxed ${
                      message.type === 'user' 
                      ? 'bg-gradient-to-br from-[var(--rosa-forte)] to-[var(--rosa-medio)] text-white' 
                      : 'bg-white text-[var(--texto-medio)] border border-pink-50'
                    }`}>
                      <p className="text-sm md:text-base font-medium">{message.content}</p>
                    </div>
                    <span className="text-[10px] text-[var(--texto-claro)] font-bold mt-1.5 block px-2">
                       {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--rosa-forte)] text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={20} />
              </div>
              <div className="bg-white p-4 rounded-3xl border border-pink-50 flex gap-1">
                <span className="w-1.5 h-1.5 bg-pink-200 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating Tooltip/Info */}
        <div className="mx-6 mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-3">
          <Info className="text-blue-500 shrink-0" size={16} />
          <p className="text-[10px] text-blue-700 font-bold leading-tight uppercase tracking-tighter">
            Esta IA usa as leis LBI e Berenice Piana como base. Sempre valide com seu advogado ou médico.
          </p>
        </div>
      </div>

      {/* Sugestões Rápidas */}
      {messages.length < 3 && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
           {SUGGESTIONS.map((s) => (
             <button
               key={s.id}
               onClick={() => handleSend(s.label, s.id)}
               className="flex items-center gap-2 px-4 py-2 bg-white border border-pink-100 rounded-full text-xs font-bold text-[var(--texto-medio)] hover:border-[var(--rosa-forte)] hover:text-[var(--rosa-forte)] transition-all shadow-sm active:scale-95"
             >
               <s.icon size={14} className="text-[var(--rosa-forte)]" />
               {s.label}
             </button>
           ))}
        </div>
      )}

      {/* Bar Input */}
      <div className="relative">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Tire sua dúvida jurídica ou comportamental..."
          className="w-full h-16 pl-6 pr-16 bg-white rounded-3xl border-2 border-pink-100 focus:border-[var(--rosa-forte)] outline-none shadow-xl text-[var(--texto-escuro)] font-medium placeholder:text-[var(--texto-claro)]"
        />
        <button 
          onClick={() => handleSend(input)}
          className="absolute right-2 top-2 w-12 h-12 bg-gradient-to-tr from-[var(--rosa-forte)] to-[var(--rosa-medio)] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AssistenteIA;
