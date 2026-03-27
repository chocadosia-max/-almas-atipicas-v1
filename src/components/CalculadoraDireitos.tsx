import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, ChevronRight, ChevronLeft, CheckCircle2,
  AlertCircle, Printer, RotateCcw, Info, ExternalLink
} from 'lucide-react';

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type Respostas = {
  rendaFamiliar: 'ate1sm' | 'ate3sm' | 'acima3sm' | '';
  idadeFilho: 'ate3' | '3a18' | 'acima18' | '';
  temLaudo: 'sim' | 'nao' | '';
  filhoNaEscola: 'sim' | 'nao' | '';
  temImovel: 'sim' | 'nao' | '';
};

type Beneficio = {
  nome: string;
  elegivel: boolean;
  probabilidade: 'alta' | 'media' | 'baixa' | 'nao';
  descricao: string;
  como: string;
  link: string;
  documentos: string[];
};

// ─── PERGUNTAS ────────────────────────────────────────────────────────────────
const PERGUNTAS = [
  {
    id: 'rendaFamiliar' as keyof Respostas,
    pergunta: 'Qual é a renda mensal total da sua família?',
    descricao: 'Some todos os salários e benefícios recebidos pela família que mora com você.',
    emoji: '💰',
    opcoes: [
      { valor: 'ate1sm', label: 'Até 1 Salário Mínimo', detalhe: 'Até R$ 1.412' },
      { valor: 'ate3sm', label: 'De 1 a 3 Salários Mínimos', detalhe: 'Entre R$ 1.412 e R$ 4.236' },
      { valor: 'acima3sm', label: 'Acima de 3 Salários Mínimos', detalhe: 'Acima de R$ 4.236' },
    ]
  },
  {
    id: 'idadeFilho' as keyof Respostas,
    pergunta: 'Qual é a idade do seu filho(a) com TEA?',
    descricao: 'A idade influencia diretamente nos benefícios disponíveis.',
    emoji: '🧒',
    opcoes: [
      { valor: 'ate3', label: 'Até 3 anos', detalhe: 'Primeira infância' },
      { valor: '3a18', label: 'Entre 3 e 18 anos', detalhe: 'Infância e adolescência' },
      { valor: 'acima18', label: 'Acima de 18 anos', detalhe: 'Vida adulta' },
    ]
  },
  {
    id: 'temLaudo' as keyof Respostas,
    pergunta: 'Seu filho(a) tem laudo médico com CID de TEA?',
    descricao: 'O CID F84.0 (TEA) ou similar é essencial para a maioria dos benefícios.',
    emoji: '📋',
    opcoes: [
      { valor: 'sim', label: 'Sim, tenho laudo com CID', detalhe: 'Documento emitido por médico' },
      { valor: 'nao', label: 'Ainda não tenho laudo', detalhe: 'Em processo de diagnóstico' },
    ]
  },
  {
    id: 'filhoNaEscola' as keyof Respostas,
    pergunta: 'Seu filho(a) está matriculado em escola?',
    descricao: 'Impacta direitos educacionais e de apoio escolar.',
    emoji: '🏫',
    opcoes: [
      { valor: 'sim', label: 'Sim, está matriculado', detalhe: 'Escola pública ou particular' },
      { valor: 'nao', label: 'Não está matriculado', detalhe: 'Ou ainda não em idade escolar' },
    ]
  },
  {
    id: 'temImovel' as keyof Respostas,
    pergunta: 'Sua família é proprietária de imóvel (casa/apartamento)?',
    descricao: 'Proprietários podem ter direito à isenção de IPTU.',
    emoji: '🏠',
    opcoes: [
      { valor: 'sim', label: 'Sim, somos proprietários', detalhe: 'Casa, apartamento ou terreno' },
      { valor: 'nao', label: 'Não, somos locatários', detalhe: 'Aluguel ou cedido' },
    ]
  }
];

// ─── LÓGICA DE ELEGIBILIDADE ──────────────────────────────────────────────────
const calcularBeneficios = (r: Respostas): Beneficio[] => {
  const baixaRenda = r.rendaFamiliar === 'ate1sm';
  const rendaMedia = r.rendaFamiliar === 'ate3sm';
  const temLaudo = r.temLaudo === 'sim';
  const naEscola = r.filhoNaEscola === 'sim';
  const proprietario = r.temImovel === 'sim';
  const menor18 = r.idadeFilho === 'ate3' || r.idadeFilho === '3a18';

  return [
    {
      nome: 'BPC/LOAS',
      elegivel: baixaRenda && temLaudo,
      probabilidade: baixaRenda && temLaudo ? 'alta' : baixaRenda && !temLaudo ? 'media' : 'nao',
      descricao: 'Benefício de Prestação Continuada — 1 salário mínimo mensal. Exige renda familiar per capita de até 1/4 do salário mínimo.',
      como: 'Solicite pelo app Meu INSS, site gov.br ou ligue 135. Agende perícia e leve documentos.',
      link: 'https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-assistenciais/bpc',
      documentos: ['CPF e RG de todos da família', 'Comprovante de renda', 'Laudo médico com CID', 'Comprovante de residência', 'Cartão do SUS'],
    },
    {
      nome: 'CIPTEA (Carteirinha de Autista)',
      elegivel: temLaudo,
      probabilidade: temLaudo ? 'alta' : 'nao',
      descricao: 'Carteira de Identificação da Pessoa com Transtorno do Espectro Autista (Lei Romeo Mion). Garante atendimento prioritário em todo o país.',
      como: 'Solicite na Prefeitura ou CRAS da sua cidade. Processo gratuito.',
      link: 'https://www.gov.br/pt-br/servicos/obter-a-ciptea',
      documentos: ['RG ou certidão de nascimento do filho', 'Laudo médico com CID F84', 'CPF do responsável', 'Foto 3x4 do filho'],
    },
    {
      nome: 'Isenção de IPTU',
      elegivel: proprietario && temLaudo,
      probabilidade: proprietario && temLaudo ? 'alta' : 'media',
      descricao: 'Muitos municípios concedem isenção ou desconto no IPTU para famílias com pessoa com TEA. Verifique a lei do seu município.',
      como: 'Consulte a prefeitura ou site da Secretaria de Finanças do seu município.',
      link: 'https://www.gov.br/fazenda/pt-br',
      documentos: ['Escritura do imóvel', 'Laudo médico com CID', 'IPTU do ano vigente', 'RG e CPF do responsável'],
    },
    {
      nome: 'Passe Livre Interestadual',
      elegivel: baixaRenda && temLaudo,
      probabilidade: baixaRenda && temLaudo ? 'alta' : 'media',
      descricao: 'Gratuidade em transporte coletivo interestadual (ônibus, trem e barco) para pessoas de baixa renda com deficiência.',
      como: 'Solicite nos postos do Ministério dos Transportes ou via gov.br.',
      link: 'https://www.gov.br/transportes/pt-br',
      documentos: ['Laudo médico', 'Comprovante de renda', 'RG e CPF', 'Foto 3x4'],
    },
    {
      nome: 'Educação: Acompanhante Terapêutico',
      elegivel: naEscola && temLaudo && menor18,
      probabilidade: naEscola && temLaudo ? 'alta' : !naEscola ? 'nao' : 'media',
      descricao: 'Direito garantido por lei: escola pública ou particular deve disponibilizar apoio especializado sem custo para crianças com TEA.',
      como: 'Leve o laudo médico para a direção da escola solicitando o suporte. Se negado, acione o Conselho Tutelar.',
      link: 'http://portal.mec.gov.br/',
      documentos: ['Laudo médico solicitando apoio escolar', 'Matrícula da criança', 'Requerimento formal por escrito'],
    },
    {
      nome: 'Educação: AEE (Atendimento Educacional Especializado)',
      elegivel: naEscola && temLaudo,
      probabilidade: naEscola && temLaudo ? 'alta' : 'nao',
      descricao: 'Serviço pedagógico gratuito e obrigatório em escolas públicas para identificar e organizar recursos de aprendizagem para seu filho.',
      como: 'Solicite avaliação pedagógica na escola regular. É um direito legal.',
      link: 'http://portal.mec.gov.br/atendimento-educacional-especializado',
      documentos: ['Laudo médico', 'Histórico escolar', 'Requerimento à direção'],
    },
    {
      nome: 'Medicamentos Gratuitos (SUS/Farmácia Popular)',
      elegivel: temLaudo,
      probabilidade: temLaudo ? 'alta' : 'media',
      descricao: 'Acesso a medicamentos de uso contínuo por meio da Farmácia Popular ou farmácia de alto custo do estado, com receita médica.',
      como: 'Presente a receita do SUS (validade 6 meses) e cartão SUS em farmácia conveniada.',
      link: 'https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular',
      documentos: ['Receita médica vigente', 'Cartão do SUS', 'RG do responsável'],
    },
    {
      nome: 'Isenção de IPVA',
      elegivel: temLaudo,
      probabilidade: temLaudo ? 'media' : 'nao',
      descricao: 'Vários estados oferecem isenção ou redução do IPVA para veículos adaptados ou de família com pessoa com deficiência. Consulte seu estado.',
      como: 'Consulte o DETRAN do seu estado ou a Secretaria da Fazenda estadual.',
      link: 'https://denatran.senatran.infraestrutura.gov.br/',
      documentos: ['Laudo médico', 'CRV do veículo', 'Declaração do médico sobre necessidade de veículo'],
    },
    {
      nome: 'Benefício Maternidade /Licença Estendida',
      elegivel: temLaudo && menor18,
      probabilidade: temLaudo && menor18 ? 'media' : 'baixa',
      descricao: 'Algumas leis estaduais e empresas garantem licença maternidade estendida ou flexibilização de horário para mães de crianças com Deficiência.',
      como: 'Consulte o setor de RH do seu empregador e verifique a lei do seu estado.',
      link: 'https://www.gov.br/trabalho-e-emprego/pt-br',
      documentos: ['Laudo médico do filho', 'Documentos do vínculo empregatício'],
    },
    {
      nome: 'CadÚnico (Cadastro Único)',
      elegivel: baixaRenda || rendaMedia,
      probabilidade: baixaRenda ? 'alta' : rendaMedia ? 'media' : 'nao',
      descricao: 'Porta de entrada para dezenas de programas sociais do Governo Federal (Bolsa Família, Tarifa Social de Energia, etc.).',
      como: 'Cadastre-se gratuitamente no CRAS (Centro de Referência de Assistência Social) mais próximo.',
      link: 'https://www.gov.br/pt-br/servicos/inscrever-se-no-cadastro-unico',
      documentos: ['CPF ou Título de Eleitor do responsável', 'Documentos de todos da casa', 'Comprovante de residência'],
    },
  ];
};

// ─── BADGE DE PROBABILIDADE ───────────────────────────────────────────────────
const PROB_CONFIG = {
  alta:  { label: 'Alta Probabilidade', bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200', dot: 'bg-green-500' },
  media: { label: 'Verifique na sua cidade', bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200', dot: 'bg-amber-500' },
  baixa: { label: 'Possível — Consulte', bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',  dot: 'bg-blue-400' },
  nao:   { label: 'Não elegível', bg: 'bg-gray-100',   text: 'text-gray-500',   border: 'border-gray-200',  dot: 'bg-gray-400' },
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const CalculadoraDireitos: React.FC = () => {
  const [etapa, setEtapa] = useState<'intro' | number | 'resultado'>('intro');
  const [respostas, setRespostas] = useState<Respostas>({
    rendaFamiliar: '',
    idadeFilho: '',
    temLaudo: '',
    filhoNaEscola: '',
    temImovel: '',
  });
  const [mostrarDetalhes, setMostrarDetalhes] = useState<string | null>(null);

  const etapaNum = typeof etapa === 'number' ? etapa : 0;
  const perguntaAtual = typeof etapa === 'number' ? PERGUNTAS[etapa] : null;

  const responder = (valor: string) => {
    if (!perguntaAtual) return;
    setRespostas(prev => ({ ...prev, [perguntaAtual.id]: valor }));
    if (etapaNum < PERGUNTAS.length - 1) {
      setEtapa(etapaNum + 1);
    } else {
      setEtapa('resultado');
    }
  };

  const reiniciar = () => {
    setEtapa('intro');
    setRespostas({ rendaFamiliar: '', idadeFilho: '', temLaudo: '', filhoNaEscola: '', temImovel: '' });
    setMostrarDetalhes(null);
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  const beneficios = etapa === 'resultado' ? calcularBeneficios(respostas) : [];
  const elegiveis = beneficios.filter(b => b.elegivel);
  const naoElegiveis = beneficios.filter(b => !b.elegivel);

  return (
    <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--rosa-forte)] to-[#4B1528] p-5 md:p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <Calculator size={22} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Calculadora de Direitos</h2>
            <p className="text-white/70 text-xs">Descubra em minutos quais benefícios você tem direito</p>
          </div>
        </div>
        {typeof etapa === 'number' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/60 mb-1.5">
              <span>Pergunta {etapaNum + 1} de {PERGUNTAS.length}</span>
              <span>{Math.round(((etapaNum + 1) / PERGUNTAS.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((etapaNum + 1) / PERGUNTAS.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 100 }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-5 md:p-6">
        <AnimatePresence mode="wait">

          {/* INTRO */}
          {etapa === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">🧮</div>
              <h3 className="text-xl font-bold text-[var(--texto-escuro)] mb-2">Calculadora Gratuita</h3>
              <p className="text-[var(--texto-medio)] text-sm mb-6 leading-relaxed">
                Responda <strong>5 perguntas rápidas</strong> e descubra automaticamente quais benefícios e direitos a sua família tem acesso. Gere um relatório para levar a advogados e assistentes sociais.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
                {[
                  { emoji: '⚡', label: '2 minutos' },
                  { emoji: '🔒', label: '100% privado' },
                  { emoji: '🖨️', label: 'Imprimível' },
                ].map((item, i) => (
                  <div key={i} className="bg-[var(--rosa-forte)]/5 border border-[var(--rosa-forte)]/10 rounded-xl p-3">
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <div className="font-bold text-[var(--texto-escuro)]">{item.label}</div>
                  </div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setEtapa(0)}
                className="w-full py-4 bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)] text-white font-black rounded-2xl shadow-lg shadow-[var(--rosa-forte)]/25 flex items-center justify-center gap-2"
              >
                Iniciar Calculadora <ChevronRight size={20} />
              </motion.button>
            </motion.div>
          )}

          {/* PERGUNTA */}
          {typeof etapa === 'number' && perguntaAtual && (
            <motion.div
              key={`pergunta-${etapa}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{perguntaAtual.emoji}</div>
                <h3 className="text-lg font-bold text-[var(--texto-escuro)] mb-2">
                  {perguntaAtual.pergunta}
                </h3>
                <p className="text-sm text-[var(--texto-claro)]">{perguntaAtual.descricao}</p>
              </div>

              <div className="space-y-3">
                {perguntaAtual.opcoes.map((op) => (
                  <motion.button
                    key={op.valor}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => responder(op.valor)}
                    className="w-full text-left p-4 rounded-2xl border-2 border-white/60 bg-white/40 hover:border-[var(--rosa-forte)]/40 hover:bg-white/70 transition-all group flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[var(--texto-escuro)] text-sm">{op.label}</div>
                      <div className="text-xs text-[var(--texto-claro)] mt-0.5">{op.detalhe}</div>
                    </div>
                    <ChevronRight size={18} className="text-[var(--rosa-forte)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </motion.button>
                ))}
              </div>

              {etapaNum > 0 && (
                <button
                  onClick={() => setEtapa(etapaNum - 1)}
                  className="mt-4 flex items-center gap-1 text-sm text-[var(--texto-claro)] hover:text-[var(--rosa-forte)] font-bold transition-colors"
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
              )}
            </motion.div>
          )}

          {/* RESULTADO */}
          {etapa === 'resultado' && (
            <motion.div
              key="resultado"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Resumo */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-green-600">{elegiveis.length}</div>
                  <div className="text-xs font-bold text-green-700 mt-1">Benefícios Identificados</div>
                </div>
                <div className="flex-1 bg-[var(--rosa-forte)]/5 border border-[var(--rosa-forte)]/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-[var(--rosa-forte)]">
                    {elegiveis.filter(b => b.probabilidade === 'alta').length}
                  </div>
                  <div className="text-xs font-bold text-[var(--rosa-forte)] mt-1">Alta Probabilidade</div>
                </div>
              </div>

              {/* Lista de Elegíveis */}
              <h4 className="font-bold text-sm text-[var(--texto-escuro)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" /> Você provavelmente tem direito a:
              </h4>
              <div className="space-y-3 mb-6">
                {elegiveis.map((b) => {
                  const prob = PROB_CONFIG[b.probabilidade];
                  const isOpen = mostrarDetalhes === b.nome;
                  return (
                    <div
                      key={b.nome}
                      className={`rounded-2xl border overflow-hidden transition-all ${prob.border} ${prob.bg}`}
                    >
                      <button
                        onClick={() => setMostrarDetalhes(isOpen ? null : b.nome)}
                        className="w-full text-left p-4 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-[var(--texto-escuro)]">{b.nome}</span>
                            <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${prob.text} bg-white/60`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${prob.dot}`} />
                              {prob.label}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--texto-medio)] line-clamp-2">{b.descricao}</p>
                        </div>
                        <ChevronRight size={16} className={`shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-90' : ''} ${prob.text}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-white/40 pt-3 space-y-3">
                              <div className="bg-white/60 rounded-xl p-3">
                                <p className="text-[10px] font-black text-[var(--texto-escuro)] uppercase mb-1.5">📌 Como Solicitar</p>
                                <p className="text-xs text-[var(--texto-medio)]">{b.como}</p>
                              </div>
                              <div className="bg-white/60 rounded-xl p-3">
                                <p className="text-[10px] font-black text-[var(--texto-escuro)] uppercase mb-1.5">📄 Documentos Necessários</p>
                                <ul className="space-y-1">
                                  {b.documentos.map((doc, i) => (
                                    <li key={i} className="text-xs text-[var(--texto-medio)] flex items-start gap-1.5">
                                      <span className="text-green-500 mt-0.5">✓</span>
                                      {doc}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <a
                                href={b.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--rosa-forte)] hover:underline"
                              >
                                <ExternalLink size={12} /> Acessar canal oficial
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Não elegíveis */}
              {naoElegiveis.length > 0 && (
                <>
                  <h4 className="font-bold text-sm text-[var(--texto-claro)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle size={16} /> Outros benefícios (não se enquadra no momento):
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {naoElegiveis.map(b => (
                      <span key={b.nome} className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full border border-gray-200 font-bold line-through">{b.nome}</span>
                    ))}
                  </div>
                </>
              )}

              {/* Aviso Legal */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Aviso importante:</strong> Esta calculadora tem caráter informativo e educacional. A elegibilidade final depende de análise individual por órgãos competentes. Consulte um advogado ou assistente social para orientação específica.
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={imprimirRelatorio}
                  className="flex-1 py-3 bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--rosa-forte)]/25 text-sm"
                >
                  <Printer size={18} /> Imprimir / Salvar PDF
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={reiniciar}
                  className="flex-1 py-3 bg-white border-2 border-gray-200 text-[var(--texto-medio)] font-bold rounded-2xl flex items-center justify-center gap-2 text-sm hover:border-[var(--rosa-forte)]/40"
                >
                  <RotateCcw size={18} /> Refazer Cálculo
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalculadoraDireitos;
