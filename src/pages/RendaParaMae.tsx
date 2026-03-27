import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Store, 
  GraduationCap, 
  ExternalLink, 
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle,
  User, Image as ImageIcon, Send, Crown, Flower, Trash2, BellRing,
  Phone, Building2, MapPin, DollarSign, Laptop, UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CURSOS_LINKS = [
  { name: "SEBRAE - Empreendedorismo", link: "https://www.sebrae.com.br" },
  { name: "SENAI - Cursos Profissionalizantes", link: "https://www.mundosenai.com.br" },
  { name: "Enap - Escola de Governo (Certificados)", link: "https://www.escolavirtual.gov.br" },
  { name: "Coursera - Bolsas para Mulheres", link: "https://www.coursera.org" },
];

const DB_NAME_EMP = 'AlmasEmpDB';
const STORE_PROF = 'profile';
const STORE_VAGAS = 'vagas';
const initEmpDB = () => new Promise<IDBDatabase>((resolve, reject) => {
  const req = indexedDB.open(DB_NAME_EMP, 1);
  req.onupgradeneeded = () => {
    if(!req.result.objectStoreNames.contains(STORE_PROF)) req.result.createObjectStore(STORE_PROF, { keyPath: 'id' });
    if(!req.result.objectStoreNames.contains(STORE_VAGAS)) req.result.createObjectStore(STORE_VAGAS, { keyPath: 'id' });
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});
const getProfileDB = async () => {
  const db = await initEmpDB().catch(()=>null);
  if(!db) return null;
  return new Promise<any>((resolve) => {
    const tx = db.transaction(STORE_PROF, 'readonly');
    const req = tx.objectStore(STORE_PROF).get('me');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
};
const saveProfileDB = async (prof: any) => {
  const db = await initEmpDB().catch(()=>null);
  if(!db) return;
  return new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_PROF, 'readwrite');
    tx.objectStore(STORE_PROF).put({ id: 'me', ...prof });
    tx.oncomplete = () => resolve();
  });
};
const getVagasDB = async () => {
  const db = await initEmpDB().catch(()=>null);
  if(!db) return [];
  return new Promise<any[]>((resolve) => {
    const tx = db.transaction(STORE_VAGAS, 'readonly');
    const req = tx.objectStore(STORE_VAGAS).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
};
const saveVagaDB = async (vaga: any) => {
  const db = await initEmpDB().catch(()=>null);
  if(!db) return;
  return new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_VAGAS, 'readwrite');
    tx.objectStore(STORE_VAGAS).put(vaga);
    tx.oncomplete = () => resolve();
  });
};
const deleteVagaDB = async (id: number) => {
  const db = await initEmpDB().catch(()=>null);
  if(!db) return;
  return new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_VAGAS, 'readwrite');
    tx.objectStore(STORE_VAGAS).delete(id);
    tx.oncomplete = () => resolve();
  });
};

const RendaParaMae = () => {
  const [activeTab, setActiveTab] = useState<'vagas' | 'perfil'>('vagas');
  const [showFlowers, setShowFlowers] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  // Perfil da Empreendedora - Estado Centralizado
  const [profile, setProfile] = useState<any>({ 
    avatarBase64: '', 
    isEmpreendedora: false,
    nomeEmpreendedora: '',
    nomeEmpresa: '',
    cidade: '',
    estado: '',
    whatsapp: '',
    avatarPosition: { x: 50, y: 50 } // Percentage for crop alignment
  });

  // Lista de Vagas
  const [vagas, setVagas] = useState<any[]>([]);

  // Estado do Form de Nova Vaga
  const [novaVagaForm, setNovaVagaForm] = useState({
    funcao: '',
    salario: '',
    tipo: 'Home Office',
    descricao: ''
  });

  const [systemAlert, setSystemAlert] = useState<{title: string, desc: string} | null>(null);

  // Efeito para carregar DB nativamente e contornar limite localStorage
  useEffect(() => {
    getProfileDB().then(saved => {
      if(saved) setProfile((p:any) => ({ ...p, ...saved }));
      else {
        const old = localStorage.getItem('almas_empreendedora_profile_v2');
        if(old) setProfile((p:any) => ({ ...p, ...JSON.parse(old) }));
      }
    });

    getVagasDB().then(saved => {
      if(saved && saved.length > 0) {
        saved.sort((a,b)=> Number(b.id) - Number(a.id));
        setVagas(saved);
      } else {
        const old = localStorage.getItem('almas_vagas_v3');
        if(old) {
           const parsed = JSON.parse(old);
           setVagas(parsed);
           parsed.forEach((pa:any) => saveVagaDB(pa));
        }
      }
    });
  }, []);

  // Efeito para salvar perfil sempre que mudar
  useEffect(() => {
    if (profile.nomeEmpreendedora || profile.avatarBase64) {
      saveProfileDB(profile);
      // Sync a minimal version to localStorage (without the giant Base64 image) for UI components
      const minimalProfile = { ...profile, avatarBase64: '' };
      localStorage.setItem('almas_empreendedora_profile', JSON.stringify(minimalProfile));
      window.dispatchEvent(new Event('profileUpdated'));
    }
  }, [profile]);

  const handleUpdateProfile = (field: string, value: any) => {
    setProfile((p: any) => ({ ...p, [field]: value }));
  };

  const handlePostVaga = (e: React.FormEvent) => {
    e.preventDefault();
    if(!novaVagaForm.funcao || !novaVagaForm.descricao) return;

    if (!profile.whatsapp) {
      toast.error("Adicione seu WhatsApp no perfil antes de postar vagas!");
      setActiveTab('perfil');
      return;
    }

    const novaVaga = {
      id: Date.now(),
      funcao: novaVagaForm.funcao,
      salario: novaVagaForm.salario,
      tipo: novaVagaForm.tipo,
      desc: novaVagaForm.descricao,
      timestamp: new Date().toISOString(),
      tags: ["Empreendedora", novaVagaForm.tipo],
      
      // Dados do Autor no momento da postagem (Snap)
      autor: {
        nome: profile.nomeEmpreendedora || 'Mãe Empreendedora',
        empresa: profile.nomeEmpresa || 'Negócio Próprio',
        cidade: profile.cidade,
        estado: profile.estado,
        whatsapp: profile.whatsapp,
        avatar: profile.avatarBase64,
        avatarPosition: profile.avatarPosition
      }
    };

    const updated = [novaVaga, ...vagas];
    setVagas(updated);
    saveVagaDB(novaVaga);
    
    setNovaVagaForm({ funcao: '', salario: '', tipo: 'Home Office', descricao: '' });
    
    // Alerta Visual
    setSystemAlert({ title: novaVaga.funcao, desc: novaVaga.desc });
    setTimeout(() => setSystemAlert(null), 5000);
    toast.success("Oportunidade publicada com sucesso!");
  };

  const handleDeleteVaga = (id: number) => {
    const updated = vagas.filter((v: any) => v.id !== id);
    setVagas(updated);
    deleteVagaDB(id);
    toast.success("Vaga marcada como preenchida e removida do feed!");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
         handleUpdateProfile('avatarBase64', reader.result as string);
         toast.success("Foto de perfil atualizada!");
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const toggleEmpreendedora = () => {
    const newVal = !profile.isEmpreendedora;
    handleUpdateProfile('isEmpreendedora', newVal);

    if (newVal) {
      setShowFlowers(true);
      setTimeout(() => setShowFlowers(false), 5000);
      toast.success("Identidade Empreendedora Ativada! 🌸");
    } else {
      toast.info("Modo Empreendedora desativado.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 relative overflow-hidden px-4 md:px-0">
      
      {/* Flower Confetti */}
      <AnimatePresence>
         {showFlowers && (
           <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
             {[...Array(30)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ top: -50, left: `${Math.random() * 100}vw`, rotate: 0, opacity: 1 }}
                 animate={{ top: '100vh', rotate: 360, opacity: 0 }}
                 transition={{ duration: 3 + Math.random() * 2, ease: 'linear' }}
                 className="absolute text-3xl"
               >
                 {['🌸', '🌺', '🐝', '✨'][Math.floor(Math.random() * 4)]}
               </motion.div>
             ))}
           </div>
         )}
         
         {systemAlert && (
           <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed top-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-[200] pointer-events-none">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border-2 border-[var(--rosa-forte)]/20 flex gap-4 items-center">
                 <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-[var(--rosa-forte)] shrink-0"><BellRing className="animate-bounce" /></div>
                 <div>
                    <div className="text-[10px] font-black uppercase text-pink-500 tracking-widest">Nova Oportunidade</div>
                    <h4 className="font-bold text-[var(--texto-escuro)] text-sm line-clamp-1">{systemAlert.title}</h4>
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="bg-white/65 shadow-xl backdrop-blur-md rounded-[3rem] border border-white/40 p-8 md:p-12 mb-8 text-center relative overflow-hidden">
        <Sparkles className="absolute top-6 right-8 text-[var(--rosa-forte)]/20 w-16 h-16" />
        <h1 className="text-4xl md:text-5xl font-black text-[var(--texto-escuro)] mb-4 font-serif italic tracking-tight leading-tight">
          Sua <span className="text-[var(--rosa-forte)]">Liberdade</span> Financeira
        </h1>
        <p className="text-[var(--texto-medio)] max-w-2xl mx-auto text-lg mb-10 font-medium">
          Oportunidades de renda pensadas para mães atípicas. Conecte-se com empreendedoras que entendem a sua realidade.
        </p>

        <div className="flex justify-center gap-3 bg-[var(--ativo-bg)] p-1.5 rounded-2xl border border-[var(--rosa-medio)]/10 shadow-inner max-w-sm mx-auto">
           <button onClick={() => setActiveTab('vagas')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'vagas' ? 'bg-white text-[var(--rosa-forte)] shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Oportunidades</button>
           <button onClick={() => setActiveTab('perfil')} className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'perfil' ? 'bg-white text-[var(--rosa-forte)] shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Empresária</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-8">
          
          {/* TAB: PERFIL EMPREENDEDORA */}
          {activeTab === 'perfil' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/80 shadow-2xl backdrop-blur-md rounded-[3rem] border-2 border-[var(--rosa-forte)]/20 p-8 md:p-10">
                 
                 <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                    <div className="relative group mx-auto md:mx-0 flex flex-col items-center">
                       <div className="w-40 h-40 bg-pink-50 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center justify-center overflow-hidden relative">
                          {profile.avatarBase64 ? (
                            <>
                              {/* Imagem com alinhamento Customizado e Grade do Instagram no modo Edição */}
                              <div className="absolute inset-0 z-0">
                                 <div 
                                   className="w-full h-full bg-no-repeat bg-cover"
                                   style={{ 
                                     backgroundImage: `url(${profile.avatarBase64})`,
                                     backgroundPosition: `${profile.avatarPosition?.x || 50}% ${profile.avatarPosition?.y || 50}%`
                                   }}
                                 />
                                 {showCropper && (
                                   <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
                                     {[...Array(9)].map((_, i) => <div key={i} className="border border-white/60 drop-shadow-md" />)}
                                   </div>
                                 )}
                              </div>
                            </>
                          ) : (
                            <User size={64} className="text-pink-200" />
                          )}
                          <label className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer z-20 ${showCropper ? 'hidden' : ''}`}>
                             <ImageIcon className="text-white drop-shadow-md" size={32} />
                             <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                          </label>
                       </div>
                       {profile.isEmpreendedora && <div className="absolute top-0 -right-3 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl border-2 border-amber-300 z-30">👑</div>}
                       
                       {profile.avatarBase64 && (
                          <div className="mt-4 w-full">
                             <button
                               onClick={() => setShowCropper(!showCropper)}
                               className="text-[10px] w-full bg-pink-50 text-pink-500 font-black uppercase tracking-widest py-2 rounded-xl border border-pink-100 mb-2 hover:bg-pink-100"
                             >
                               {showCropper ? "Pronto" : "Alinhar Foto"}
                             </button>
                             
                             <AnimatePresence>
                               {showCropper && (
                                 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex flex-col gap-2 p-3 bg-white border border-pink-100 rounded-2xl shadow-lg mt-2 relative z-50 overflow-hidden">
                                   <div>
                                     <label className="text-[8px] font-black uppercase text-gray-400">Deslocar ← →</label>
                                     <input type="range" min="0" max="100" value={profile.avatarPosition?.x || 50} onChange={(e) => handleUpdateProfile('avatarPosition', { ...(profile.avatarPosition || {y:50}), x: Number(e.target.value) })} className="w-full accent-[var(--rosa-forte)]" />
                                   </div>
                                   <div>
                                     <label className="text-[8px] font-black uppercase text-gray-400">Deslocar ↑ ↓</label>
                                     <input type="range" min="0" max="100" value={profile.avatarPosition?.y || 50} onChange={(e) => handleUpdateProfile('avatarPosition', { ...(profile.avatarPosition || {x:50}), y: Number(e.target.value) })} className="w-full accent-[var(--rosa-forte)]" />
                                   </div>
                                 </motion.div>
                               )}
                             </AnimatePresence>
                          </div>
                       )}
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                       <h2 className="text-3xl font-black text-[var(--texto-escuro)] font-serif italic mb-2">Dados da Empresária</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Seu Nome</label>
                             <input value={profile.nomeEmpreendedora} onChange={e=>handleUpdateProfile('nomeEmpreendedora', e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-300 font-bold text-sm" placeholder="Ex: Maria Silva" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Sua Empresa</label>
                             <input value={profile.nomeEmpresa} onChange={e=>handleUpdateProfile('nomeEmpresa', e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-300 font-bold text-sm" placeholder="Ex: Doce Atípico" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">WhatsApp (Com DDD)</label>
                             <input value={profile.whatsapp} onChange={e=>handleUpdateProfile('whatsapp', e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-300 font-bold text-sm" placeholder="11999999999" />
                          </div>
                          <div className="flex gap-2">
                             <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Cidade</label>
                                <input value={profile.cidade} onChange={e=>handleUpdateProfile('cidade', e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-300 font-bold text-sm" placeholder="São Paulo" />
                             </div>
                             <div className="w-20 space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">UF</label>
                                <input value={profile.estado} onChange={e=>handleUpdateProfile('estado', e.target.value)} maxLength={2} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-300 font-bold text-sm text-center uppercase" placeholder="SP" />
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className={`p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 transition-all border-2 ${profile.isEmpreendedora ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0 ${profile.isEmpreendedora ? 'bg-amber-500' : 'bg-gray-300'}`}><Crown size={32} /></div>
                    <div className="flex-1 text-center md:text-left">
                       <h3 className={`text-xl font-bold mb-1 ${profile.isEmpreendedora ? 'text-amber-900' : 'text-gray-500'}`}>Identidade Empreendedora</h3>
                       <p className="text-gray-500 text-sm font-medium">Ao ativar, você poderá postar vagas reais para outras mães da comunidade.</p>
                    </div>
                    <button onClick={toggleEmpreendedora} className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${profile.isEmpreendedora ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-100'}`}>
                       {profile.isEmpreendedora ? <span className="flex items-center gap-2"><CheckCircle size={16} /> Identidade Ativa</span> : 'Habilitar Perfil'}
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {/* TAB: OPORTUNIDADES (FEED) */}
          {activeTab === 'vagas' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               
               {/* Form de Publicação (Apenas se for Empreendedora) */}
               {profile.isEmpreendedora && (
                 <div className="bg-[#4B1528] rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border-4 border-white">
                    <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-pink-500/10 rounded-full blur-[60px]" />
                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 italic font-serif leading-tight"><Building2 size={24} className="text-pink-400" /> Convocar Mães Atípicas</h3>
                    <form onSubmit={handlePostVaga} className="space-y-5 relative z-10">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                             <input required value={novaVagaForm.funcao} onChange={e=>setNovaVagaForm((pv: any)=>({...pv, funcao: e.target.value}))} className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white outline-none focus:bg-white/20 font-bold placeholder:text-white/40 shadow-inner" placeholder="Função..." />
                          </div>
                          <div className="md:col-span-1">
                             <input value={novaVagaForm.salario} onChange={e=>setNovaVagaForm((pv: any)=>({...pv, salario: e.target.value}))} className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white outline-none focus:bg-white/20 font-bold placeholder:text-white/30" placeholder="R$ Salário" />
                          </div>
                          <div className="md:col-span-1">
                             <select value={novaVagaForm.tipo} onChange={e=>setNovaVagaForm((pv: any)=>({...pv, tipo: e.target.value}))} className="w-full p-4 bg-white text-[#4B1528] rounded-2xl font-black text-xs outline-none cursor-pointer hover:bg-pink-50 transition-all shadow-md">
                                <option>Home Office</option>
                                <option>Presencial</option>
                                <option>Híbrido</option>
                             </select>
                          </div>
                       </div>
                       <textarea required rows={3} value={novaVagaForm.descricao} onChange={e=>setNovaVagaForm((pv: any)=>({...pv, descricao: e.target.value}))} className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white outline-none focus:bg-white/20 font-medium placeholder:text-white/30 resize-none shadow-inner" placeholder="Conte mais sobre a vaga, flexibilidade e horários..."></textarea>
                       <button type="submit" className="w-full py-5 bg-[var(--rosa-forte)] text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 uppercase tracking-[4px] text-xs hover:scale-[1.01] active:scale-95 transition-all">
                          <Send size={18} /> LANÇAR OPORTUNIDADE
                       </button>
                    </form>
                 </div>
               )}

               {/* Grid de Feed de Vagas */}
               <div className="bg-white/60 shadow-xl backdrop-blur-md rounded-[3rem] border border-white/40 p-6 md:p-10">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-[var(--texto-escuro)] font-serif italic">Mural de <span className="text-[var(--rosa-forte)]">Chances</span></h2>
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-pink-500 tracking-widest bg-pink-50 px-4 py-2 rounded-full border border-pink-100">
                       <UserCheck size={14} /> Somente Mães
                    </div>
                  </div>

                  {vagas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {vagas.map(v => (
                         <motion.div key={v.id} whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2.5rem] border border-pink-50 shadow-md hover:shadow-2xl transition-all relative overflow-hidden group">
                           
                           {/* Badge Tipo/Salário */}
                           <div className="flex gap-2 flex-wrap mb-4">
                              <span className="px-3 py-1 bg-pink-100 text-[var(--rosa-forte)] rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Laptop size={12} /> {v.tipo}</span>
                              {v.salario && <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><DollarSign size={12} /> {v.salario}</span>}
                           </div>

                           <h3 className="text-xl font-black text-[var(--texto-escuro)] mb-3 leading-tight">{v.funcao}</h3>
                           <p className="text-[var(--texto-medio)] text-sm font-medium mb-6 line-clamp-3 leading-relaxed italic">{v.desc}</p>

                           {/* Perfil da Empreendedora Card */}
                           <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-4 border border-gray-100 group-hover:bg-pink-50 transition-all">
                              <div className="w-12 h-12 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center shrink-0 border border-white relative">
                                 {v.autor.avatar ? (
                                   <div 
                                     className="w-full h-full bg-no-repeat bg-cover"
                                     style={{ 
                                       backgroundImage: `url(${v.autor.avatar})`,
                                       backgroundPosition: `${v.autor.avatarPosition?.x || 50}% ${v.autor.avatarPosition?.y || 50}%`
                                     }}
                                   />
                                 ) : <User className="text-gray-300" />}
                                 <Crown size={12} className="absolute -top-1 -right-1 text-amber-500 bg-white rounded-full p-[1px] shadow-sm" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="text-xs font-black text-[#4B1528] truncate">{v.autor.nome}</div>
                                 <div className="text-[9px] font-bold text-pink-500 uppercase tracking-widest truncate">{v.autor.empresa}</div>
                                 <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase mt-0.5"><MapPin size={10} /> {v.autor.cidade}, {v.autor.estado}</div>
                              </div>
                           </div>

                           <div className="flex gap-2">
                              {v.autor.whatsapp === profile.whatsapp ? (
                                <button onClick={() => handleDeleteVaga(v.id)} className="w-full py-4 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all shadow-inner font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group">
                                   <CheckCircle size={18} className="group-hover:scale-110 transition-transform" /> VAGA PREENCHIDA
                                </button>
                              ) : (
                                <a 
                                  href={`https://wa.me/55${v.autor.whatsapp?.replace(/\D/g,'')}?text=Olá ${v.autor.nome?.split(' ')[0]}, vi sua vaga de ${v.funcao} no Almas Atípicas e gostaria de participar!`} 
                                  target="_blank" 
                                  className="w-full py-4 bg-[#25D366] text-white rounded-xl font-black text-xs uppercase tracking-widest text-center shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-2"
                                >
                                   <Phone size={14} /> Contatar Empresa
                                </a>
                              )}
                           </div>
                         </motion.div>
                       ))}
                    </div>
                  ) : (
                    <div className="p-20 text-center border-4 border-dashed border-gray-100 rounded-[3rem]">
                       <Briefcase size={80} className="text-gray-100 mx-auto mb-6" />
                       <h4 className="text-xl font-bold text-gray-400 italic">Nenhuma vaga lançada no feed hoje.</h4>
                    </div>
                  )}
               </div>

               {/* Mural SEBRAE/Gov (Persistent) */}
               <div className="bg-gradient-to-br from-white/70 to-white/40 shadow-xl backdrop-blur-md rounded-[3rem] border border-white/40 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-48 h-48 bg-white/50 rounded-full flex items-center justify-center p-4 border border-white shadow-inner shrink-0 scale-90 md:scale-100">
                    <Store size={80} className="text-[var(--rosa-forte)] opacity-40 shrink-0" />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <h3 className="text-2xl font-black text-[var(--texto-escuro)] font-serif italic mb-2 leading-tight">Empreendedorismo e MEI</h3>
                    <p className="text-[var(--texto-medio)] text-sm font-medium leading-relaxed">Regularize seu negócio para emitir notas fiscais, garantir auxílio maternidade e aposentadoria. Sua jornada como empresária começa com profissionalismo.</p>
                    <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" target="_blank" className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--texto-escuro)] text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg">Abrir MEI Agora <ExternalLink size={14} /></a>
                  </div>
               </div>
            </motion.div>
          )}

        </div>

        {/* Sidebar Educacional */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white/65 shadow-xl backdrop-blur-md rounded-[2.5rem] border border-white/40 p-8">
              <h4 className="text-xl font-bold text-[var(--texto-escuro)] mb-6 font-serif italic flex items-center gap-2"><GraduationCap size={20} className="text-pink-500" /> Cursos Gratuitos</h4>
              <div className="space-y-3">
                 {CURSOS_LINKS.map((c, i) => (
                   <a key={i} href={c.link} target="_blank" className="flex items-center justify-between p-4 bg-white border border-pink-50 rounded-2xl hover:bg-pink-50 transition-all group shadow-sm">
                      <span className="text-xs font-black text-gray-400 group-hover:text-pink-500 uppercase tracking-widest">{c.name}</span>
                      <ChevronRight size={16} className="text-pink-200" />
                   </a>
                 ))}
              </div>
           </div>

           <div className="bg-gradient-to-br from-[var(--rosa-forte)] to-[#4B1528] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <Sparkles className="absolute -top-10 -left-10 w-40 h-40 opacity-10 group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="text-2xl font-black font-serif italic mb-2 italic">Apoio MEI 💼</h4>
              <p className="text-pink-100 text-sm font-medium mb-6">Mãe, sabia que como MEI você tem direito ao Auxílio-Maternidade?</p>
              <button className="w-full py-4 bg-white text-[#4B1528] font-black rounded-2xl text-[10px] uppercase tracking-[3px] shadow-xl hover:scale-105 transition-all">Saber Mais</button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default RendaParaMae;
