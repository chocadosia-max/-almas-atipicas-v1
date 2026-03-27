import React from 'react';
import { Shield, Lock, AlertTriangle, FileText, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermosDeUso = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto pb-12 pt-4">
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-[var(--texto-medio)] hover:text-[var(--rosa-forte)] transition-colors font-medium bg-white/50 px-4 py-2 rounded-xl border border-pink-100"
      >
        <ChevronLeft size={20} />
        Voltar
      </button>

      {/* Cabeçalho */}
      <div className="bg-gradient-to-br from-[var(--rosa-forte)] to-[#9f3458] rounded-3xl p-10 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <Shield className="w-16 h-16 mb-4 text-pink-200" />
          <h1 className="text-4xl font-bold font-serif mb-4">Políticas e Termos de Uso</h1>
          <p className="text-pink-100 text-lg max-w-2xl leading-relaxed">
            Nós valorizamos a sua confiança e a privacidade da sua família acima de tudo. Por favor, leia nossos termos para entender como protegemos você e quais são as nossas limitações legais.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Bloco 1: Aviso Médico Obrigatório */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 rounded-3xl p-8 border border-amber-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-amber-900">Aviso sobre Saúde e Terapias</h2>
          </div>
          <div className="text-amber-800 space-y-4 leading-relaxed font-medium">
            <p>
              A plataforma <strong>Comigo / Almas Atípicas</strong> oferece suporte informativo, ferramentas de organização e acolhimento emocional para mães atípicas.
            </p>
            <p className="bg-amber-100/50 p-4 rounded-xl border border-amber-200">
              <strong>IMPORTANTE:</strong> O conteúdo gerado nesta plataforma, seja por nossos artigos, materiais da livraria ou interfaces interativas (IA), <strong>não substitui, sob nenhuma hipótese, o aconselhamento médico profissional, o diagnóstico ou a prescrição de profissionais habilitados</strong> (psicólogos, médicos neuropediatras, fonoaudiólogos ou terapeutas ocupacionais).
            </p>
            <p>
              Qualquer decisão sobre o tratamento do seu filho deve ser validada presencialmente por um médico ou profissional de saúde da sua confiança.
            </p>
          </div>
        </motion.div>

        {/* Bloco 2: LGPD e Dados Sensíveis */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 mb-2 bg-blue-50 rounded-xl">
              <Lock className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--texto-escuro)]">Dados Pessoais Sensíveis (LGPD)</h2>
          </div>
          <div className="text-[var(--texto-medio)] space-y-4 leading-relaxed">
            <p>
              Em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)</strong>, afirmamos nosso compromisso com a proteção dos dados sensíveis da sua família:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Os seus registros no Diário da Jornada e no Rastreador do Momento Pausa são <strong>estritamente criptografados</strong> e salvos no seu aparelho/conta pessoal.</li>
              <li>A plataforma não comercializará, sob nenhuma hipótese, os dados sobre as condições de saúde ou diagnósticos do seu filho para agências de publicidade ou farmacêuticas.</li>
              <li>Você tem o direito incondicional de solicitar o <strong>apagamento total</strong> de todos os seus dados e histórico da nossa base a qualquer momento (Direito ao Esquecimento).</li>
            </ul>
          </div>
        </motion.div>

        {/* Bloco 3: Segurança de Menores (ECA) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--texto-escuro)]">Estatuto da Criança e do Adolescente (ECA)</h2>
          </div>
          <div className="text-[var(--texto-medio)] space-y-4 leading-relaxed">
            <p>
              Nas áreas de Fórum Público e Rede de Mães, nossa equipe aplica moderação rigorosa para proteger a identidade das crianças.
            </p>
            <p>
              Para a segurança constante da rede, <strong>é estritamente proibido:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Postar fotografias ou vídeos gravando o momento de crise severa (meltdown) da criança, em respeito à sua dignidade.</li>
              <li>Compartilhar o endereço físico de escolas, clínicas ou rotinas de horários exatos para proteção física contra terceiros intencionados.</li>
              <li>Publicar o nome completo ou dados da carteira do SUS / Convênio da criança em locais de discussão aberta.</li>
            </ul>
          </div>
        </motion.div>

        {/* Bloco 4: Responsabilidade Civil */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <FileText className="w-6 h-6 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--texto-escuro)]">Isenção de Responsabilidade</h2>
          </div>
          <div className="text-[var(--texto-medio)] space-y-4 leading-relaxed">
            <p>
               A plataforma atua como facilitadora tecnológica. Ocasionalmente, materiais na <strong>Livraria</strong> e na seção <strong>Meus Direitos</strong> podem conter citações à Lei Brasileira de Inclusão. No entanto, orientações jurídicas ali contidas não desobrigam a contratação de um advogado especialista habilitado na OAB em caso de litígio contra escolas ou planos de saúde.
            </p>
            <p>
               Mural de Empregos ("Renda"): Não nos responsabilizamos pelos contratos negociados diretamente via WhatsApp através do nosso mural de vagas. Desempenhamos apenas serviços de classificados.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 text-center text-sm text-[var(--texto-claro)]">
        Última atualização: Março de 2026<br/>
        Estes termos estão em vigor imediatamente a partir do momento de acesso ao aplicativo.
      </div>
    </div>
  );
};

export default TermosDeUso;
