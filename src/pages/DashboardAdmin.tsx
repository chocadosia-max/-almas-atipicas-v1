import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, Activity, Heart, Search, FileText, Trash2, Plus, Book, LayoutDashboard, Image as ImageIcon } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DashboardAdmin = () => {
  const { isAdmin, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'geral' | 'ebooks'>('geral');

  // Ebooks State
  const [ebooks, setEbooks] = useState<any[]>(() => {
    const saved = localStorage.getItem('almas_ebooks_2');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) { return []; }
    }
    return [];
  });

  const [stats, setStats] = useState({
    maes: 1, 
    ebooks: 0,
    vagas: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadStats = () => {
      // Ebooks
      const savedEbooks = localStorage.getItem('almas_ebooks_2');
      const ebookCount = savedEbooks ? JSON.parse(savedEbooks).length : 0;
      
      // Vagas
      const savedVagas = localStorage.getItem('almas_vagas_2');
      const vagasCount = savedVagas ? JSON.parse(savedVagas).length : 0;

      setStats(prev => ({ ...prev, ebooks: ebookCount, vagas: vagasCount }));
    };

    const fetchRealData = async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        setStats(prev => ({ ...prev, maes: count || 1 }));
      }

      const { data: users, error: uErr } = await supabase
        .from('profiles')
        .select('id, full_name, cidade, estado, nivel_suporte_filho, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!uErr && users) {
        setRecentUsers(users);
      }
    };

    loadStats();
    fetchRealData();

    const handleStorage = () => {
      loadStats();
      const savedE = localStorage.getItem('almas_ebooks_2');
      if (savedE) setEbooks(JSON.parse(savedE));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // E-book form handlers
  const [ebookTitle, setEbookTitle] = useState('');
  const [ebookAutor, setEbookAutor] = useState('');
  const [ebookCat, setEbookCat] = useState('Direitos');
  const [ebookType, setEbookType] = useState('Premium');
  const [ebookDesc, setEbookDesc] = useState('');
  const [ebookHotmart, setEbookHotmart] = useState('');
  const [ebookKiwify, setEbookKiwify] = useState('');
  const [ebookColor, setEbookColor] = useState('from-pink-500 to-rose-600');
  const [ebookCoverFile, setEbookCoverFile] = useState<File | null>(null);
  const [ebookCoverPreview, setEbookCoverPreview] = useState<string>('');

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEbookCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEbookCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      coverUrl: ebookCoverPreview
    };
    const updated = [newEbook, ...ebooks];
    localStorage.setItem('almas_ebooks_2', JSON.stringify(updated));
    setEbooks(updated);
    toast.success("E-book adicionado à Livraria!");
    setEbookTitle(''); setEbookAutor(''); setEbookDesc('');
    setEbookHotmart(''); setEbookKiwify('');
    setEbookCoverPreview('');
  };

  const handleDeleteEbook = (id: number) => {
    const updated = ebooks.filter((b: any) => b.id !== id);
    setEbooks(updated);
    localStorage.setItem('almas_ebooks_2', JSON.stringify(updated));
    toast.success("E-book removido.");
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

      {/* DASHBOARD GERAL */}
      {activeTab === 'geral' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
               <div><div className="text-2xl font-black text-[#4B1528]">{stats.maes}</div><div className="text-[10px] font-black uppercase text-gray-400">Mães na Rede</div></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center"><Book size={24} /></div>
               <div><div className="text-2xl font-black text-[#4B1528]">{stats.ebooks}</div><div className="text-[10px] font-black uppercase text-gray-400">Materiais</div></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center"><Activity size={24} /></div>
               <div><div className="text-2xl font-black text-[#4B1528]">{stats.vagas}</div><div className="text-[10px] font-black uppercase text-gray-400">Oportunidades</div></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm">
             <h2 className="text-xl font-bold mb-6">Mães cadastradas recentemente</h2>
             <table className="w-full text-left">
                <thead><tr className="border-b text-gray-400 text-xs font-black uppercase"><th className="pb-3 px-4">Usuária</th><th className="pb-3 px-4">Local</th><th className="pb-3 px-4 text-right">Ação</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {recentUsers.map(user => (
                    <tr key={user.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-700">{user.full_name || 'Usuária Atípica'}</td>
                      <td className="px-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{user.estado || 'BR'}</span></td>
                      <td className="px-4 text-right"><button className="text-xs font-bold text-pink-600">Ver Detalhes</button></td>
                    </tr>
                  ))}
                  {recentUsers.length === 0 && (
                    <tr><td colSpan={3} className="py-12 text-center text-gray-400 font-medium">Buscando dados no Supabase...</td></tr>
                  )}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* GERENCIAR E-BOOKS */}
      {activeTab === 'ebooks' && (
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} className="text-pink-500" /> Adicionar Novo Material</h3>
             <form onSubmit={handleAddEbook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="text-xs font-black uppercase text-gray-400 mb-2 block">Título</label><input required value={ebookTitle} onChange={e=>setEbookTitle(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" placeholder="Ex: Direitos das Mães" /></div>
                <div><label className="text-xs font-black uppercase text-gray-400 mb-2 block">Autor</label><input required value={ebookAutor} onChange={e=>setEbookAutor(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" placeholder="Nome do autor" /></div>
                <div className="md:col-span-2"><label className="text-xs font-black uppercase text-gray-400 mb-2 block">Resumo</label><textarea required value={ebookDesc} onChange={e=>setEbookDesc(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none h-24" placeholder="Fale brevemente sobre o material..." /></div>
                <div className="md:col-span-2 p-6 border-2 border-dashed rounded-3xl flex flex-col items-center bg-gray-50/50">
                   {ebookCoverPreview ? (
                     <div className="relative group">
                       <img src={ebookCoverPreview} className="w-40 h-40 object-cover rounded-2xl shadow-xl" />
                       <button type="button" onClick={() => setEbookCoverPreview('')} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg"><Trash2 size={14} /></button>
                     </div>
                   ) : (
                     <label className="cursor-pointer flex flex-col items-center gap-2">
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-pink-500"><ImageIcon size={24} /></div>
                       <span className="font-bold text-sm text-gray-500">Capa do E-book (PNG/JPG)</span>
                       <input type="file" className="hidden" onChange={handleCoverChange} />
                     </label>
                   )}
                </div>
                <button className="md:col-span-2 py-4 bg-[#D4537E] text-white font-black rounded-2xl shadow-lg hover:bg-[#b04366] transition-all">SALVAR NA LIVRARIA</button>
             </form>
           </div>
           
           <div className="bg-white p-8 rounded-[2.5rem] border border-pink-100 shadow-sm overflow-hidden">
              <h3 className="text-xl font-bold mb-6">Catálogo Atual</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ebooks.map(b => (
                  <div key={b.id} className="p-4 border rounded-3xl flex items-center gap-4 bg-gray-50/30 group hover:shadow-md transition-all">
                    <img src={b.coverUrl} className="w-14 h-14 object-cover rounded-xl shadow-sm" />
                    <div className="flex-1 overflow-hidden">
                      <div className="font-bold text-[#4B1528] text-sm truncate">{b.title}</div>
                      <div className="text-[10px] text-gray-400">{b.autor}</div>
                    </div>
                    <button onClick={() => handleDeleteEbook(b.id)} className="p-2 text-red-500 bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  </div>
                ))}
                {ebooks.length === 0 && <p className="text-center py-10 text-gray-400 font-bold opacity-50 col-span-full">Nenhum e-book na livraria.</p>}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default DashboardAdmin;
