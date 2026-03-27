import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mic, StopCircle, Send, Heart, Volume2,
  Radio, Play, Pause,
  Users, Music, Leaf, Heart as HeartIcon,
  MessageCircle, Anchor, Clock, Sparkles, Plus, PlayCircle, LogIn, 
  Activity
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { toast } from "sonner";
import { supabase } from '../integrations/supabase/client';

/* ─── Constants ─── */
const MAX_BUBBLE_SCALE = 1.4;
const BASE_BUBBLE_SIZE = 60;
const avatarEmojis = ['🌸', '🌺', '🌷', '🌻', '🦋', '🌙', '⭐', '🫶', '💜', '🌿', '✨', '💎'];
const moodEmojis = ['😊', '😴', '🤯', '🫶', '🧘', '☕', '🌟', '🌙', '🫂'];

/* ─── UI Helpers ─── */
const Firefly = () => {
    const x = useMemo(() => Math.random() * 100, []);
    const y = useMemo(() => Math.random() * 100, []);
    const dur = useMemo(() => 4 + Math.random() * 6, []);
    return (
      <motion.div animate={{ x: [0, Math.random() * 60 - 30, 0], y: [0, Math.random() * 60 - 30, 0], opacity: [0.1, 0.6, 0.1], scale: [1, 1.4, 1] }} transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }} className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full blur-[2px] pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }} />
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
      <motion.div ref={el => onBubbleRef(participant.id, el)} initial={{ scale: 0, opacity: 0 }} animate={isReceivingHeart ? { scale: [heartScale, heartScale * 1.4, heartScale], opacity: 1 } : { scale: heartScale, opacity: 1, y: [0, -10, 0, 10, 0] }} transition={{ scale: { type: 'spring', stiffness: 260, damping: 20 }, y: { duration: 5 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }, left: { type: 'spring', stiffness: 60, damping: 25 }, top: { type: 'spring', stiffness: 60, damping: 25 } }} className="absolute flex flex-col items-center gap-2 cursor-pointer z-30 transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${cx}%`, top: `${cy}%` }} onClick={() => onClick(participant.id)}>
        <AnimatePresence>{isSelected && !participant.isMe && ( <motion.div key="selection-ring" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }} exit={{ scale: 0.8, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} className="absolute rounded-full border-2 border-dashed border-pink-400/50" style={{ width: bubblePx + 24, height: bubblePx + 24, top: -12, left: -12 }} /> )}</AnimatePresence>
        {participant.mood && ( <motion.div className="absolute -top-4 -right-2 bg-white shadow-xl rounded-full w-6 h-6 flex items-center justify-center text-xs border border-pink-100 z-40">{participant.mood}</motion.div> )}
        <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} animate={{ width: bubblePx, height: bubblePx }} transition={{ type: 'spring' }} className="rounded-full flex items-center justify-center shadow-2xl border-4 border-white/40 overflow-hidden relative bg-gradient-to-br from-pink-300 via-rose-500 to-rose-700">
          <div className="absolute top-1 left-2 w-1/3 h-1/3 bg-white/30 rounded-full blur-[4px]" />
          <span style={{ fontSize: Math.max(Math.round(bubblePx * 0.45), 20) }}>{participant.emoji || '🌸'}</span>
        </motion.div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-white px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full shadow-lg border border-white/5 uppercase">{participant.isMe ? `VOCÊ` : participant.name?.toUpperCase()}</span>
          {hearts > 0 && <span className="text-[9px] font-black text-rose-100 bg-rose-500 px-1.5 rounded-full -mt-1 shadow-md">{hearts} ❤️</span>}
        </div>
      </motion.div>
    );
};

const MuralCard = ({ card, onPlay }: any) => {
    const rotation = useMemo(() => Math.random() * 6 - 3, []);
    return (
        <motion.div initial={{ scale: 0, opacity: 0, rotate: rotation }} animate={{ scale: 1, opacity: 1, rotate: rotation }} whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }} className="group relative bg-white p-4 shadow-xl border-t-[12px] border-pink-500 rounded-sm w-full max-w-[280px]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shadow-inner border border-white"><Anchor size={14} className="text-pink-600" /></div>
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-xl shadow-sm">👩</div>
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-800 uppercase leading-none">Mãe {card.author}</span>
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-1"><Clock size={10} /> {card.time}</span>
                   </div>
                </div>
                <div className="w-full bg-pink-50 h-[2px] rounded-full relative overflow-hidden"><motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute top-0 bottom-0 left-0 right-0 bg-pink-500/20" /></div>
                <button onClick={() => onPlay(card.audioData)} className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all bg-gray-900 text-white hover:bg-pink-600 shadow-lg"> <PlayCircle size={18} /> OUVIR DESABAFO </button>
                <div className="flex justify-between items-center px-1"> <div className="text-[10px] text-pink-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"><Sparkles size={10} /> ACOLHIDO</div> <HeartIcon size={14} className="text-pink-200" fill="currentColor" /> </div>
            </div>
        </motion.div>
    );
};

/* ─── Main Component ─── */
const RadioDasMaes = () => {
    const [activeTab, setActiveTab] = useState<'podcast' | 'desabafos'>('podcast');
    const [desabafos, setDesabafos] = useState<any[]>(() => {
        try { const saved = localStorage.getItem('social_radio_desabafos'); return saved ? JSON.parse(saved) : []; } catch { return []; }
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
    const [isAmbientAudioActive, setIsAmbientAudioActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const mouseX = useMotionValue(0); const mouseY = useMotionValue(0);
    const rotateX = useTransform(useSpring(mouseY, { damping: 20, stiffness: 100 }), [-400, 400], [10, -10]);
    const rotateY = useTransform(useSpring(mouseX, { damping: 20, stiffness: 100 }), [-400, 400], [-10, 10]);

    const channelRef = useRef<any>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
    const bubbleRefsMap = useRef<Map<any, HTMLDivElement>>(new Map());
    const userId = useRef(Math.random().toString(36).substr(2, 9));

    const [myName] = useState(() => {
       try { const profile = localStorage.getItem('almas_empreendedora_profile'); if (profile) { const parsed = JSON.parse(profile); return parsed.nomeEmpreendedora || 'Mãe'; } return 'Mãe'; } catch { return 'Mãe'; }
    });
    const [myEmoji] = useState(() => avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)]);

    useEffect(() => {
        const audio = new Audio('https://www.bensound.com/bensound-music/bensound-tomorrow.mp3');
        audio.loop = true; audio.volume = 0.1; ambientAudioRef.current = audio;
        return () => { if (ambientAudioRef.current) ambientAudioRef.current.pause(); };
    }, []);

    const toggleAmbientMusic = useCallback(() => {
        if (isAmbientAudioActive) ambientAudioRef.current?.pause();
        else ambientAudioRef.current?.play().catch(() => {});
        setIsAmbientAudioActive(!isAmbientAudioActive);
    }, [isAmbientAudioActive]);

    const joinSocialRoom = useCallback(async () => {
        if (hasJoinedLive || isConnecting) return;
        setIsConnecting(true);
        try {
            const channel = supabase.channel('radio-social-room', { 
                config: { presence: { key: userId.current } } 
            });
            
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
              .on('broadcast', { event: 'mural-pinned' }, ({ payload }) => {
                 setDesabafos(prev => {
                    const updated = [payload, ...prev].slice(0, 20);
                    localStorage.setItem('social_radio_desabafos', JSON.stringify(updated));
                    return updated;
                 });
              })
              .on('broadcast', { event: 'heart-event' }, ({ payload }) => {
                setReceivingHeartId(payload.targetId); setTimeout(() => setReceivingHeartId(null), 700);
                setParticipants(prev => prev.map(p => p.id === payload.targetId ? { ...p, hearts: (p.hearts || 0) + 1 } : p));
              })
              .on('broadcast', { event: 'audio-msg' }, ({ payload }) => {
                setChatMessages(prev => [...prev.slice(-49), payload]);
                new Audio(payload.audio).play().catch(() => {});
              })
              .on('broadcast', { event: 'petal-rain' }, () => setPetals(v => [...v, Date.now()]))
              .on('broadcast', { event: 'group-hug' }, () => { setIsHugging(true); setTimeout(() => setIsHugging(false), 3500); });

            channel.subscribe(async (status) => { 
                if (status === 'SUBSCRIBED') {
                   try {
                     await channel.track({ name: myName, emoji: myEmoji, hearts: 0, mood: null }); 
                     setHasJoinedLive(true);
                     setIsConnecting(false);
                     toast.success('Conectada à sala!');
                   } catch { setIsConnecting(false); toast.error('Erro ao sintonizar.'); }
                } else if (status === 'CHANNEL_ERROR') {
                    setIsConnecting(false);
                    toast.error('Erro de conexão.');
                }
            });
            channelRef.current = channel;
        } catch (err) {
            setIsConnecting(false);
            toast.error('Falha ao abrir canal.');
        }
    }, [hasJoinedLive, isConnecting, myEmoji, myName]);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        if (!hasJoinedLive) { joinSocialRoom(); return; }
        const msg = { id: Math.random().toString(), name: myName, text: chatInput.trim() };
        channelRef.current?.send({ type: 'broadcast', event: 'chat-msg', payload: msg });
        setChatMessages(prev => [...prev.slice(-49), msg]); setChatInput('');
    };

    const handleSendHeart = () => {
        if (!selectedTargetId) { toast.info('Selecione uma bolha.'); return; }
        if (heartsSent.has(selectedTargetId)) { toast.info('Apenas um coração por mãe!'); return; }
        setHeartsSent(prev => new Set(prev).add(selectedTargetId));
        channelRef.current?.send({ type: 'broadcast', event: 'heart-event', payload: { targetId: selectedTargetId } });
    };

    useEffect(() => { if (chatContainerRef.current) { chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; } }, [chatMessages]);

    return (
        <div className="w-full max-w-7xl mx-auto h-[calc(100vh-60px)] flex flex-col p-2 overflow-hidden bg-transparent">
            {/* Ambient Particles */}
            <AnimatePresence> {petals.slice(-40).map(id => (
              <motion.div key={id} initial={{ top: '-10%', left: `${Math.random() * 100}%`, opacity: 0 }} animate={{ top: '110%', opacity: [0, 1, 1, 0], rotate: 360 }} transition={{ duration: 7 }} className="fixed pointer-events-none select-none text-2xl z-[99]" onAnimationComplete={() => setPetals(v => v.filter(x => x !== id))}>🌸</motion.div>
            ))} </AnimatePresence>

            {/* Header */}
            <div className="flex flex-row items-center justify-between gap-4 mb-2 bg-white/30 backdrop-blur-3xl p-3 px-6 rounded-[2.5rem] border border-white/50 shadow-xl shrink-0 z-[100]">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3"><Radio size={18} /></div>
                    <div className="flex flex-col"><span className="text-[10px] font-black text-pink-500 uppercase tracking-widest leading-none">Almas Atípicas</span><h1 className="text-xl font-black text-gray-800 leading-none">Rádio das Mães</h1></div>
                </div>
                <div className="flex bg-black/5 p-1 rounded-2xl border border-black/5">
                    <button onClick={() => setActiveTab('podcast')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'podcast' ? 'bg-white text-pink-500 shadow-md scale-105' : 'text-gray-400'}`}><MessageCircle size={14} /> SALA</button>
                    <button onClick={() => setActiveTab('desabafos')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'desabafos' ? 'bg-white text-pink-500 shadow-md scale-105' : 'text-gray-400'}`}><Sparkles size={14} /> MURAL</button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'podcast' ? (
                    <motion.div key="social-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col gap-2 min-h-0 relative">
                        {/* Interactive Stage */}
                        <div onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); mouseX.set(e.clientX - r.left - r.width/2); mouseY.set(e.clientY - r.top - r.height/2); }} className="flex-1 min-h-[520px] rounded-[4rem] overflow-hidden shadow-2xl border-2 border-white/10 relative bg-black perspective-[1000px]">
                            <div className="absolute inset-0 bg-gradient-radial from-[#1e0a16] via-[#0d040a] to-[#050103] opacity-90" />
                            
                            {/* OVERLAY CHAT */}
                            <div className="absolute left-8 top-20 bottom-8 w-[320px] bg-black/30 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 z-50 flex flex-col overflow-hidden shadow-2xl">
                                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Acolhimentos</span>
                                    {isConnecting && <Activity size={12} className="text-pink-500 animate-spin" />}
                                </div>
                                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar custom-scrollbar">
                                    {chatMessages.length === 0 && <div className="h-full flex flex-col items-center justify-center gap-2 opacity-20"><MessageCircle size={32} className="text-white" /><span className="text-[9px] font-black text-white uppercase text-center">Nenhum acolhimento ainda...</span></div>}
                                    {chatMessages.map(m => (
                                        <div key={m.id} className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-pink-400">{m.name}</span>
                                            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                                <p className="text-white/90 text-[12px] break-words">{m.text}</p>
                                                {m.audio && <button onClick={() => new Audio(m.audio).play()} className="mt-2 flex items-center gap-2 px-3 py-1 bg-pink-500/20 rounded-full text-[9px] text-pink-300 font-black uppercase"><Volume2 size={10} /> Áudio</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stage Content */}
                            <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                                <div className="absolute inset-0 pointer-events-auto overflow-hidden">
                                    {hasJoinedLive && Array.from({ length: 15 }).map((_, i) => <Firefly key={i} />)}
                                    <AnimatePresence>
                                        {participants.map((p, i) => ( 
                                            <FloatingBubble key={p.id} participant={p} index={i} total={participants.length} isSelected={selectedTargetId === p.id} isReceivingHeart={receivingHeartId === p.id} isHugging={isHugging} onClick={(id: any) => { if (id !== userId.current) setSelectedTargetId((v: any) => v === id ? null : id); }} onBubbleRef={(id: any, el: any) => { if (el) bubbleRefsMap.current.set(id, el); else bubbleRefsMap.current.delete(id); }} /> 
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                            
                            {!hasJoinedLive && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-40 flex items-center justify-center pointer-events-none">
                                     <motion.button onClick={(e) => { e.stopPropagation(); joinSocialRoom(); }} disabled={isConnecting} className="absolute bottom-8 right-8 z-[100] pointer-events-auto flex items-center gap-3 px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-3xl border border-white/20 rounded-2xl text-[10px] font-black text-white hover:text-pink-400 uppercase tracking-widest transition-all shadow-2xl active:scale-95">
                                        {isConnecting ? <Activity size={16} className="animate-spin" /> : <LogIn size={16} />} 
                                        {isConnecting ? 'Conectando...' : 'Entrar na Sala'}
                                     </motion.button>
                                </div>
                            )}

                            <div className="absolute top-6 right-6 z-[60] flex gap-3">
                                <button onClick={toggleAmbientMusic} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white hover:scale-110 shadow-xl transition-all"> {isAmbientAudioActive ? <Pause size={20} /> : <Play size={20} />} </button>
                            </div>
                        </div>

                        {/* Control Bar */}
                        <div className="bg-white/30 backdrop-blur-3xl rounded-[3rem] border border-white/60 p-3 px-4 flex flex-col gap-3 shadow-2xl shrink-0">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex gap-2 p-1 bg-black/5 rounded-2xl border border-black/5">
                                    <button onClick={() => { if (!hasJoinedLive) { joinSocialRoom(); return; } channelRef.current?.send({ type: 'broadcast', event: 'group-hug' }); setIsHugging(true); setTimeout(() => setIsHugging(false), 3500); }} className="px-4 py-2 hover:bg-white rounded-xl text-[10px] font-black text-gray-500 hover:text-pink-600 transition-all flex items-center gap-2"><Users size={14} /> ABRAÇO</button>
                                    <button onClick={() => { if (!hasJoinedLive) { joinSocialRoom(); return; } channelRef.current?.send({ type: 'broadcast', event: 'petal-rain' }); setPetals(v => [...v, Date.now()]); }} className="px-4 py-2 hover:bg-white rounded-xl text-[10px] font-black text-gray-500 hover:text-pink-400 transition-all flex items-center gap-2"><Leaf size={14} /> PÉTALAS</button>
                                </div>
                                <div className="flex-1 flex gap-1.5 px-3 py-1.5 bg-white/30 rounded-2xl overflow-x-auto no-scrollbar justify-center"> {moodEmojis.map(m => ( <button key={m} onClick={() => { if (!hasJoinedLive) return; channelRef.current?.send({ type: 'broadcast', event: 'update-mood', payload: { userId: userId.current, emoji: m } }); setParticipants(prev => prev.map(p => p.isMe ? { ...p, mood: m } : p)); }} className="w-7 h-7 flex items-center justify-center hover:scale-150 transition-all text-sm">{m}</button> ))} </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-[430px] flex items-center bg-white/60 rounded-[2.5rem] px-2 py-1 border border-white focus-within:ring-4 ring-pink-500/10 shadow-xl">
                                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Acolha com suas palavras..." className="flex-1 bg-transparent px-6 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none font-black" />
                                        <button onClick={handleSendMessage} className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white mr-1 hover:scale-110 shadow-md transition-all"><Send size={18} /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleSendHeart} disabled={!selectedTargetId} className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl ${selectedTargetId ? 'bg-white text-pink-500 scale-105' : 'bg-gray-100 opacity-50'}`}><Heart size={24} fill={selectedTargetId ? "currentColor" : "none"} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* Mural */
                    <div className="flex-1 flex flex-col gap-6 p-4 bg-pink-100/30 rounded-[3rem] border border-white/80 overflow-hidden relative">
                         <div className="flex flex-col gap-2 relative z-20"> <h2 className="text-3xl font-black text-gray-900 leading-tight">Mural de <span className="text-pink-500 italic">Desabafos</span></h2> <p className="text-sm text-gray-500 font-bold flex items-center gap-2"><Sparkles size={16} className="text-pink-400" /> Pendure sua voz aqui.</p> </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-20 relative z-20">
                             {desabafos.length === 0 ? ( <div className="flex flex-col items-center justify-center h-full gap-6 opacity-30 select-none"><div className="w-40 h-40 bg-pink-200 rounded-full flex items-center justify-center text-7xl">🍃</div><p className="text-xl font-black text-pink-900 uppercase">O mural está em silêncio...</p></div> ) : ( <div className="flex flex-wrap justify-center gap-8 px-4"> {desabafos.map(d => ( <MuralCard key={d.id} card={d} onPlay={(audio: string) => { if (!hasJoinedLive) joinSocialRoom(); new Audio(audio).play(); }} /> ))} </div> )}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RadioDasMaes;
