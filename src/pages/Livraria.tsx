import React, { useState } from 'react';
import { Book, Download, Eye, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIAS = ['Todos', 'Direitos', 'Rotinas', 'Autocuidado', 'Comportamento', 'Inclusão'];

const Livraria = () => {
  const [filtroCat, setFiltroCat] = useState('Todos');
  const [previewBook, setPreviewBook] = useState<any | null>(null);

  const [books, setBooks] = useState<any[]>(() => {
    const saved = localStorage.getItem('almas_ebooks_2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Atualiza hooks quando custom hooks do painel editarem o local storage
  React.useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('almas_ebooks_2');
      if (saved) {
        try { setBooks(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    // Para funcionar na mesma aba com atualizações locais customizadas (opcional)
    const interval = setInterval(handleStorage, 1000); 
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const filtereds = filtroCat === 'Todos' ? books : books.filter(b => b.cat === filtroCat);

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      {/* Hero */}
      <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-10 mb-8 text-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNENDUzN0UiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]">
        <Book className="mx-auto w-12 h-12 text-[var(--texto-medio)] mb-4" />
        <h1 className="text-4xl font-bold text-[var(--texto-escuro)] mb-4 font-serif">
          Conhecimento que transforma
        </h1>
        <p className="text-[var(--texto-medio)] max-w-2xl mx-auto text-lg mb-8">
          A informação é a sua arma mais poderosa. Nossa biblioteca reúne os melhores e-books, guias práticos e materiais visuais para a jornada atípica.
        </p>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIAS.map(cat => (
            <button 
              key={cat}
              onClick={() => setFiltroCat(cat)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                filtroCat === cat 
                  ? 'bg-[var(--rosa-forte)] text-white shadow-md' 
                  : 'bg-white/60 text-[var(--texto-claro)] hover:bg-white/80 hover:text-[var(--texto-escuro)] border border-white/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid ou Empty State */}
      {filtereds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtereds.map((book) => (
            <div key={book.id} className="group bg-white/65 shadow-md backdrop-blur-[8px] rounded-3xl border border-white/40 p-5 hover:shadow-xl transition-all flex flex-col h-full cursor-pointer" onClick={() => setPreviewBook(book)}>
              
              {/* Capa CSS com Animação 3D de Folhear (1:1) */}
              <div className="w-full aspect-square relative perspective-[1200px] mb-4">
                <div className="w-full h-full relative preserve-3d group-hover:-rotate-y-12 transition-transform duration-500 bg-white shadow-xl origin-left rounded-r-xl border border-gray-100 flex items-center justify-center p-2">
                   
                   {/* Conteúdo / Imagem Real ou Gradiente */}
                   {book.coverUrl ? (
                     <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover rounded shadow-inner max-w-full" />
                   ) : (
                     <div className={`w-full h-full rounded bg-gradient-to-br ${book.color || 'from-gray-400 to-gray-600'} flex flex-col justify-between p-4 shadow-inner relative overflow-hidden text-white`}>
                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20 border-r border-black/30"></div>
                        <div className="z-10 pl-3">
                          <span className="text-[9px] uppercase tracking-widest font-bold opacity-80">{book.cat}</span>
                          <h3 className="font-serif font-bold text-lg leading-tight mt-1 drop-shadow-md">{book.title}</h3>
                        </div>
                        <div className="z-10 pl-3 font-medium text-[10px] opacity-90 drop-shadow-sm">
                          {book.autor}
                        </div>
                     </div>
                   )}
  
                   {/* Efeito de Página (Folhear) - Aparece sobre a capa no hover */}
                   <div className="absolute inset-y-0 right-0 left-0 bg-white rounded-r-xl origin-left transform rotate-y-0 opacity-0 group-hover:opacity-100 group-hover:-rotate-y-45 transition-all duration-700 ease-in-out flex flex-col p-4 shadow-[-5px_0_15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden pointer-events-none z-20">
                      <div className="h-full border border-gray-100 p-3 opacity-90 flex flex-col gap-2">
                         <h4 className="font-black text-[10px] uppercase text-gray-400">Sumário Exclusivo</h4>
                         <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                         <div className="h-2 w-full bg-gray-100 rounded"></div>
                         <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                         <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                      </div>
                   </div>
  
                </div>
              </div>
  
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    book.type === 'Gratuito' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {book.type}
                  </span>
                  {book.type === 'Premium' && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                </div>
                <h4 className="font-bold text-[var(--texto-escuro)] text-lg mb-1 leading-snug">{book.title}</h4>
                <p className="text-[var(--texto-claro)] text-sm mb-4 line-clamp-2">{book.desc}</p>
              </div>
              
              <button className="w-full py-2.5 rounded-xl bg-[var(--ativo-bg)] text-[var(--texto-escuro)] font-bold group-hover:bg-[var(--rosa-forte)] group-hover:text-white transition-colors">
                Detalhes
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white/50 rounded-3xl border border-dashed border-[var(--rosa-medio)] text-center">
          <div className="w-16 h-16 bg-[var(--rosa-forte)]/10 rounded-full flex items-center justify-center mb-4">
            <Book className="text-[var(--rosa-forte)] w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-[var(--texto-escuro)] mb-2">Nenhum {filtroCat === 'Todos' ? 'e-book' : `e-book de ${filtroCat}`} encontrado.</h3>
          <p className="text-[var(--texto-medio)] text-sm max-w-sm">
            No momento, nossa biblioteca para esta categoria está sendo preparada com os melhores materiais pelos administradores. Volte em breve!
          </p>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl border border-white/50 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className={`md:w-2/5 aspect-[3/4] md:aspect-auto bg-gradient-to-br ${previewBook.color} p-8 flex flex-col justify-center text-white relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.1)]`}>
                 <div className="absolute left-0 top-0 bottom-0 w-8 bg-black/20 border-r border-black/30"></div>
                 <div className="pl-6 z-10 text-center">
                    <Book className="w-12 h-12 mx-auto mb-6 opacity-80" />
                    <h2 className="font-serif font-bold text-3xl leading-snug mb-4 drop-shadow-lg">{previewBook.title}</h2>
                    <p className="font-medium opacity-90 text-lg">{previewBook.autor}</p>
                 </div>
              </div>

              <div className="md:w-3/5 p-8 lg:p-12 flex flex-col relative overflow-y-auto">
                <button 
                  onClick={() => setPreviewBook(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-[var(--hover-bg)] text-[var(--texto-claro)] hover:text-[var(--texto-escuro)] hover:bg-[var(--ativo-bg)] transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="mb-6">
                  <span className={`inline-block mb-3 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    previewBook.type === 'Gratuito' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {previewBook.type}
                  </span>
                  <h2 className="text-3xl font-bold text-[var(--texto-escuro)] mb-2">{previewBook.title}</h2>
                  <p className="text-[var(--texto-claro)] font-medium">por {previewBook.autor} • {previewBook.cat}</p>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-[var(--texto-escuro)] mb-2">Sobre este guia</h3>
                  <p className="text-[var(--texto-medio)] mb-6 leading-relaxed">
                    {previewBook.desc}
                    <br/><br/>
                    Este material foi desenhado pensando na carga mental da mãe atípica: capítulos curtos, objetivos e repletos de passos acionáveis, sem enrolação teórica desnecessária.
                  </p>

                  <h3 className="font-bold text-[var(--texto-escuro)] mb-2 flex items-center gap-2">
                    <Eye size={18} /> Prévia do sumário
                  </h3>
                  <ul className="text-[var(--texto-medio)] text-sm space-y-2 mb-8 list-disc pl-5 opacity-80">
                    <li>Capítulo 1: O cenário atual</li>
                    <li>Capítulo 2: Primeiros passos práticos</li>
                    <li>Capítulo 3: Como manter a constância</li>
                    <li>Capítulo 4: Ferramentas em anexo</li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-[var(--hover-bg)] flex flex-col gap-4">
                  {previewBook.type === 'Premium' && previewBook.hotmartLink && (
                    <a href={previewBook.hotmartLink} target="_blank" rel="noopener noreferrer" className="w-full py-4 rounded-xl bg-[#F04E23] hover:bg-[#d4431d] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#F04E23]/20 transition-all active:scale-95 text-center">
                      <Star size={20} className="fill-white" /> Comprar na Hotmart
                    </a>
                  )}
                  {previewBook.type === 'Premium' && previewBook.kiwifyLink && (
                    <a href={previewBook.kiwifyLink} target="_blank" rel="noopener noreferrer" className="w-full py-4 rounded-xl bg-[#0055FF] hover:bg-[#0044cc] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0055FF]/20 transition-all active:scale-95 text-center">
                      <Star size={20} className="fill-white" /> Comprar na Kiwify
                    </a>
                  )}
                  {previewBook.type === 'Gratuito' && (
                    <button className="w-full py-4 rounded-xl bg-[var(--rosa-forte)] hover:bg-[#b04066] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--rosa-forte)]/20 transition-all active:scale-95">
                      <Download size={20} /> Baixar E-book (PDF)
                    </button>
                  )}
                  {previewBook.type === 'Premium' && !previewBook.hotmartLink && !previewBook.kiwifyLink && (
                    <button disabled className="w-full py-4 rounded-xl bg-gray-300 text-gray-500 font-bold flex items-center justify-center gap-2 shadow-inner cursor-not-allowed">
                       <Star size={20} className="fill-gray-400" /> Venda Indisponível
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-\\[1200px\\] { perspective: 1200px; }
        .preserve-3d { transform-style: preserve-3d; }
        .-rotate-y-12 { transform: rotateY(-12deg); }
        .-rotate-y-45 { transform: rotateY(-45deg); }
        .rotate-y-0 { transform: rotateY(0deg); }
      `}} />
    </div>
  );
};

export default Livraria;
