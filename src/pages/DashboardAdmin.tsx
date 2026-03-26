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
      // Contagem Total
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        setStats(prev => ({ ...prev, maes: count || 1 }));
      }

      // Usuárias Recentes
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
      const saved = localStorage.getItem('almas_ebooks_2');
      if (saved) setEbooks(JSON.parse(saved));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Form State
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
        const img = new Image();
        img.onload = () => {
          // Redimensionamento Inteligente (Suporta 4K convertendo para no máximo 1600px)
          const MAX_SIZE = 1600;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85); // Compressão otimizada
            setEbookCoverPreview(compressedBase64);
          } else {
             setEbookCoverPreview(reader.result as string);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebookTitle || !ebookAutor || !ebookDesc) {
      toast.error("Preencha os campos obrigatórios.");
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
    
    try {
      localStorage.setItem('almas_ebooks_2', JSON.stringify(updated));
      setEbooks(updated);
      window.dispatchEvent(new Event('storage'));
      // Clear Form
      setEbookTitle(''); setEbookAutor(''); setEbookDesc('');
      setEbookHotmart(''); setEbookKiwify('');
      setEbookCoverFile(null); setEbookCoverPreview('');
      toast.success("E-book adicionado com sucesso à Livraria!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar: a imagem da capa é muito grande. Tente compactar a imagem (max 1MB).");
    }
  };

  const handleDeleteEbook = (id: number) => {
    const updated = ebooks.filter((b: any) => b.id !== id);
    setEbooks(updated);
    try {
      localStorage.setItem('almas_ebooks_2', JSON.stringify(updated));
    } catch (e) {}
    window.dispatchEvent(new Event('storage'));
    toast.success("E-book excluído instantaneamente.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4537E]"></div>
      </div>
    );
  }

  // Basic Protection: If not admin, send to the timeline or root
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 w-full">
      <div className="bg-white/65 shadow-xl backdrop-blur-[8px] rounded-3xl border border-white/40 p-8 mb-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#4B1528] font-serif flex items-center gap-3 mb-2">
             ⚙️ Painel de Controle (Admin)
          </h1>
          <p className="text-[#72243E] opacity-80">
            Visão geral da plataforma Mãe em Primeiro.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2 sm:gap-4 bg-[var(--ativo-bg)] p-1.5 rounded-2xl border border-[var(--rosa-medio)]/20 shadow-inner">
           <button 
             onClick={() => setActiveTab('geral')}
             className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'geral' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'}`}
           >
             <LayoutDashboard size={18}/> Visão Geral
           </button>
           <button 
             onClick={() => setActiveTab('ebooks')}
             className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'ebooks' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'}`}
           >
             <Book size={18}/> Gestão de E-books
           </button>
        </div>
      </div>

      {activeTab === 'geral' ? (
        <>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <Users size={80} />
          </div>
          <p className="text-pink-100 font-bold uppercase tracking-wider text-sm mb-1">Total de Mães</p>
          <h3 className="text-5xl font-black mb-2">{stats.maes}</h3>
          <p className="text-sm border-t border-white/20 pt-2 mt-2">
            Mães conectadas na rede real
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#831843] to-[#4c0519] rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <Activity size={80} />
          </div>
          <p className="text-pink-100 font-bold uppercase tracking-wider text-sm mb-1">E-books Ativos</p>
          <h3 className="text-5xl font-black mb-2">{stats.ebooks}</h3>
          <p className="text-sm border-t border-white/20 pt-2 mt-2">
             Materiais de apoio e mentoria
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <Heart size={80} />
          </div>
          <p className="text-purple-100 font-bold uppercase tracking-wider text-sm mb-1">Oportunidades de Renda</p>
          <h3 className="text-5xl font-black mb-2">{stats.vagas}</h3>
          <p className="text-sm border-t border-white/20 pt-2 mt-2">
             Vagas postadas pela rede
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-[12px] rounded-3xl border border-white/60 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
           <h2 className="text-xl font-extrabold text-[#4B1528]">Mães Adicionadas Recentemente</h2>
           <div className="relative w-full md:w-64">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Buscar por nome/email..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-pink-100">
                <th className="py-3 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Usuária</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Email</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Local</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Filho(a)</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user: any) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-[#4B1528]">{user.full_name || 'Mãe Atípica'}</td>
                  <td className="py-4 px-4 text-gray-500 text-sm">{(user.id || "").substring(0,8)}...</td>
                  <td className="py-4 px-4 text-gray-500 font-medium">
                     <span className="bg-gray-100 px-2 py-1 rounded text-xs">{user.estado || 'UF'}</span>
                  </td>
                  <td className="py-4 px-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                       user.nivel_suporte_filho === 'Nível 1' ? 'bg-blue-100 text-blue-700' :
                       user.nivel_suporte_filho === 'Nível 2' ? 'bg-yellow-100 text-yellow-700' :
                       'bg-red-100 text-red-700'
                     }`}>
                       {user.nivel_suporte_filho || 'N/A'}
                     </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400 text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Recentemente'}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">Nenhuma mãe cadastrada recentemente além de você.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-center">
           <button className="text-pink-600 font-bold hover:underline text-sm">Ver todas as usuárias</button>
        </div>
      </div>
      </>
      ) : (
        <div className="space-y-8">
           {/* Add E-book Form */}
           <div className="bg-white/80 backdrop-blur-[12px] rounded-3xl border border-white/60 p-6 md:p-8 shadow-xl">
             <h2 className="text-2xl font-extrabold text-[#4B1528] mb-6 flex items-center gap-2"><Plus className="text-pink-500" /> Adicionar Novo E-book</h2>
             
             <form onSubmit={handleAddEbook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-200 rounded-2xl bg-pink-50/50 hover:bg-pink-50 transition-colors">
                   {ebookCoverPreview ? (
                     <div className="relative w-40 aspect-square rounded-xl shadow-lg border-4 border-white overflow-hidden mb-4">
                        <img src={ebookCoverPreview} alt="Capa" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => {setEbookCoverPreview(''); setEbookCoverFile(null);}} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"><Trash2 size={12} /></button>
                     </div>
                   ) : (
                     <label className="flex flex-col items-center justify-center cursor-pointer w-full">
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow mb-3 text-pink-500"><ImageIcon size={32} /></div>
                       <span className="font-bold text-gray-700">Upload Capa Qualidade 4K (1:1)</span>
                       <span className="text-xs text-gray-500 mt-1">PNG, JPG até 50MB (Conversão Instantânea)</span>
                       <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                     </label>
                   )}
                </div>

                <div className="space-y-4">
                  <div><label className="text-sm font-bold text-gray-700 mb-1 block">Título do Livro *</label><input required value={ebookTitle} onChange={e=>setEbookTitle(e.target.value)} type="text" className="w-full p-3 rounded-xl border border-gray-200" placeholder="Ex: Guia do BPC" /></div>
                  <div><label className="text-sm font-bold text-gray-700 mb-1 block">Autor *</label><input required value={ebookAutor} onChange={e=>setEbookAutor(e.target.value)} type="text" className="w-full p-3 rounded-xl border border-gray-200" placeholder="Ex: Dra. Mariana Lemos" /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-sm font-bold text-gray-700 mb-1 block">Categoria</label>
                       <select value={ebookCat} onChange={e=>setEbookCat(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200">
                         <option>Direitos</option><option>Rotinas</option><option>Autocuidado</option><option>Comportamento</option><option>Inclusão</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-sm font-bold text-gray-700 mb-1 block">Tipo</label>
                       <select value={ebookType} onChange={e=>setEbookType(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200">
                         <option>Premium</option><option>Gratuito</option>
                       </select>
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div><label className="text-sm font-bold text-gray-700 mb-1 block">Link Afiliado Hotmart</label><input value={ebookHotmart} onChange={e=>setEbookHotmart(e.target.value)} type="url" className="w-full p-3 rounded-xl border border-orange-200 focus:border-orange-500 bg-orange-50/30" placeholder="https://hotmart.com/..." /></div>
                  <div><label className="text-sm font-bold text-gray-700 mb-1 block">Link Afiliado Kiwify</label><input value={ebookKiwify} onChange={e=>setEbookKiwify(e.target.value)} type="url" className="w-full p-3 rounded-xl border border-blue-200 focus:border-blue-500 bg-blue-50/30" placeholder="https://kiwify.com.br/..." /></div>
                  <div><label className="text-sm font-bold text-gray-700 mb-1 block">Descrição Curta *</label><textarea required value={ebookDesc} onChange={e=>setEbookDesc(e.target.value)} rows={3} className="w-full p-3 rounded-xl border border-gray-200 resize-none" placeholder="Resumo do impacto deste material..."></textarea></div>
                </div>

                <div className="md:col-span-2 mt-4">
                   <button type="submit" className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-black text-lg rounded-xl shadow-xl transition-all flex items-center justify-center gap-2">
                      <Plus size={24} /> PUBLICAR E-BOOK NA LIVRARIA
                   </button>
                </div>
             </form>
           </div>

           {/* E-books Table */}
           <div className="bg-white/80 backdrop-blur-[12px] rounded-3xl border border-white/60 p-6 shadow-xl">
             <h2 className="text-xl font-extrabold text-[#4B1528] mb-6 flex items-center gap-2"><Book className="text-pink-500" /> Catálogo da Livraria</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-pink-100">
                      <th className="py-3 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Capa / Título</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Categoria</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Links</th>
                      <th className="py-3 px-4 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ebooks.map((b: any) => (
                      <tr key={b.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                        <td className="py-4 px-4">
                           <div className="flex items-center gap-3">
                              {b.coverUrl ? (
                                <img src={b.coverUrl} className="w-10 h-10 object-cover rounded shadow" />
                              ) : (
                                <div className={`w-10 h-10 rounded shadow bg-gradient-to-br ${b.color || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white font-serif text-xs font-bold uppercase`}>{b.title.slice(0,2)}</div>
                              )}
                              <div>
                                <h4 className="font-bold text-[#4B1528] max-w-[200px] truncate">{b.title}</h4>
                                <p className="text-xs text-gray-500">{b.autor}</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 font-bold text-sm">
                           <span className={b.type === 'Premium' ? 'text-amber-500' : 'text-green-500'}>{b.type}</span> • {b.cat}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold">
                           {b.hotmartLink && <span className="block text-orange-500 mb-1 max-w-[150px] truncate">Hotmart</span>}
                           {b.kiwifyLink && <span className="block text-blue-500 max-w-[150px] truncate">Kiwify</span>}
                           {!b.hotmartLink && !b.kiwifyLink && <span className="text-gray-400">Nenhum externo</span>}
                        </td>
                        <td className="py-4 px-4 text-center">
                           <button onClick={() => handleDeleteEbook(b.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Excluir">
                             <Trash2 size={18} />
                           </button>
                        </td>
                      </tr>
                    ))}
                    {ebooks.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-8 text-gray-500 font-bold">Nenhum e-book cadastrado.</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default DashboardAdmin;
