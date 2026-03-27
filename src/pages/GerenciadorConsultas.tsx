import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Plus, Trash2, MessageCircle,
  Stethoscope, Brain, Mic2, Dumbbell, Eye, Heart,
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { toast } from 'sonner';

type TipoTerapia =
  | 'Fonoaudiologia'
  | 'Terapia Ocupacional'
  | 'Psicologia'
  | 'ABA'
  | 'Fisioterapia'
  | 'Neuropediatria'
  | 'Oftalmologia'
  | 'Outro';

type Consulta = {
  id: string;
  tipo: TipoTerapia;
  profissional: string;
  local: string;
  data: string;
  hora: string;
  whatsapp: string;
  obs: string;
  concluida: boolean;
};

const TIPO_CONFIG: Record<TipoTerapia, { icon: any; color: string; bg: string }> = {
  'Fonoaudiologia':      { icon: Mic2,         color: 'text-blue-500',   bg: 'bg-blue-50 border-blue-200' },
  'Terapia Ocupacional': { icon: Dumbbell,      color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
  'Psicologia':          { icon: Brain,         color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200' },
  'ABA':                 { icon: Heart,         color: 'text-pink-500',   bg: 'bg-pink-50 border-pink-200' },
  'Fisioterapia':        { icon: Dumbbell,      color: 'text-green-500',  bg: 'bg-green-50 border-green-200' },
  'Neuropediatria':      { icon: Stethoscope,   color: 'text-red-500',    bg: 'bg-red-50 border-red-200' },
  'Oftalmologia':        { icon: Eye,           color: 'text-cyan-500',   bg: 'bg-cyan-50 border-cyan-200' },
  'Outro':               { icon: Calendar,      color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200' },
};

const STORAGE_KEY = 'almas_consultas_v1';

const hoje = () => new Date().toISOString().split('T')[0];

const formatarData = (data: string) => {
  const [y, m, d] = data.split('-');
  return `${d}/${m}/${y}`;
};

const diasRestantes = (data: string, hora: string) => {
  const agora = new Date();
  const dt = new Date(`${data}T${hora}:00`);
  const diff = Math.ceil((dt.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const GerenciadorConsultas = () => {
  const [consultas, setConsultas] = useState<Consulta[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'proximas' | 'concluidas'>('proximas');
  const [expandida, setExpandida] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    tipo: 'Fonoaudiologia' as TipoTerapia,
    profissional: '',
    local: '',
    data: '',
    hora: '',
    whatsapp: '',
    obs: '',
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consultas));
  }, [consultas]);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.profissional || !form.data || !form.hora) {
      toast.error('Preencha profissional, data e hora!');
      return;
    }
    const nova: Consulta = {
      id: Date.now().toString(),
      ...form,
      concluida: false,
    };
    setConsultas(prev => [nova, ...prev].sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora)));
    setForm({ tipo: 'Fonoaudiologia', profissional: '', local: '', data: '', hora: '', whatsapp: '', obs: '' });
    setShowForm(false);
    toast.success('Consulta agendada com sucesso! 🗓️');
  };

  const handleExcluir = (id: string) => {
    setConsultas(prev => prev.filter(c => c.id !== id));
    toast.success('Consulta removida.');
  };

  const handleConcluir = (id: string) => {
    setConsultas(prev => prev.map(c => c.id === id ? { ...c, concluida: !c.concluida } : c));
  };

  const handleWhatsApp = (c: Consulta) => {
    const numero = c.whatsapp.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `🌸 *Lembrete de Consulta - Almas Atípicas*\n\n` +
      `📋 *Tipo:* ${c.tipo}\n` +
      `👨‍⚕️ *Profissional:* ${c.profissional}\n` +
      `📅 *Data:* ${formatarData(c.data)} às ${c.hora}\n` +
      `📍 *Local:* ${c.local || 'Não informado'}\n\n` +
      `_Lembrete enviado pelo app Almas Atípicas_ 💜`
    );
    const url = numero
      ? `https://wa.me/55${numero}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  const consultasFiltradas = consultas.filter(c => {
    if (filtro === 'proximas') return !c.concluida;
    if (filtro === 'concluidas') return c.concluida;
    return true;
  });

  const proximas = consultas.filter(c => !c.concluida && c.data >= hoje());
  const hoje7dias = consultas.filter(c => {
    const d = diasRestantes(c.data, c.hora);
    return !c.concluida && d >= 0 && d <= 7;
  });

  return (
    <div className="max-w-4xl mx-auto pb-12">

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-6 md:p-8 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--rosa-forte)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--rosa-forte)] to-[var(--rosa-medio)] flex items-center justify-center shadow-md">
                <Calendar size={22} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--texto-escuro)] font-serif">
                Gerenciador de Consultas
              </h1>
            </div>
            <p className="text-[var(--texto-medio)] text-sm md:text-base max-w-lg">
              Organize todas as terapias e consultas do seu filho em um só lugar. Nunca mais perca uma sessão! 💜
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)] text-white rounded-2xl font-bold shadow-lg shadow-[var(--rosa-forte)]/25 text-sm whitespace-nowrap"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancelar' : 'Nova Consulta'}
          </motion.button>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'Total', value: consultas.length, color: 'text-[var(--rosa-forte)]', bg: 'bg-[var(--rosa-forte)]/10' },
            { label: 'Próximas', value: proximas.length, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Esta semana', value: hoje7dias.length, color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-3 text-center border border-white/60`}>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs font-bold text-[var(--texto-claro)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* FORMULÁRIO */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 backdrop-blur-[12px] rounded-3xl border border-white/60 p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-[var(--texto-escuro)] mb-6 flex items-center gap-2">
                <Plus size={20} className="text-[var(--rosa-forte)]" />
                Adicionar Nova Consulta
              </h2>
              <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Tipo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-2">Tipo de Terapia / Consulta</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(TIPO_CONFIG) as TipoTerapia[]).map(tipo => {
                      const cfg = TIPO_CONFIG[tipo];
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, tipo }))}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                            form.tipo === tipo
                              ? `${cfg.bg} ${cfg.color} border-current shadow-sm`
                              : 'bg-white/60 text-[var(--texto-claro)] border-white/40 hover:bg-white/80'
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-xs">{tipo}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-1.5">Nome do Profissional *</label>
                  <input
                    required
                    value={form.profissional}
                    onChange={e => setForm(f => ({ ...f, profissional: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:border-[var(--rosa-forte)] focus:ring-2 focus:ring-[var(--rosa-forte)]/20 text-sm"
                    placeholder="Ex: Dra. Marina Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-1.5">Local / Clínica</label>
                  <input
                    value={form.local}
                    onChange={e => setForm(f => ({ ...f, local: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:border-[var(--rosa-forte)] text-sm"
                    placeholder="Ex: Clínica ABA Recife"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-1.5">Data *</label>
                  <input
                    required
                    type="date"
                    min={hoje()}
                    value={form.data}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:border-[var(--rosa-forte)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-1.5">Horário *</label>
                  <input
                    required
                    type="time"
                    value={form.hora}
                    onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:border-[var(--rosa-forte)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-1.5">
                    <MessageCircle size={14} className="inline mr-1 text-green-500" />
                    WhatsApp para Lembrete (opcional)
                  </label>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-green-200 bg-green-50/30 focus:outline-none focus:border-green-500 text-sm"
                    placeholder="Ex: 81999999999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--texto-escuro)] mb-1.5">Observações</label>
                  <input
                    value={form.obs}
                    onChange={e => setForm(f => ({ ...f, obs: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:border-[var(--rosa-forte)] text-sm"
                    placeholder="Ex: Levar relatório da escola"
                  />
                </div>

                <div className="md:col-span-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)] text-white font-black rounded-2xl shadow-lg shadow-[var(--rosa-forte)]/25 flex items-center justify-center gap-2"
                  >
                    <Calendar size={20} />
                    AGENDAR CONSULTA
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTROS */}
      <div className="flex gap-2 mb-5 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/40 shadow-sm">
        {([
          { key: 'proximas', label: '📅 Próximas' },
          { key: 'concluidas', label: '✅ Concluídas' },
          { key: 'todas', label: '📋 Todas' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              filtro === f.key
                ? 'bg-white text-[var(--rosa-forte)] shadow-md'
                : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LISTA DE CONSULTAS */}
      <div className="space-y-4">
        <AnimatePresence>
          {consultasFiltradas.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/40 rounded-3xl border border-white/30"
            >
              <Calendar size={48} className="mx-auto mb-4 text-[var(--rosa-forte)]/40" />
              <p className="text-[var(--texto-claro)] font-bold">
                {filtro === 'proximas' ? 'Nenhuma consulta agendada. Clique em "Nova Consulta" para começar!' :
                 filtro === 'concluidas' ? 'Nenhuma consulta concluída ainda.' :
                 'Nenhuma consulta cadastrada.'}
              </p>
            </motion.div>
          )}

          {consultasFiltradas.map((c) => {
            const cfg = TIPO_CONFIG[c.tipo];
            const Icon = cfg.icon;
            const dias = diasRestantes(c.data, c.hora);
            const isAberta = expandida === c.id;
            const isCritica = !c.concluida && dias >= 0 && dias <= 2;
            const isPassada = !c.concluida && dias < 0;

            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`bg-white/80 backdrop-blur-[12px] rounded-2xl border shadow-md overflow-hidden transition-all ${
                  c.concluida ? 'opacity-60 border-gray-200' :
                  isCritica ? 'border-amber-300 shadow-amber-100' :
                  isPassada ? 'border-red-200' :
                  'border-white/60'
                }`}
              >
                {/* Barra de status no topo */}
                <div className={`h-1 w-full ${
                  c.concluida ? 'bg-green-400' :
                  isCritica ? 'bg-amber-400' :
                  isPassada ? 'bg-red-400' :
                  'bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)]'
                }`} />

                <div className="p-4 md:p-5">
                  <div className="flex items-start gap-3">

                    {/* Ícone do tipo */}
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <Icon size={22} className={cfg.color} />
                    </div>

                    {/* Conteúdo principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs font-black uppercase tracking-wide ${cfg.color}`}>{c.tipo}</span>
                        {c.concluida && (
                          <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Concluída</span>
                        )}
                        {isCritica && !c.concluida && (
                          <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse">⚡ Em {dias === 0 ? 'hoje' : `${dias}d`}</span>
                        )}
                        {isPassada && (
                          <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Pendente revisão</span>
                        )}
                      </div>
                      <h3 className={`font-bold text-[var(--texto-escuro)] truncate ${c.concluida ? 'line-through' : ''}`}>{c.profissional}</h3>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-[var(--texto-claro)] font-medium">
                        <span className="flex items-center gap-1"><Calendar size={12} />{formatarData(c.data)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{c.hora}</span>
                        {c.local && <span className="truncate max-w-[200px]">📍 {c.local}</span>}
                      </div>
                    </div>

                    {/* Expandir */}
                    <button
                      onClick={() => setExpandida(isAberta ? null : c.id)}
                      className="p-2 rounded-xl hover:bg-gray-100 text-[var(--texto-claro)] transition-colors shrink-0"
                    >
                      {isAberta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {/* Ações rápidas */}
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWhatsApp(c)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <MessageCircle size={14} />
                      Lembrete WhatsApp
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleConcluir(c.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                        c.concluida
                          ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      {c.concluida ? 'Reabrir' : 'Concluir'}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleExcluir(c.id)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>

                  {/* Expandido: observações */}
                  <AnimatePresence>
                    {isAberta && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {c.whatsapp && (
                            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                              <p className="text-[10px] font-black text-green-700 uppercase mb-1">WhatsApp</p>
                              <p className="text-sm font-bold text-gray-700">{c.whatsapp}</p>
                            </div>
                          )}
                          {c.obs && (
                            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                              <p className="text-[10px] font-black text-amber-700 uppercase mb-1 flex items-center gap-1">
                                <AlertCircle size={12} /> Observações
                              </p>
                              <p className="text-sm text-gray-700">{c.obs}</p>
                            </div>
                          )}
                          {!c.whatsapp && !c.obs && (
                            <p className="text-sm text-[var(--texto-claro)] col-span-2 italic">Nenhuma observação adicional.</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Aviso de privacidade */}
      <div className="mt-8 p-4 bg-white/40 rounded-2xl border border-white/30 text-center">
        <p className="text-xs text-[var(--texto-claro)] font-medium">
          🔒 Todas as suas consultas ficam salvas <strong>apenas no seu dispositivo</strong>. Nenhum dado é enviado para a internet.
        </p>
      </div>
    </div>
  );
};

export default GerenciadorConsultas;
