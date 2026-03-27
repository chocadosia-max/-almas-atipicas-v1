import React from 'react';
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/sidebar/Sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";

// Minha Jornada
import DiarioDaJornada from "./pages/DiarioDaJornada";
import CadernetaDigital from "./pages/CadernetaDigital";
import RotinaDoDia from "./pages/RotinaDoDia";
import MomentoPausa from "./pages/MomentoPausa";
import GerenciadorConsultas from "./pages/GerenciadorConsultas";

// Comunidade
import RedeDeMaes from "./pages/RedeDeMaes";
import RadioDasMaes from "./pages/RadioDasMaes";
import Livraria from "./pages/Livraria";

// Direitos & Renda
import SeusDireitos from "./pages/SeusDireitos";
import RendaParaMae from "./pages/RendaParaMae";

// Espaço Kids
import EspacoKids from "./pages/EspacoKids";
import JogoNivel1 from "./pages/JogoNivel1";
import JogoNivel2 from "./pages/JogoNivel2";
import JogoNivel3 from "./pages/JogoNivel3";

// Geral
import EstouEmCrise from "./pages/EstouEmCrise";
import CartaoEmergencia from "./pages/CartaoEmergencia";
import ParaAFamilia from "./pages/ParaAFamilia";
import DashboardAdmin from "./pages/DashboardAdmin";
import TermosDeUso from "./pages/TermosDeUso";

const queryClient = new QueryClient();

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const LegalFooter = () => (
  <div className="w-full mt-12 bg-gray-900 border-t-4 border-[var(--rosa-forte)] text-gray-300 p-6 md:p-8 rounded-t-3xl shadow-2xl relative z-50">
    <div className="max-w-6xl mx-auto text-sm md:text-base leading-relaxed flex flex-col md:flex-row gap-6 md:gap-12 items-center text-center md:text-left">
      <div className="flex-1">
        <h4 className="text-[var(--rosa-forte)] font-bold text-lg mb-2 flex items-center justify-center md:justify-start gap-2">
          <span className="bg-[var(--rosa-forte)]/20 p-1.5 rounded-md">⚖️</span>
          Aviso Legal & LGPD
        </h4>
        <p className="mb-3">
          A plataforma <strong className="text-white">Comigo (Almas Atípicas)</strong> oferece acolhimento e dados informativos, atuando como facilitadora tecnológica.
        </p>
        <p className="text-xs md:text-sm text-gray-400">
          <strong className="text-amber-400">ISENÇÃO DE RESPONSABILIDADE MÉDICA:</strong> Nenhum conteúdo interativo (IA, Ebooks, Checklists) ou relato da comunidade substitui o aconselhamento, diagnóstico ou prescrição de médicos neuropediatras, psicólogos ou terapeutas habilitados. Siga sempre as orientações dos profissionais que acompanham seu filho.
        </p>
      </div>
      <div className="flex flex-col gap-3 min-w-[200px]">
        <button 
          onClick={() => window.location.href = '/termos'} 
          className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-700 hover:border-gray-500 font-medium transition-all shadow-md text-sm whitespace-nowrap"
        >
          Ler Termos de Uso
        </button>
        <div className="text-xs text-center text-gray-500 mt-2">
          © 2026 Plataforma Comigo.<br/>Todos os direitos reservados.
        </div>
      </div>
    </div>
  </div>
);

const AppLayout = () => {
  const location = useLocation();
  const hideFooterRoutes = ['/pausa', '/crise', '/cartao-tea'];
  const showFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <ProtectedRoute>
      <Sidebar />
      <div className="lg:pl-[240px] pt-16 lg:pt-0 w-full min-h-screen">
        <main className="w-full flex flex-col min-h-screen">
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <PageWrapper key={location.pathname}>
                 <Outlet />
              </PageWrapper>
            </AnimatePresence>
          </div>
          {showFooter && <LegalFooter />}
        </main>
      </div>
    </ProtectedRoute>
  );
};

// Layout for Index without sidebar
const LandingLayout = () => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <PageWrapper key={location.pathname}>
            <Outlet />
          </PageWrapper>
        </AnimatePresence>
      </div>
      <LegalFooter />
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen w-full relative" style={{ background: 'linear-gradient(to right, #D4537E 0%, #F4C0D1 25%, #FBEAF0 100%)' }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Landing page without sidebar */}
              <Route element={<LandingLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
              </Route>
              
              {/* Application with Sidebar */}
              <Route element={<AppLayout />}>
                <Route path="/diario" element={<DiarioDaJornada />} />
                <Route path="/caderneta" element={<CadernetaDigital />} />
                <Route path="/rotina" element={<RotinaDoDia />} />
                <Route path="/pausa" element={<MomentoPausa />} />
                <Route path="/consultas" element={<GerenciadorConsultas />} />

                <Route path="/rede-de-maes" element={<RedeDeMaes />} />
                <Route path="/radio" element={<RadioDasMaes />} />
                <Route path="/livraria" element={<Livraria />} />

                <Route path="/seus-direitos" element={<SeusDireitos />} />
                <Route path="/renda" element={<RendaParaMae />} />

                <Route path="/kids" element={<EspacoKids />} />
                <Route path="/kids/nivel-1" element={<JogoNivel1 />} />
                <Route path="/kids/nivel-2" element={<JogoNivel2 />} />
                <Route path="/kids/nivel-3" element={<JogoNivel3 />} />

                <Route path="/crise" element={<EstouEmCrise />} />
                <Route path="/cartao-tea" element={<CartaoEmergencia />} />
                <Route path="/para-a-familia" element={<ParaAFamilia />} />
                <Route path="/termos" element={<TermosDeUso />} />
                
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;

