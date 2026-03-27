import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mic, StopCircle, Send, Heart, Volume2,
  Radio, Play, Pause,
  Users, Music, Leaf, Heart as HeartIcon,
  MessageCircle, Anchor, Clock, Sparkles, Plus, PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { toast } from "sonner";
import { supabase } from '../integrations/supabase/client';

/* ─── Constants ─── */
const MAX_BUBBLE_SCALE = 1.4;
const BASE_BUBBLE_SIZE = 60;
const avatarEmojis = ['🌸', '🌺', '🌷', '🌻', '🦋', '🌙', '⭐', '🫶', '💜', '🌿', '✨', '💎'];
const moodEmojis = ['😊', '😴', '🤯', '🫶', '🧘', '☕', '🌟', '🌙', '🫂'];

/* ─── Particles ─── */
const Petal = ({ id, onDone }: { id: number; onDone: () => void }) => {
  const startX = useMemo(() => Math.random() * 100, []);
  const delay = useMemo(() => Math.random() * 2, []);
  useEffect(() => { const t = setTimeout(onDone, 9000); return () => clearTimeout(t); }, []); // eslint-disable-line
  return (
    <motion.div initial={{ top: '-10%', left: `${startX}%`, opacity: 0, rotate: 0 }} animate={{ top: '110%', left: [`${startX}%`, `${startX + (Math.random() * 10 - 5)}%`], opacity: [0, 0.7, 0.7, 0], rotate: 360 }} transition={{ duration: 7, delay, ease: 'linear' }} className="fixed pointer-events-none select-none text-2xl z-[99]">🌸</motion.div>
  );
};

const Firefly = () => {
    const x = useMemo(() => Math.random() * 100, []);
    const y = useMemo(() => Math.random() * 100, []);
    return (
      <motion.div animate={{ x: [0, Math.random() * 60 - 30, 0], y: [0, Math.random() * 60 - 30, 0], opacity: [0.1, 0.6, 0.1], scale: [1, 1.4, 1] }} transition={{ duration: 4 + Math.random() * 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full blur-[2px] pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }} />
    );
};

/* ─── Floating Message Component ─── */
const FloatingMessage = ({ msg, onDone }: any) => {
    const randomX = useMemo(() => 20 + Math.random() * 60, []);
    const randomY = useMemo(() => 20 + Math.random() * 60, []);
    useEffect(() => { const t = setTimeout(onDone, 5000); return () => clearTimeout(t); }, []); // eslint-disable-line
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute z-50 pointer-events-none px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-center gap-1"
            style={{ left: `${randomX}%`, top: `${randomY}%`, transform: 'translate(-50%, -50%)' }}
        >
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-tighter">{msg.name}</span>
            <span className="text-white text-sm font-bold text-center drop-shadow-md">{msg.text}</span>
            {msg.audio && <div className="mt-1 flex items-center gap-1 text-[8px] text-white/50 animate-pulse"><Volume2 size={10} /> ÁUDIO...</div>}
        </motion.div>
    );
};

/* ─── Bubble Component ─── */
const FloatingBubble = ({ participant, index, total, isSelected, isReceivingHeart, isHugging, onClick, onBubbleRef }: any) => {
    const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
    const cx = isHugging ? 50 + Math.cos(angle) * 10 : 50 + Math.cos(angle) * 35;
    const cy = isHugging ? 45 + Math.sin(angle) * 8 : 45 + Math.sin(angle) * 28;
    const hearts = Number(participant.hearts) || 0;
    const heartScale = Math.min(1 + hearts * 0.1, MAX_BUBBLE_SCALE);
    const bubblePx = Math.round(BASE_BUBBLE_SIZE * heartScale);
  
    return (
      <motion.div ref={el => onBubbleRef(participant.id, el)} initial={{ scale: 0, opacity: 0 }} animate={isReceivingHeart ? { scale: [heartScale, heartScale * 1.4, heartScale], opacity: 1 } : { scale: heartScale, opacity: 1, y: [0, -10, 0, 10, 0] }} transition={{ scale: { type: 'spring', stiffness: 260, damping: 20 }, y: { duration: 5 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }, left: { type: 'spring', stiffness: 60, damping: 25 }, top: { type: 'spring', stiffness: 60, damping: 25 } }} className="absolute flex flex-col items-center gap-2 cursor-pointer z-30 transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${cx}%`, top: `${cy}%` }} onClick={onClick}>
        <AnimatePresence>{isSelected && !participant.isMe && ( <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }} exit={{ scale: 0.8, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} className="absolute rounded-full border-2 border-dashed border-pink-400/50" style={{ width: bubblePx + 24, height: bubblePx + 24, top: -12, left: -12 }} /> )}</AnimatePresence>
        {participant.mood && ( <motion.div className="absolute -top-4 -right-2 bg-white shadow-xl rounded-full w-6 h-6 flex items-center justify-center text-xs border border-pink-100 z-40">{participant.mood}</motion.div> )}
        <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} animate={{ width: bubblePx, height: bubblePx }} transition={{ type: 'spring' }} className="rounded-full flex items-center justify-center shadow-2xl border-4 border-white/40 overflow-hidden relative bg-gradient-to-br from-pink-300 via-rose-500 to-rose-700">
          <div className="absolute top-1 left-2 w-1/3 h-1/3 bg-white/30 rounded-full blur-[4px]" />
          <span style={{ fontSize: Math.max(Math.round(bubblePx * 0.45), 20) }}>{participant.emoji || '🌸'}</span>
        </motion.div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-white px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full shadow-lg border border-white/5 uppercase">{participant.isMe ? `VOCÊ` : participant.name.toUpperCase()}</span>
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

/* ══════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════ */
const RadioDasMaes = () => {
    const [activeTab, setActiveTab] = useState<'podcast' | 'desabafos'>('podcast');
    const [desabafos, setDesabafos] = useState<any[]>(() => {
        try { const saved = localStorage.getItem('social_radio_desabafos'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });

    const [hasJoinedLive, setHasJoinedLive] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [selectedTargetId, setSelectedTargetId] = useState<any>(null);
    const [heartParticles, setHeartParticles] = useState<any[]>([]);
    const [receivingHeartId, setReceivingHeartId] = useState<any>(null);
    
    // Floating messages on Stage
    const [activeMessages, setActiveMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [heartsSent, setHeartsSent] = useState<Set<string>>(new Set());
    const [isHugging, setIsHugging] = useState(false);
    const [petals, setPetals] = useState<number[]>([]);
    const [isAmbientAudioActive, setIsAmbientAudioActive] = useState(false);

    const mouseX = useMotionValue(0); const mouseY = useMotionValue(0);
    const rotateX = useTransform(useSpring(mouseY, { damping: 20, stiffness: 100 }), [-400, 400], [10, -10]);
    const rotateY = useTransform(useSpring(mouseX, { damping: 20, stiffness: 100 }), [-400, 400], [-10, 10]);

    const channelRef = useRef<any>(null);
    const bubbleRefsMap = useRef<Map<any, HTMLDivElement>>(new Map());
    const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
    const userId = useRef(Math.random().toString(36).substr(2, 9));

    const [myName] = useState(() => {
       try { const p = localStorage.getItem('almas_empreendedora_profile'); return p ? JSON.parse(p).nomeEmpreendedora || 'Mãe' : 'Mãe'; } catch { return 'Mãe'; }
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

    const joinSocialRoom = useCallback(() => {
        if (hasJoinedLive) return;
        setHasJoinedLive(true);
        const channel = supabase.channel('radio-social-room', { config: { presence: { key: userId.current } } });
        channel
          .on('presence', { event: 'sync' }, () => {
             const state = channel.presenceState();
             const users = Object.keys(state).map(k => ({ ...(state[k] as any)[0], id: k, isMe: k === userId.current })).filter(Boolean);
             setParticipants(users);
          })
          .on('broadcast', { event: 'chat-msg' }, ({ payload }) => {
             setActiveMessages(prev => [...prev, payload]);
          })
          .on('broadcast', { event: 'mural-pinned' }, ({ payload }) => {
             setDesabafos(prev => {
                const updated = [payload, ...prev].slice(0, 20);
                localStorage.setItem('social_radio_desabafos', JSON.stringify(updated));
                return updated;
             });
             toast.info(`${payload.author} deixou um novo desabafo!`);
          })
          .on('broadcast', { event: 'heart-event' }, ({ payload }) => {
            setReceivingHeartId(payload.targetId); setTimeout(() => setReceivingHeartId(null), 700);
            setParticipants(prev => prev.map(p => p.id === payload.targetId ? { ...p, hearts: (p.hearts || 0) + 1 } : p));
          })
          .on('broadcast', { event: 'audio-msg' }, ({ payload }) => {
             setActiveMessages(prev => [...prev, payload]);
             new Audio(payload.audio).play().catch(() => {});
          })
          .subscribe(async (status) => { if (status === 'SUBSCRIBED') await channel.track({ name: myName, emoji: myEmoji, hearts: 0, mood: null }); });
        channelRef.current = channel;
    }, [hasJoinedLive, myEmoji, myName]);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        if (!hasJoinedLive) joinSocialRoom();
        const msg = { id: Math.random().toString(), name: myName, text: chatInput.trim() };
        channelRef.current?.send({ type: 'broadcast', event: 'chat-msg', payload: msg });
        setActiveMessages(prev => [...prev, msg]); setChatInput('');
    };

    const handleSendHeart = () => {
        if (!selectedTargetId) { toast.info('Selecione uma bolha.'); return; }
        if (heartsSent.has(selectedTargetId)) { toast.info('Apenas um coração por mãe!'); return; }
        setHeartsSent(prev => new Set(prev).add(selectedTargetId));
        channelRef.current?.send({ type: 'broadcast', event: 'heart-event', payload: { targetId: selectedTargetId } });
    };

    const [isRecordingMsg, setIsRecordingMsg] = useState(false);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const toggleRecording = async () => {
        if (!hasJoinedLive) joinSocialRoom();
        if (isRecordingMsg) { recorderRef.current?.stop(); setIsRecordingMsg(false); }
        else {
          try {
            const s = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(s); recorderRef.current = mr; chunksRef.current = [];
            mr.ondataavailable = e => chunksRef.current.push(e.data);
            mr.onstop = () => {
              const b = new Blob(chunksRef.current, { type: 'audio/webm' });
              const r = new FileReader(); r.readAsDataURL(b); r.onloadend = () => {
                const b64 = r.result as string; 
                if (activeTab === 'podcast') {
                   channelRef.current?.send({ type: 'broadcast', event: 'audio-msg', payload: { id: userId.current, name: myName, audio: b64, text: 'Enviou uma nota de voz' } });
                   setActiveMessages(prev => [...prev, { id: Math.random().toString(), name: myName, audio: b64, text: 'Enviou uma nota de voz' }]);
                } else {
                   const newCard = { id: Date.now().toString(), author: myName, audioData: b64, time: 'Agora' };
                   channelRef.current?.send({ type: 'broadcast', event: 'mural-pinned', payload: newCard });
                   setDesabafos(prev => [newCard, ...prev]);
                }
              };
              s.getTracks().forEach(t => t.stop());
            };
            mr.start(); setIsRecordingMsg(true);
          } catch { toast.error('Sem microfone.'); }
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto h-[calc(100vh-60px)] flex flex-col p-2 overflow-hidden bg-transparent">
            {/* Stage Partials */}
            <AnimatePresence> {petals.map(id => <Petal key={id} id={id} onDone={() => setPetals(v => v.filter(x => x !== id))} />)} </AnimatePresence>

            {/* Header */}
            <div className="flex flex-row items-center justify-between gap-4 mb-2 bg-white/30 backdrop-blur-3xl p-3 px-6 rounded-[2.5rem] border border-white/50 shadow-xl shrink-0">
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
                    <motion.div key="stage-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col gap-2 min-h-0 relative">
                        {/* Interactive Stage - TAKES UP MOST SPACE */}
                        <div onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); mouseX.set(e.clientX - r.left - r.width/2); mouseY.set(e.clientY - r.top - r.height/2); }} className="flex-1 rounded-[3.5rem] overflow-hidden shadow-2xl border-2 border-white/10 relative bg-black perspective-[1000px]">
                            <div className="absolute inset-0 bg-gradient-radial from-[#1e0a16] via-[#0d040a] to-[#050103] opacity-90" />
                            
                            {/* Floating Messages Layer */}
                            <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none">
                                <AnimatePresence>
                                    {activeMessages.map(m => (
                                        <FloatingMessage key={m.id} msg={m} onDone={() => setActiveMessages(prev => prev.filter(x => x.id !== m.id))} />
                                    ))}
                                </AnimatePresence>
                            </div>

                            <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                                <div className="absolute inset-0 pointer-events-auto">
                                    {hasJoinedLive && Array.from({ length: 15 }).map((_, i) => <Firefly key={i} />)}
                                    {!hasJoinedLive ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-50">
                                            <div className="w-32 h-32 bg-white/10 rounded-[3rem] backdrop-blur-md flex items-center justify-center text-7xl shadow-2xl border border-white/20">🌙</div>
                                            <button onClick={joinSocialRoom} className="px-14 py-5 bg-white text-pink-600 font-black rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all text-sm uppercase">Sintonizar Sala</button>
                                        </div>
                                    ) : (
                                        <AnimatePresence>{participants.map((p, i) => ( <FloatingBubble key={p.id} participant={p} index={i} total={participants.length} isSelected={selectedTargetId === p.id} isReceivingHeart={receivingHeartId === p.id} isHugging={isHugging} onClick={() => { if (!p.isMe) setSelectedTargetId((v: any) => v === p.id ? null : p.id); }} onBubbleRef={(id: any, el: any) => { if (el) bubbleRefsMap.current.set(id, el); else bubbleRefsMap.current.delete(id); }} /> ))}</AnimatePresence>
                                    )}
                                </div>
                            </motion.div>
                            <div className="absolute top-6 left-8 flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10"> <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_green]" /> <span className="text-[10px] font-black text-white uppercase tracking-widest">{participants.length} Almas On-line</span> </div>
                            <div className="absolute right-6 top-6">
                                <button onClick={toggleAmbientMusic} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:scale-110`}> {isAmbientAudioActive ? <Pause size={20} /> : <Play size={20} />} </button>
                            </div>
                        </div>

                        {/* Control Hub - MUCH SLIMMER NOW */}
                        <div className="bg-white/30 backdrop-blur-3xl rounded-[3rem] border border-white/60 p-4 flex flex-col gap-4 shadow-2xl shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2 p-1 bg-black/5 rounded-2xl border border-black/5">
                                    <button onClick={() => { if (!hasJoinedLive) joinSocialRoom(); channelRef.current?.send({ type: 'broadcast', event: 'group-hug' }); setIsHugging(true); setTimeout(() => setIsHugging(false), 3500); }} className="px-5 py-2 hover:bg-white rounded-xl text-[10px] font-black text-gray-500 hover:text-pink-600 transition-all flex items-center gap-2"><Users size={14} /> ABRAÇO</button>
                                    <button onClick={() => { if (!hasJoinedLive) joinSocialRoom(); channelRef.current?.send({ type: 'broadcast', event: 'petal-rain' }); setPetals(Array.from({ length: 40 }, (_, i) => Date.now() + i)); }} className="px-5 py-2 hover:bg-white rounded-xl text-[10px] font-black text-gray-500 hover:text-pink-400 transition-all flex items-center gap-2"><Leaf size={14} /> PÉTALAS</button>
                                </div>
                                <div className="flex gap-1.5 px-3 py-1.5 bg-white/30 rounded-2xl"> {moodEmojis.map(m => ( <button key={m} onClick={() => { if (!hasJoinedLive) joinSocialRoom(); channelRef.current?.send({ type: 'broadcast', event: 'update-mood', payload: { userId: userId.current, emoji: m } }); setParticipants(prev => prev.map(p => p.isMe ? { ...p, mood: m } : p)); }} className="w-8 h-8 flex items-center justify-center hover:scale-150 transition-all text-sm">{m}</button> ))} </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="flex-1 flex items-center bg-white/60 rounded-[2.5rem] px-2 py-1.5 border border-white focus-within:ring-4 ring-pink-500/10 transition-all shadow-xl">
                                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Palavras que acolhem..." className="flex-1 bg-transparent px-6 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none font-black" />
                                    <button onClick={handleSendMessage} className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white mr-1 hover:scale-110 active:scale-95 transition-all"><Send size={20} /></button>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSendHeart} disabled={!selectedTargetId} className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${selectedTargetId ? 'bg-white text-pink-500 scale-105' : 'bg-gray-100 opacity-50'}`}><Heart size={28} fill={selectedTargetId ? "currentColor" : "none"} /></button>
                                    <button onClick={toggleRecording} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${isRecordingMsg ? 'bg-red-500 animate-pulse text-white' : 'bg-pink-600 text-white hover:scale-105'}`}>{isRecordingMsg ? <StopCircle size={24} /> : <Mic size={24} />}</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* Mural */
                    <motion.div key="mural-layout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col gap-6 p-4 bg-pink-100/30 rounded-[3rem] border border-white/80 overflow-hidden relative">
                        <div className="flex flex-col gap-2 relative z-20"> <h2 className="text-3xl font-black text-gray-900 leading-tight">Mural de <span className="text-pink-500 italic">Desabafos</span></h2> <p className="text-sm text-gray-500 font-bold flex items-center gap-2"><Sparkles size={16} className="text-pink-400" /> Pendure sua voz aqui.</p> </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-20 relative z-20">
                             {desabafos.length === 0 ? ( <div className="flex flex-col items-center justify-center h-full gap-6 opacity-30 select-none"><div className="w-40 h-40 bg-pink-200 rounded-full flex items-center justify-center text-7xl">🍃</div><p className="text-xl font-black text-pink-900 uppercase">O mural está em silêncio...</p></div> ) : ( <div className="flex flex-wrap justify-center gap-8 px-4"> {desabafos.map(d => ( <MuralCard key={d.id} card={d} onPlay={(audio: string) => { if (!hasJoinedLive) joinSocialRoom(); new Audio(audio).play(); }} /> ))} </div> )}
                        </div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"> <button onClick={toggleRecording} className={`flex items-center gap-4 px-10 py-5 rounded-[2.5rem] font-black text-sm uppercase transition-all shadow-2xl ${isRecordingMsg ? 'bg-red-500 animate-pulse text-white scale-110' : 'bg-gray-900 text-white hover:bg-pink-600 hover:scale-105'}`}> {isRecordingMsg ? <StopCircle size={22} /> : <Plus size={22} />} {isRecordingMsg ? 'Gravando...' : 'Pendurar Desabafo'} </button> </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RadioDasMaes;
