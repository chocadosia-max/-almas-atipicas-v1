import React, { useState, useEffect } from 'react';
import { Search, MapPin, UserPlus, Filter, Loader2, MessageSquare, Heart, Share2, Plus, Image as ImageIcon, ThumbsUp, MessageCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// Feed inicia totalmente vazio (Apenas dados reais de agora em diante)
const INITIAL_POSTS: any[] = [];

const RedeDeMaes = () => {
  const [abaAtiva, setAbaAtiva] = useState<'feed' | 'encontrar'>('feed');
  const [perfis, setPerfis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroIdade, setFiltroIdade] = useState('');

  // Estados do Feed
  const [feedPosts, setFeedPosts] = useState<any[]>(() => {
    const saved = localStorage.getItem('almas_feed_community_2');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) { return INITIAL_POSTS; }
    }
    localStorage.setItem('almas_feed_community_2', JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  });
  
  const [novoPostContent, setNovoPostContent] = useState('');
  const [activeComments, setActiveComments] = useState<Record<number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchPerfis = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, cidade, estado, nivel_suporte_filho, idade_filho, bio, avatar_url')
          .eq('onboarding_complete', true);
        
        if (error) throw error;
        setPerfis(data || []);
      } catch (error) {
        console.error('Erro ao buscar perfis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfis();
  }, []);

  // Lógica CRUD Feed
  const handlePostar = () => {
    if (!novoPostContent.trim()) {
      toast.error('O conteúdo do post não pode estar vazio.');
      return;
    }

    const savedProfile = localStorage.getItem('almas_profile');
    let authorName = "Mãe da Comunidade";
    let avatar = "";
    if (savedProfile) {
       try { 
         const parsed = JSON.parse(savedProfile);
         if (parsed.full_name) authorName = parsed.full_name;
         if (parsed.avatarUrl) avatar = parsed.avatarUrl;
       } catch(e) {}
    }

    const post = {
      id: Date.now(),
      autorId: 'local',
      autorNome: authorName,
      avatar: avatar,
      cargo: "Membro da Rede",
      conteudo: novoPostContent,
      data: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date()) + " de Hoje",
      curtidas: 0,
      comentariosList: [],
      tags: ["Comunidade"]
    };

    const updated = [post, ...feedPosts];
    setFeedPosts(updated);
    localStorage.setItem('almas_feed_community_2', JSON.stringify(updated));
    setNovoPostContent('');
    toast.success("Publicação enviada com sucesso para a rede de apoio!");
  };

  const handleDeletePost = (id: number) => {
    const updated = feedPosts.filter(p => p.id !== id);
    setFeedPosts(updated);
    localStorage.setItem('almas_feed_community_2', JSON.stringify(updated));
    toast.success("Sua publicação foi excluída invisivelmente.");
  };

  const handleApoiar = (id: number) => {
    const updated = feedPosts.map(p => {
      if (p.id === id) {
        return { ...p, curtidas: p.curtidas + 1 };
      }
      return p;
    });
    setFeedPosts(updated);
    localStorage.setItem('almas_feed_community_2', JSON.stringify(updated));
  };

  const handleEnviarComentario = (idPost: number) => {
    const txt = commentInputs[idPost] || "";
    if (!txt.trim()) return;

    const savedProfile = localStorage.getItem('almas_profile');
    let authorName = "Mãe Atípica";
    if (savedProfile) {
       try { 
         const parsed = JSON.parse(savedProfile);
         if (parsed.full_name) authorName = parsed.full_name;
       } catch(e) {}
    }

    const updated = feedPosts.map(p => {
      if (p.id === idPost) {
        return {
          ...p,
          comentariosList: [...p.comentariosList, { id: Date.now(), autorNome: authorName, txt: txt.trim() }]
        };
      }
      return p;
    });

    setFeedPosts(updated);
    localStorage.setItem('almas_feed_community_2', JSON.stringify(updated));
    setCommentInputs(prev => ({ ...prev, [idPost]: '' }));
    toast.success("Apoio e comentário enviados com muito carinho!");
  };

  // ALGORITMO DE RELEVÂNCIA (ENGAGEMENT SCORE)
  // Curtidas valem 1 ponto, Comentários valem 2 pontos. O array é clonado para não mutar estado original.
  const sortedFeed = [...feedPosts].sort((a, b) => {
    const scoreA = a.curtidas + (a.comentariosList.length * 2);
    const scoreB = b.curtidas + (b.comentariosList.length * 2);
    // Se o Score for igual, ordena temporalmente (id)
    if (scoreB === scoreA) return b.id - a.id;
    return scoreB - scoreA;
  });

  const filtrados = perfis.filter(p => {
    const nome = p.full_name || '';
    const cidade = p.cidade || '';
    const matchBusca = nome.toLowerCase().includes(busca.toLowerCase()) || cidade.toLowerCase().includes(busca.toLowerCase());
    const matchEstado = filtroEstado ? p.estado === filtroEstado : true;
    const matchNivel = filtroNivel ? p.nivel_suporte_filho === filtroNivel : true;
    const matchIdade = filtroIdade ? p.idade_filho === filtroIdade : true;
    return matchBusca && matchEstado && matchNivel && matchIdade;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-white/40 shadow-xl backdrop-blur-[12px] rounded-[2.5rem] border border-white/40 p-10 mb-8 text-left transition-all hover:bg-white/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--rosa-forte)]/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--texto-escuro)] mb-4 font-serif leading-[1.1]">
              Rede de Mães que <span className="text-[var(--rosa-forte)] italic">se apoiam</span>.
            </h1>
            <p className="text-[var(--texto-medio)] text-lg">
              Compartilhe experiências, tire dúvidas e conecte-se com mulheres que trilham a mesma jornada.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs System */}
      <div className="flex gap-2 p-1.5 bg-white/30 backdrop-blur-[6px] rounded-2xl border border-white/20 mb-8 w-fit mx-auto md:mx-0">
        <button
          onClick={() => setAbaAtiva('feed')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            abaAtiva === 'feed' 
            ? 'bg-white shadow-md text-[var(--rosa-forte)] scale-[1.02]' 
            : 'text-[var(--texto-medio)] hover:bg-white/40'
          }`}
        >
          <MessageCircle size={20} />
          Feed da Comunidade
        </button>
        <button
          onClick={() => setAbaAtiva('encontrar')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            abaAtiva === 'encontrar' 
            ? 'bg-white shadow-md text-[var(--rosa-forte)] scale-[1.02]' 
            : 'text-[var(--texto-medio)] hover:bg-white/40'
          }`}
        >
          <Search size={20} />
          Encontrar Mães
        </button>
      </div>

      {abaAtiva === 'feed' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Card */}
            <div className="bg-white/65 shadow-lg backdrop-blur-[8px] rounded-3xl border border-white/40 p-6 transition-all hover:bg-white/70">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--rosa-medio)] overflow-hidden shrink-0">
                  <div className="w-full h-full flex items-center justify-center text-xl">👩‍💼</div>
                </div>
                <div className="flex-1">
                  <textarea 
                    placeholder="O que está acontecendo na sua jornada hoje?"
                    value={novoPostContent}
                    onChange={(e) => setNovoPostContent(e.target.value)}
                    className="w-full bg-white/50 border border-pink-100 rounded-xl p-3 focus:ring-1 focus:ring-pink-300 text-lg text-[var(--texto-escuro)] placeholder:text-[var(--texto-claro)] resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between pt-4 mt-2">
                    <button className="flex items-center gap-2 text-[var(--texto-medio)] font-semibold hover:text-[var(--rosa-forte)] transition-colors px-3 py-1.5 rounded-lg hover:bg-white">
                      <ImageIcon size={20} /> Imagem
                    </button>
                    <div className="flex gap-2">
                      <button onClick={handlePostar} className="bg-[var(--rosa-forte)] text-white px-5 py-2 rounded-xl font-bold shadow-md hover:brightness-110 active:scale-95 transition-all">
                        Publicar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-2 text-[var(--texto-claro)] font-bold text-sm">
               <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> O feed é organizado pela relevância da Comunidade
            </div>

            {/* Posts from Sorted Feed */}
            {sortedFeed.map(post => {
              const engagementScore = post.curtidas + (post.comentariosList.length * 2);
              const isHighEngagement = engagementScore > 3;

              return (
              <div key={post.id} className={`bg-white/80 shadow-md backdrop-blur-[8px] rounded-3xl border border-white/40 p-6 hover:shadow-xl transition-all group relative overflow-hidden ${isHighEngagement ? 'border-[var(--rosa-forte)]/50 shadow-pink-100/50' : ''}`}>
                
                {/* Efeito Visual de Alto Engajamento */}
                {isHighEngagement && (
                  <div className="absolute top-0 right-0 p-2 bg-gradient-to-l from-[var(--rosa-forte)]/10 px-4 rounded-bl-3xl flex items-center gap-2 pointer-events-none">
                     <span className="text-[10px] font-black uppercase text-[var(--rosa-forte)] tracking-wider">Alta Relevância</span>
                     <Heart size={14} className="fill-[var(--rosa-forte)] text-[var(--rosa-forte)] animate-bounce" />
                  </div>
                )}
                
                <AnimatePresence>
                   {isHighEngagement && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        className="absolute -right-10 -bottom-10 pointer-events-none"
                      >
                         <Heart size={120} className="fill-[var(--rosa-forte)] opacity-20 rotate-12" />
                      </motion.div>
                   )}
                </AnimatePresence>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex gap-4">
                    {post.avatar ? (
                       <img src={post.avatar} alt={post.autorNome} className="w-12 h-12 rounded-full object-cover border-2 border-pink-100 shadow-sm" />
                    ) : (
                       <div className="w-12 h-12 rounded-full bg-[var(--texto-claro)]/20 flex items-center justify-center font-bold text-[var(--texto-escuro)] text-xl border-2 border-pink-100 shadow-sm">{post.autorNome.charAt(0)}</div>
                    )}
                    <div>
                      <h3 className="font-bold text-[var(--texto-escuro)] group-hover:text-[var(--rosa-forte)] transition-colors">{post.autorNome}</h3>
                      <p className="text-xs font-bold text-[var(--rosa-forte)]/70 tracking-wide uppercase">{post.cargo} • {post.data}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 border border-pink-100 text-[var(--texto-medio)]">
                        {tag}
                      </span>
                    ))}
                    {post.autorId === 'local' && (
                       <button onClick={() => handleDeletePost(post.id)} className="p-2 ml-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Excluir Post">
                           <Trash2 size={16} />
                       </button>
                    )}
                  </div>
                </div>
                
                <p className="text-[var(--texto-escuro)] text-lg leading-relaxed mb-6 whitespace-pre-wrap relative z-10">
                  {post.conteudo}
                </p>

                <div className="flex items-center gap-6 pt-4 border-t border-[var(--hover-bg)] relative z-10">
                  <button onClick={() => handleApoiar(post.id)} className="flex items-center gap-2 text-[var(--texto-medio)] font-bold hover:text-[var(--rosa-forte)] transition-all">
                    <Heart size={20} className={`transition-transform ${post.curtidas > 0 ? 'fill-[var(--rosa-forte)] text-[var(--rosa-forte)]' : 'group-hover:scale-110'}`} />
                    {post.curtidas} Apoiar
                  </button>
                  <button onClick={() => setActiveComments(prev => ({...prev, [post.id]: !prev[post.id]}))} className="flex items-center gap-2 text-[var(--texto-medio)] font-bold hover:text-[#0055FF] transition-all">
                    <MessageSquare size={20} />
                    {post.comentariosList.length} Comentários
                  </button>
                  <button className="flex items-center gap-2 text-[var(--texto-claro)] font-bold hover:text-[var(--texto-medio)] transition-all ml-auto">
                    <Share2 size={20} />
                  </button>
                  {post.autorId !== 'local' && (
                    <button
                      onClick={() => toast.warning('Denúncia registrada. Nossa equipe irá analisar este conteúdo em até 48h. Obrigada por manter a rede segura! 🌸')}
                      title="Denunciar conteúdo inadequado"
                      className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg px-2 py-1 transition-all tracking-widest"
                    >
                      ⚑ Denunciar
                    </button>
                  )}
                </div>

                {/* Secção de Comentários */}
                <AnimatePresence>
                  {activeComments[post.id] && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="mt-6 pt-4 border-t border-dashed border-gray-200 relative z-10"
                     >
                        <div className="space-y-4 mb-4 max-h-48 overflow-y-auto pr-2">
                           {post.comentariosList.length === 0 && <p className="text-sm text-gray-400 font-medium italic">Seja a primeira a apoiar e comentar!</p>}
                           {post.comentariosList.map((c: any) => (
                             <div key={c.id} className="bg-gray-50 p-3 rounded-2xl">
                               <span className="font-bold text-sm text-[var(--rosa-forte)] block mb-0.5">{c.autorNome}</span>
                               <span className="text-sm text-[var(--texto-escuro)]">{c.txt}</span>
                             </div>
                           ))}
                        </div>
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({...prev, [post.id]: e.target.value}))}
                              onKeyDown={(e) => e.key === 'Enter' && handleEnviarComentario(post.id)}
                              placeholder="Escreva um comentário carinhoso..." 
                              className="flex-1 px-4 py-2 font-medium bg-white border border-pink-100 placeholder:text-gray-300 rounded-xl outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300"
                           />
                           <button onClick={() => handleEnviarComentario(post.id)} className="px-4 bg-[var(--ativo-bg)] text-[var(--rosa-forte)] font-bold hover:bg-[var(--rosa-forte)] hover:text-white rounded-xl transition-all shadow-sm">
                              Enviar
                           </button>
                        </div>
                     </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )})}
            
            {sortedFeed.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 bg-white/50 rounded-3xl border border-dashed border-[var(--rosa-medio)] text-center">
                <div className="w-16 h-16 bg-[var(--rosa-forte)]/10 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="text-[var(--rosa-forte)] w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-[var(--texto-escuro)] mb-2">Comunidade silenciosa agora.</h3>
                <p className="text-[var(--texto-medio)] text-sm max-w-sm">
                  Publique o que está passando em sua vida, desabafos, vitórias, dúvidas. Seja a faísca que começa nossa Rede!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar / Recommendations Column */}
          <div className="hidden lg:block space-y-8">
            <div className="bg-white/40 backdrop-blur-[8px] rounded-3xl border border-white/20 p-6">
              <h4 className="font-bold text-[var(--texto-escuro)] mb-4 flex items-center gap-2">
                <ThumbsUp size={18} className="text-[var(--rosa-forte)]" />
                Tópicos em Alta
              </h4>
              <div className="space-y-3">
                {['Dicas de Alimentação', 'Escola Inclusiva', 'Rotina do Banho', 'Direitos BPC'].map(topic => (
                  <button key={topic} className="w-full text-left px-4 py-3 rounded-2xl bg-white/30 border border-white/40 hover:bg-white transition-all text-[var(--texto-medio)] font-semibold text-sm">
                    #{topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[var(--rosa-forte)] to-[var(--rosa-medio)] rounded-[2rem] p-6 text-white shadow-xl shadow-[var(--rosa-forte)]/20">
              <h4 className="font-bold text-xl mb-2">Momento Pausa 🌿</h4>
              <p className="text-white/90 text-sm mb-4">Mãe, você já tirou 5 minutos para você hoje? O autocuidado é essencial para continuar cuidando.</p>
              <button className="w-full py-3 bg-white text-[var(--rosa-forte)] rounded-xl font-extrabold hover:scale-[1.02] active:scale-95 transition-all shadow-md">
                Ir para o Momento Pausa
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Buscas e Filtros (Original functionality) */}
          <div className="bg-white/65 shadow-lg backdrop-blur-[8px] rounded-3xl border border-white/40 p-8 transition-all hover:bg-white/70">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-4.5 h-6 w-6 text-[var(--rosa-forte)]/50" />
                <input 
                  type="text" 
                  placeholder="Nome ou cidade..." 
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white/50 border-2 border-transparent focus:border-[var(--rosa-medio)] focus:bg-white rounded-2xl outline-none text-[#4B1528] placeholder:text-[var(--texto-claro)] transition-all text-lg shadow-inner"
                />
              </div>
              
              <div className="flex gap-4 flex-wrap flex-1">
                <select 
                  className="flex-1 py-4 px-6 bg-white/50 border border-white/60 focus:bg-white rounded-2xl outline-none text-[#4B1528] transition-all font-semibold"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">UF (Todos)</option>
                  {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>

                <select 
                  className="flex-1 py-4 px-6 bg-white/50 border border-white/60 focus:bg-white rounded-2xl outline-none text-[#4B1528] transition-all font-semibold"
                  value={filtroNivel}
                  onChange={(e) => setFiltroNivel(e.target.value)}
                >
                  <option value="">Nível TEA</option>
                  <option value="Nível 1">L1 (Leve)</option>
                  <option value="Nível 2">L2 (Moderado)</option>
                  <option value="Nível 3">L3 (Substancial)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ─── AVISO LGPD / ECA ─── */}
          <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-amber-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-amber-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <p className="text-xs font-bold leading-relaxed">
              <strong>Aviso de Privacidade (LGPD · ECA):</strong> Informações de saúde como nível de suporte TEA e faixa etária dos filhos são dados sensíveis de menores de idade. Esses dados foram compartilhados voluntariamente pelas mães durante o cadastro. Passe o mouse sobre os badges para visualizá-los. Não reproduza, copie ou compartilhe esses dados fora da plataforma.
            </p>
          </div>

          {/* Grid de Mães */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-16 h-16 text-[var(--rosa-forte)] animate-spin mb-4" />
              <p className="text-[var(--texto-medio)] font-extrabold text-xl">Buscando rede de apoio...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtrados.length > 0 ? filtrados.map(perfil => (
                <div key={perfil.id} className="bg-white/65 shadow-md backdrop-blur-[8px] rounded-[2.5rem] border border-white/40 p-8 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)]"></div>
                  
                  <div className="w-28 h-28 bg-gradient-to-tr from-[var(--rosa-forte)] to-[var(--rosa-medio)] p-1.5 rounded-full mb-5 shadow-lg relative group-hover:scale-110 transition-transform duration-500">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-5xl shadow-inner overflow-hidden border-4 border-white">
                      {perfil.avatar_url ? (
                        <img src={perfil.avatar_url} alt={perfil.full_name} className="w-full h-full object-cover" />
                      ) : (
                        "👩‍"
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-extrabold text-2xl text-[var(--texto-escuro)] mb-1 group-hover:text-[var(--rosa-forte)] transition-colors">{perfil.full_name || 'Mãe Atípica'}</h3>
                  
                  <div className="flex items-center gap-1.5 text-[var(--texto-medio)] font-bold text-sm mb-4">
                    <MapPin size={16} className="text-[var(--rosa-forte)]" />
                    {perfil.cidade || 'Cidade'}, {perfil.estado || 'UF'}
                  </div>
                  
                  <div className="flex gap-2 mb-6 justify-center flex-wrap">
                    {perfil.nivel_suporte_filho && (
                      <span 
                        title="Dado de saúde sensível — compartilhado pela mãe. Passe o mouse para ver."
                        className="relative bg-[var(--rosa-forte)]/10 text-[var(--rosa-forte)] text-xs font-black px-3 py-1.5 rounded-full cursor-help group/badge"
                      >
                        <span className="blur-sm group-hover/badge:blur-none transition-all duration-300 select-none">{perfil.nivel_suporte_filho}</span>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none font-normal">Dado sensível (LGPD)</span>
                      </span>
                    )}
                    {perfil.idade_filho && (
                      <span 
                        title="Dado de saúde sensível — compartilhado pela mãe. Passe o mouse para ver."
                        className="relative bg-[var(--texto-escuro)]/10 text-[var(--texto-escuro)] text-xs font-black px-3 py-1.5 rounded-full cursor-help group/age"
                      >
                        <span className="blur-sm group-hover/age:blur-none transition-all duration-300 select-none">{perfil.idade_filho} anos</span>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover/age:opacity-100 transition-opacity pointer-events-none font-normal">Dado sensível (LGPD)</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[var(--texto-medio)] text-sm mb-8 flex-1 italic line-clamp-3 leading-relaxed">
                    {perfil.bio ? `"${perfil.bio}"` : "Caminhando com amor e superação todos os dias."}
                  </p>

                  <button className="w-full py-4 rounded-2xl bg-white border-2 border-[var(--rosa-forte)] text-[var(--rosa-forte)] hover:bg-[var(--rosa-forte)] hover:text-white font-black flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95">
                    <UserPlus size={20} strokeWidth={3} />
                    Conectar
                  </button>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center">
                   <p className="text-[var(--texto-claro)] text-xl font-bold">Nenhuma mãe encontrada com esses filtros.</p>
                   <button onClick={() => {setBusca(''); setFiltroEstado('');}} className="mt-4 text-[var(--rosa-forte)] font-bold underline">Limpar busca</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RedeDeMaes;

