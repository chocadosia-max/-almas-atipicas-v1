import React, { useState, useEffect } from 'react';
import { Book, Download, Eye, X, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIAS = ['Todos', 'Direitos', 'Rotinas', 'Autocuidado', 'Comportamento', 'Inclusão'];

const EbookOLutoQueNinguemFala = () => {
  return (
    <div className="w-full h-full min-h-[500px] md:min-h-[600px] border-0 rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(201,169,110,0.3)]">
      <iframe 
        src="/ebook-luto-que-ninguem-fala.html" 
        className="w-full h-full min-h-[500px] md:min-h-[600px] border-0"
        title="O Luto que Ninguém Fala - Ebook"
      />
    </div>
  );
};

const Livraria = () => {
  const [filtroCat, setFiltroCat] = useState('Todos');
  const [previewBook, setPreviewBook] = useState<any | null>(null);
  const [readingBookId, setReadingBookId] = useState<string | null>(null);

  // Ebook Premium "O Luto que Ninguém Fala" sempre presente e em destaque
  const destaqueEbook = {
    id: 'luto-que-ninguem-fala',
    title: 'O Luto que Ninguém Fala',
    autor: 'Coleção Comigo',
    cat: 'Autocuidado',
    type: 'Gratuito',
    desc: 'O que acontece com você após o diagnóstico do seu filho — e por que isso tem um nome, uma razão e uma saída. Este ebook não é sobre autismo. É sobre você — a mãe que ficou de pé quando o chão sumiu embaixo dos seus pés.',
    color: 'from-[#4A2218] to-[#C1694F]',
    isInteractive: true,
  };

  const [books, setBooks] = useState<any[]>(() => {
    const saved = localStorage.getItem('almas_ebooks_2');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        // Filtra para garantir que não haja duplicata se já estiver salvo
        return parsed.filter((b: any) => b.id !== 'luto-que-ninguem-fala');
      } catch (e) { return []; }
    }
    return [];
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('almas_ebooks_2');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          setBooks(parsed.filter((b: any) => b.id !== 'luto-que-ninguem-fala'));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000); 
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const allBooks = [destaqueEbook, ...books];
  const filtereds = filtroCat === 'Todos' ? allBooks : allBooks.filter(b => b.cat === filtroCat);

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      {/* Hero */}
      <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-10 mb-8 text-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNENDUzN0UiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] relative overflow-hidden">
        <Book className="mx-auto w-12 h-12 text-[var(--texto-medio)] mb-4" />
        <h1 className="text-4xl font-bold text-[var(--texto-escuro)] mb-4 font-serif">
          Conhecimento que transforma
        </h1>
        <p className="text-[var(--texto-medio)] max-w-2xl mx-auto text-lg mb-8">
          A informação é a sua arma mais poderosa. Nossa biblioteca reúne os melhores materiais para a jornada atípica.
        </p>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-2 relative z-10">
          {CATEGORIAS.map(cat => (
            <button 
              key={cat}
              onClick={() => setFiltroCat(cat)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all border ${
                filtroCat === cat 
                  ? 'bg-[var(--rosa-forte)] text-white shadow-md border-[var(--rosa-forte)]' 
                  : 'bg-white text-[var(--texto-medio)] hover:bg-pink-50 border-pink-100 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Área de Leitura Interativa */}
      <AnimatePresence mode="wait">
        {readingBookId === 'luto-que-ninguem-fala' && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.9 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.9 }}
            className="mb-12"
          >
            <div className="w-full flex justify-end mb-4">
              <button 
                onClick={() => setReadingBookId(null)}
                className="px-6 py-3 bg-[var(--ativo-bg)] text-[var(--rosa-forte)] font-bold rounded-2xl flex items-center gap-2 hover:bg-[var(--rosa-forte)] hover:text-white transition-all shadow-md"
              >
                <X size={18} /> Fechar Leitura
              </button>
            </div>
            <EbookOLutoQueNinguemFala />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {!readingBookId && (
        <>
          {filtereds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtereds.map((book) => (
                <motion.div 
                  key={book.id}
                  whileTap={book.id === 'luto-que-ninguem-fala' ? { scale: 0.9, filter: 'brightness(1.5) drop-shadow(0 0 40px rgba(251,191,36,1))' } : { scale: 0.98 }}
                  className={`group bg-white/65 backdrop-blur-[8px] rounded-3xl border p-5 transition-all flex flex-col h-full cursor-pointer relative overflow-hidden ${book.id === 'luto-que-ninguem-fala' ? 'animate-[float_6s_ease-in-out_infinite] hover:animate-none border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.7)] hover:shadow-[0_0_50px_rgba(251,191,36,1)] z-10' : 'border-white/40 shadow-sm hover:shadow-xl z-0'}`}
                  onClick={() => {
                    if (book.isInteractive) {
                      setReadingBookId(book.id);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    } else {
                      setPreviewBook(book);
                    }
                  }}
                >
                  
                  {book.id === 'luto-que-ninguem-fala' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-transparent to-amber-300/40 opacity-80 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none"></div>
                  )}

                  {/* Capa */}
                  <div className="w-full aspect-square relative perspective-[1200px] mb-4">
                    <div className={`w-full h-full relative preserve-3d group-hover:-rotate-y-12 transition-transform duration-500 bg-white shadow-xl origin-left rounded-r-xl border border-gray-100 flex items-center justify-center p-2 ${book.id === 'luto-que-ninguem-fala' ? 'group-hover:shadow-[0_0_30px_rgba(201,169,110,0.6)]' : ''}`}>
                       
                       {book.coverUrl ? (
                         <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover rounded shadow-inner max-w-full" />
                       ) : (
                         <div className={`w-full h-full rounded bg-gradient-to-br ${book.color || 'from-gray-400 to-gray-600'} flex flex-col justify-between p-4 shadow-inner relative overflow-hidden text-white`}>
                            {book.id === 'luto-que-ninguem-fala' && <Sparkles className="absolute top-2 right-2 text-amber-300 w-8 h-8 opacity-50" />}
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
      
                       {/* Efeito de Folhear */}
                       <div className="absolute inset-y-0 right-0 left-0 bg-white rounded-r-xl origin-left transform rotate-y-0 opacity-0 group-hover:opacity-100 group-hover:-rotate-y-45 transition-all duration-700 ease-in-out flex flex-col p-4 shadow-[-5px_0_15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden pointer-events-none z-20">
                          <div className="h-full border border-gray-100 p-3 opacity-90 flex flex-col gap-2">
                             <h4 className="font-black text-[10px] uppercase text-gray-400">Sumário</h4>
                             <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                             <div className="h-2 w-full bg-gray-100 rounded"></div>
                             <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                             <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                          </div>
                       </div>
                    </div>
                  </div>
      
                  <div className="flex-1 flex flex-col relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                        book.type === 'Gratuito' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {book.type}
                      </span>
                      {book.isInteractive && <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-1 rounded-md uppercase flex items-center gap-1"><Sparkles size={10} /> Interativo</span>}
                    </div>
                    <h4 className="font-bold text-[var(--texto-escuro)] text-lg mb-1 leading-snug">{book.title}</h4>
                    <p className="text-[var(--texto-claro)] text-sm mb-4 line-clamp-2">{book.desc}</p>
                  </div>
                  
                  <button className={`relative z-10 w-full py-2.5 rounded-xl border font-bold transition-all shadow-sm ${book.isInteractive ? 'bg-amber-100 border-amber-200 text-amber-700 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500' : 'bg-white border-pink-100 text-[var(--rosa-forte)] group-hover:bg-[var(--rosa-forte)] group-hover:text-white group-hover:border-[var(--rosa-forte)]'}`}>
                    {book.isInteractive ? 'Ler Agora' : 'Detalhes'}
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white/50 rounded-3xl border border-dashed border-[var(--rosa-medio)] text-center">
              <div className="w-16 h-16 bg-[var(--rosa-forte)]/10 rounded-full flex items-center justify-center mb-4">
                <Book className="text-[var(--rosa-forte)] w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-[var(--texto-escuro)] mb-2">Nenhum {filtroCat === 'Todos' ? 'e-book' : `e-book de ${filtroCat}`} encontrado.</h3>
            </div>
          )}
        </>
      )}

      {/* Preview Modal para livros normais */}
      <AnimatePresence>
        {previewBook && !previewBook.isInteractive && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl border border-white/50 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className={`md:w-2/5 aspect-[3/4] md:aspect-auto bg-gradient-to-br ${previewBook.color || 'from-gray-400 to-gray-600'} p-8 flex flex-col justify-center text-white relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.1)]`}>
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
                  </p>
                </div>

                <div className="pt-6 border-t border-[var(--hover-bg)] flex flex-col gap-4">
                  {previewBook.type === 'Gratuito' ? (
                    <button className="w-full py-4 rounded-xl bg-[var(--rosa-forte)] hover:bg-[#b04066] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--rosa-forte)]/20 transition-all active:scale-95">
                      <Download size={20} /> Baixar E-book (PDF)
                    </button>
                  ) : (
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
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
};

export default Livraria;
