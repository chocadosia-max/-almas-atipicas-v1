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

const AppLayout = () => {
  const location = useLocation();
  return (
    <ProtectedRoute>
      <Sidebar />
      <div className="lg:pl-[220px] pt-16 lg:pt-0 w-full min-h-screen">
        <main className="w-full h-full p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <PageWrapper key={location.pathname}>
               <Outlet />
            </PageWrapper>
          </AnimatePresence>
        </main>
      </div>
    </ProtectedRoute>
  );
};

// Layout for Index without sidebar
const LandingLayout = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <PageWrapper key={location.pathname}>
        <Outlet />
      </PageWrapper>
    </AnimatePresence>
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

