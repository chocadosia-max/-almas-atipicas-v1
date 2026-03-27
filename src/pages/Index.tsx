import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
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

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-[#FBEAF0]">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--rosa-forte)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--rosa-medio)]/10 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] py-4 px-6 md:px-12 bg-white/90 backdrop-blur-xl border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-2xl text-[var(--texto-escuro)]">
            <Sparkles className="text-[var(--rosa-forte)] w-6 h-6" />
            <span>almas <em className="text-[var(--rosa-forte)] italic font-serif">atípicas</em></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[var(--texto-medio)]">
            <a href="#solucao" className="hover:text-[var(--rosa-forte)] transition-colors">A Solução</a>
            <a href="#comunidade" className="hover:text-[var(--rosa-forte)] transition-colors">Comunidade</a>
          </div>
          <Link 
            to="/login" 
            className="px-6 py-2.5 rounded-xl bg-[var(--rosa-forte)] text-white font-bold transition-all shadow-md hover:scale-[1.05] active:scale-95"
          >
            Entrar
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-28 sm:pt-36 md:pt-40 pb-16 md:pb-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[90vh]">
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
            
            <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-[var(--texto-escuro)] leading-[1.05] mb-4 md:mb-6">
              Você não precisa<br/>
              <span className="text-[var(--rosa-forte)] italic font-serif">ser forte</span><br/>
              o tempo todo.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-[var(--texto-medio)] mb-6 md:mb-10 max-w-xl leading-relaxed font-medium">
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
              <div className="flex items-center gap-3 px-6 py-4 bg-white border border-pink-100 rounded-2xl shadow-sm">
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
            className="hidden sm:block relative"
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
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[var(--texto-escuro)] mb-6 md:mb-8">Sabemos exatamente o que você sente.</h3>
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
              <div className="hidden lg:flex lg:w-1/2 justify-center items-center perspective-1000">
                  <motion.div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      rotateY,
                      rotateX,
                      transformStyle: "preserve-3d",
                    }}
                    className="relative h-96 w-72 rounded-[2rem] bg-gradient-to-br from-[var(--rosa-forte)] to-[var(--rosa-medio)] shadow-2xl"
                  >
                    <div
                      style={{
                        transform: "translateZ(75px)",
                        transformStyle: "preserve-3d",
                      }}
                      className="absolute inset-4 grid place-content-center rounded-[1.5rem] bg-white/20 backdrop-blur-md border border-white/30 shadow-lg"
                    >
                      <Sparkles
                        style={{
                          transform: "translateZ(50px)",
                        }}
                        className="mx-auto text-white w-20 h-20 drop-shadow-2xl mb-4"
                      />
                      <p
                        style={{
                          transform: "translateZ(40px)",
                        }}
                        className="text-center text-2xl font-black text-white px-2"
                      >
                        Acolhimento <br />
                        <span className="text-pink-100 italic font-serif font-normal">Sempre Ativo</span>
                      </p>
                    </div>

                    {/* Floating elements behind */}
                    <motion.div
                      style={{ transform: "translateZ(30px)" }}
                      className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                    />
                    <motion.div
                      style={{ transform: "translateZ(30px)" }}
                      className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl"
                    />
                  </motion.div>
              </div>
           </div>
        </section>

      </main>
    </div>
  );
};

export default Index;

