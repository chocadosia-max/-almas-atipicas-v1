import React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Scale, 
  CreditCard, 
  Stethoscope, 
  GraduationCap, 
  Briefcase, 
  ChevronRight,
  ExternalLink,
  Info,
  Newspaper
} from "lucide-react";
import { Link } from "react-router-dom";
import CalculadoraDireitos from "@/components/CalculadoraDireitos";

const DIREITOS_CATEGORIES = [
  {
    title: "BENEFÍCIOS FINANCEIROS",
    icon: <Scale className="w-5 h-5" />,
    items: [
      {
        id: "bpc",
        name: "BPC/LOAS",
        content: "Benefício de Prestação Continuada. Garante um salário mínimo mensal à pessoa com deficiência de qualquer idade que comprove não possuir meios de prover a própria manutenção.",
        solicitacao: "Pode ser feito pelo site ou app Meu INSS, ou pelo telefone 135.",
        documentos: "CPF de todos os membros da família, comprovante de residência e laudo médico atualizado.",
        link: "https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-assistenciais/beneficio-assistencial-a-pessoa-com-deficiencia-bpc"
      },
      {
        id: "isencao",
        name: "Isenção de IR",
        content: "Pessoas com deficiência (ou seus responsáveis legais) têm direito à isenção do Imposto de Renda sobre rendimentos de aposentadoria e pensão.",
        solicitacao: "Requerimento via Portal e-CAC da Receita Federal com laudo pericial.",
        documentos: "Laudo médico emitido por serviço público e documentos de identificação.",
        link: "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/isencoes/isencao-de-irpf-para-portadores-de-molestia-grave"
      },
      {
        id: "passe-livre",
        name: "Passe Livre Intermunicipal",
        content: "Gratuidade nas passagens de transportes coletivos interestaduais (ônibus, trem e barco) para pessoas de baixa renda com deficiência.",
        solicitacao: "Através do site do Ministério da Infraestrutura ou nos postos autorizados.",
        documentos: "Laudo médico padrão, foto 3x4 e comprovante de renda.",
        link: "https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/passe-livre"
      }
    ]
  },
  {
    title: "SAÚDE",
    icon: <Stethoscope className="w-5 h-5" />,
    items: [
      {
        id: "sus",
        name: "Atendimento Especializado (SUS)",
        content: "Direito ao atendimento multidisciplinar em CAPS (Centros de Atenção Psicossocial), CER (Centros Especializados em Reabilitação) e CRAS.",
        solicitacao: "Encaminhamento via Unidade Básica de Saúde (UBS) do seu bairro.",
        documentos: "Cartão do SUS e laudo com CID.",
        link: "https://www.gov.br/saude/pt-br"
      },
      {
        id: "remedios",
        name: "Medicamentos Gratuitos",
        content: "Acesso a fármacos de uso contínuo pelo programa Farmácia Popular ou via farmácias de alto custo do Estado.",
        solicitacao: "Apresentação de receita médica (validade 6 meses) e documento com foto.",
        documentos: "Receita do SUS ou particular e cartão do SUS.",
        link: "https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular"
      }
    ]
  },
  {
    title: "EDUCAÇÃO",
    icon: <GraduationCap className="w-5 h-5" />,
    items: [
      {
        id: "acompanhante",
        name: "Acompanhante Terapêutico",
        content: "A escola (pública ou particular) deve prover apoio especializado sem custo adicional para a família se comprovada a necessidade.",
        solicitacao: "Requerimento formal à secretaria da escola anexando o laudo e recomendação médica.",
        documentos: "Laudo médico solicitando expressamente o apoio escolar.",
        link: "http://portal.mec.gov.br/"
      },
      {
        id: "aee",
        name: "Atendimento Educacional Especializado (AEE)",
        content: "Serviço pedagógico extracurricular que identifica e organiza recursos de aprendizagem para o aluno com TEA.",
        solicitacao: "Solicitar avaliação pedagógica na escola regular.",
        documentos: "Documentos escolares e laudo.",
        link: "http://portal.mec.gov.br/atendimento-educacional-especializado"
      }
    ]
  },
  {
    title: "TRABALHO E SOCIAL",
    icon: <Briefcase className="w-5 h-5" />,
    items: [
      {
        id: "lei-romeo-mion",
        name: "Carteirinha de Autista (Ciptea)",
        content: "Lei Romeo Mion (13.977/20). Documento que agiliza o atendimento prioritário e acesso a serviços públicos e privados.",
        solicitacao: "Via órgãos estaduais ou municipais de assistência social.",
        documentos: "RG, comprovante de residência e laudo com CID assinado.",
        link: "https://www.gov.br/pt-br/servicos/obter-a-carteira-de-identificacao-da-pessoa-com-transtorno-do-espectro-autista-ciptea"
      },
      {
        id: "cotas",
        name: "Cotas em Concursos e Empregos",
        content: "Reserva de percentual de vagas em concursos públicos e empresas com mais de 100 funcionários para pessoas com deficiência.",
        solicitacao: "Inscrição na modalidade PcD conforme edital ou processo seletivo.",
        documentos: "Laudo médico atualizado compatível com o edital.",
        link: "https://www.gov.br/pt-br"
      }
    ]
  }
];

const NOTICIAS_MOCK = [
  { id: 1, title: "Novo Projeto de Lei amplia isenção de IPVA para TEA em SP", data: "24/03/2026", fonte: "Portal ALESP" },
  { id: 2, title: "STJ reafirma obrigatoriedade de acompanhante em escolas particulares", data: "20/03/2026", fonte: "Jurídico Hoje" },
  { id: 3, title: "Governo Federal lança novo portal para solicitação da CIPTEA", data: "15/03/2026", fonte: "Gov.BR" },
];

const SeusDireitos = () => {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Hero */}
      <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-10 mb-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-[var(--rosa-claro)] to-white/30">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold text-[var(--texto-escuro)] mb-4 font-serif leading-tight">
            Você tem direitos.<br/> <span className="text-[var(--rosa-forte)] italic">Conheça todos eles.</span>
          </h1>
          <p className="text-[var(--texto-medio)] text-lg mb-8 max-w-xl">
            A informação é a primeira barreira contra o preconceito e a exclusão. Navegue pelas conquistas que garantem o suporte ao seu filho.
          </p>
        </div>
        <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center p-4 border border-white/40">
           <Scale size={80} className="text-[var(--rosa-forte)] opacity-80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Accordions */}
        <div className="lg:col-span-8">
          <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-[var(--texto-escuro)] mb-8 font-serif">Guia de Direitos Práticos</h2>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              {DIREITOS_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 text-[var(--rosa-forte)] font-bold text-xs tracking-widest uppercase mb-4 px-1">
                    {cat.icon}
                    <span>{cat.title}</span>
                  </div>
                  
                  {cat.items.map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="border border-pink-100 bg-white rounded-2xl px-4 mb-3 overflow-hidden transition-all data-[state=open]:shadow-md data-[state=open]:border-[var(--rosa-forte)]/30">
                      <AccordionTrigger className="hover:no-underline py-4 text-[var(--texto-escuro)] font-bold text-left hover:text-[var(--rosa-forte)]">
                        {item.name}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 text-[var(--texto-medio)]">
                        <p className="mb-4 leading-relaxed">{item.content}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="bg-white/20 p-4 rounded-xl border border-white/30">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-[var(--texto-escuro)] uppercase mb-2">
                              <Info size={14} className="text-[var(--rosa-forte)]" /> Como Solicitar
                            </h4>
                            <p className="text-sm">{item.solicitacao}</p>
                          </div>
                          <div className="bg-white/20 p-4 rounded-xl border border-white/30">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-[var(--texto-escuro)] uppercase mb-2">
                              <ClipboardList size={14} className="text-[var(--rosa-forte)]" /> Documentos
                            </h4>
                            <p className="text-sm">{item.documentos}</p>
                          </div>
                        </div>

                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-2 text-[var(--rosa-forte)] font-bold text-sm hover:underline"
                        >
                          Acesssar canal oficial <ExternalLink size={14} />
                        </a>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </div>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Sidebar: Calculadora + News */}
        <div className="lg:col-span-4 space-y-6">
          {/* CALCULADORA DE DIREITOS */}
          <CalculadoraDireitos />
          <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-[var(--texto-escuro)] mb-6 font-serif">
              <Newspaper className="text-[var(--rosa-forte)]" /> Notícias & Atualizações
            </h3>
            <div className="space-y-4">
              {NOTICIAS_MOCK.map((news) => (
                <div key={news.id} className="p-4 bg-white/20 hover:bg-white/40 rounded-xl border border-white/30 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[var(--texto-claro)]">{news.data}</span>
                    <span className="text-[10px] uppercase font-bold text-[var(--rosa-forte)]">{news.fonte}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--texto-escuro)] group-hover:text-[var(--rosa-forte)] transition-colors line-clamp-2">
                    {news.title}
                  </h4>
                  <div className="mt-2 flex justify-end">
                    <ChevronRight size={14} className="text-[var(--rosa-forte)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[var(--rosa-forte)] to-[#4B1528] rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <Info className="mb-4 opacity-50" size={32} />
             <h3 className="text-xl font-bold mb-2">Dúvidas sobre o BPC?</h3>
             <p className="text-sm opacity-90 mb-6">Nossos e-books na livraria tem um guia exclusivo para o passo a passo sem erros.</p>
             <Link to="/livraria" className="block w-full text-center py-3 bg-white text-[var(--rosa-forte)] font-bold rounded-xl hover:bg-pink-50 transition-colors shadow-lg">
                Ir para livraria
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components for icons to avoid re-renders or missing imports
function ClipboardList(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  )
}

export default SeusDireitos;
