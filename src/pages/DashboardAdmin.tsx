import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, Activity, Book, LayoutDashboard, Image as ImageIcon, Trash2, Plus, RefreshCw } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from 'framer-motion';

// ── IndexedDB helper – same DB used by RendaParaMae ────────────────────────────
const getVagasCountFromDB = (): Promise<number> =>
  new Promise((resolve) => {
    const req = indexedDB.open('AlmasEmpDB', 1);
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('vagas')) { resolve(0); return; }
      const tx = db.transaction('vagas', 'readonly');
      const countReq = tx.objectStore('vagas').count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => resolve(0);
    };
    req.onerror = () => resolve(0);
  });

// ── Ebook color palette ────────────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { label: 'Rosa Forte', value: 'from-pink-500 to-rose-600' },
  { label: 'Roxo', value: 'from-violet-500 to-purple-600' },
  { label: 'Azul', value: 'from-blue-500 to-indigo-600' },
  { label: 'Verde', value: 'from-green-500 to-emerald-600' },
  { label: 'Âmbar', value: 'from-amber-400 to-orange-500' },
  { label: 'Escuro', value: 'from-[#4A2218] to-[#C1694F]' },
];
const CAT_OPTIONS = ['Direitos', 'Rotinas', 'Autocuidado', 'Comportamento', 'Inclusão'];

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, color, value, label }: { icon: any; color: string; value: number | string; label: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4"
  >
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="text-2xl font-black text-[#4B1528]">{value}</div>
      <div className="text-[10px] font-black uppercase text-gray-400">{label}</div>
    </div>
  </motion.div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const DashboardAdmin = () => {
  const { isAdmin, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<'geral' | 'ebooks'>('geral');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Ebooks state ─────────────────────────────────────────────────────────────
  const [ebooks, setEbooks] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('almas_ebooks_2') || '[]'); } catch { return []; }
  });

  // ── Dashboard stats ───────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ maes: 0, ebooks: 0, vagas: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  // ── Fetch all data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      // 1. Total de mães (Supabase)
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Usuárias recentes (Supabase)
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, cidade, estado, nivel_suporte_filho, created_at')
        .order('created_at', { ascending: false })
        .limit(8);

      // 3. Vagas (IndexedDB – mesmo banco do RendaParaMae)
      const vagasCount = await getVagasCountFromDB();

      // 4. E-books (localStorage)
      const savedEbooks = JSON.parse(localStorage.getItem('almas_ebooks_2') || '[]');

      setStats({ maes: count ?? 0, ebooks: savedEbooks.length, vagas: vagasCount });
      setRecentUsers(users || []);
      setEbooks(savedEbooks);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // ── Auto-refresh: first load + every 30s ─────────────────────────────────────
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── E-book form state ─────────────────────────────────────────────────────────
  const [ebookTitle, setEbookTitle] = useState('');
  const [ebookAutor, setEbookAutor] = useState('');
  const [ebookCat, setEbookCat] = useState('Direitos');
  const [ebookType, setEbookType] = useState<'Gratuito' | 'Premium'>('Premium');
  const [ebookDesc, setEbookDesc] = useState('');
  const [ebookHotmart, setEbookHotmart] = useState('');
  const [ebookKiwify, setEbookKiwify] = useState('');
  const [ebookColor, setEbookColor] = useState(COLOR_OPTIONS[0].value);
  const [ebookCoverPreview, setEbookCoverPreview] = useState('');

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEbookCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddEbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebookTitle || !ebookAutor || !ebookDesc) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    const newEbook = {
      id: Date.now(),
      title: ebookTitle,
      autor: ebookAutor,
      cat: ebookCat,
      type: ebookType,
      color: ebookColor,
      desc: ebookDesc,
      hotmartLink: ebookHotmart,
      kiwifyLink: ebookKiwify,
      coverUrl: ebookCoverPreview,
    };
    const updated = [newEbook, ...ebooks];
    localStorage.setItem('almas_ebooks_2', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setEbooks(updated);
    setStats(prev => ({ ...prev, ebooks: updated.length }));
    toast.success('E-book adicionado à Livraria!');
    setEbookTitle(''); setEbookAutor(''); setEbookDesc('');
    setEbookHotmart(''); setEbookKiwify(''); setEbookCoverPreview('');
  };

  const handleDeleteEbook = (id: number) => {
    const updated = ebooks.filter((b: any) => b.id !== id);
    localStorage.setItem('almas_ebooks_2', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setEbooks(updated);
    setStats(prev => ({ ...prev, ebooks: updated.length }));
    toast.success('E-book removido.');
  };

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="max-w-7xl mx-auto pb-12 w-full px-4 pt-4">

      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-pink-100 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-[#4B1528] font-serif mb-1">⚙️ Painel Admin</h1>
          <p className="text-gray-500 font-medium italic">Gestão centralizada da plataforma</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => fetchData()}
            disabled={isRefreshing}
            title="Atualizar dados agora"
            className="p-3 bg-pink-50 text-pink-500 rounded-2xl border border-pink-100 hover:bg-pink-100 transition-all disabled:opacity-40"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
            <button
              onClick={() => setActiveTab('geral')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'geral' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutDashboard size={16} /> Resumo
            </button>
            <button
              onClick={() => setActiveTab('ebooks')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'ebooks' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Book size={16} /> E-books
            </button>
          </div>
        </div>
      </div>

      {/* ─── DASHBOARD GERAL ──────────────────────────────────────────────────── */}
      {activeTab === 'geral' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={Users} color="bg-pink-100 text-pink-600" value={stats.maes} label="Mães na Rede" />
            <StatCard icon={Book} color="bg-amber-100 text-amber-600" value={stats.ebooks} label="Materiais" />
            <StatCard icon={Activity} color="bg-blue-100 text-blue-600" value={stats.vagas} label="Oportunidades Ativas" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Mães cadastradas recentemente</h2>
              {isRefreshing && <span className="text-xs text-pink-400 font-bold animate-pulse">Atualizando...</span>}
            </div>
            <table className="w-full text-left min-w-[400px]">
              <thead>
                <tr className="border-b text-gray-400 text-xs font-black uppercase">
                  <th className="pb-3 px-4">Usuária</th>
                  <th className="pb-3 px-4">Local</th>
                  <th className="pb-3 px-4">Nível TEA</th>
                  <th className="pb-3 px-4 text-right">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentUsers.map(user => (
                  <tr key={user.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-700">{user.full_name || 'Usuária Atípica'}</td>
                    <td className="px-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{user.cidade ? `${user.cidade}, ` : ''}{user.estado || 'BR'}</span></td>
                    <td className="px-4"><span className="bg-pink-50 text-pink-600 px-2 py-1 rounded text-xs font-bold">{user.nivel_suporte_filho || '—'}</span></td>
                    <td className="px-4 text-right text-xs text-gray-400 font-bold">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && !isRefreshing && (
                  <tr><td colSpan={4} className="py-12 text-center text-gray-400 font-medium">Nenhum cadastro encontrado.</td></tr>
                )}
                {recentUsers.length === 0 && isRefreshing && (
                  <tr><td colSpan={4} className="py-12 text-center text-pink-400 font-bold animate-pulse">Buscando dados no Supabase...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── GERENCIAR E-BOOKS ────────────────────────────────────────────────── */}
      {activeTab === 'ebooks' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} className="text-pink-500" /> Adicionar Novo Material</h3>
            <form onSubmit={handleAddEbook} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Título */}
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Título *</label>
                <input required value={ebookTitle} onChange={e => setEbookTitle(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300" placeholder="Ex: Direitos das Mães" />
              </div>

              {/* Autor */}
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Autor *</label>
                <input required value={ebookAutor} onChange={e => setEbookAutor(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300" placeholder="Nome do autor" />
              </div>

              {/* Categoria */}
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Categoria</label>
                <select value={ebookCat} onChange={e => setEbookCat(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300 cursor-pointer font-bold text-gray-700">
                  {CAT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Tipo de Acesso</label>
                <select value={ebookType} onChange={e => setEbookType(e.target.value as 'Gratuito' | 'Premium')} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300 cursor-pointer font-bold text-gray-700">
                  <option value="Gratuito">Gratuito</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              {/* Cor da capa */}
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Cor da Capa</label>
                <select value={ebookColor} onChange={e => setEbookColor(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300 cursor-pointer font-bold text-gray-700">
                  {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Link Hotmart */}
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Link Hotmart (opcional)</label>
                <input value={ebookHotmart} onChange={e => setEbookHotmart(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300" placeholder="https://go.hotmart.com/..." />
              </div>

              {/* Resumo */}
              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Resumo *</label>
                <textarea required value={ebookDesc} onChange={e => setEbookDesc(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none h-24 resize-none focus:border-pink-300" placeholder="Fale brevemente sobre o material..." />
              </div>

              {/* Capa */}
              <div className="md:col-span-2 p-6 border-2 border-dashed rounded-3xl flex flex-col items-center bg-gray-50/50">
                {ebookCoverPreview ? (
                  <div className="relative group">
                    <img src={ebookCoverPreview} className="w-40 h-40 object-cover rounded-2xl shadow-xl" alt="Capa do e-book" />
                    <button type="button" onClick={() => setEbookCoverPreview('')} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-pink-500"><ImageIcon size={24} /></div>
                    <span className="font-bold text-sm text-gray-500">Capa do E-book (PNG/JPG)</span>
                    <span className="text-xs text-gray-400">opcional — sem capa usa a cor selecionada</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  </label>
                )}
              </div>

              <button type="submit" className="md:col-span-2 py-4 bg-[#D4537E] text-white font-black rounded-2xl shadow-lg hover:bg-[#b04366] transition-all active:scale-95">
                SALVAR NA LIVRARIA
              </button>
            </form>
          </div>

          {/* Catálogo */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm overflow-hidden">
            <h3 className="text-xl font-bold mb-6">Catálogo Atual ({ebooks.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ebooks.map(b => (
                <div key={b.id} className="p-4 border rounded-3xl flex items-center gap-4 bg-gray-50/30 group hover:shadow-md transition-all">
                  {b.coverUrl ? (
                    <img src={b.coverUrl} className="w-14 h-14 object-cover rounded-xl shadow-sm shrink-0" alt={b.title} />
                  ) : (
                    <div className={`w-14 h-14 rounded-xl shadow-sm shrink-0 bg-gradient-to-br ${b.color || 'from-pink-400 to-rose-500'} flex items-center justify-center`}>
                      <Book size={20} className="text-white opacity-70" />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-[#4B1528] text-sm truncate">{b.title}</div>
                    <div className="text-[10px] text-gray-400">{b.autor}</div>
                    <div className="flex gap-1 mt-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${b.type === 'Gratuito' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{b.type}</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{b.cat}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteEbook(b.id)} className="p-2 text-red-500 bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 size={16} /></button>
                </div>
              ))}
              {ebooks.length === 0 && (
                <p className="text-center py-10 text-gray-400 font-bold opacity-50 col-span-full">Nenhum e-book na livraria. Adicione o primeiro acima.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardAdmin;
