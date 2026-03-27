import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const S = {
  pageIn: { opacity: 1, x: 0, rotateY: 0 },
  pageInitial: { opacity: 0, x: 60, rotateY: -15 },
  pageExit: { opacity: 0, x: -60, rotateY: 15 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as any },
};

const Cover = () => (
  <div style={{ background: 'linear-gradient(145deg,#2C1810,#4A2218,#C1694F)', minHeight: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.015) 3px,rgba(255,255,255,0.015) 4px)' }} />
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#E8CC96', border: '1px solid rgba(201,169,110,0.4)', padding: '6px 18px', borderRadius: 30, marginBottom: 28, background: 'rgba(201,169,110,0.08)', position: 'relative' }}>✦ Comigo · Guia para Mães Atípicas ✦</div>
    <svg viewBox="0 0 200 100" width="180" style={{ marginBottom: 20, opacity: 0.85 }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="50" rx="80" ry="40" fill="rgba(201,169,110,0.15)" />
      <ellipse cx="78" cy="65" rx="25" ry="30" fill="rgba(255,255,255,0.08)" stroke="rgba(201,169,110,0.4)" strokeWidth="1" />
      <circle cx="78" cy="35" r="14" fill="rgba(255,255,255,0.1)" stroke="rgba(201,169,110,0.5)" strokeWidth="1" />
      <ellipse cx="112" cy="68" rx="14" ry="18" fill="rgba(255,255,255,0.06)" stroke="rgba(201,169,110,0.3)" strokeWidth="1" />
      <circle cx="112" cy="49" r="9" fill="rgba(255,255,255,0.08)" stroke="rgba(201,169,110,0.35)" strokeWidth="1" />
      <text x="88" y="53" fontSize="12" fill="#C9A96E" opacity="0.9">♥</text>
    </svg>
    <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(34px,6vw,56px)', fontWeight: 900, color: '#fff', lineHeight: 1.08, letterSpacing: -1, marginBottom: 8, position: 'relative' }}>O Luto que<br /><em style={{ fontStyle: 'italic', color: '#E8CC96' }}>Ninguém Fala</em></h1>
    <div style={{ width: 60, height: 2, background: 'linear-gradient(to right,transparent,#C9A96E,transparent)', margin: '18px auto' }} />
    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, maxWidth: 400, lineHeight: 1.7, marginBottom: 24, fontWeight: 300, position: 'relative' }}>O que acontece com você após o diagnóstico do seu filho — e por que isso tem um nome, uma razão e uma saída</p>
    <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', color: '#C9A96E', fontSize: 15, position: 'relative' }}>Coleção Comigo · Para toda mãe que se sentiu sozinha</p>
  </div>
);

const HBox = ({ icon, text }: { icon: string; text: string }) => (
  <div style={{ background: 'linear-gradient(135deg,#FEF3EC,#FAE8D8)', borderLeft: '4px solid #C1694F', borderRadius: '0 12px 12px 0', padding: '16px 20px', margin: '18px 0' }}>
    <p style={{ margin: 0, fontSize: 14.5, color: '#2C1810', fontWeight: 600, lineHeight: 1.7 }}>{icon} {text}</p>
  </div>
);

const Quote = ({ text, fonte }: { text: string; fonte: string }) => (
  <div style={{ borderTop: '2px solid #C9A96E', borderBottom: '2px solid #C9A96E', padding: '18px 24px', margin: '24px 0', textAlign: 'center' as const }}>
    <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontStyle: 'italic', color: '#2C1810', lineHeight: 1.7, margin: 0 }}>"{text}"</p>
    <cite style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#8B6553', marginTop: 8 }}>— {fonte}</cite>
  </div>
);

const Tip = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', margin: '14px 0', boxShadow: '0 3px 16px rgba(0,0,0,0.07)', display: 'flex', gap: 14 }}>
    <span style={{ fontSize: 26, flexShrink: 0 }}>{icon}</span>
    <div><h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, color: '#2C1810', margin: '0 0 4px' }}>{title}</h4><p style={{ fontSize: 13.5, color: '#5C3D2E', lineHeight: 1.65, margin: 0 }}>{text}</p></div>
  </div>
);

const PhaseCard = ({ num, title, text }: { num: string; title: string; text: string }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '16px 14px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderTop: '3px solid #C1694F', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', right: 8, top: 6, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, fontWeight: 900, color: 'rgba(193,105,79,0.08)', lineHeight: 1 }}>{num}</div>
    <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, color: '#9B4D37', marginBottom: 6, marginTop: 0 }}>{title}</h4>
    <p style={{ fontSize: 13, lineHeight: 1.65, color: '#5C3D2E', margin: 0 }}>{text}</p>
  </div>
);

const Body = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#FDF8F3', padding: '36px 44px 52px 48px', minHeight: 440 }}>{children}</div>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 700, color: '#9B4D37', margin: '26px 0 10px', lineHeight: 1.3 }}>{children}</h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 15, color: '#5C3D2E', lineHeight: 1.82, marginBottom: 14 }}>{children}</p>
);

const ChapterOpener = ({ num, title, subtitle, bg }: { num: string; title: string; subtitle: string; bg: string }) => (
  <div style={{ background: bg, minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '40px 44px 32px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', right: -50, top: -50, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{num}</div>
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(24px,4vw,34px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, position: 'relative', zIndex: 1 }}>{title}<br /><em style={{ color: '#E8CC96' }}>{subtitle}</em></div>
  </div>
);

const PAGES: React.ReactNode[] = [
  /* 0 — Capa */ <Cover key="cover" />,
  
  /* 1 — Sumário */
  <div key="sumario" style={{ background: '#FDF8F3', padding: '40px 48px 52px' }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#C1694F', opacity: 0.7, marginBottom: 8 }}>Índice</div>
    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 900, color: '#2C1810', marginBottom: 26, lineHeight: 1.2 }}>O que você vai <em style={{ fontStyle: 'italic', color: '#C1694F' }}>encontrar aqui</em></h2>
    {[['01','O Momento em que Tudo Mudou — O impacto do diagnóstico'],['02','O Filho Imaginado — O luto que ninguém explica'],['03','As 5 Fases — Entendendo cada etapa do processo'],['04','O Outro Lado — Ressignificação e vida nova'],['05','Uma Carta Para Você — Fechamento com amor']].map(([n,l],i) => (
      <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 13, color: '#C1694F', fontWeight: 700, minWidth: 26 }}>{n}</span>
        <span style={{ fontSize: 14, color: '#5C3D2E', fontWeight: 600, flex: 1 }}>{l}</span>
        <span style={{ color: '#E8927C', fontSize: 12 }}>›</span>
      </div>
    ))}
    <div style={{ marginTop: 28, padding: '18px 20px', background: 'linear-gradient(135deg,#FEF3EC,#FAE8D8)', borderRadius: 14 }}>
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 15, color: '#2C1810', lineHeight: 1.7, margin: 0 }}>"Este ebook não é sobre autismo. É sobre você — a mãe que ficou de pé quando o chão sumiu embaixo dos seus pés."</p>
    </div>
  </div>,

  /* 2 — Cap1 Abertura */
  <div key="cap1a">
    <ChapterOpener num="Capítulo 01" title="O Momento em que" subtitle="Tudo Mudou" bg="linear-gradient(135deg,#C1694F,#9B4D37,#E8927C)" />
    <Body>
      <P><strong style={{ color: '#C1694F' }}>Você lembra do dia.</strong> Talvez fosse uma manhã de consulta comum. E então vieram as palavras: <em>Transtorno do Espectro Autista. TEA.</em></P>
      <P>Para algumas mães, foi um alívio — finalmente havia um nome. Para outras, o mundo parou. Para a maioria, foi os dois ao mesmo tempo.</P>
      <HBox icon="📊" text="Pesquisas mostram que mães de crianças com TEA enfrentam sobrecarga emocional, física e financeira significativa — e a maioria nunca recebe orientação psicológica sobre esse processo." />
      <P>O que ninguém te contou — e que este ebook vai te contar — é que o que você sente tem nome, fundamento científico, e <strong>não é fraqueza</strong>.</P>
      <Quote text="Após receberem o diagnóstico, as mães passam pelo que chamamos de impacto — um momento em que não conseguem saber lidar com as situações e com as próprias emoções." fonte="Literatura científica brasileira sobre TEA" />
    </Body>
  </div>,

  /* 3 — Cap1 continuação */
  <div key="cap1b">
    <Body>
      <H3>O que acontece no seu corpo e na sua mente</H3>
      <P>Não é drama. É biologia. O cérebro responde como se fosse uma ameaça física. O cortisol sobe. As perguntas chegam em ondas:</P>
      {['E agora, o que eu faço?','Isso tem cura? Vai melhorar?','Por que com o meu filho?','O que eu fiz de errado?','Vou conseguir cuidar dele do jeito certo?'].map(q => (
        <div key={q} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: 14.5, color: '#5C3D2E', lineHeight: 1.6 }}>
          <span style={{ width: 22, height: 22, background: '#C1694F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 12, fontWeight: 700 }}>?</span>{q}
        </div>
      ))}
      <H3>A solidão invisível</H3>
      <P>Familiares tentam ajudar e acabam minimizando. Amigos somem. Você fica com um peso que não consegue nem nomear.</P>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' as const, margin: '18px 0' }}>
        {[['70%','das mães relatam sentir-se sozinhas após o diagnóstico'],['4+','anos é o tempo médio até o diagnóstico no Brasil'],['1 em 36','crianças hoje nasce no espectro autista']].map(([n,l]) => (
          <div key={n} style={{ flex: 1, minWidth: 120, background: 'linear-gradient(135deg,#9B4D37,#C1694F)', color: '#fff', borderRadius: 14, padding: '16px 14px', textAlign: 'center' as const }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 900, color: '#E8CC96', display: 'block' }}>{n}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginTop: 6, lineHeight: 1.4 }}>{l}</span>
          </div>
        ))}
      </div>
      <P>Você não está sozinha. E o que você sente não é excesso — é humano.</P>
    </Body>
  </div>,

  /* 4 — Cap2 Abertura */
  <div key="cap2a">
    <ChapterOpener num="Capítulo 02" title="O Filho" subtitle="Imaginado — o luto que ninguém fala" bg="linear-gradient(135deg,#4A1C2A,#9B3A5A,#C47490)" />
    <Body>
      <P><strong style={{ color: '#C1694F' }}>Muito antes do seu filho nascer, ele já existia.</strong> Existia na sua imaginação — com um rosto que você tentava adivinhar, com um futuro que você já construía.</P>
      <P>Esse bebê imaginado é real. Os pesquisadores chamam de <strong>"filho idealizado"</strong>, e ele se forma a partir de quatro dimensões:</P>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '18px 0' }}>
        {[['A','Dimensão Estética','Como ele seria fisicamente — o sorriso, os traços, a semelhança.'],['B','Dimensão de Competência','O que ele conseguiria fazer — se seria bailarina, médico, artista.'],['C','Dimensão de Futuro','A vida que ele teria — faculdade, amor, independência.'],['D','Identidade Materna','Quem você seria como mãe — como o criaria, os momentos juntos.']].map(([l,t,d]) => (
          <PhaseCard key={l} num={l} title={`✦ ${t}`} text={d} />
        ))}
      </div>
      <P>Quando o diagnóstico chega, é como se esse filho imaginado fosse embora. Esse é o luto — não do seu filho real, mas de todos os futuros que você havia construído.</P>
    </Body>
  </div>,

  /* 5 — Cap2 continuação */
  <div key="cap2b">
    <Body>
      <H3>Por que isso é um luto de verdade</H3>
      <P>A psicologia reconhece o "luto simbólico" — a perda de algo que existia apenas no campo das expectativas, mas que era absolutamente real para quem sonhava.</P>
      <HBox icon="💡" text="O luto materno pós-diagnóstico de TEA é reconhecido cientificamente como um processo de perda legítimo. Sentir isso não significa que você ama menos seu filho." />
      <H3>O que você não precisa sentir vergonha de sentir</H3>
      <P>Tristeza profunda. Raiva. Inveja. Exaustão. Culpa. Amor enorme e desespero ao mesmo tempo. Todos esses sentimentos coexistem — e nenhum cancela o outro.</P>
      <Quote text="A mãe diz que está com a sensação de luto — isso não significa que ela considera ter perdido um filho. O luto autista está relacionado a sonhos." fonte="Autismo e Realidade" />
      <H3>A culpa — a mais silenciosa de todas</H3>
      <P>"O que eu fiz durante a gravidez?" A culpa materna é amplificada em nossa cultura porque existe a ideia de que mãe "perfeita" produz filho "perfeito".</P>
      <Tip icon="🔬" title="O que a ciência realmente diz" text="O autismo é resultado de fatores genéticos e ambientais pré-natais. Não existe ação específica que uma mãe possa ter feito que cause TEA. A culpa não tem base na realidade — mas é completamente compreensível." />
    </Body>
  </div>,

  /* 6 — Cap2 julgamento */
  <div key="cap2c">
    <Body>
      <H3>O julgamento de fora</H3>
      <P>Além da culpa interna, muitas mães enfrentam comentários que machucam profundamente:</P>
      {['"Você deve ter sido permissiva demais na criação"','"Na minha época não existia esse autismo"','"Você vai ver que ele vai sair disso"','"Será que não é só frescura?"','"Tente não falar que ele é autista para não rotulá-lo"'].map(c => (
        <div key={c} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: 14.5, color: '#5C3D2E', lineHeight: 1.6 }}>
          <span style={{ width: 22, height: 22, background: '#9B3A5A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 12, fontWeight: 700 }}>✗</span>{c}
        </div>
      ))}
      <HBox icon="💬" text="Você não precisa educar o mundo inteiro. Você pode escolher com quem compartilha, quando e o quanto quer explicar. Proteger sua energia também é cuidar do seu filho." />
    </Body>
  </div>,

  /* 7 — Cap3 Abertura */
  <div key="cap3a">
    <ChapterOpener num="Capítulo 03" title="As 5 Fases —" subtitle="O mapa do seu coração" bg="linear-gradient(135deg,#1A3A4A,#2A6080,#4A90A4)" />
    <Body>
      <P>A psiquiatra Elisabeth Kübler-Ross descreveu as fases do luto para qualquer perda significativa — incluindo o luto pelo filho idealizado.</P>
      <P><strong>Importante:</strong> as fases não são lineares. Você pode voltar a fases anteriores. Não existe jeito certo ou prazo certo.</P>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '18px 0' }}>
        <PhaseCard num="1" title="1ª Fase — Negação" text='"Tenho certeza que o médico errou. Vou buscar uma segunda opinião. Ele é só um pouco mais devagar."' />
        <PhaseCard num="2" title="2ª Fase — Raiva" text='"Por que comigo? Por que com ele? Fico com raiva das outras mães, do meu parceiro, de mim mesma."' />
        <PhaseCard num="3" title="3ª Fase — Barganha" text='"Se eu colocar em todas as terapias e fizer tudo certo, talvez ele evolua e supere o diagnóstico."' />
        <PhaseCard num="4" title="4ª Fase — Depressão" text="A tristeza profunda chega. O cansaço. A sensação de que não vai dar conta. É a fase mais pesada — e ela passa." />
      </div>
    </Body>
  </div>,

  /* 8 — Cap3 Fase 5 */
  <div key="cap3b">
    <Body>
      <div style={{ background: 'linear-gradient(135deg,#9B4D37,#C1694F)', borderRadius: 16, padding: '24px 26px', marginBottom: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>5ª e Última Fase</div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Aceitação ✦</div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, margin: 0 }}>Aceitação não é resignação. É olhar para o seu filho real — com suas especificidades e seus dons únicos — e dizer: <em>"Eu te vejo. Eu te amo. Vou aprender a caminhar com você."</em></p>
      </div>
      <H3>A fase de barganha e o perigo das curas milagrosas</H3>
      <P>Na fase de barganha, a mãe está disposta a tentar qualquer coisa. É nessa vulnerabilidade que aparecem promessas de "cura", protocolos não científicos, intervenções caras e sem evidência.</P>
      <HBox icon="🔴" text='Sinal de alerta: qualquer profissional que prometa "curar o autismo" está agindo antiéticamente. Procure terapias com base científica: ABA, fonoaudiologia, terapia ocupacional e psicologia.' />
      <Tip icon="💡" title="Busca por informação = amor em ação" text="A busca por recursos é a forma mais poderosa do amor materno se expressar. O problema é quando a busca vira fuga — do diagnóstico, dos sentimentos, do presente." />
    </Body>
  </div>,

  /* 9 — Cap3 Depressão */
  <div key="cap3c">
    <Body>
      <H3>Quando a tristeza vira depressão</H3>
      <P>Muitas mães desenvolvem depressão e ansiedade, e nunca recebem ajuda porque estão tão focadas no filho que esquecem de si mesmas.</P>
      <div style={{ background: '#FEF3EC', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: '#9B4D37', textAlign: 'center' as const, marginBottom: 14, fontSize: 15 }}>Sinais de que você precisa de apoio profissional</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['😶','Vazio constante','Não sente prazer em nada'],['😴','Sono alterado','Dorme demais ou de menos'],['🔒','Isolamento','Evita todas as pessoas'],['😠','Irritabilidade','Raiva sem causa'],['🤍','Desapego','Sentir-se distante do filho'],['💔','Pensamentos ruins','Sobre si mesma ou a vida']].map(([ic,t,d]) => (
            <div key={t} style={{ background: 'white', borderRadius: 10, padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 18 }}>{ic}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9B4D37', marginTop: 4 }}>{t}</div>
              <div style={{ fontSize: 11, color: '#5C3D2E' }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
      <Tip icon="🤝" title="Buscar ajuda é um ato de amor pelo seu filho" text="Você não pode cuidar de alguém rodando no vazio. Uma mãe emocionalmente saudável cuida melhor. Procurar terapia não é luxo — é necessidade. Acesse pelo CAPS ou CRAS gratuitamente." />
    </Body>
  </div>,

  /* 10 — Cap4 Abertura */
  <div key="cap4a">
    <ChapterOpener num="Capítulo 04" title="O Outro Lado —" subtitle="Quando o luto vira força" bg="linear-gradient(135deg,#1A3A28,#2D6A4F,#52B788)" />
    <Body>
      <P><strong style={{ color: '#2D6A4F' }}>Existe um outro lado.</strong> Não um lado onde as dificuldades somem, mas um lado onde você não carrega mais o peso de quem não sabe o que está sentindo.</P>
      <P>A ressignificação é um processo ativo. Você não "chega" lá. Você <strong>constrói</strong> o caminho.</P>
      <Quote text="As mães constroem sentidos próprios para o autismo de seus filhos. Com o diagnóstico, uma nova mãe nasce — com novos planos e uma nova identidade." fonte="Pesquisa científica sobre TEA e família" />
      <H3>O que muda quando você atravessa o luto</H3>
      {['Você para de lutar contra o diagnóstico e começa a trabalhar com ele','Você descobre habilidades que nunca sabia que tinha','Você enxerga avanços — por menores que sejam — como vitórias reais','Você aprende a falar sobre o TEA sem precisar se justificar','Você constrói uma rede de apoio com outras mães que entendem'].map(i => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: 14.5, color: '#5C3D2E', lineHeight: 1.6 }}>
          <span style={{ width: 22, height: 22, background: '#2D6A4F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>{i}
        </div>
      ))}
    </Body>
  </div>,

  /* 11 — Cap4 movimentos */
  <div key="cap4b">
    <Body>
      <H3>Os dois movimentos que você precisa fazer</H3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '18px 0' }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 16px', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', borderTop: '3px solid #C1694F' }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>🌱</div>
          <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, color: '#9B4D37', marginBottom: 8, marginTop: 0 }}>Movimento Interno</h4>
          <p style={{ fontSize: 13.5, color: '#5C3D2E', lineHeight: 1.7, margin: 0 }}>Adaptar-se à sua nova realidade emocional. Processar o luto. Reconstruir sua identidade de mãe a partir do filho real que você tem.</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 16px', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', borderTop: '3px solid #C9A96E' }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>🌍</div>
          <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, color: '#2C1810', marginBottom: 8, marginTop: 0 }}>Movimento Externo</h4>
          <p style={{ fontSize: 13.5, color: '#5C3D2E', lineHeight: 1.7, margin: 0 }}>Trabalhar a aceitação social. Educar a escola, a família, os vizinhos. Construir uma rede. Ocupar espaços com seu filho.</p>
        </div>
      </div>
      <H3>Reconstruindo os sonhos — não abandonando</H3>
      <P>A ressignificação não é sobre abrir mão — é sobre <strong>reescrever</strong>. O autismo não define o teto do seu filho. Define o <em>caminho</em> — diferente, mas igualmente cheio de possibilidades.</P>
      <HBox icon="💚" text="Mães de crianças com TEA desenvolvem, com o tempo, uma resiliência documentada pela ciência. A dor não some — mas você aprende a carregá-la com mais leveza. Com mais propósito." />
    </Body>
  </div>,

  /* 12 — Cap4 práticas */
  <div key="cap4c">
    <Body>
      <H3>O que realmente ajuda — baseado em ciência</H3>
      <Tip icon="🧠" title="1. Acompanhamento psicológico" text="A terapia individual é a ferramenta mais poderosa. Você pode acessar gratuitamente pelo CAPS, CRAS ou serviços de psicologia universitários." />
      <Tip icon="👩‍👩‍👧" title="2. Grupos de mães atípicas" text="O contato com quem vive a mesma realidade reduz o isolamento. Grupos presenciais ou online são pontos de ancoragem essenciais." />
      <Tip icon="📚" title="3. Informação de qualidade" text="Quanto mais você entende o TEA — o perfil sensorial, os interesses, as dificuldades do seu filho — menos medo sente." />
      <Tip icon="🌸" title="4. Autocuidado não negociável" text="Dormir. Comer. Ter um momento por dia que é só seu. Não é egoísmo — é manutenção. Seu filho precisa da melhor versão de você." />
      <Tip icon="✋" title="5. Pedir e aceitar ajuda" text='A cultura de "mãe que se vira sozinha" mata. Peça ajuda. Aceite ajuda. Delegue. Você não foi feita para fazer tudo isso em solidão.' />
    </Body>
  </div>,

  /* 13 — Fechamento */
  <div key="fechamento" style={{ background: 'linear-gradient(160deg,#2C1810,#9B4D37)', minHeight: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '52px 44px', textAlign: 'center' as const }}>
    <div style={{ fontSize: 44 }}>💌</div>
    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, color: '#fff', margin: '18px 0 14px' }}>Uma carta para você</h2>
    <div style={{ width: 60, height: 2, background: 'linear-gradient(to right,transparent,#C9A96E,transparent)', margin: '0 auto 24px' }} />
    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14.5, lineHeight: 1.9, maxWidth: 460 }}>
      Querida mãe,<br /><br />
      Se você chegou até aqui, você já está fazendo algo que tantas não fazem: <strong style={{ color: '#E8CC96' }}>buscando se entender</strong>.<br /><br />
      O luto que você sente é real. A exaustão é real. O amor imenso que te move também é real. Nada disso se contradiz.<br /><br />
      Você não precisa ter tudo resolvido para ser uma boa mãe. Você só precisa continuar — e pedir ajuda quando não conseguir sozinha.<br /><br />
      Seu filho não precisa de uma mãe perfeita. Ele precisa da <em style={{ color: '#E8CC96' }}>sua</em> mãe.
    </p>
    <div style={{ width: 60, height: 2, background: 'linear-gradient(to right,transparent,#C9A96E,transparent)', margin: '24px auto' }} />
    <p style={{ color: '#C9A96E', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 16 }}>Com amor e respeito,<br />Comigo — a plataforma que caminha ao seu lado</p>
    <p style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.3)', maxWidth: 380 }}>Este ebook faz parte da Coleção Comigo — desenvolvida para mães atípicas brasileiras. Compartilhe com quem precisa. ♥</p>
  </div>,
];

const CHAPTER_MAP = [0, 1, 2, 4, 7, 10, 13];
const CHAPTER_LABELS = ['Capa', 'Sumário', 'Cap. 1', 'Cap. 2', 'Cap. 3', 'Cap. 4', 'Final'];
const TOTAL = PAGES.length;

const EbookLutoReader: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (n: number) => {
    setDir(n > current ? 1 : -1);
    setCurrent(Math.max(0, Math.min(TOTAL - 1, n)));
  };

  const activeChapter = CHAPTER_MAP.reduce((acc, pg, i) => current >= pg ? i : acc, 0);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", position: 'relative', width: '100%' }}>
      {/* Nav Chapters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
        {CHAPTER_MAP.map((pg, i) => (
          <button key={i} onClick={() => go(pg)} style={{ background: activeChapter === i ? '#C1694F' : 'rgba(255,255,255,0.6)', color: activeChapter === i ? '#fff' : '#5C3D2E', border: '1px solid rgba(193,105,79,0.25)', borderRadius: 30, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
            {CHAPTER_LABELS[i]}
          </button>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>{current + 1} / {TOTAL}</span>
      </div>

      {/* Book */}
      <div style={{ perspective: 1800, width: '100%', maxWidth: 720, margin: '0 auto', borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.35)', position: 'relative' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0, x: dir * 60, rotateY: dir * -15 }}
            animate={S.pageIn}
            exit={{ opacity: 0, x: dir * -60, rotateY: dir * 15 }}
            transition={S.transition}
            style={{ transformOrigin: 'center center', minHeight: 480, background: '#FDF8F3', position: 'relative' }}
          >
            {/* Spine */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 22, background: 'linear-gradient(to right,rgba(0,0,0,0.12),transparent)', zIndex: 5, pointerEvents: 'none' }} />
            {PAGES[current]}
            <div style={{ position: 'absolute', bottom: 16, right: 28, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 12, color: '#8B6553', letterSpacing: 1, opacity: 0.5 }}>p. {current + 1}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav Buttons + Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginTop: 20 }}>
        <button disabled={current === 0} onClick={() => go(current - 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 50, padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.3 : 1, backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}>
          <ChevronLeft size={16} /> Anterior
        </button>
        <div style={{ width: 140, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(to right,#C1694F,#C9A96E)', borderRadius: 4, width: `${((current + 1) / TOTAL * 100).toFixed(1)}%`, transition: 'width 0.4s ease' }} />
        </div>
        <button disabled={current === TOTAL - 1} onClick={() => go(current + 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 50, padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: current === TOTAL - 1 ? 'not-allowed' : 'pointer', opacity: current === TOTAL - 1 ? 0.3 : 1, backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}>
          Próxima <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default EbookLutoReader;
