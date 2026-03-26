import { motion } from "framer-motion";
import { Sparkles, Heart, Users, Star, CheckCircle2, ArrowRight, ShieldCheck, Zap, MessageCircle, Puzzle, Headphones, Scale } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-[#FBEAF0]">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--rosa-forte)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--rosa-medio)]/10 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] py-4 px-6 md:px-12 bg-white/40 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-2xl text-[var(--texto-escuro)]">
            <Sparkles className="text-[var(--rosa-forte)] w-6 h-6" />
            <span>almas <em className="text-[var(--rosa-forte)] italic font-serif">atípicas</em></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[var(--texto-medio)]">
            <a href="#solucao" className="hover:text-[var(--rosa-forte)] transition-colors">A Solução</a>
            <a href="#comunidade" className="hover:text-[var(--rosa-forte)] transition-colors">Comunidade</a>
            <a href="#precos" className="hover:text-[var(--rosa-forte)] transition-colors">Planos</a>
          </div>
          <Link 
            to="/login" 
            className="px-6 py-2.5 rounded-xl bg-white/60 hover:bg-white border border-white/60 text-[var(--texto-escuro)] font-bold transition-all shadow-sm"
          >
            Entrar
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[90vh]">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--rosa-forte)]/10 border border-[var(--rosa-forte)]/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--rosa-forte)] animate-pulse" />
              <span className="text-xs font-black uppercase text-[var(--rosa-forte)] tracking-widest">Inscrições Abertas - Vagas Limitadas</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-black text-[var(--texto-escuro)] leading-[1.05] mb-6">
              Você não precisa<br/>
              <span className="text-[var(--rosa-forte)] italic font-serif">ser forte</span><br/>
              o tempo todo.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-[var(--texto-medio)] mb-10 max-w-xl leading-relaxed font-medium">
              A exaustão da mãe atípica é invisível para o mundo, mas real no seu coração. 
              Encontre o suporte, as ferramentas e a comunidade que entendem sua jornada sem julgamentos.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/login" 
                className="px-10 py-5 rounded-2xl bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)] text-white font-black text-lg shadow-2xl shadow-[var(--rosa-forte)]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                COMEÇAR MINHA JORNADA <ArrowRight size={20} />
              </Link>
              <div className="flex items-center gap-3 px-6 py-4 bg-white/40 border border-white/60 rounded-2xl backdrop-blur-sm">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-pink-${300 + i*100}`} />)}
                 </div>
                 <span className="text-xs font-bold text-[var(--texto-medio)]">+1.200 Mães Ativas</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Card Preview Visual */}
            <div className="w-full aspect-square rounded-[3rem] bg-gradient-to-br from-white/80 to-white/40 border border-white backdrop-blur-md shadow-[0_50px_100px_-20px_rgba(212,83,126,0.15)] flex items-center justify-center p-12 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
               <div className="relative z-10 text-center">
                  <Heart className="w-20 h-20 text-[var(--rosa-forte)] mx-auto mb-8 animate-pulse" />
                  <p className="text-2xl font-serif italic text-[var(--texto-escuro)] mb-6 leading-relaxed">
                    "Aqui eu deixo de ser apenas 'mãe de autista' e volto a ser eu mesma."
                  </p>
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <span className="font-black text-[var(--texto-claro)] uppercase tracking-widest text-xs">Aline V., Membro Premium</span>
               </div>
               
               {/* Floating Badges */}
               <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-12 -right-6 px-4 py-2 bg-white rounded-xl shadow-lg border border-pink-100 flex items-center gap-2"
               >
                  <Users size={16} className="text-blue-500" />
                  <span className="text-[10px] font-black">REDE DE APOIO 24H</span>
               </motion.div>
               <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-12 -left-6 px-4 py-2 bg-white rounded-xl shadow-lg border border-pink-100 flex items-center gap-2"
               >
                  <Puzzle size={16} className="text-purple-500" />
                  <span className="text-[10px] font-black">ESPAÇO KIDS EDUCATIVO</span>
               </motion.div>
            </div>
          </motion.div>
        </section>

        {/* PAIN POINTS SECTION */}
        <section id="solucao" className="py-24 bg-white/40">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-16">
            <h2 className="text-sm font-black text-[var(--rosa-forte)] uppercase tracking-[0.3em] mb-4">A Jornada é Solitária?</h2>
            <h3 className="text-4xl md:text-5xl font-black text-[var(--texto-escuro)] mb-8">Sabemos exatamente o que você sente.</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { title: "Carga Mental Exaustiva", desc: "Consultas, terapias, escola e o medo constante do futuro. A mente nunca descansa." },
                { title: "Isolamento Social", desc: "Amigos se afastam, a família nem sempre entende e você se sente em um mundo à parte." },
                { title: "Falta de Direcionamento", desc: "Como acessar direitos? Como lidar com crises? A busca por respostas é cansativa." }
              ].map((p, i) => (
                <div key={i} className="p-8 bg-white/60 rounded-[2rem] border border-white hover:border-[var(--rosa-forte)]/30 transition-all">
                  <h4 className="font-black text-xl mb-4 text-[var(--texto-escuro)]">{p.title}</h4>
                  <p className="text-[var(--texto-medio)] font-medium leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION GRID (THE STACK) */}
        <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
           <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                <h2 className="text-sm font-black text-[var(--rosa-forte)] uppercase tracking-[0.3em] mb-4">O Ecossistema Completo</h2>
                <h3 className="text-4xl lg:text-5xl font-black text-[var(--texto-escuro)] mb-8 leading-tight">Tudo o que você precisa em um só lugar.</h3>
                <div className="space-y-6">
                  {[
                    { icon: <MessageCircle className="text-blue-500" />, title: "Rede de Mães Pro", desc: "Conecte-se com mães na sua cidade e por nível de suporte." },
                    { icon: <Headphones className="text-pink-500" />, title: "Rádio & Podcasts", desc: "Conteúdo focado em regulação e acolhimento para seus ouvidos." },
                    { icon: <Scale className="text-purple-500" />, title: "Guia de Direitos", desc: "Assistência clara sobre BPC, CIPTEA, leis e solicitações." },
                    { icon: <Zap className="text-amber-500" />, title: "Diário de Jornada", desc: "Organize marcos de desenvolvimento e cuide da sua saúde mental." }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-4 p-4 hover:bg-white/40 rounded-2xl transition-all cursor-default group">
                       <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
                          {s.icon}
                       </div>
                       <div>
                          <h4 className="font-bold text-[var(--texto-escuro)] mb-1">{s.title}</h4>
                          <p className="text-sm text-[var(--texto-medio)] font-medium">{s.desc}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                 <div className="aspect-[4/5] bg-pink-100 rounded-3xl overflow-hidden shadow-lg transform translate-y-8">
                    <img src="https://images.unsplash.com/photo-1544126592-807daa2b569b?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Mãe e filho" />
                 </div>
                 <div className="aspect-[4/5] bg-pink-200 rounded-3xl overflow-hidden shadow-lg">
                    <img src="https://images.unsplash.com/photo-1484981138541-3d074aa97716?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Suporte" />
                 </div>
              </div>
           </div>
        </section>

        {/* PRICING / THE GRAND SLAM OFFER */}
        <section id="precos" className="py-24 bg-[var(--texto-escuro)] text-white overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[var(--rosa-forte)]/10 rounded-full blur-[150px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-sm font-black text-[var(--rosa-forte)] uppercase tracking-[0.3em] mb-4">Escolha sua Porta de Entrada</h2>
            <h3 className="text-4xl md:text-5xl font-black mb-16">O investimento no seu <span className="italic">suporte</span>.</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
               {/* Free Plan */}
               <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col items-center">
                  <h4 className="text-xl font-bold mb-2 opacity-60">Gratuito</h4>
                  <div className="text-5xl font-black mb-8">R$ 0</div>
                  <ul className="text-left space-y-4 mb-10 flex-1">
                    <li className="flex items-center gap-2 text-sm opacity-80"><CheckCircle2 size={16} /> Acesso à Rede (Básico)</li>
                    <li className="flex items-center gap-2 text-sm opacity-80"><CheckCircle2 size={16} /> Guia de Leis Resumido</li>
                    <li className="flex items-center gap-2 text-sm opacity-80"><CheckCircle2 size={16} /> 1 Jogo Kids Grátis</li>
                  </ul>
                  <Link to="/login" className="w-full py-4 rounded-xl border border-white/20 font-bold hover:bg-white/10 transition-all">Começar agora</Link>
               </div>

               {/* Premium Plan (Hormozi Offer) */}
               <div className="p-8 bg-white text-[var(--texto-escuro)] rounded-[2.5rem] flex flex-col items-center relative shadow-[0_0_50px_rgba(212,83,126,0.3)] transform md:scale-105">
                  <div className="absolute -top-4 px-4 py-1 bg-[var(--rosa-forte)] text-white text-[10px] font-black uppercase rounded-full tracking-widest">Oferta de Lançamento</div>
                  <h4 className="text-xl font-bold mb-2">Membro Premium</h4>
                  <div className="text-5xl font-black mb-2 text-[var(--rosa-forte)]">R$ 29,90</div>
                  <p className="text-xs font-bold text-[var(--texto-claro)] mb-8">ou R$ 299 anuais (Economize 2 meses)</p>
                  
                  <ul className="text-left space-y-4 mb-10 flex-1 w-full">
                    <li className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 size={18} className="text-green-500" /> Rede de Mães Pro (Busca por Local)</li>
                    <li className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 size={18} className="text-green-500" /> Todos os Jogos Kids Liberados</li>
                    <li className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 size={18} className="text-green-500" /> Minha Jornada (Funcionalidades Full)</li>
                    <li className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 size={18} className="text-green-500" /> Rádio Atípica (Podcast Exclusivo)</li>
                    <li className="bg-pink-50 p-3 rounded-lg border border-pink-100 flex flex-col gap-1">
                       <span className="text-[10px] font-black text-[var(--rosa-forte)] uppercase tracking-tighter italic">+ BÔNUS EXCLUSIVO</span>
                       <span className="text-xs font-bold">E-book: Guia do BPC s/ Advogados</span>
                    </li>
                  </ul>
                  
                  <Link to="/login" className="w-full py-4 rounded-xl bg-[var(--rosa-forte)] text-white font-black hover:bg-[#b04066] transition-all flex items-center justify-center gap-2">
                    ASSINAR CLUBE PREMIUM <Zap size={18} fill="currentColor" />
                  </Link>
               </div>
            </div>
          </div>
        </section>

        {/* GUARANTEE & TRUST */}
        <section className="py-20 max-w-4xl mx-auto px-6 text-center">
            <div className="p-10 bg-white border border-pink-100 rounded-[3rem] shadow-xl">
               <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-6" />
               <h3 className="text-3xl font-black text-[var(--texto-escuro)] mb-4">Garantia Vida Atípica</h3>
               <p className="text-[var(--texto-medio)] font-medium mb-8">
                 Se nos primeiros 7 dias você sentir que a comunidade e as ferramentas não estão trazendo o acolhimento que você esperava, devolvemos 100% do seu investimento. Sem perguntas, sem burocracia. Estamos aqui para somar, não para ser mais um fardo.
               </p>
               <div className="flex items-center justify-center gap-8 opacity-40">
                  <div className="font-bold border-2 border-black px-3 py-1 text-xs">PAGAMENTO SEGURO</div>
                  <div className="font-bold border-2 border-black px-3 py-1 text-xs">PIX / CARTÃO</div>
               </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 border-t border-[var(--rosa-forte)]/10 px-6 md:px-12 text-center text-[var(--texto-claro)] text-sm font-bold">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="font-black text-xl text-[var(--texto-escuro)] flex items-center gap-2">
                <Sparkles className="text-[var(--rosa-forte)]" size={20} /> 
                almas atípicas
              </div>
              <div className="flex gap-8">
                 <Link to="/login" className="hover:text-[var(--rosa-forte)]">Termos</Link>
                 <Link to="/login" className="hover:text-[var(--rosa-forte)]">Privacidade</Link>
                 <Link to="/login" className="hover:text-[var(--rosa-forte)]">Suporte</Link>
              </div>
              <div>© 2026 Almas Atípicas - Desenvolvido com ❤️ para mães reais.</div>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;

