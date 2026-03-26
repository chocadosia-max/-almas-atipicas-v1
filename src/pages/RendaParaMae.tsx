import React, { useState } from 'react';
import { 
  Briefcase, 
  Store, 
  GraduationCap, 
  ExternalLink, 
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle,
  User, Image as ImageIcon, Send, Crown, Flower, Trash2, BellRing
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CURSOS_LINKS = [
  { name: "SEBRAE - Empreendedorismo", link: "https://www.sebrae.com.br" },
  { name: "SENAI - Cursos Profissionalizantes", link: "https://www.mundosenai.com.br" },
  { name: "Enap - Escola de Governo (Certificados)", link: "https://www.escolavirtual.gov.br" },
  { name: "Coursera - Bolsas para Mulheres", link: "https://www.coursera.org" },
];

const RendaParaMae = () => {
  const [activeTab, setActiveTab] = useState<'vagas' | 'perfil'>('vagas');
  const [showFlowers, setShowFlowers] = useState(false);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('almas_empreendedora_profile');
    return saved ? JSON.parse(saved) : { avatarBase64: '', isEmpreendedora: false };
  });

  const [vagas, setVagas] = useState<any[]>(() => {
    const saved = localStorage.getItem('almas_vagas_2');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) { return []; }
    }
    return [];
  });

  const [novaVagaTitle, setNovaVagaTitle] = useState('');
  const [novaVagaDesc, setNovaVagaDesc] = useState('');
  const [systemAlert, setSystemAlert] = useState<{title: string, desc: string} | null>(null);

  const handlePostVaga = (e: React.FormEvent) => {
    e.preventDefault();
    if(!novaVagaTitle || !novaVagaDesc) return;
    const novaVaga = {
      id: Date.now(),
      title: novaVagaTitle,
      tags: ["Comunidade", "Empreendedora"],
      desc: novaVagaDesc,
      avatarBase64: profile.avatarBase64,
      authorId: 'local'
    };
    const updated = [novaVaga, ...vagas];
    setVagas(updated);
    localStorage.setItem('almas_vagas_2', JSON.stringify(updated));
    setNovaVagaTitle(''); setNovaVagaDesc('');
    
    // Broadcast Global Alert
    setSystemAlert({ title: novaVaga.title, desc: novaVaga.desc });
    setTimeout(() => setSystemAlert(null), 5000);
  };

  const handleDeleteVaga = (id: number) => {
    const updated = vagas.filter((v: any) => v.id !== id);
    setVagas(updated);
    localStorage.setItem('almas_vagas_2', JSON.stringify(updated));
    toast.success("Oportunidade excluída com sucesso da comunidade!");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
         const newProfile = { ...profile, avatarBase64: reader.result as string };
         setProfile(newProfile);
         localStorage.setItem('almas_empreendedora_profile', JSON.stringify(newProfile));
         window.dispatchEvent(new Event('profileUpdated'));
         toast.success("Sua foto de perfil foi atualizada!");
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const toggleEmpreendedora = () => {
    const newVal = !profile.isEmpreendedora;
    const newProfile = { ...profile, isEmpreendedora: newVal };
    setProfile(newProfile);
    localStorage.setItem('almas_empreendedora_profile', JSON.stringify(newProfile));
    window.dispatchEvent(new Event('profileUpdated'));

    if (newVal) {
      setShowFlowers(true);
      setTimeout(() => setShowFlowers(false), 5000);
      toast.success("Parabéns! Modo Empreendedora Ativado. 🌸", { description: "Uma coroa dourada foi adicionada ao seu perfil." });
    } else {
      toast.info("Modo Empreendedora desativado.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 relative overflow-hidden">
      {/* Flower Confetti Animation */}
      <AnimatePresence>
         {showFlowers && (
           <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
             {[...Array(40)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ top: -50, left: `${Math.random() * 100}vw`, rotate: 0, opacity: 1, scale: Math.random() * 0.5 + 0.8 }}
                 animate={{ top: '100vh', rotate: 360, opacity: 0 }}
                 transition={{ duration: 2 + Math.random() * 3, ease: 'linear' }}
                 className="absolute text-4xl drop-shadow-md"
               >
                 {['🌸', '🌺', '🏵️', '🐝', '✨'][Math.floor(Math.random() * 5)]}
               </motion.div>
             ))}
           </div>
         )}
         
         {/* System Alert Modal - Global Broadcast */}
         {systemAlert && (
           <motion.div 
             initial={{ opacity: 0, y: -100, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: -50, scale: 0.9 }}
             className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[200] pointer-events-none"
           >
             <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-[var(--rosa-forte)]/30 backdrop-blur-md flex gap-4 items-start relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--rosa-forte)]/10 rounded-bl-full -z-10 animate-pulse"></div>
               <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                 <BellRing className="animate-bounce" />
               </div>
               <div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">Alerta de Sistema (Global)</span>
                 <h4 className="font-extrabold text-[var(--texto-escuro)] text-lg mt-1 mb-1 leading-tight">Mãe Empreendedora Online!</h4>
                 <p className="text-sm font-bold text-[var(--rosa-forte)] mb-1 break-words">{systemAlert.title}</p>
                 <p className="text-xs text-[var(--texto-medio)] line-clamp-2">Uma nova oportunidade acabou de ser postada na comunidade.</p>
               </div>
             </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Hero */}
      <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-[3rem] border border-white/40 p-10 mb-8 text-center bg-gradient-to-r from-[var(--rosa-forte)]/10 via-transparent to-[var(--rosa-forte)]/10 relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 text-[var(--rosa-forte)]/30 w-12 h-12" />
        <h1 className="text-4xl font-bold text-[var(--texto-escuro)] mb-4 font-serif leading-tight">
          Sua independência começa aqui
        </h1>
        <p className="text-[var(--texto-medio)] max-w-2xl mx-auto text-lg mb-8">
          Entendemos que a jornada atípica exige tempo. Por isso, reunimos caminhos para geração de renda que se adaptam à sua rotina, não o contrário.
        </p>

        <div className="flex justify-center gap-4 bg-[var(--ativo-bg)] p-1.5 rounded-2xl border border-[var(--rosa-medio)]/20 shadow-inner max-w-md mx-auto">
           <button 
             onClick={() => setActiveTab('vagas')} 
             className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'vagas' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'}`}
           >
             <Briefcase size={18} /> Oportunidades
           </button>
           <button 
             onClick={() => setActiveTab('perfil')} 
             className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'perfil' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'}`}
           >
             <User size={18} /> Meu Perfil
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Conditional Tab Rendering */}
        <div className="lg:col-span-8 space-y-8">
          
          {activeTab === 'perfil' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 shadow-2xl backdrop-blur-md rounded-[3rem] border-2 border-[var(--rosa-forte)]/20 p-10 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[var(--rosa-forte)]/20 to-transparent"></div>
               
               <div className="relative z-10 mb-8 pt-8">
                  <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-xl border-4 border-white flex items-center justify-center relative overflow-hidden group">
                     {profile.avatarBase64 ? (
                       <img src={profile.avatarBase64} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     ) : (
                       <User size={48} className="text-gray-300" />
                     )}
                     
                     <label className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] font-bold py-2 translate-y-full group-hover:translate-y-0 transition-transform cursor-pointer flex items-center justify-center gap-1 uppercase tracking-widest backdrop-blur-sm">
                        <ImageIcon size={12} /> Alterar
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                     </label>
                  </div>
                  
                  {profile.isEmpreendedora && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute mx-auto left-0 right-0 -top-6 w-16 h-16 pointer-events-none drop-shadow-xl text-5xl">
                       👑
                    </motion.div>
                  )}
               </div>

               <h2 className="text-3xl font-black text-[var(--texto-escuro)] mb-2">Suas Configurações</h2>
               <p className="text-[var(--texto-medio)] font-medium mb-8">Personalize seu perfil para a comunidade de mães.</p>

               <div className="bg-gradient-to-r from-amber-50 to-orange-50 bg-white border border-amber-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 text-left">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shrink-0">
                     <Crown size={32} />
                  </div>
                  <div className="flex-1">
                     <h3 className="text-xl font-bold text-amber-900 mb-1">Modo Empreendedora</h3>
                     <p className="text-amber-700/80 text-sm font-medium">Libere a postagem direta de vagas de trabalho e oportunidades de negócios que você lidera.</p>
                  </div>
                  <button 
                    onClick={toggleEmpreendedora}
                    className={`shrink-0 py-3 px-6 rounded-2xl font-black transition-all shadow-md flex items-center gap-2 ${profile.isEmpreendedora ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white text-amber-600 border border-amber-300 hover:bg-amber-50'}`}
                  >
                     {profile.isEmpreendedora ? <CheckCircle size={18} /> : null}
                     {profile.isEmpreendedora ? 'Modo Ativado' : 'Ativar Modo'}
                  </button>
               </div>
            </motion.div>
          )}

          {activeTab === 'vagas' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              
              {/* Form de Vagas Empreendedora */}
              {profile.isEmpreendedora && (
                 <div className="bg-gradient-to-r from-[var(--rosa-forte)] to-[#4B1528] rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white border-4 border-white">
                    <Flower className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10" />
                    <h3 className="text-2xl font-black mb-2 flex items-center gap-2 drop-shadow-md">👑 Postar Nova Vaga</h3>
                    <p className="text-pink-100 text-sm mb-6 max-w-md font-medium">Como você ativou o Modo Empreendedora, você pode convocar outras mães atípicas para integrarem seus projetos. Acolha outra mãe!</p>
                    <form onSubmit={handlePostVaga} className="space-y-4 relative z-10">
                       <input required value={novaVagaTitle} onChange={e=>setNovaVagaTitle(e.target.value)} type="text" placeholder="Título da Vaga (ex: Assistente de Mídias)" className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-pink-200 outline-none focus:bg-white/20 transition-all font-bold" />
                       <textarea required value={novaVagaDesc} onChange={e=>setNovaVagaDesc(e.target.value)} rows={3} placeholder="Descrição da oportunidade flexível..." className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-pink-200 outline-none focus:bg-white/20 transition-all font-medium resize-none"></textarea>
                       <button type="submit" className="w-full py-4 rounded-2xl bg-white text-[#4B1528] font-black hover:scale-[1.01] hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest"><Send size={18} /> Publicar Vaga Na Comunidade</button>
                    </form>
                 </div>
              )}
          
          {/* Seção 1: Trabalho Remoto & Comunidade */}
          <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-[var(--texto-escuro)] font-serif">
                <Briefcase className="text-[var(--rosa-forte)]" /> Oportunidades & Remoto
              </h2>
              <button className="text-[var(--rosa-forte)] text-sm font-bold flex items-center gap-1 hover:underline bg-[var(--ativo-bg)] px-3 py-1 rounded-full">
                <Search size={14} /> Filtrar
              </button>
            </div>
            
            {vagas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vagas.map((card: any) => (
                  <div key={card.id} className="p-6 bg-white shadow-sm hover:shadow-lg rounded-3xl border border-pink-50 transition-all cursor-pointer group flex flex-col justify-between relative">
                    
                    {card.authorId === 'local' && (
                       <button onClick={(e) => { e.stopPropagation(); handleDeleteVaga(card.id); }} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all z-10" title="Excluir Minha Vaga">
                          <Trash2 size={16} />
                       </button>
                    )}

                    <div>
                      <div className="flex gap-3 mb-4 items-center">
                        {card.avatarBase64 ? (
                           <div className="relative w-10 h-10 shrink-0">
                             <img src={card.avatarBase64} alt="Avatar" className="w-full h-full object-cover rounded-full shadow-md border border-[var(--rosa-forte)]/20" />
                             <Crown size={12} className="absolute -top-1 -right-1 text-amber-500 drop-shadow-md bg-white rounded-full p-[1px]" />
                           </div>
                        ) : (
                           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 text-gray-400">
                              <User size={20} />
                           </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 pr-6">
                          {card.tags.map((t: string) => (
                            <span key={t} className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${t === 'Comunidade' ? 'bg-[var(--rosa-forte)]/10 text-[var(--rosa-forte)]' : 'bg-gray-100 text-gray-500'}`}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h3 className="font-black text-lg text-[var(--texto-escuro)] group-hover:text-[var(--rosa-forte)] transition-colors mb-2 leading-tight">
                        {card.title}
                      </h3>
                      <p className="text-[var(--texto-claro)] text-sm font-medium leading-relaxed mb-4">
                        {card.desc}
                      </p>
                    </div>
                    <button className="w-full py-2 bg-[var(--ativo-bg)] text-[var(--rosa-forte)] font-bold text-xs rounded-xl group-hover:bg-[var(--rosa-forte)] group-hover:text-white transition-colors">
                       Ver Detalhes
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white/50 rounded-3xl border border-dashed border-[var(--rosa-medio)] text-center">
                <div className="w-16 h-16 bg-[var(--rosa-forte)]/10 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="text-[var(--rosa-forte)] w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-[var(--texto-escuro)] mb-2">Nenhuma vaga ativa</h3>
                <p className="text-[var(--texto-medio)] text-sm max-w-sm">
                  No momento, a comunidade não possui postagens de oportunidades. Se você for uma Empreendedora, poste uma nova vaga!
                </p>
              </div>
            )}
          </div>

          {/* Seção MEI Empreendedora Exclusiva para aba Vagas */}
          <div className="bg-gradient-to-br from-white/70 to-white/40 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-6 lg:p-8 overflow-hidden relative">
            <div className="absolute -bottom-8 -right-8 opacity-5">
              <Store size={200} />
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10 text-center md:text-left">
              <div className="flex-1">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-[var(--texto-escuro)] font-serif mb-4">
                  <Store className="text-[var(--rosa-forte)]" /> Empreendedorismo (MEI)
                </h2>
                <p className="text-[var(--texto-medio)] mb-6">
                  Formalize seu negócio, garanta sua contribuição para aposentadoria e tenha acesso a créditos especiais. Abrir um MEI é gratuito e fundamental para sua segurança financeira.
                </p>
                <div className="space-y-3 mb-8">
                   <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--texto-escuro)] font-medium">
                      <CheckCircle size={16} className="text-green-500" /> Auxílio maternidade garantido
                   </div>
                   <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--texto-escuro)] font-medium">
                      <CheckCircle size={16} className="text-green-500" /> Aposentadoria por invalidez e idade
                   </div>
                   <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--texto-escuro)] font-medium">
                      <CheckCircle size={16} className="text-green-500" /> Emissão de Nota Fiscal
                   </div>
                </div>
                <a 
                  href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--texto-escuro)] text-white font-bold hover:bg-black transition-all shadow-lg"
                >
                  Abrir meu MEI Agora <ExternalLink size={16} />
                </a>
              </div>
              <div className="w-48 h-48 bg-white/50 rounded-full flex items-center justify-center p-4 border border-white/60 shadow-inner">
                 <Store size={80} className="text-[var(--rosa-forte)] opacity-80" />
              </div>
            </div>
          </div>
            </motion.div>
          )}

        </div>

        {/* Right Column: Educational & Benefits */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Cursos */}
          <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-[var(--texto-escuro)] mb-6 font-serif">
              <GraduationCap className="text-[var(--rosa-forte)]" /> Cursos Gratuitos
            </h3>
            <div className="space-y-3">
              {CURSOS_LINKS.map((curso, idx) => (
                <a 
                  key={idx} 
                  href={curso.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-between p-4 bg-white/30 hover:bg-white/50 border border-white/50 rounded-xl transition-all group"
                >
                  <span className="text-sm font-bold text-[var(--texto-medio)] group-hover:text-[var(--rosa-forte)]">{curso.name}</span>
                  <ChevronRight size={16} className="text-[var(--rosa-forte)]" />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RendaParaMae;
