import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Users, Activity, Book, LayoutDashboard, ImageIcon, Trash2, Plus,
  RefreshCw, Flag, Radio, Briefcase, BarChart2, Download, Bell,
  AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Music, Upload, Save, X
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';

// ── IndexedDB helpers ──────────────────────────────────────────────────────────
const openDB = (name: string, version = 1, stores: string[] = []): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = () => stores.forEach(s => { if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s, { keyPath: 'id' }); });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const countIDB = async (dbName: string, store: string): Promise<number> => {
  try {
    const db = await openDB(dbName, 1);
    if (!db.objectStoreNames.contains(store)) return 0;
    return new Promise(res => {
      const req = db.transaction(store, 'readonly').objectStore(store).count();
      req.onsuccess = () => res(req.result);
      req.onerror = () => res(0);
    });
  } catch { return 0; }
};

const getAllIDB = async (dbName: string, store: string): Promise<any[]> => {
  try {
    const db = await openDB(dbName, 1);
    if (!db.objectStoreNames.contains(store)) return [];
    return new Promise(res => {
      const req = db.transaction(store, 'readonly').objectStore(store).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => res([]);
    });
  } catch { return []; }
};

const deleteIDB = async (dbName: string, store: string, id: any): Promise<void> => {
  try {
    const db = await openDB(dbName, 1);
    return new Promise(res => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).delete(id);
      tx.oncomplete = () => res();
    });
  } catch {}
};

// ── Audio IndexedDB (AlmasZenDB) ───────────────────────────────────────────────
const saveAudioToDB = async (audio: any) => {
  const db = await openDB('AlmasZenDB', 1, ['audios']);
  return new Promise<void>(res => {
    const tx = db.transaction('audios', 'readwrite');
    tx.objectStore('audios').put(audio);
    tx.oncomplete = () => res();
  });
};

// ── Constants ──────────────────────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { label: 'Rosa Forte', value: 'from-pink-500 to-rose-600' },
  { label: 'Roxo', value: 'from-violet-500 to-purple-600' },
  { label: 'Azul', value: 'from-blue-500 to-indigo-600' },
  { label: 'Verde', value: 'from-green-500 to-emerald-600' },
  { label: 'Âmbar', value: 'from-amber-400 to-orange-500' },
  { label: 'Escuro', value: 'from-[#4A2218] to-[#C1694F]' },
];
const CAT_OPTIONS = ['Direitos', 'Rotinas', 'Autocuidado', 'Comportamento', 'Inclusão'];

type TabKey = 'geral' | 'ebooks' | 'usuarios' | 'vagas' | 'denuncias' | 'broadcast';

// ── Mini Bar Chart ─────────────────────────────────────────────────────────────
const MiniBarChart = ({ data }: { data: { label: string; count: number }[] }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.round((d.count / max) * 100)}%` }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="w-full bg-gradient-to-t from-[var(--rosa-forte)] to-pink-300 rounded-t-lg min-h-[4px]"
          />
          <span className="text-[8px] font-bold text-gray-400 text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, color, bg, value, label }: any) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center shrink-0`}><Icon size={22} /></div>
    <div>
      <div className="text-2xl font-black text-[#4B1528]">{value}</div>
      <div className="text-[10px] font-black uppercase text-gray-400">{label}</div>
    </div>
  </motion.div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const DashboardAdmin = () => {
  const { isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('geral');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Global State ───────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ maes: 0, ebooks: 0, vagas: 0, denuncias: 0, posts: 0, audios: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [vagas, setVagas] = useState<any[]>([]);
  const [denuncias, setDenuncias] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('almas_admin_denuncias') || '[]'); } catch { return []; }
  });
  const [ebooks, setEbooks] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('almas_ebooks_2') || '[]'); } catch { return []; }
  });
  const [audios, setAudios] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ label: string; count: number }[]>([]);

  // ── Engagement metrics ─────────────────────────────────────────────────────
  const engagementMetrics = (() => {
    try {
      const feed = JSON.parse(localStorage.getItem('almas_feed_community_2') || '[]');
      const totalPosts = feed.length;
      const totalComments = feed.reduce((acc: number, p: any) => acc + (p.comentariosList?.length || 0), 0);
      const totalLikes = feed.reduce((acc: number, p: any) => acc + (p.curtidas || 0), 0);
      return { totalPosts, totalComments, totalLikes };
    } catch { return { totalPosts: 0, totalComments: 0, totalLikes: 0 }; }
  })();

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { data: recent } = await supabase.from('profiles').select('id, full_name, cidade, estado, nivel_suporte_filho, created_at').order('created_at', { ascending: false }).limit(8);
      const { data: all } = await supabase.from('profiles').select('id, full_name, cidade, estado, nivel_suporte_filho, created_at, bio').order('full_name');

      // Chart: group last 7 days
      const { data: chartUsers } = await supabase.from('profiles').select('created_at').order('created_at', { ascending: false }).limit(200);
      if (chartUsers) {
        const now = new Date();
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now);
          d.setDate(d.getDate() - (6 - i));
          return d;
        });
        const groups = days.map(day => ({
          label: day.toLocaleDateString('pt-BR', { weekday: 'short' }),
          count: chartUsers.filter(u => {
            const ud = new Date(u.created_at!);
            return ud.getDate() === day.getDate() && ud.getMonth() === day.getMonth();
          }).length
        }));
        setChartData(groups);
      }

      const vagasCount = await countIDB('AlmasEmpDB', 'vagas');
      const vagasList = await getAllIDB('AlmasEmpDB', 'vagas');
      const audiosList = await getAllIDB('AlmasZenDB', 'audios');
      const savedEbooks = JSON.parse(localStorage.getItem('almas_ebooks_2') || '[]');
      const savedDenuncias = JSON.parse(localStorage.getItem('almas_admin_denuncias') || '[]');
      const feed = JSON.parse(localStorage.getItem('almas_feed_community_2') || '[]');

      setStats({ maes: count ?? 0, ebooks: savedEbooks.length, vagas: vagasCount, denuncias: savedDenuncias.filter((d: any) => d.status === 'pendente').length, posts: feed.length, audios: audiosList.length });
      setRecentUsers(recent || []);
      setAllUsers(all || []);
      setVagas(vagasList.sort((a: any, b: any) => Number(b.id) - Number(a.id)));
      setEbooks(savedEbooks);
      setDenuncias(savedDenuncias);
      setAudios(audiosList.sort((a: any, b: any) => Number(b.id) - Number(a.id)));
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Ebook form ─────────────────────────────────────────────────────────────
  const [ebookTitle, setEbookTitle] = useState('');
  const [ebookAutor, setEbookAutor] = useState('');
  const [ebookCat, setEbookCat] = useState('Direitos');
  const [ebookType, setEbookType] = useState<'Gratuito' | 'Premium'>('Premium');
  const [ebookDesc, setEbookDesc] = useState('');
  const [ebookHotmart, setEbookHotmart] = useState('');
  const [ebookColor, setEbookColor] = useState(COLOR_OPTIONS[0].value);
  const [ebookCoverPreview, setEbookCoverPreview] = useState('');

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEbookCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddEbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebookTitle || !ebookAutor || !ebookDesc) { toast.error('Preencha os campos obrigatórios.'); return; }
    const newEbook = { id: Date.now(), title: ebookTitle, autor: ebookAutor, cat: ebookCat, type: ebookType, color: ebookColor, desc: ebookDesc, hotmartLink: ebookHotmart, coverUrl: ebookCoverPreview };
    const updated = [newEbook, ...ebooks];
    localStorage.setItem('almas_ebooks_2', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setEbooks(updated);
    setStats(prev => ({ ...prev, ebooks: updated.length }));
    toast.success('E-book adicionado à Livraria!');
    setEbookTitle(''); setEbookAutor(''); setEbookDesc(''); setEbookHotmart(''); setEbookCoverPreview('');
  };

  const handleDeleteEbook = (id: number) => {
    const updated = ebooks.filter((b: any) => b.id !== id);
    localStorage.setItem('almas_ebooks_2', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setEbooks(updated);
    setStats(prev => ({ ...prev, ebooks: updated.length }));
    toast.success('E-book removido.');
  };

  // ── Vagas ──────────────────────────────────────────────────────────────────
  const handleDeleteVaga = async (id: any) => {
    await deleteIDB('AlmasEmpDB', 'vagas', id);
    setVagas(v => v.filter((x: any) => x.id !== id));
    setStats(prev => ({ ...prev, vagas: prev.vagas - 1 }));
    toast.success('Vaga removida.');
  };

  // ── Denúncias ──────────────────────────────────────────────────────────────
  const resolveDenuncia = (id: number) => {
    const updated = denuncias.map((d: any) => d.id === id ? { ...d, status: 'resolvida' } : d);
    localStorage.setItem('almas_admin_denuncias', JSON.stringify(updated));
    setDenuncias(updated);
    setStats(prev => ({ ...prev, denuncias: Math.max(0, prev.denuncias - 1) }));
    toast.success('Denúncia marcada como resolvida.');
  };

  const dismissDenuncia = (id: number) => {
    const updated = denuncias.map((d: any) => d.id === id ? { ...d, status: 'descartada' } : d);
    localStorage.setItem('almas_admin_denuncias', JSON.stringify(updated));
    setDenuncias(updated);
    setStats(prev => ({ ...prev, denuncias: Math.max(0, prev.denuncias - 1) }));
    toast.info('Denúncia descartada.');
  };

  // ── Audio / Rádio Playlist ─────────────────────────────────────────────────
  const [newAudioTitle, setNewAudioTitle] = useState('');
  const [newAudioBase64, setNewAudioBase64] = useState('');
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setNewAudioFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setNewAudioBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveAudio = async () => {
    if (!newAudioTitle || !newAudioBase64) { toast.error('Título e MP3 obrigatórios.'); return; }
    toast.loading('Salvando música...', { id: 'save_audio' });
    const novo = { id: Date.now().toString(), title: newAudioTitle, url: newAudioBase64, fileName: newAudioFile?.name || 'Musica' };
    try {
      await saveAudioToDB(novo);
      setAudios(prev => [novo, ...prev]);
      setStats(prev => ({ ...prev, audios: prev.audios + 1 }));
      setNewAudioTitle(''); setNewAudioBase64(''); setNewAudioFile(null);
      toast.success('Música adicionada à playlist!', { id: 'save_audio' });
    } catch { toast.error('Arquivo muito grande.', { id: 'save_audio' }); }
  };

  const handleDeleteAudio = async (id: string) => {
    await deleteIDB('AlmasZenDB', 'audios', id);
    setAudios(prev => prev.filter((a: any) => a.id !== id));
    setStats(prev => ({ ...prev, audios: Math.max(0, prev.audios - 1) }));
    toast.success('Música removida.');
  };

  // ── Broadcast / Maintenance ────────────────────────────────────────────────
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'success'>('info');
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('almas_maintenance') || 'false'); } catch { return false; }
  });

  const handleSendBroadcast = () => {
    if (!broadcastMsg.trim()) { toast.error('Digite uma mensagem.'); return; }
    const payload = { message: broadcastMsg.trim(), type: broadcastType, timestamp: Date.now(), active: true };
    localStorage.setItem('almas_admin_broadcast', JSON.stringify(payload));
    window.dispatchEvent(new Event('storage'));
    toast.success('Notificação global enviada! Será exibida para todas as usuárias.');
    setBroadcastMsg('');
  };

  const handleClearBroadcast = () => {
    localStorage.removeItem('almas_admin_broadcast');
    window.dispatchEvent(new Event('storage'));
    toast.info('Notificação global removida.');
  };

  const toggleMaintenance = () => {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    localStorage.setItem('almas_maintenance', JSON.stringify(next));
    window.dispatchEvent(new Event('storage'));
    toast[next ? 'warning' : 'success'](next ? 'Modo manutenção ATIVADO — banner visível para todas.' : 'Modo manutenção DESATIVADO.');
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!allUsers.length) { toast.error('Nenhuma usuária para exportar.'); return; }
    const header = 'Nome,Cidade,Estado,Nível TEA,Cadastro\n';
    const rows = allUsers.map(u =>
      `"${u.full_name || ''}","${u.cidade || ''}","${u.estado || ''}","${u.nivel_suporte_filho || ''}","${u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : ''}"`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `almas_atipicas_usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`CSV com ${allUsers.length} usuárias exportado com sucesso! (Aviso LGPD: use apenas para fins internos)`);
  };

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const TABS: { key: TabKey; label: string; icon: any; badge?: number }[] = [
    { key: 'geral', label: 'Resumo', icon: LayoutDashboard },
    { key: 'ebooks', label: 'E-books', icon: Book, badge: stats.ebooks },
    { key: 'usuarios', label: 'Usuárias', icon: Users, badge: stats.maes },
    { key: 'vagas', label: 'Vagas', icon: Briefcase, badge: stats.vagas },
    { key: 'denuncias', label: 'Denúncias', icon: Flag, badge: stats.denuncias },
    { key: 'broadcast', label: 'Broadcast', icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-16 w-full px-4 pt-4">

      {/* HEADER */}
      <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-pink-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#4B1528] font-serif mb-1">⚙️ Painel Admin</h1>
          <p className="text-gray-400 font-medium text-sm">Auto-refresh: 30s · {isRefreshing && <span className="text-pink-400 animate-pulse">atualizando...</span>}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData()} disabled={isRefreshing} className="p-3 bg-pink-50 text-pink-500 rounded-2xl border border-pink-100 hover:bg-pink-100 transition-all disabled:opacity-40">
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-3 bg-[#4B1528] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#3a0f1e] transition-all shadow-lg">
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap mb-8">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all relative ${activeTab === tab.key ? 'bg-[var(--rosa-forte)] text-white shadow-lg shadow-pink-300/30' : 'bg-white text-gray-400 border border-gray-100 hover:border-pink-200 hover:text-[var(--rosa-forte)]'}`}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === tab.key ? 'bg-white/30 text-white' : 'bg-pink-100 text-pink-600'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

          {/* ─── GERAL ────────────────────────────────────────────────────────── */}
          {activeTab === 'geral' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={Users} bg="bg-pink-100" color="text-pink-600" value={stats.maes} label="Mães na Rede" />
                <StatCard icon={Book} bg="bg-amber-100" color="text-amber-600" value={stats.ebooks} label="E-books" />
                <StatCard icon={Briefcase} bg="bg-blue-100" color="text-blue-600" value={stats.vagas} label="Vagas Ativas" />
                <StatCard icon={Flag} bg="bg-red-100" color="text-red-500" value={stats.denuncias} label="Denúncias Pendentes" />
                <StatCard icon={Radio} bg="bg-purple-100" color="text-purple-600" value={stats.audios} label="Músicas Playlist" />
                <StatCard icon={Activity} bg="bg-green-100" color="text-green-600" value={stats.posts} label="Posts no Feed" />
              </div>

              {/* Charts + Engagement */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Chart */}
                <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm">
                  <h3 className="font-bold text-[#4B1528] mb-1 flex items-center gap-2"><BarChart2 size={18} className="text-pink-500" /> Crescimento — Últimos 7 Dias</h3>
                  <p className="text-xs text-gray-400 mb-4">Novos cadastros por dia</p>
                  {chartData.length > 0 ? <MiniBarChart data={chartData} /> : <div className="h-20 flex items-center justify-center text-gray-300 text-sm">Carregando...</div>}
                </div>

                {/* Engagement */}
                <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm">
                  <h3 className="font-bold text-[#4B1528] mb-4 flex items-center gap-2"><Activity size={18} className="text-green-500" /> Métricas de Engajamento</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Posts no Feed', value: engagementMetrics.totalPosts, color: 'bg-pink-400' },
                      { label: 'Comentários', value: engagementMetrics.totalComments, color: 'bg-blue-400' },
                      { label: 'Apoios (Curtidas)', value: engagementMetrics.totalLikes, color: 'bg-green-400' },
                    ].map(m => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                          <span>{m.label}</span><span>{m.value}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((m.value / Math.max(engagementMetrics.totalPosts, 1)) * 100, 100)}%` }}
                            className={`h-full ${m.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Users Table */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm overflow-x-auto">
                <h2 className="text-xl font-bold mb-6">Mães cadastradas recentemente</h2>
                <table className="w-full text-left min-w-[500px]">
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
                        <td className="px-4 text-right text-xs text-gray-400 font-bold">{user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                      </tr>
                    ))}
                    {recentUsers.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-gray-400 font-medium">Nenhum cadastro encontrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── E-BOOKS ──────────────────────────────────────────────────────── */}
          {activeTab === 'ebooks' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} className="text-pink-500" /> Adicionar Novo Material</h3>
                <form onSubmit={handleAddEbook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="text-xs font-black uppercase text-gray-400 mb-2 block">Título *</label><input required value={ebookTitle} onChange={e => setEbookTitle(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300" placeholder="Ex: Direitos das Mães" /></div>
                  <div><label className="text-xs font-black uppercase text-gray-400 mb-2 block">Autor *</label><input required value={ebookAutor} onChange={e => setEbookAutor(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300" placeholder="Nome do autor" /></div>
                  <div><label className="text-xs font-black uppercase text-gray-400 mb-2 block">Categoria</label><select value={ebookCat} onChange={e => setEbookCat(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300 cursor-pointer font-bold text-gray-700">{CAT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="text-xs font-black uppercase text-gray-400 mb-2 block">Tipo de Acesso</label><select value={ebookType} onChange={e => setEbookType(e.target.value as any)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300 cursor-pointer font-bold text-gray-700"><option value="Gratuito">Gratuito</option><option value="Premium">Premium</option></select></div>
                  <div><label className="text-xs font-black uppercase text-gray-400 mb-2 block">Cor da Capa</label><select value={ebookColor} onChange={e => setEbookColor(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300 cursor-pointer font-bold text-gray-700">{COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                  <div><label className="text-xs font-black uppercase text-gray-400 mb-2 block">Link Hotmart (opcional)</label><input value={ebookHotmart} onChange={e => setEbookHotmart(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300" placeholder="https://go.hotmart.com/..." /></div>
                  <div className="md:col-span-2"><label className="text-xs font-black uppercase text-gray-400 mb-2 block">Resumo *</label><textarea required value={ebookDesc} onChange={e => setEbookDesc(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none h-24 resize-none focus:border-pink-300" placeholder="Fale brevemente sobre o material..." /></div>
                  <div className="md:col-span-2 p-6 border-2 border-dashed rounded-3xl flex flex-col items-center bg-gray-50/50">
                    {ebookCoverPreview ? (
                      <div className="relative group"><img src={ebookCoverPreview} className="w-40 h-40 object-cover rounded-2xl shadow-xl" alt="Capa" /><button type="button" onClick={() => setEbookCoverPreview('')} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg"><Trash2 size={14} /></button></div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-pink-500"><ImageIcon size={24} /></div>
                        <span className="font-bold text-sm text-gray-500">Capa do E-book (PNG/JPG)</span>
                        <span className="text-xs text-gray-400">opcional — usa cor selecionada se omitido</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                      </label>
                    )}
                  </div>
                  <button type="submit" className="md:col-span-2 py-4 bg-[#D4537E] text-white font-black rounded-2xl shadow-lg hover:bg-[#b04366] transition-all active:scale-95">SALVAR NA LIVRARIA</button>
                </form>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Catálogo Atual ({ebooks.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ebooks.map((b: any) => (
                    <div key={b.id} className="p-4 border rounded-3xl flex items-center gap-4 bg-gray-50/30 group hover:shadow-md transition-all">
                      {b.coverUrl ? <img src={b.coverUrl} className="w-14 h-14 object-cover rounded-xl shadow-sm shrink-0" alt={b.title} /> : <div className={`w-14 h-14 rounded-xl shadow-sm shrink-0 bg-gradient-to-br ${b.color || 'from-pink-400 to-rose-500'} flex items-center justify-center`}><Book size={20} className="text-white opacity-70" /></div>}
                      <div className="flex-1 overflow-hidden"><div className="font-bold text-[#4B1528] text-sm truncate">{b.title}</div><div className="text-[10px] text-gray-400">{b.autor}</div><div className="flex gap-1 mt-1"><span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${b.type === 'Gratuito' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{b.type}</span><span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{b.cat}</span></div></div>
                      <button onClick={() => handleDeleteEbook(b.id)} className="p-2 text-red-500 bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  {ebooks.length === 0 && <p className="text-center py-10 text-gray-400 font-bold opacity-50 col-span-full">Nenhum e-book na livraria.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── USUÁRIAS ─────────────────────────────────────────────────────── */}
          {activeTab === 'usuarios' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Todas as Usuárias ({allUsers.length})</h2>
              </div>
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b text-gray-400 text-xs font-black uppercase">
                    <th className="pb-3 px-4">Nome</th>
                    <th className="pb-3 px-4">Localização</th>
                    <th className="pb-3 px-4">Nível TEA</th>
                    <th className="pb-3 px-4 text-right">Cadastrou-se</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allUsers.map(user => (
                    <tr key={user.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-700 text-sm">{user.full_name || 'Usuária Atípica'}</td>
                      <td className="px-4 text-sm text-gray-500">{user.cidade ? `${user.cidade}, ${user.estado}` : user.estado || '—'}</td>
                      <td className="px-4"><span className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded text-xs font-bold">{user.nivel_suporte_filho || '—'}</span></td>
                      <td className="px-4 text-right text-xs text-gray-400 font-bold">{user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                    </tr>
                  ))}
                  {allUsers.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-gray-400">Buscando usuárias...</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── VAGAS ────────────────────────────────────────────────────────── */}
          {activeTab === 'vagas' && (
            <div className="space-y-4">
              <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Vagas Ativas ({vagas.length})</h2>
                {vagas.length === 0 ? <p className="text-center py-12 text-gray-400 font-bold">Nenhuma vaga publicada no mural.</p> : (
                  <div className="space-y-4">
                    {vagas.map((v: any) => (
                      <div key={v.id} className="p-5 border border-gray-100 rounded-2xl flex items-start gap-4 group hover:shadow-md hover:border-pink-100 transition-all">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-black text-[#4B1528]">{v.funcao}</span>
                            <span className="text-[10px] font-black uppercase text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">{v.tipo}</span>
                            {v.salario && <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{v.salario}</span>}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{v.desc}</p>
                          <div className="text-xs text-gray-400 font-bold">{v.autor?.nome} · {v.autor?.empresa} · {v.autor?.cidade}, {v.autor?.estado}</div>
                        </div>
                        <button onClick={() => handleDeleteVaga(v.id)} className="shrink-0 p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── DENÚNCIAS ────────────────────────────────────────────────────── */}
          {activeTab === 'denuncias' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm">
              <h2 className="text-xl font-bold mb-2">Central de Denúncias</h2>
              <p className="text-sm text-gray-400 mb-6">Conteúdo reportado pelas usuárias da comunidade. Analise e tome uma ação para cada item.</p>
              {denuncias.length === 0 ? (
                <div className="py-20 text-center">
                  <ShieldCheck size={48} className="text-green-400 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold">Nenhuma denúncia registrada. Comunidade segura! 🌸</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {denuncias.map((d: any) => (
                    <div key={d.id} className={`p-5 border rounded-2xl flex items-start gap-4 ${d.status === 'pendente' ? 'border-red-100 bg-red-50/30' : d.status === 'resolvida' ? 'border-green-100 bg-green-50/30 opacity-60' : 'border-gray-100 opacity-40'}`}>
                      <Flag size={18} className={d.status === 'pendente' ? 'text-red-400 mt-0.5 shrink-0' : 'text-gray-400 mt-0.5 shrink-0'} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${d.status === 'pendente' ? 'bg-red-100 text-red-600' : d.status === 'resolvida' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.status}</span>
                          <span className="text-xs text-gray-400">{d.timestamp ? new Date(d.timestamp).toLocaleString('pt-BR') : ''}</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{d.content || 'Conteúdo não especificado'}</p>
                        {d.autorNome && <p className="text-xs text-gray-400 mt-1">Autor: {d.autorNome}</p>}
                      </div>
                      {d.status === 'pendente' && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => resolveDenuncia(d.id)} title="Marcar como resolvida" className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all"><CheckCircle2 size={16} /></button>
                          <button onClick={() => dismissDenuncia(d.id)} title="Descartar denúncia" className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"><XCircle size={16} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── BROADCAST ────────────────────────────────────────────────────── */}
          {activeTab === 'broadcast' && (
            <div className="space-y-6">
              {/* Global Notification */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Bell size={20} className="text-pink-500" /> Notificação Global</h3>
                <p className="text-sm text-gray-400 mb-6">Mensagem exibida como banner para todas as usuárias logadas na plataforma.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Tipo de Alerta</label>
                    <div className="flex gap-3">
                      {(['info', 'warning', 'success'] as const).map(t => (
                        <button key={t} type="button" onClick={() => setBroadcastType(t)}
                          className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${broadcastType === t ? (t === 'info' ? 'bg-blue-500 text-white border-blue-500' : t === 'warning' ? 'bg-amber-500 text-white border-amber-500' : 'bg-green-500 text-white border-green-500') : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                          {t === 'info' ? '🔵 Info' : t === 'warning' ? '⚠️ Alerta' : '✅ Sucesso'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Mensagem *</label>
                    <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} rows={3} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300 resize-none" placeholder="Ex: Novidade! Novo e-book gratuito disponível na Livraria..." />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSendBroadcast} className="flex-1 py-4 bg-[var(--rosa-forte)] text-white font-black rounded-2xl shadow-lg hover:bg-[#b04366] transition-all active:scale-95 flex items-center justify-center gap-2"><Bell size={16} /> ENVIAR PARA TODAS</button>
                    <button onClick={handleClearBroadcast} className="px-6 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"><X size={14} /> Limpar</button>
                  </div>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${maintenanceMode ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-100'} shadow-sm`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2"><AlertTriangle size={20} className={maintenanceMode ? 'text-amber-500' : 'text-gray-400'} /> Modo Manutenção</h3>
                    <p className="text-sm text-gray-500 mt-1">Exibe um banner de aviso para todas as usuárias informando que o sistema está em manutenção.</p>
                  </div>
                  <button onClick={toggleMaintenance} className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${maintenanceMode ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {maintenanceMode ? '🔧 ATIVO — Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>

              {/* Playlist Admin */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Music size={20} className="text-purple-500" /> Playlist — Momento Pausa</h3>
                <p className="text-sm text-gray-400 mb-6">Gerencie as músicas ambientes disponíveis para as usuárias no Momento Pausa.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input value={newAudioTitle} onChange={e => setNewAudioTitle(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-pink-300" placeholder="Título da música..." />
                    <label className="flex flex-col items-center justify-center gap-2 w-full p-6 bg-purple-50 text-purple-600 font-black rounded-3xl border-2 border-dashed border-purple-200 cursor-pointer hover:bg-purple-100 transition-all">
                      <Upload size={24} />
                      <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                      <span className="text-xs">{newAudioFile ? newAudioFile.name : 'Selecionar MP3'}</span>
                    </label>
                    <button onClick={handleSaveAudio} className="w-full py-4 bg-purple-500 text-white font-black rounded-2xl shadow-lg hover:bg-purple-600 transition-all flex items-center justify-center gap-2"><Save size={16} /> ADICIONAR À PLAYLIST</button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    <h4 className="text-xs font-black uppercase text-gray-400 mb-3">Músicas ({audios.length})</h4>
                    {audios.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-purple-50 transition-all">
                        <div className="flex items-center gap-3"><Music size={14} className="text-purple-400 shrink-0" /><span className="text-sm font-bold text-gray-700 truncate">{a.title}</span></div>
                        <button onClick={() => handleDeleteAudio(a.id)} className="p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    {audios.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Nenhuma música na playlist.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DashboardAdmin;
