import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Book, BookOpen, Clock, Coffee, HeartHandshake, MessageCircle, BookMarked, 
  Scale, Coins, Puzzle, Menu, AlertCircle, User, LogOut, Settings, ChevronRight, Stethoscope, Sparkles,
  X, Camera, Save
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NavItem {
  name: string;
  path: string;
  icon: any;
  highlight?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Minha Jornada",
    items: [
      { name: "Diário", path: "/diario", icon: Book },
      { name: "Caderneta", path: "/caderneta", icon: BookOpen },
      { name: "Rotina", path: "/rotina", icon: Clock },
      { name: "Momento Pausa", path: "/pausa", icon: Coffee },
      { name: "Consultas", path: "/consultas", icon: Stethoscope, highlight: false },
    ],
  },
  {
    label: "Comunidade",
    items: [
      { name: "Rede de Mães", path: "/rede-de-maes", icon: HeartHandshake },
      { name: "Chat", path: "/chat", icon: MessageCircle },
      { name: "Livraria", path: "/livraria", icon: BookMarked },
    ],
  },
  {
    label: "Direitos & Renda",
    items: [
      { name: "Seus Direitos", path: "/seus-direitos", icon: Scale },
      { name: "Renda", path: "/renda", icon: Coins },
    ],
  },
  {
    label: "Espaço Kids",
    items: [
      { name: "Kids", path: "/kids", icon: Puzzle, highlight: true },
    ],
  },
];


const SidebarContent = () => {
  const location = useLocation();
  const { isAdmin, user, signOut } = useAuth();
  
  const [localProfile, setLocalProfile] = useState(() => {
    const saved = localStorage.getItem('almas_empreendedora_profile');
    return saved ? JSON.parse(saved) : { avatarBase64: '', isEmpreendedora: false, nomeEmpreendedora: '', bio: '' };
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(localProfile);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const saved = localStorage.getItem('almas_empreendedora_profile');
      if (saved) setLocalProfile(JSON.parse(saved));
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleConvidarMae = () => {
    const inviteLink = `https://almas-atipicas-v1.pages.dev/login?invite=ACOLHER26`;
    const mensagem = `🌸 Olá! Venha fazer parte da Plataforma Comigo (Almas Atípicas), uma rede de apoio incrível para mães.\n\nClique no meu link VIP abaixo para criar sua conta gratuita (o código de acesso já vai preenchido):\n\n${inviteLink}`;
    
    navigator.clipboard.writeText(mensagem);
    toast.success("Mensagem de convite copiada para a área de transferência!");
  };

  return (
    <div className="flex flex-col h-full py-6">
      {/* Top Profile Card */}
      <motion.div 
        role="button"
        tabIndex={0}
        aria-label="Abrir modal de configuração do perfil"
        onClick={() => { setEditProfile(localProfile); setIsProfileModalOpen(true); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setEditProfile(localProfile); setIsProfileModalOpen(true); } }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mx-4 mb-8 p-4 rounded-2xl bg-white border border-pink-100 shadow-sm group cursor-pointer hover:shadow-md transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
      >
        <div className="flex items-center gap-3 relative">
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--rosa-forte)] to-[var(--rosa-medio)] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
            {localProfile.avatarBase64 ? (
               <img src={localProfile.avatarBase64} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
               <User size={24} />
            )}
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-[var(--texto-escuro)] text-sm truncate">
               {localProfile.nomeEmpreendedora || user?.full_name || "Mãe Atípica"}
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 ${localProfile.isEmpreendedora ? 'text-amber-500' : 'text-[var(--rosa-forte)]/70'}`}>
              {localProfile.isEmpreendedora && <span>👑</span>}
              {localProfile.isEmpreendedora ? 'Empreendedora' : 'Nível de Suporte 2'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botão Convidar Mãe */}
      <div className="px-4 mb-6">
        <button 
          onClick={handleConvidarMae}
          aria-label="Gerar e copiar convite para a plataforma"
          className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-[0_10px_25px_rgba(245,158,11,0.4)] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 group focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
        >
          <Sparkles size={18} className="group-hover:animate-pulse" />
          CONVIDAR UMA MÃE
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
        {NAV_GROUPS.map((group, i) => (
          <div key={i}>
            <div className="px-3 mb-3 text-[10px] font-black uppercase text-[var(--texto-claro)] tracking-[2px]">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item, j) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link 
                    key={j} 
                    to={item.path} 
                    className="block outline-none rounded-xl focus-visible:ring-4 focus-visible:ring-pink-300 focus-visible:ring-offset-1"
                    aria-label={`Ir para a página ${item.name}`}
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive 
                        ? "bg-[var(--rosa-forte)] text-white shadow-md" 
                        : "text-[var(--texto-medio)] hover:bg-[var(--rosa-forte)]/10 hover:text-[var(--texto-escuro)] bg-white/60 border border-white/40"
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="active-pill"
                          className="absolute left-0 w-1 h-6 bg-[var(--rosa-forte)] rounded-full"
                        />
                      )}
                      <item.icon size={20} className={isActive ? "text-[var(--rosa-forte)]" : "opacity-60"} />
                      <span className={`text-[13px] font-bold ${isActive ? "ml-1" : ""}`}>{item.name}</span>
                      
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="ml-auto"
                        >
                          <ChevronRight size={14} />
                        </motion.div>
                      )}
                      
                      {item.highlight && !isActive && (
                        <span className="ml-auto text-lg animate-bounce duration-1000">🧩</span>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 mt-auto pt-6 space-y-3">
        {isAdmin && (
          <Link 
            to="/admin/dashboard" 
            className="block outline-none rounded-xl focus-visible:ring-4 focus-visible:ring-pink-300"
            aria-label="Acessar painel de administração"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-[var(--rosa-forte)]/30 bg-[var(--rosa-forte)]/5 text-[var(--rosa-forte)] font-black text-xs uppercase text-center justify-center transition-all hover:bg-[var(--rosa-forte)]/10"
            >
              <Settings size={16} />
              Painel Admin
            </motion.div>
          </Link>
        )}
        
        <Link 
          to="/crise" 
          className="block outline-none rounded-2xl focus-visible:ring-4 focus-visible:ring-red-400"
          aria-label="Acessar apoio e ferramentas de emergência"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 p-3.5 bg-red-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
          >
            <AlertCircle size={18} />
            ESTOU EM CRISE
          </motion.div>
        </Link>
        
        <button 
          onClick={() => signOut()} 
          aria-label="Fazer logoff"
          className="w-full flex items-center gap-2 p-3 rounded-xl text-[var(--texto-medio)] font-bold text-xs bg-white border border-pink-100 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all group focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 active:scale-95"
        >
          <LogOut size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          Sair da Conta
        </button>
      </div>

      {/* Profile Config Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-perfil-titulo"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl border border-pink-100 relative overflow-hidden"
          >
            <button 
              onClick={() => setIsProfileModalOpen(false)} 
              aria-label="Fechar modal de perfil"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
            >
               <X size={16} />
            </button>
            
            <div className="flex items-center justify-between mb-6">
               <h3 id="modal-perfil-titulo" className="text-xl font-black text-gray-900 font-serif m-0">Seu <span className="text-pink-500 italic">Perfil</span></h3>
               {editProfile.isEmpreendedora && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
                     <span className="text-sm">👑</span>
                     <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Empreendedora</span>
                  </div>
               )}
            </div>

            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-pink-400 to-rose-500 p-1 flex items-center justify-center">
                {editProfile.avatarBase64 ? (
                   <img src={editProfile.avatarBase64} alt="Avatar" className="w-full h-full object-cover rounded-full border-4 border-white" />
                ) : (
                   <User size={40} className="text-white" />
                )}
                <label 
                  aria-label="Alterar foto de perfil"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white text-pink-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform border border-pink-100 focus-within:ring-4 focus-within:ring-pink-300"
                >
                   <Camera size={14} />
                   <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                         const reader = new FileReader();
                         reader.onload = (eReader) => {
                            const img = new Image();
                            img.onload = () => {
                               const canvas = document.createElement('canvas');
                               // Compression logic
                               let width = img.width;
                               let height = img.height;
                               const maxDimension = 400;
                               if (width > height && width > maxDimension) {
                                   height *= maxDimension / width;
                                   width = maxDimension;
                               } else if (height > maxDimension) {
                                   width *= maxDimension / height;
                                   height = maxDimension;
                               }
                               canvas.width = width;
                               canvas.height = height;
                               const ctx = canvas.getContext('2d');
                               if(ctx) {
                                   ctx.drawImage(img, 0, 0, width, height);
                                   const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                                   setEditProfile({ ...editProfile, avatarBase64: compressedBase64 });
                               }
                            };
                            if (eReader.target?.result) {
                               img.src = eReader.target.result as string;
                            }
                         };
                         reader.readAsDataURL(file);
                      }
                   }} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Nome de Apresentação</label>
                <input 
                  type="text" 
                  value={editProfile.nomeEmpreendedora} 
                  onChange={e => setEditProfile({ ...editProfile, nomeEmpreendedora: e.target.value })}
                  placeholder="Ex: Mãe Maria"
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 ring-pink-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Biografia Curta</label>
                <textarea 
                  value={editProfile.bio} 
                  onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })}
                  placeholder="Conte um pouco sobre a sua jornada..."
                  rows={3}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 resize-none focus:ring-2 ring-pink-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={() => {
                 try {
                     localStorage.setItem('almas_empreendedora_profile', JSON.stringify(editProfile));
                     window.dispatchEvent(new Event('profileUpdated'));
                     setIsProfileModalOpen(false);
                     toast.success('Perfil atualizado com sucesso!');
                 } catch (error) {
                     console.error("Erro ao salvar perfil:", error);
                     toast.error('Erro ao salvar. A foto pode ser muito grande, tente uma menor.');
                 }
              }}
              aria-label="Salvar alterações do perfil"
              className="w-full mt-6 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/30 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-500"
            >
               <Save size={16} /> Salvar Perfil
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export const Sidebar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 w-[240px] border-r border-pink-100 bg-white/80 backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Header + Sheet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 px-4 h-16 flex items-center justify-between shadow-lg border-b border-white/20" style={{ background: 'linear-gradient(to right, #D4537E, #F4C0D1)' }}>
        <div className="flex items-center gap-2 font-black text-white text-lg">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">🌸</div>
          <span>almas <em className="font-serif italic opacity-80">atípicas</em></span>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              aria-label="Abrir menu de navegação"
              className="p-2 text-white bg-white/10 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
            >
              <Menu size={24} />
            </motion.button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] border-none bg-gradient-to-b from-[#FBEAF0] to-white/95 backdrop-blur-2xl">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;

