import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Book, BookOpen, Clock, Coffee, HeartHandshake, Radio, BookMarked, 
  Scale, Coins, Puzzle, Menu, AlertCircle, User, LogOut, Settings, ChevronRight, Stethoscope, Sparkles
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
      { name: "Rádio", path: "/radio", icon: Radio },
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
    return saved ? JSON.parse(saved) : { avatarBase64: '', isEmpreendedora: false };
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      const saved = localStorage.getItem('almas_empreendedora_profile');
      if (saved) setLocalProfile(JSON.parse(saved));
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleConvidarMae = () => {
    const mensagem = `🌸 Olá! Venha fazer parte da Plataforma Comigo (Almas Atípicas), uma rede de apoio incrível para mães.\n\nUse meu código de convite secreto para criar sua conta gratuita: *ACOLHER26*\n\nAcesse: https://almas-atipicas-v1.pages.dev`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Convite - Almas Atípicas',
        text: mensagem
      }).catch((err) => {
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(mensagem);
          toast.success("Mensagem de convite copiada!");
        }
      });
    } else {
      navigator.clipboard.writeText(mensagem);
      toast.success("Mensagem de convite copiada para a área de transferência!");
    }
  };

  return (
    <div className="flex flex-col h-full py-6">
      {/* Top Profile Card */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mx-4 mb-8 p-4 rounded-2xl bg-white border border-pink-100 shadow-sm group cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3 relative">
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--rosa-forte)] to-[var(--rosa-medio)] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
            {localProfile.avatarBase64 ? (
               <img src={localProfile.avatarBase64} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
               <User size={24} />
            )}
            
            {localProfile.isEmpreendedora && (
               <div className="absolute -top-3 -right-2 text-2xl drop-shadow-[0_2px_4px_rgba(212,83,126,0.6)] animate-bounce" title="Mãe Empreendedora">
                 👑🏵️
               </div>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-[var(--texto-escuro)] text-sm truncate">
               {user?.full_name || "Mãe Atípica"}
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-tighter ${localProfile.isEmpreendedora ? 'text-amber-500' : 'text-[var(--rosa-forte)]/70'}`}>
              {localProfile.isEmpreendedora ? 'Empreendedora' : 'Nível de Suporte 2'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botão Convidar Mãe */}
      <div className="px-4 mb-6">
        <button 
          onClick={handleConvidarMae}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-[0_10px_25px_rgba(245,158,11,0.4)] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 group"
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
                  <Link key={j} to={item.path}>
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
          <Link to="/admin/dashboard">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-[var(--rosa-forte)]/30 bg-[var(--rosa-forte)]/5 text-[var(--rosa-forte)] font-black text-xs uppercase text-center justify-center transition-all hover:bg-[var(--rosa-forte)]/10"
            >
              <Settings size={16} />
              Painel Admin
            </motion.div>
          </Link>
        )}
        
        <Link to="/crise">
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
          className="w-full flex items-center gap-2 p-3 rounded-xl text-[var(--texto-medio)] font-bold text-xs bg-white border border-pink-100 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all group"
        >
          <LogOut size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          Sair da Conta
        </button>
      </div>
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
              className="p-2 text-white bg-white/10 rounded-xl"
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

