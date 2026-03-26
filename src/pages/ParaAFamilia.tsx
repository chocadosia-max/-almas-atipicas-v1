import React from 'react';
import { HeartHandshake, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';

const DICAS = [
  { título: "Não julgue o comportamento", desc: "Crises não são birras. Elas acontecem por sobrecarga sensorial ou emocional." },
  { título: "Ofereça ajuda prática", desc: "Em vez de dizer 'se precisar, avise', diga 'estou levando o jantar hoje' ou 'posso ficar com ele por 2 horas para você dormir?'" },
  { título: "Cuidado com palpites", desc: "A mãe atípica já pesquisa intensamente. Não compare a criança com outras ou sugira soluções milagrosas." },
  { título: "Seja um porto seguro", desc: "Acolha a mãe sem cobrar explicações o tempo todo. Um abraço vale mais que mil conselhos." },
];

const ParaAFamilia = () => {
  return (
    <div className="max-w-5xl mx-auto pb-12 w-full">
      {/* Hero */}
      <div className="bg-white/65 shadow-[0_20px_40px_-15px_rgba(212,83,126,0.2)] backdrop-blur-[12px] rounded-[32px] border border-white/60 p-10 md:p-14 mb-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4537E] to-[#F4C0D1]"></div>
        <HeartHandshake className="w-16 h-16 text-[#D4537E] mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#4B1528] font-serif tracking-tight mb-4">
          Rede de Apoio: Família
        </h1>
        <p className="text-lg md:text-xl text-[#72243E]/80 max-w-2xl mx-auto font-medium">
          O diagnóstico não é apenas da criança, mas de toda a família. Entenda como você pode ser o suporte que essa mãe realmente precisa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Myths vs Facts */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-2xl font-bold text-[#4B1528] flex items-center gap-2 px-2">
            <BookOpen className="text-pink-500" /> Entendendo o TEA
          </h2>
          
          <div className="bg-[#4B1528] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-bold mb-6 text-pink-200">Mitos e Verdades</h3>
            
            <div className="space-y-6 relative z-10">
               <div className="border-l-4 border-red-400 pl-4 bg-white/5 p-4 rounded-r-2xl">
                  <p className="text-red-300 font-bold uppercase text-xs mb-1 flex items-center gap-1"><AlertCircle size={14} /> Mito</p>
                  <p className="font-medium text-lg">"Ele não tem cara de autista."</p>
                  <p className="text-sm mt-2 text-white/70">O autismo não possui traços físicos. É uma condição neurológica.</p>
               </div>
               
               <div className="border-l-4 border-green-400 pl-4 bg-white/5 p-4 rounded-r-2xl">
                  <p className="text-green-300 font-bold uppercase text-xs mb-1 flex items-center gap-1"><CheckCircle size={14} /> Verdade</p>
                  <p className="font-medium text-lg">"O diagnóstico precoce muda tudo."</p>
                  <p className="text-sm mt-2 text-white/70">Intervenções terapêuticas cedo trazem muito mais qualidade de vida e autonomia.</p>
               </div>
               
               <div className="border-l-4 border-red-400 pl-4 bg-white/5 p-4 rounded-r-2xl">
                  <p className="text-red-300 font-bold uppercase text-xs mb-1 flex items-center gap-1"><AlertCircle size={14} /> Mito</p>
                  <p className="font-medium text-lg">"É só falta de limite/disciplina."</p>
                  <p className="text-sm mt-2 text-white/70">Comportamentos no TEA são frequentemente respostas à desregulação sensorial, não má criação.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Practical Help */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-2xl font-bold text-[#4B1528] flex items-center gap-2 px-2">
            <HeartHandshake className="text-pink-500" /> Como Ajudar na Prática
          </h2>
          
          <div className="space-y-4">
            {DICAS.map((dica, idx) => (
               <div key={idx} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white hover:border-pink-300 transition-colors shadow-sm gap-4 flex flex-col items-start group">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-black shrink-0 group-hover:scale-110 transition-transform">
                     {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#4B1528] text-lg mb-2">{dica.título}</h4>
                    <p className="text-[#4B1528]/70 leading-relaxed text-sm">
                       {dica.desc}
                    </p>
                  </div>
               </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ParaAFamilia;
