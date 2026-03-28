import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Send, Heart, Volume2, MessageCircle,
  Users, Anchor, Clock, Sparkles, PlayCircle, LogIn, 
  Activity, Leaf, StopCircle, Trash2
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { toast } from "sonner";
import { supabase } from '../integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

/* ─── Constants ─── */
const MAX_BUBBLE_SCALE = 1.4;
const BASE_BUBBLE_SIZE = 55;
const avatarEmojis = ['🌸', '🌺', '🌷', '🌻', '🦋', '🌙', '⭐', '🫶', '💜', '🌿', '✨', '💎'];
const moodEmojis = ['😊', '😴', '🤯', '🫶', '🧘', '☕', '🌟', '🌙', '🫂'];

// Changing the key to v3 automatically clears all the old problematic cards
const MURAL_STORAGE_KEY = 'social_radio_mural_v3';

/* ─── UI Helpers ─── */
const Firefly = () => {
    const x = useMemo(() => Math.random() * 100, []);
    const y = useMemo(() => Math.random() * 100, []);
    const dur = useMemo(() => 4 + Math.random() * 6, []);
    return (
      <motion.div animate={{ x: [0, Math.random() * 60 - 30, 0], y: [0, Math.random() * 60 - 30, 0], opacity: [0.1, 0.6, 0.1], scale: [1, 1.2, 1] }} transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }} className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full blur-[2px] pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }} />
    );
};

const FloatingBubble = ({ participant, index, total, isSelected, isReceivingHeart, isHugging, onClick, onBubbleRef }: any) => {
    const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
    const cx = isHugging ? 60 + Math.cos(angle) * 10 : 65 + Math.cos(angle) * 25;
    const cy = isHugging ? 45 + Math.sin(angle) * 8 : 45 + Math.sin(angle) * 28;
    const hearts = Number(participant?.hearts) || 0;
    const heartScale = Math.min(1 + hearts * 0.1, MAX_BUBBLE_SCALE);
    const bubblePx = Math.round(BASE_BUBBLE_SIZE * heartScale);
    if (!participant) return null;
    return (
      <motion.div 
        ref={el => onBubbleRef(participant.id, el)} 
        initial={{ scale: 0, opacity: 0 }} 
        animate={isReceivingHeart ? { scale: [heartScale, heartScale * 1.4, heartScale], opacity: 1 } : { scale: heartScale, opacity: 1, y: [0, -10, 0, 10, 0] }} 
        transition={{ scale: { type: 'spring', stiffness: 260, damping: 20 }, y: { duration: 5 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }, left: { type: 'spring', stiffness: 60, damping: 25 }, top: { type: 'spring', stiffness: 60, damping: 25 } }} 
        className="absolute flex flex-col items-center gap-2 cursor-pointer z-30 transform -translate-x-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 rounded-full" 
        style={{ left: `${cx}%`, top: `${cy}%` }} 
        onClick={() => onClick(participant.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(participant.id); }}
        role="button"
        tabIndex={0}
        aria-label={`Selecionar mãe ${participant.name || 'desconhecida'}`}
      >
        <AnimatePresence>{isSelected && !participant.isMe && ( <motion.div key="selection-ring" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }} exit={{ scale: 0.8, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} className="absolute rounded-full border-2 border-dashed border-pink-400/50" style={{ width: bubblePx + 24, height: bubblePx + 24, top: -12, left: -12 }} /> )}</AnimatePresence>
        {participant.mood && <motion.div className="absolute -top-4 -right-2 bg-white shadow-xl rounded-full w-6 h-6 flex items-center justify-center text-xs border border-pink-100 z-40">{participant.mood}</motion.div>}
        <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} animate={{ width: bubblePx, height: bubblePx }} transition={{ type: 'spring' }} className="rounded-full flex items-center justify-center shadow-2xl border-4 border-white/40 overflow-hidden relative bg-gradient-to-br from-pink-300 via-rose-500 to-rose-700">
          <div className="absolute top-1 left-2 w-1/3 h-1/3 bg-white/30 rounded-full blur-[4px]" />
          <span style={{ fontSize: Math.max(Math.round(bubblePx * 0.45), 18) }}>{participant.emoji || '🌸'}</span>
        </motion.div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-white px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full shadow-lg border border-white/5 uppercase">{participant.isMe ? `VOCÊ` : participant.name?.toUpperCase()}</span>
          {hearts > 0 && <span className="text-[9px] font-black text-rose-100 bg-rose-500 px-1.5 rounded-full -mt-1 shadow-md">{hearts} ❤️</span>}
        </div>
      </motion.div>
    );
};

const MuralCard = ({ card, onPlay, onDelete, isMine }: any) => {
    const rotation = useMemo(() => Math.random() * 4 - 2, []);
    return (
        <motion.div initial={{ scale: 0.9, opacity: 0, rotate: rotation }} animate={{ scale: 1, opacity: 1, rotate: rotation }} whileHover={{ scale: 1.02, rotate: 0, zIndex: 10 }} className="group relative bg-white/90 backdrop-blur-sm p-6 shadow-2xl rounded-[2.5rem] border border-white flex flex-col gap-5 overflow-hidden min-h-[260px] shrink-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-pink-500/10 rounded-full mt-4" />
            
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center text-3xl shadow-inner border border-white group-hover:scale-105 transition-transform">👩</div>
                  <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-800 uppercase tracking-tight">Mãe {card.author}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={12} className="text-pink-300" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{card.time}</span>
                      </div>
                  </div>
                </div>
                {isMine && (
                   <button 
                     onClick={() => onDelete(card.id)} 
                     aria-label="Excluir desabafo"
                     className="w-10 h-10 flex items-center justify-center text-red-300 hover:text-red-500 bg-red-50/50 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-red-100/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200" 
                     title="Excluir desabafo"
                   >
                      <Trash2 size={18} />
                   </button>
                )}
            </div>
            
            <div 
              className="w-full bg-pink-100/50 p-6 rounded-[2rem] border border-white/50 relative group/btn cursor-pointer overflow-hidden transition-all hover:bg-pink-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300" 
              onClick={() => onPlay(card.audioData)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPlay(card.audioData); }}
              aria-label={`Ouvir mensagem de voz de ${card.author}`}
            >
               <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
               <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] mb-1">Escutar Desabafo</span>
                    <span className="text-xs font-bold text-gray-400">Mensagem de Voz</span>
                  </div>
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl group-hover/btn:scale-110 group-hover/btn:bg-pink-600 transition-all">
                     <PlayCircle size={22} />
                  </div>
               </div>
               <div className="mt-4 flex gap-1 h-3 items-end">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div key={i} animate={{ height: [4, 8 + Math.random() * 8, 4] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }} className="flex-1 bg-pink-500/20 rounded-full" />
                  ))}
               </div>
            </div>

            <div className="flex justify-between items-center px-2">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
                  <span className="text-[9px] font-black text-pink-600 uppercase tracking-widest">Acolhimento Ativo</span>
               </div>
               <div className="flex gap-4">
                  <Heart size={16} className="text-pink-100 group-hover:text-pink-500 transition-colors cursor-pointer" fill="none" />
                  <Heart size={16} className="text-pink-100 group-hover:text-rose-500 transition-colors cursor-pointer" fill="none" />
               </div>
            </div>
        </motion.div>
    );
};

const RadioDasMaes = () => {
    const [activeTab, setActiveTab] = useState<'chat' | 'mural'>('chat');
    const [desabafos, setDesabafos] = useState<any[]>(() => {
        try { const saved = localStorage.getItem(MURAL_STORAGE_KEY); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });
    const [hasJoinedLive, setHasJoinedLive] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [selectedTargetId, setSelectedTargetId] = useState<any>(null);
    const [receivingHeartId, setReceivingHeartId] = useState<any>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [heartsSent, setHeartsSent] = useState<Set<string>>(new Set());
    const [isHugging, setIsHugging] = useState(false);
    const [petals, setPetals] = useState<number[]>([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoadingMural, setIsLoadingMural] = useState(true);

    const mouseX = useMotionValue(0); const mouseY = useMotionValue(0);
    const rotateX = useTransform(useSpring(mouseY, { damping: 20, stiffness: 100 }), [-400, 400], [8, -8]);
    const rotateY = useTransform(useSpring(mouseX, { damping: 20, stiffness: 100 }), [-400, 400], [-8, 8]);

    const channelRef = useRef<any>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const bubbleRefsMap = useRef<Map<any, HTMLDivElement>>(new Map());
    const userId = useRef(Math.random().toString(36).substr(2, 9));
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const [myName] = useState(() => {
       try { const p = localStorage.getItem('almas_empreendedora_profile'); if (p) return JSON.parse(p).nomeEmpreendedora || 'Mãe'; return 'Mãe'; } catch { return 'Mãe'; }
    });
    const [myEmoji] = useState(() => avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)]);

    useEffect(() => {
       const saved = localStorage.getItem(MURAL_STORAGE_KEY);
       if (saved) {
           setDesabafos(JSON.parse(saved));
       }
       // Simular loading state para feedback suave
       setTimeout(() => setIsLoadingMural(false), 800);
    }, []);

    const joinSocialRoom = useCallback(async () => {
        if (hasJoinedLive || isConnecting) return;
        setIsConnecting(true);
        try {
            const channel = supabase.channel('radio-social-room', { config: { presence: { key: userId.current } } });
            channel
              .on('presence', { event: 'sync' }, () => {
                 const state = channel.presenceState();
                 const users = Object.keys(state).map(k => {
                    const u = (state[k] as any)[0];
                    return u ? { ...u, id: k, isMe: k === userId.current } : null;
                 }).filter(Boolean);
                 setParticipants(users);
              })
              .on('broadcast', { event: 'chat-msg' }, ({ payload }) => setChatMessages(prev => [...prev.slice(-49), payload]))
              .on('broadcast', { event: 'heart-event' }, ({ payload }) => {
                setReceivingHeartId(payload.targetId); setTimeout(() => setReceivingHeartId(null), 700);
                setParticipants(prev => prev.map(p => p.id === payload.targetId ? { ...p, hearts: (p.hearts || 0) + 1 } : p));
              })
              .on('broadcast', { event: 'audio-msg' }, ({ payload }) => { setChatMessages(prev => [...prev.slice(-49), payload]); new Audio(payload.audio).play().catch(() => {}); })
              .on('broadcast', { event: 'petal-rain' }, () => setPetals(v => [...v.slice(-40), Date.now()]))
              .on('broadcast', { event: 'group-hug' }, () => { setIsHugging(true); setTimeout(() => setIsHugging(false), 3500); })
              .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                  await channel.track({ name: myName, emoji: myEmoji, hearts: 0, mood: null });
                  setHasJoinedLive(true); setIsConnecting(false); toast.success('Sintonizada!');
                } else if (status === 'CHANNEL_ERROR') { setIsConnecting(false); toast.error('Falha na conexão.'); }
              });
            channelRef.current = channel;
        } catch { setIsConnecting(false); toast.error('Erro ao conectar.'); }
    }, [hasJoinedLive, isConnecting, myEmoji, myName]);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        if (!hasJoinedLive) { joinSocialRoom(); return; }
        const msg = { id: Math.random().toString(), name: myName, text: chatInput.trim() };
        channelRef.current?.send({ type: 'broadcast', event: 'chat-msg', payload: msg });
        setChatMessages(prev => [...prev.slice(-49), msg]); setChatInput('');
    };

    const handleSendHeart = () => {
        if (!selectedTargetId) { toast.info('Selecione uma mãe.'); return; }
        if (heartsSent.has(selectedTargetId)) return;
        setHeartsSent(prev => new Set(prev).add(selectedTargetId));
        channelRef.current?.send({ type: 'broadcast', event: 'heart-event', payload: { targetId: selectedTargetId } });
    };

    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder.current = new MediaRecorder(stream);
                audioChunks.current = [];
                mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
                mediaRecorder.current.onstop = () => {
                    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        const base64Audio = reader.result as string;
                        const newDesabafo = { id: Date.now(), author: myName, audioData: base64Audio, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                        setDesabafos(prev => {
                            const updated = [newDesabafo, ...prev];
                            localStorage.setItem(MURAL_STORAGE_KEY, JSON.stringify(updated));
                            return updated;
                        });
                        toast.success('Seu desabafo foi pendurado no mural! 🌸');
                    };
                };
                mediaRecorder.current.start();
                setIsRecording(true);
            } catch { toast.error('Não consegui acessar seu microfone.'); }
        } else {
            mediaRecorder.current?.stop();
            setIsRecording(false);
            mediaRecorder.current?.stream.getTracks().forEach(t => t.stop());
        }
    };

    const handleDeleteCard = (cardId: number) => {
        setDesabafos(prev => {
            const updated = prev.filter(c => c.id !== cardId);
            localStorage.setItem(MURAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        toast.success('Registro removido do mural. ✨');
    };

    useEffect(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [chatMessages]);

    return (
        <main className="w-full max-w-7xl mx-auto min-h-[calc(100vh-60px)] flex flex-col p-2 pb-12 bg-transparent">
            {/* Particles */}
            <AnimatePresence> {petals.map(id => (
              <motion.div key={id} initial={{ top: '-10%', left: `${Math.random() * 100}%`, opacity: 0 }} animate={{ top: '110%', opacity: [0, 1, 1, 0], rotate: 360 }} transition={{ duration: 7 }} className="fixed pointer-events-none text-2xl z-[101]" onAnimationComplete={() => setPetals(p => p.filter(x => x !== id))}>🌸</motion.div>
            ))} </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 bg-white/40 backdrop-blur-2xl p-2 px-6 rounded-[2rem] border border-white/50 shadow-lg shrink-0 z-[100]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-500/20"><MessageCircle size={18} /></div>
                    <div className="flex flex-col"><span className="text-[8px] font-black text-pink-500 uppercase tracking-tighter leading-none">Comunidade Almas Atípicas</span><h1 className="text-sm font-black text-gray-800 leading-none tracking-tight uppercase">Chat de Acolhimento</h1></div>
                </div>
                <div className="flex bg-black/5 p-1 rounded-xl border border-black/5">
                    <button 
                      onClick={() => setActiveTab('chat')} 
                      aria-label="Abrir chat ao vivo" 
                      className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all tracking-widest uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 ${activeTab === 'chat' ? 'bg-white text-pink-500 shadow-sm scale-105' : 'text-gray-400'}`}
                    >
                      Chat Ao Vivo
                    </button>
                    <button 
                      onClick={() => setActiveTab('mural')} 
                      aria-label="Abrir mural de apoio" 
                      className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all tracking-widest uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 ${activeTab === 'mural' ? 'bg-white text-pink-500 shadow-sm scale-105' : 'text-gray-400'}`}
                    >
                      Mural de Apoio
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'chat' ? (
                    <motion.div key="chat-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col min-h-[500px] gap-2">
                         {/* Stage Area */}
                        <div onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); mouseX.set(e.clientX - r.left - r.width/2); mouseY.set(e.clientY - r.top - r.height/2); }} className="flex-1 min-h-[340px] rounded-[3rem] overflow-hidden shadow-2xl border-2 border-white/10 relative bg-black perspective-[1000px]">
                            <div className="absolute inset-0 bg-gradient-radial from-[#1e0a16] via-[#0d040a] to-[#050103] opacity-90" />
                            
                            {/* LIVE CHAT OVERLAY */}
                            <div className="absolute left-6 top-12 bottom-6 w-[280px] bg-black/30 backdrop-blur-2xl rounded-[2rem] border border-white/10 z-50 flex flex-col overflow-hidden shadow-2xl">
                                <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between"><span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Acolhimentos Ativos</span>{isConnecting && <Activity size={10} className="text-pink-500 animate-spin" />}</div>
                                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar custom-scrollbar">
                                    {chatMessages.map(m => (
                                        <div key={m.id} className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-pink-400">{m.name}</span>
                                            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5"><p className="text-white/80 text-[11px] leading-relaxed break-words">{m.text}</p>
                                                {m.audio && <button onClick={() => new Audio(m.audio).play()} className="mt-2 flex items-center gap-2 px-3 py-1 bg-pink-500/20 rounded-full text-[8px] text-pink-300 font-black uppercase tracking-widest shadow-lg"><Volume2 size={12} /> Escutar</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Participants Layer */}
                            <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                                <div className="absolute inset-0 pointer-events-auto overflow-hidden">
                                    {hasJoinedLive && Array.from({ length: 12 }).map((_, i) => <Firefly key={i} />)}
                                    <AnimatePresence> {participants.map((p, i) => ( <FloatingBubble key={p.id} participant={p} index={i} total={participants.length} isSelected={selectedTargetId === p.id} isReceivingHeart={receivingHeartId === p.id} isHugging={isHugging} onClick={(id: any) => id !== userId.current && setSelectedTargetId((v: any) => v === id ? null : id)} onBubbleRef={(id: any, el: any) => el ? bubbleRefsMap.current.set(id, el) : bubbleRefsMap.current.delete(id)} /> ))} </AnimatePresence>
                                </div>
                            </motion.div>
                            
                            {!hasJoinedLive && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-[55] flex items-center justify-center pointer-events-none">
                                     <button 
                                       onClick={joinSocialRoom} 
                                       disabled={isConnecting} 
                                       aria-label="Conectar ao chat de acolhimento"
                                       className="absolute bottom-6 right-6 z-[100] pointer-events-auto flex items-center gap-3 px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-3xl border border-white/20 rounded-2xl text-[9px] font-black text-white hover:text-pink-400 transition-all uppercase tracking-[0.2em] leading-none shadow-2xl active:scale-95 group focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
                                     > 
                                       {isConnecting ? <Activity size={14} className="animate-spin" /> : <LogIn size={14} className="group-hover:translate-x-1 transition-transform" />} {isConnecting ? 'Sincronizando...' : 'Conectar ao Chat'} 
                                     </button>
                                </div>
                            )}
                        </div>

                        {/* Control Bar */}
                        <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 p-4 flex flex-col gap-2 shadow-xl shrink-0">
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex gap-2 p-1 bg-black/5 rounded-2xl">
                                    <button onClick={() => { if (!hasJoinedLive) joinSocialRoom(); else { channelRef.current?.send({ type: 'broadcast', event: 'group-hug' }); setIsHugging(true); setTimeout(() => setIsHugging(false), 3500); } }} className="px-5 py-2 hover:bg-white rounded-xl text-[9px] font-black text-gray-500 hover:text-pink-600 transition-all flex items-center gap-2 uppercase tracking-widest"><Users size={14} /> Abraço</button>
                                    <button onClick={() => { if (!hasJoinedLive) joinSocialRoom(); else { channelRef.current?.send({ type: 'broadcast', event: 'petal-rain' }); setPetals(v => [...v.slice(-39), Date.now()]); } }} className="px-5 py-2 hover:bg-white rounded-xl text-[9px] font-black text-gray-500 hover:text-pink-400 transition-all flex items-center gap-2 uppercase tracking-widest"><Leaf size={14} /> Pétalas</button>
                                </div>
                                <div className="flex-1 flex gap-1.5 px-3 py-1 bg-white/20 rounded-2xl overflow-x-auto no-scrollbar justify-center"> {moodEmojis.map(m => ( <button key={m} onClick={() => { if (!hasJoinedLive) return; channelRef.current?.send({ type: 'broadcast', event: 'update-mood', payload: { userId: userId.current, emoji: m } }); setParticipants(prev => prev.map(p => p.isMe ? { ...p, mood: m } : p)); }} className="w-8 h-8 flex items-center justify-center hover:scale-150 transition-all text-sm outline-none">{m}</button> ))} </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-[380px] flex items-center bg-white border-2 border-white/50 rounded-full px-2 py-1 shadow-2xl focus-within:ring-4 ring-pink-500/10 focus-within:border-pink-200 transition-all">
                                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} aria-label="Digitar uma palavra de apoio" placeholder="Escreva uma palavra de apoio..." className="flex-1 bg-transparent px-6 py-2 text-xs text-gray-800 placeholder:text-gray-400 outline-none font-bold" />
                                        <button onClick={handleSendMessage} aria-label="Enviar mensagem" className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-pink-600 hover:scale-110 shadow-lg transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"><Send size={16} /></button>
                                    </div>
                                    <button onClick={handleSendHeart} disabled={!selectedTargetId} aria-label="Enviar coração" className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 ${selectedTargetId ? 'bg-white text-pink-500 scale-110 border border-pink-100' : 'bg-gray-100/50 opacity-40'}`}> <Heart size={20} fill={selectedTargetId ? "currentColor" : "none"} /> </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* Mural Section */
                    <motion.div key="mural-layout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full h-fit flex flex-col bg-pink-50/30 rounded-[3.5rem] p-8 border border-white relative">
                        <div className="flex items-center justify-between mb-8"> 
                           <div className="flex flex-col">
                              <div className="flex items-center gap-3">
                                 <h2 className="text-3xl font-black text-gray-900 leading-none tracking-tight">Mural de <span className="text-pink-500">Apoio</span></h2>
                                 <span className="bg-pink-100 text-pink-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-pink-200 shadow-sm">v3.0</span>
                              </div>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2"><Sparkles size={14} className="text-pink-300" /> Sintonize com outras jornadas</p>
                           </div>
                           <button 
                             onClick={toggleRecording} 
                             aria-label={isRecording ? "Parar e pendurar gravação" : "Pendurar desabafo (gravar áudio)"}
                             className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-400 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-900 text-white hover:bg-pink-600'}`}
                           >
                               {isRecording ? <StopCircle size={20} /> : <Anchor size={20} />}
                               {isRecording ? 'PARAR E PENDURAR' : 'PENDURAR DESABAFO'}
                           </button>
                        </div>
                        <div className="w-full h-fit grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                             {isLoadingMural ? (
                                Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={idx} className="bg-white/60 p-6 rounded-[2.5rem] border border-white flex flex-col gap-5 min-h-[260px] animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-14 h-14 rounded-2xl bg-pink-100/50" />
                                            <div className="flex flex-col gap-2">
                                                <Skeleton className="h-4 w-20 bg-pink-100/50 rounded-full" />
                                                <Skeleton className="h-2 w-16 bg-gray-100 rounded-full" />
                                            </div>
                                        </div>
                                        <Skeleton className="w-full h-24 rounded-[2rem] bg-pink-100/50" />
                                        <div className="flex justify-between items-center mt-auto">
                                            <Skeleton className="h-3 w-24 bg-gray-100 rounded-full" />
                                            <div className="flex gap-2">
                                                <Skeleton className="w-4 h-4 rounded-full bg-gray-100" />
                                                <Skeleton className="w-4 h-4 rounded-full bg-gray-100" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                             ) : desabafos.length === 0 ? ( <div className="col-span-full h-full min-h-[400px] flex flex-col items-center justify-center text-gray-300 gap-4 opacity-30"><div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-5xl">🌌</div><span className="font-black text-xs uppercase tracking-widest">Aguardando colheitas...</span></div> ) : ( desabafos.map(d => <MuralCard key={d.id} isMine={d.author.toLowerCase().trim() === myName.toLowerCase().trim()} card={d} onDelete={handleDeleteCard} onPlay={(a: string) => { joinSocialRoom(); new Audio(a).play(); }} />) )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
};

export default RadioDasMaes;
