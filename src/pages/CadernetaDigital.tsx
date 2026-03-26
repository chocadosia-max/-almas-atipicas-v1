import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star, Save, ClipboardList, Utensils, Moon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type CadernetaEntry = {
  id: string;
  date: string;
  humor: number;
  alimentacao: string;
  sono: string;
  comportamentos: Record<string, boolean>;
  observacoes: string;
};

const COMPORTAMENTOS_OPTIONS = [
  { id: 'birra', label: 'Birra/Crise' },
  { id: 'ecolalia', label: 'Ecolalia' },
  { id: 'hiperfoco', label: 'Hiperfoco' },
  { id: 'estereotipia', label: 'Estereotipia' },
  { id: 'progresso', label: 'Progresso Social ✨' },
];

const CadernetaDigital = () => {
  const [entries, setEntries] = useState<CadernetaEntry[]>([]);
  
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [humor, setHumor] = useState(3);
  const [alimentacao, setAlimentacao] = useState('');
  const [sono, setSono] = useState('');
  const [comportamentos, setComportamentos] = useState<Record<string, boolean>>({});
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('caderneta_entradas');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: CadernetaEntry = {
      id: Date.now().toString(),
      date,
      humor,
      alimentacao,
      sono,
      comportamentos,
      observacoes
    };

    const newEntries = [newEntry, ...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(newEntries);
    localStorage.setItem('caderneta_entradas', JSON.stringify(newEntries));
    
    // Reset form but keep date
    setHumor(3);
    setAlimentacao('');
    setSono('');
    setComportamentos({});
    setObservacoes('');
    
    toast.success('Acompanhamento salvo! 📓');
  };

  const handleDelete = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('caderneta_entradas', JSON.stringify(updatedEntries));
    toast.success('Registro excluído com sucesso.');
  };

  const toggleComportamento = (id: string) => {
    setComportamentos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8 p-6 bg-white/65 shadow-lg backdrop-blur-[8px] rounded-3xl border border-white/40 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--texto-escuro)] font-serif mb-2">Caderneta do Filho</h1>
          <p className="text-[var(--texto-medio)]">Acompanhamento diário para entender os padrões e evoluçãos da criança.</p>
        </div>
        <ClipboardList className="w-12 h-12 text-[var(--rosa-forte)] opacity-80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSave} className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-[var(--texto-escuro)] mb-6">Novo Registro</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-2">Data do registro</label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-white/60 focus:border-[var(--rosa-forte)] rounded-xl outline-none text-[#4B1528] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-2">Humor do dia</label>
                <div className="flex gap-2 justify-between bg-white/30 p-2 rounded-xl border border-white/50">
                  {[1,2,3,4,5].map(star => (
                    <button 
                      type="button" 
                      key={star} 
                      onClick={() => setHumor(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-6 h-6 ${humor >= star ? 'fill-[var(--rosa-forte)] text-[var(--rosa-forte)]' : 'text-[var(--texto-claro)]'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--texto-escuro)] mb-2">
                  <Utensils className="w-4 h-4 text-[var(--rosa-forte)]" /> Alimentação
                </label>
                <input 
                  type="text"
                  placeholder="Seletividade? Comeu bem?"
                  value={alimentacao}
                  onChange={(e) => setAlimentacao(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-white/60 focus:border-[var(--rosa-forte)] rounded-xl outline-none text-[#4B1528] placeholder:text-[var(--texto-claro)]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--texto-escuro)] mb-2">
                  <Moon className="w-4 h-4 text-[var(--rosa-forte)]" /> Sono (horas/qualidade)
                </label>
                <input 
                  type="text"
                  placeholder="Ex: 8h, acordou 2x"
                  value={sono}
                  onChange={(e) => setSono(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-white/60 focus:border-[var(--rosa-forte)] rounded-xl outline-none text-[#4B1528] placeholder:text-[var(--texto-claro)]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-3">Comportamentos no dia</label>
                <div className="flex flex-wrap gap-2">
                  {COMPORTAMENTOS_OPTIONS.map(comp => (
                    <button
                      type="button"
                      key={comp.id}
                      onClick={() => toggleComportamento(comp.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        comportamentos[comp.id] 
                          ? 'bg-[var(--rosa-forte)] text-white border-[var(--rosa-forte)]' 
                          : 'bg-white/50 text-[var(--texto-medio)] border-white/60 hover:border-[var(--rosa-medio)]'
                      }`}
                    >
                      {comp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-2">Observações Livres</label>
                <textarea 
                  placeholder="Anotações para terapias, escola ou consultas..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full h-24 p-4 bg-white/50 border border-white/60 focus:border-[var(--rosa-forte)] rounded-xl outline-none text-[#4B1528] placeholder:text-[var(--texto-claro)] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--rosa-forte)] hover:bg-[#b04066] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--rosa-forte)]/20 transition-all active:scale-95"
              >
                <Save size={18} />
                Registrar no Histórico
              </button>
            </div>
          </form>
        </div>

        {/* Histórico */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-[var(--texto-escuro)] mb-6 flex items-center justify-between">
            <span>Histórico de Acompanhamento</span>
            <span className="text-sm font-normal bg-[var(--ativo-bg)] px-3 py-1 rounded-full text-[var(--texto-medio)]">
              {entries.length} registros
            </span>
          </h2>

          {entries.length === 0 ? (
            <div className="text-center p-12 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/30 text-[var(--texto-claro)] font-medium">
              Nenhum acompanhamento registrado ainda.
            </div>
          ) : (
            entries.map(entry => {
              const checkedMents = COMPORTAMENTOS_OPTIONS.filter(c => entry.comportamentos[c.id]);
              
              return (
                <div key={entry.id} className="bg-white/65 shadow-md backdrop-blur-[8px] rounded-2xl border border-white/40 p-5 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/50">
                    <div className="font-bold text-[var(--texto-escuro)] text-lg">
                      {format(new Date(entry.date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                    </div>
                    <div className="flex gap-4 items-center">
                       <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${entry.humor >= star ? 'fill-[var(--rosa-forte)] text-[var(--rosa-forte)]' : 'text-transparent border-[var(--texto-claro)] drop-shadow-sm'}`} />
                        ))}
                      </div>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {entry.alimentacao && (
                      <div className="bg-white/40 p-3 rounded-xl">
                        <div className="text-xs font-bold text-[var(--texto-claro)] uppercase mb-1 flex items-center gap-1">
                          <Utensils className="w-3 h-3"/> Alimentação
                        </div>
                        <div className="text-sm text-[var(--texto-escuro)]">{entry.alimentacao}</div>
                      </div>
                    )}
                    {entry.sono && (
                      <div className="bg-white/40 p-3 rounded-xl">
                        <div className="text-xs font-bold text-[var(--texto-claro)] uppercase mb-1 flex items-center gap-1">
                          <Moon className="w-3 h-3"/> Sono
                        </div>
                        <div className="text-sm text-[var(--texto-escuro)]">{entry.sono}</div>
                      </div>
                    )}
                  </div>

                  {checkedMents.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-bold text-[var(--texto-claro)] uppercase mb-2">Comportamentos marcados</div>
                      <div className="flex flex-wrap gap-2">
                        {checkedMents.map(c => (
                          <span key={c.id} className="inline-block px-2 py-1 bg-[var(--ativo-bg)] text-[var(--texto-medio)] text-xs font-semibold rounded-md">
                            {c.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.observacoes && (
                    <div className="mt-4 pt-4 border-t border-white/30 text-sm text-[var(--texto-medio)] italic whitespace-pre-wrap">
                      "{entry.observacoes}"
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CadernetaDigital;
