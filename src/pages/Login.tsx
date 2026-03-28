import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Login = () => {
  const [searchParams] = useSearchParams();
  const inviteParam = searchParams.get('invite');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(inviteParam || '');
  const [isSignUp, setIsSignUp] = useState(!!inviteParam);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Bem-vinda de volta!");
      navigate('/diario');
    } catch (error: any) {
      toast.error(error.message || "Erro ao tentar fazer login.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Proteção rigorosa de rede de apoio
    const codeClean = inviteCode.toUpperCase().trim();
    const legacyCodes = ["ACOLHER26", "REDEAPOIO", "COMIGOMAE", "MAMAE2026"];
    const isLegacy = legacyCodes.includes(codeClean);
    const isDynamic = /^[0-9A-F]{8}$/.test(codeClean); // Aceita prefixos de IDs únicos (hexadecimal 8 caracteres)

    if (!isLegacy && !isDynamic) {
      toast.error("Código de convite inválido! Peça uma palavra-chave para alguma mãe da rede.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Conta criada! O acesso será liberado em seguida.");
      setIsSignUp(false);
      setInviteCode("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#D4537E] via-[#F4C0D1] to-[#FBEAF0]">
      <div className="bg-white/65 backdrop-blur-[12px] p-8 md:p-10 rounded-[20px] shadow-2xl border border-white/50 w-full max-w-md flex flex-col items-center">
        <h1 className="text-4xl font-serif font-bold text-[#4B1528] mb-2 text-center">
          <span className="text-pink-600 block mb-1">🌸</span>
          Mãe em Primeiro
        </h1>
        <p className="text-[#72243E] opacity-80 mb-8 text-center text-sm font-medium">
          Você não está sozinha nessa jornada.
        </p>

        <form onSubmit={isSignUp ? handleSignup : handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#4B1528] uppercase tracking-wider px-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/70 border border-white/60 focus:border-[#D4537E] focus:ring-2 focus:ring-[#D4537E]/20 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-[#4B1528]/30"
              placeholder="Digite seu e-mail"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#4B1528] uppercase tracking-wider px-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/70 border border-white/60 focus:border-[#D4537E] focus:ring-2 focus:ring-[#D4537E]/20 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-[#4B1528]/30"
              placeholder="Sua senha secreta"
              required
            />
          </div>

          {isSignUp && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-1.5 overflow-hidden">
              <label className="text-xs font-bold text-pink-600 uppercase tracking-wider px-1">Código de Convite</label>
              <input 
                type="text" 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full bg-pink-50 border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-pink-300 font-bold uppercase"
                placeholder="Ex: ACOLHER26 ou seu código VIP"
                required={isSignUp}
              />
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-[#D4537E] hover:bg-[#b04066] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Processando..." : (isSignUp ? "Validar Convite e Cadastrar" : "Entrar na minha jornada")}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center border-t border-[#4B1528]/10 pt-6 w-full gap-2">
          <span className="text-sm text-[#72243E]">{isSignUp ? "Já faz parte da rede?" : "Ainda não tem o aplicativo?"}</span>
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-bold text-[#D4537E] hover:underline"
          >
            {isSignUp ? "Fazer login normal" : "Fui convidada (Criar Conta)"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
