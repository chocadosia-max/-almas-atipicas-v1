import React, { useState, useRef } from 'react';
import { Download, Upload, Info, AlertTriangle, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const CartaoEmergencia = () => {
  const [nome, setNome] = useState('');
  const [nivel, setNivel] = useState('');
  const [comportamentos, setComportamentos] = useState('');
  const [ajudas, setAjudas] = useState('');
  const [contato1, setContato1] = useState('');
  const [contato2, setContato2] = useState('');
  const [medico, setMedico] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    if (!nome) {
      toast.error("Por favor, preencha o nome antes de gerar o cartão.");
      return;
    }

    try {
      toast("Gerando PDF, aguarde...");
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98] // Formato cartão de crédito padrão ISO (CR80)
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
      pdf.save(`Cartao_TEA_${nome.replace(/\s+/g, '_')}.pdf`);
      toast.success("Download concluído! Imprima frente e verso e plastifique.");
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao gerar o PDF.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-8 lg:p-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#1E3A8A] font-serif mb-4 flex items-center justify-center gap-3">
          <UserCheck className="w-10 h-10 md:w-12 md:h-12" />
          Gerador de Cartão TEA
        </h1>
        <p className="text-blue-800 opacity-80 max-w-2xl mx-auto text-lg">
          Crie um cartão de identificação prático para situações de emergência. A informação clara e visível ajuda profissionais de saúde, polícia e comunidade a prestarem o suporte adequado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Formulário */}
        <div className="bg-white/80 shadow-md rounded-3xl p-6 lg:p-8 border border-white/60">
          <h2 className="text-xl font-bold text-[#1E3A8A] mb-6 flex items-center gap-2">
            <Info className="w-5 h-5" /> Preencha as Informações
          </h2>
          <form className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Foto Recente</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="text-gray-400 mb-2 w-8 h-8" />
                <span className="text-sm font-medium text-gray-500">Clique ou arraste a foto (3x4 ideal)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Nome Completo</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: João Silva" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Nível de Suporte</label>
                <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="">Selecione...</option>
                  <option value="Nível 1 (Leve)">Nível 1 (Leve)</option>
                  <option value="Nível 2 (Moderado)">Nível 2 (Moderado)</option>
                  <option value="Nível 3 (Severo)">Nível 3 (Severo)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Comportamento em Crise</label>
              <textarea value={comportamentos} onChange={(e) => setComportamentos(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="Ex: Cobre os ouvidos, não responde, chora intensamente..." />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">O que ajuda na crise?</label>
              <textarea value={ajudas} onChange={(e) => setAjudas(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="Ex: Falar baixo, afastar de ruídos, oferecer abafador..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Contato 1 (Nome e Telefone)</label>
                <input type="text" value={contato1} onChange={(e) => setContato1(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Maria (11) 9000-0000" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Contato 2 ou Médico</label>
                <input type="text" value={contato2} onChange={(e) => setContato2(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contato reserva..." />
              </div>
            </div>

          </form>
        </div>

        {/* Viewer */}
        <div className="sticky top-8 bg-blue-50 p-6 lg:p-8 rounded-3xl border border-blue-100 flex flex-col items-center">
          <h2 className="text-xl font-bold text-[#1E3A8A] mb-6 flex items-center gap-2">
            Pré-visualização do Cartão
          </h2>

          <div className="bg-gray-100 p-8 rounded-3xl w-full flex items-center justify-center overflow-x-auto mx-auto shadow-inner">
             {/* The Card to be captured */}
             {/* CR80 Ratio 85.6mm x 53.98mm is ~ 3.37 x 2.125. Scaled roughly to 856x540 for screen view */}
             <div 
               ref={cardRef}
               className="bg-white overflow-hidden shadow-2xl relative"
               style={{ width: '856px', height: '540px', transform: 'scale(0.4)', transformOrigin: 'top center', marginBottom: '-300px' }}
             >
                {/* Header Azul */}
                <div className="absolute top-0 left-0 w-full h-[120px] bg-[#1E3A8A] flex items-center px-8 border-b-[8px] border-yellow-400">
                   <AlertTriangle className="text-white w-16 h-16 mr-6" />
                   <div>
                      <h1 className="text-white text-5xl font-black uppercase tracking-wider m-0">Identificação TEA</h1>
                      <p className="text-yellow-200 text-2xl font-bold uppercase m-0 mt-2">Transtorno do Espectro Autista</p>
                   </div>
                </div>

                {/* Main Body */}
                <div className="absolute top-[140px] left-0 w-full h-[400px] bg-white flex px-8 pt-4 pb-8">
                   {/* Left Col (Photo) */}
                   <div className="w-[200px] h-full flex flex-col items-center">
                     {fotoUrl ? (
                        <img src={fotoUrl} alt="Foto ID" className="w-[180px] h-[240px] object-cover bg-gray-200 border-4 border-[#1E3A8A] rounded-xl shadow-md" />
                     ) : (
                        <div className="w-[180px] h-[240px] bg-gray-100 border-4 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-sm font-bold shadow-sm">
                           SEM<br/>FOTO
                        </div>
                     )}
                     <div className="mt-4 bg-[#1E3A8A] text-white py-2 px-4 rounded-full w-full text-center font-bold text-xl uppercase shadow-md">
                        {nivel || "NÍVEL UNDEF."}
                     </div>
                   </div>

                   {/* Right Col (Data) */}
                   <div className="flex-1 ml-10 flex flex-col justify-between">
                      <div>
                        <h2 className="text-[#1E3A8A] text-6xl font-black mb-1 m-0 leading-tight truncate max-w-[500px]">{nome || "NOME DO TITULAR"}</h2>
                        <div className="w-full h-1 bg-gray-200 mb-6"></div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="bg-red-50 p-4 rounded-xl border-l-8 border-red-500 shadow-sm">
                           <p className="text-red-800 text-sm font-black uppercase mb-1">Comportamentos em Crise / Alertas:</p>
                           <p className="text-gray-700 text-lg font-bold leading-snug line-clamp-2">{comportamentos || "-"}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border-l-8 border-green-500 shadow-sm">
                           <p className="text-green-800 text-sm font-black uppercase mb-1">O que ajuda no acolhimento:</p>
                           <p className="text-gray-700 text-lg font-bold leading-snug line-clamp-2">{ajudas || "-"}</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-100 mt-4 p-4 rounded-xl border border-gray-300 flex justify-between items-center shadow-sm">
                         <div>
                            <p className="text-gray-500 text-xs font-black uppercase mb-1">Contatos de Emergência</p>
                            <p className="text-[#1E3A8A] text-xl font-bold truncate max-w-[300px]">{contato1 || "Nenhum cadastrado"}</p>
                            <p className="text-gray-600 text-lg font-bold truncate max-w-[300px] mt-1">{contato2}</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <button 
            onClick={handleDownload}
            className="mt-8 bg-[#1E3A8A] hover:bg-[#152e73] text-white font-black py-4 px-12 rounded-2xl shadow-[0_8px_0_#0f172a] active:shadow-none active:translate-y-2 transition-all flex items-center justify-center gap-3 text-lg w-full max-w-sm"
          >
            <Download className="w-6 h-6" /> Baixar PDF
          </button>
          <p className="text-xs text-blue-700 opacity-60 mt-4 max-w-sm text-center">
            *O arquivo gerado tem as medidas exatas e alta resolução para plastificação.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartaoEmergencia;
