import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mic, StopCircle, Send, Trash2, Heart, Volume2,
  Radio, PhoneOff, Play, Pause,
  Users, Sparkles, Music, Leaf, Star, Smile, MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { toast } from "sonner";
import { supabase } from '../integrations/supabase/client';

/* ─── Constants ─── */
const MAX_BUBBLE_SCALE = 1.4; // Slightly smaller to avoid overflow
const BASE_BUBBLE_SIZE = 60;
const avatarEmojis = ['🌸', '🌺', '🌷', '🌻', '🦋', '🌙', '⭐', '🫶', '💜', '🌿', '🧡', '✨'];
const moodEmojis = ['😊', '😴', '🤯', '🫶', '🧘', '☕', '🌟', '🌙', '🫂'];

/* ─── Particles & Overlays ─── */

const Petal = ({ id, onDone }: { id: number; onDone: () => void }) => {
  const startX = useMemo(() => Math.random() * 100, []);
  const delay = useMemo(() => Math.random() * 2, []);
  const duration = useMemo(() => 5 + Math.random() * 4, []);
  useEffect(() => { const t = setTimeout(onDone, (duration + delay) * 1000); return () => clearTimeout(t); }, []); // eslint-disable-line
  return (
    <motion.div
      initial={{ top: '-10%', left: `${startX}%`, opacity: 0, rotate: 0 }}
      animate={{ top: '110%', left: [`${startX}%`, `${startX + (Math.random() * 10 - 5)}%`], opacity: [0, 0.7, 0.7, 0], rotate: 360 }}
      transition={{ duration, delay, ease: 'linear' }}
      className="fixed pointer-events-none select-none text-2xl z-[99]"
    >🌸</motion.div>
  );
};

// 3D Firefly with depth
const Firefly = () => {
  const x = useMemo(() => Math.random() * 100, []);
  const y = useMemo(() => Math.random() * 100, []);
  const duration = useMemo(() => 4 + Math.random() * 6, []);
  return (
    <motion.div
      animate={{ 
        x: [0, Math.random() * 60 - 30, 0], 
        y: [0, Math.random() * 60 - 30, 0], 
        opacity: [0.1, 0.6, 0.1], 
        scale: [1, 1.4, 1] 
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full blur-[2px] pointer-events-none shadow-[0_0_8px_rgba(253,224,71,0.6)]"
      style={{ left: `${x}%`, top: `${y}%` }}
    />
  );
};

/* ─── Components ─── */

const FloatingBubble = ({
  participant, index, total, isSelected, isReceivingHeart, isHugging, onClick, onBubbleRef
}: {
  participant: any; index: number; total: number;
  isSelected: boolean; isReceivingHeart: boolean; isHugging: boolean;
  onClick: () => void; onBubbleRef: (id: any, el: HTMLDivElement | null) => void;
}) => {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const defaultCx = 50 + Math.cos(angle) * 35;
  const defaultCy = 45 + Math.sin(angle) * 28;
  
  const cx = isHugging ? 50 + Math.cos(angle) * 10 : defaultCx;
  const cy = isHugging ? 45 + Math.sin(angle) * 8 : defaultCy;

  const hearts = Number(participant.hearts) || 0;
  const heartScale = Math.min(1 + hearts * 0.1, MAX_BUBBLE_SCALE);
  const bubblePx = Math.round(BASE_BUBBLE_SIZE * heartScale);

  return (
    <motion.div
      ref={el => onBubbleRef(participant.id, el)}
      initial={{ scale: 0, opacity: 0 }}
      animate={isReceivingHeart
        ? { scale: [heartScale, heartScale * 1.4, heartScale], opacity: 1 }
        : { scale: heartScale, opacity: 1, y: [0, -10, 0, 10, 0] }}
      transition={{ 
        scale: { type: 'spring', stiffness: 260, damping: 20 },
        y: { duration: 5 + index * 0.4, repeat: Infinity, ease: 'easeInOut' },
        left: { type: 'spring', stiffness: 60, damping: 25 },
        top: { type: 'spring', stiffness: 60, damping: 25 }
      }}
      className="absolute flex flex-col items-center gap-2 cursor-pointer z-30 group"
      style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)' }}
      onClick={onClick}
    >
      {/* 3D Selection Ring */}
      <AnimatePresence>
        {isSelected && !participant.isMe && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute rounded-full border-2 border-dashed border-pink-400/50"
            style={{ width: bubblePx + 24, height: bubblePx + 24, top: -12, left: -12 }} />
        )}
      </AnimatePresence>
      
      {participant.playingAudio && (
        <motion.div animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute rounded-full bg-pink-400/40" style={{ width: bubblePx + 30, height: bubblePx + 30, top: -15, left: -15 }} />
      )}

      {/* Mood Badge */}
      {participant.mood && (
         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-2 bg-white/90 backdrop-blur-sm shadow-xl rounded-full w-6 h-6 flex items-center justify-center text-xs border border-pink-100 z-40 transform hover:scale-125 transition-transform">
            {participant.mood}
         </motion.div>
      )}

      {/* Bubble with Sphere Effect */}
      <motion.div 
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        animate={{ width: bubblePx, height: bubblePx }} 
        transition={{ type: 'spring' }}
        className="rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(219,39,119,0.3)] border-4 border-white/40 ring-4 ring-pink-500/10 overflow-hidden relative bg-gradient-to-br from-pink-300 via-rose-500 to-rose-700"
      >
        {/* Highlight for 3D sphere look */}
        <div className="absolute top-1 left-2 w-1/3 h-1/3 bg-white/30 rounded-full blur-[4px]" />
        
        <span className="relative z-10 filter drop-shadow-md" style={{ fontSize: Math.max(Math.round(bubblePx * 0.45), 20) }}>
          {participant.emoji || '🌸'}
        </span>
        
        {participant.hasUnplayedAudio && (
           <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-bounce shadow-lg" />
        )}
      </motion.div>

      <div className="flex flex-col items-center">
        <span className="text-[10px] font-black text-white px-3 py-1 bg-black/40 backdrop-blur-md rounded-full truncate max-w-[90px] shadow-lg border border-white/5">
          {participant.isMe ? `VOCÊ` : participant.name.toUpperCase()}
        </span>
        {hearts > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[10px] font-black text-white bg-pink-500 px-2 py-0.5 rounded-full -mt-1 shadow-md border border-white/20">{hearts} ❤️</motion.span>
        )}
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════ */
const RadioDasMaes = () => {
  const [activeTab, setActiveTab] = useState<'podcast' | 'desabafos'>('podcast');
  const [desabafos, setDesabafos] = useState<any[]>([]);

  /* ── Social Room States ── */
  const [hasJoinedLive, setHasJoinedLive] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<any>(null);
  const [heartParticles, setHeartParticles] = useState<any[]>([]);
  const [receivingHeartId, setReceivingHeartId] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ id: string; name: string; text?: string; audio?: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [heartsSent, setHeartsSent] = useState<Set<string>>(new Set());

  const [isHugging, setIsHugging] = useState(false);
  const [petals, setPetals] = useState<number[]>([]);
  const [isAmbientAudioActive, setIsAmbientAudioActive] = useState(false);

  /* ── 3D Tilt Logic ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 100 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 100 });
  const rotateX = useTransform(smoothY, [-400, 400], [10, -10]);
  const rotateY = useTransform(smoothX, [-400, 400], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const channelRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const bubbleRefsMap = useRef<Map<any, HTMLDivElement>>(new Map());
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const userId = useRef(Math.random().toString(36).substr(2, 9));

  const [myName] = useState(() => {
    try { const p = localStorage.getItem('almas_empreendedora_profile'); return p ? JSON.parse(p).nomeEmpreendedora || 'Mãe' : 'Mãe'; } catch { return 'Mãe'; }
  });
  const [myEmoji] = useState(() => avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)]);

  useEffect(() => {
    const audio = new Audio('https://www.bensound.com/bensound-music/bensound-tomorrow.mp3');
    audio.loop = true; audio.volume = 0.15;
    ambientAudioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  const toggleAmbientMusic = () => {
    if (isAmbientAudioActive) { ambientAudioRef.current?.pause(); }
    else { ambientAudioRef.current?.play().catch(() => toast.info('Clique no stage para ativar áudio!')); }
    setIsAmbientAudioActive(!isAmbientAudioActive);
  };

  const joinSocialRoom = () => {
    setHasJoinedLive(true);
    const channel = supabase.channel('radio-social-room', { config: { presence: { key: userId.current } } });
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).map(key => {
          const u = (state[key] as any)?.[0];
          return u ? { ...u, id: key, isMe: key === userId.current } : null;
        }).filter(Boolean);
        setParticipants(users);
      })
      .on('broadcast', { event: 'chat-msg' }, ({ payload }) => setChatMessages(prev => [...prev, payload]))
      .on('broadcast', { event: 'heart-event' }, ({ payload }) => triggerHeartVisuals(payload.targetId))
      .on('broadcast', { event: 'audio-msg' }, ({ payload }) => {
        setChatMessages(prev => [...prev, payload]);
        setParticipants(prev => prev.map(p => p.id === payload.id ? { ...p, hasUnplayedAudio: true } : p));
      })
      .on('broadcast', { event: 'group-hug' }, () => { setIsHugging(true); setTimeout(() => setIsHugging(false), 3500); })
      .on('broadcast', { event: 'petal-rain' }, () => { setPetals(Array.from({ length: 40 }, (_, i) => Date.now() + i)); })
      .on('broadcast', { event: 'update-mood' }, ({ payload }) => {
        setParticipants(prev => prev.map(p => p.id === payload.userId ? { ...p, mood: payload.emoji } : p));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await channel.track({ name: myName, emoji: myEmoji, hearts: 0, mood: null });
      });
    channelRef.current = channel;
  };

  const triggerHeartVisuals = (targetId: any) => {
    const targetEl = bubbleRefsMap.current.get(targetId);
    let ox = window.innerWidth / 2, oy = window.innerHeight / 2;
    if (targetEl) {
      const r = targetEl.getBoundingClientRect();
      ox = r.left + r.width / 2; oy = r.top + r.height / 2;
    }
    setHeartParticles(prev => [...prev, ...Array.from({ length: 14 }, (_, i) => ({ id: Date.now() + i, startX: ox, startY: oy }))]);
    setReceivingHeartId(targetId);
    setTimeout(() => setReceivingHeartId(null), 700);
    setParticipants(prev => prev.map(p => p.id === targetId ? { ...p, hearts: (p.hearts || 0) + 1 } : p));
  };

  const handleSendHeart = () => {
    if (!selectedTargetId) { toast.info('Selecione uma bolha primeiro.'); return; }
    if (heartsSent.has(selectedTargetId)) { toast.info('Um coração por pessoa 🌸'); return; }
    setHeartsSent(prev => new Set(prev).add(selectedTargetId));
    channelRef.current?.send({ type: 'broadcast', event: 'heart-event', payload: { targetId: selectedTargetId } });
    triggerHeartVisuals(selectedTargetId);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = { id: Math.random().toString(), name: myName, text: chatInput.trim() };
    channelRef.current?.send({ type: 'broadcast', event: 'chat-msg', payload: msg });
    setChatMessages(prev => [...prev, msg]); setChatInput('');
  };

  /* ── Audio ── */
  const [isRecordingMsg, setIsRecordingMsg] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (isRecordingMsg) { recorderRef.current?.stop(); setIsRecordingMsg(false); }
    else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(s);
        recorderRef.current = mr; chunksRef.current = [];
        mr.ondataavailable = e => chunksRef.current.push(e.data);
        mr.onstop = () => {
          const b = new Blob(chunksRef.current, { type: 'audio/webm' });
          const r = new FileReader(); r.readAsDataURL(b);
          r.onloadend = () => {
            const b64 = r.result as string;
            channelRef.current?.send({ type: 'broadcast', event: 'audio-msg', payload: { id: userId.current, name: myName, audio: b64 } });
            setChatMessages(prev => [...prev, { id: Math.random().toString(), name: myName, audio: b64 }]);
          };
          s.getTracks().forEach(t => t.stop());
        };
        mr.start(); setIsRecordingMsg(true);
      } catch { toast.error('Mão conseguimos acessar o mic.'); }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col pt-2 pb-6 px-4 overflow-hidden">
      
      {/* Visual FX Layers */}
      <AnimatePresence>
        {heartParticles.map(p => (
          <motion.span key={p.id} initial={{ x: p.startX, y: p.startY, opacity: 1, scale: 1.5 }} animate={{ x: p.startX + (Math.random()-0.5)*200, y: p.startY - 200, opacity: 0, scale: 0.5 }} transition={{ duration: 1.8 }} className="fixed pointer-events-none select-none text-3xl z-[9999]" style={{ left: 0, top: 0 }}>❤️</motion.span>
        ))}
        {petals.map(id => <Petal key={id} id={id} onDone={() => setPetals(v => v.filter(x => x !== id))} />)}
      </AnimatePresence>

      {/* Header - Compact */}
      <div className="flex flex-row items-center justify-between gap-4 mb-3 bg-white/20 backdrop-blur-xl p-3 px-6 rounded-3xl border border-white/30 shadow-lg shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white shadow-lg"><Radio size={16} /></div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Sala de <span className="text-pink-500">Acolhimento</span></h1>
          </div>
          <div className="flex bg-black/5 p-1 rounded-xl border border-black/5">
            <button onClick={() => setActiveTab('podcast')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'podcast' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400'}`}>SALA</button>
            <button onClick={() => setActiveTab('desabafos')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'desabafos' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400'}`}>MURAL</button>
          </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'podcast' ? (
          <motion.div key="stage" className="flex-1 flex flex-col gap-3 min-h-0 relative">
            
            {/* Ambient Controls */}
            <div className="absolute right-4 top-4 flex flex-col gap-3 z-50">
               <button onClick={toggleAmbientMusic} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAmbientAudioActive ? 'bg-pink-500 text-white shadow-lg scale-110 shadow-pink-500/40' : 'bg-white/80 text-gray-400 shadow-sm'}`}>
                 <Music size={18} className={isAmbientAudioActive ? 'animate-pulse' : ''} />
               </button>
            </div>

            {/* Stage - 3D Perspective */}
            <div 
              onMouseMove={handleMouseMove}
              className="flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 relative bg-black perspective-[1000px]"
            >
              <div className="absolute inset-0 bg-gradient-radial from-[#1e0a16] via-[#0d040a] to-[#050103] opacity-80" />
              
              <motion.div 
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                className="absolute inset-0 w-full h-full flex items-center justify-center"
              >
                {hasJoinedLive && Array.from({ length: 12 }).map((_, i) => <Firefly key={i} />)}
                
                {!hasJoinedLive ? (
                  <div className="flex flex-col items-center gap-6 z-50">
                    <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-24 h-24 bg-pink-500/20 rounded-full flex items-center justify-center text-5xl">🌙</motion.div>
                    <button onClick={joinSocialRoom} className="px-10 py-4 bg-white text-pink-600 font-black rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform">ENTRAR NA SALA</button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {participants.map((p, i) => (
                      <FloatingBubble key={p.id} participant={p} index={i} total={participants.length} isSelected={selectedTargetId === p.id} isReceivingHeart={receivingHeartId === p.id} isHugging={isHugging} onClick={() => { if (!p.isMe) setSelectedTargetId(prev => prev === p.id ? null : p.id); }} onBubbleRef={(id, el) => { if (el) bubbleRefsMap.current.set(id, el); else bubbleRefsMap.current.delete(id); }} />
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>

              {/* Status Bar */}
              <div className="absolute top-4 left-6 flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">{participants.length} MÃES CONECTADAS</span>
              </div>
            </div>

            {/* Bottom Controls - Ultra Compact & Modern */}
            {hasJoinedLive && (
              <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 p-3 px-4 flex flex-col gap-3 shadow-2xl shrink-0">
                <div className="flex items-center justify-between gap-4">
                  
                  {/* Quick Interaction Bar */}
                  <div className="flex gap-2 p-1 bg-black/20 rounded-2xl border border-white/5">
                     <button onClick={() => channelRef.current?.send({ type: 'broadcast', event: 'group-hug', payload: {} })} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl text-[10px] font-black text-white/50 hover:text-white transition-all"><Users size={14} /> ABRAÇO</button>
                     <button onClick={() => channelRef.current?.send({ type: 'broadcast', event: 'petal-rain', payload: {} })} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl text-[10px] font-black text-white/50 hover:text-pink-300 transition-all"><Leaf size={14} /> PÉTALAS</button>
                  </div>

                  {/* Mood Selector */}
                  <div className="flex gap-1.5 px-3 py-1.5 bg-white/5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar max-w-[150px] sm:max-w-none">
                     {moodEmojis.map(m => (
                       <button key={m} onClick={() => { channelRef.current?.send({ type: 'broadcast', event: 'update-mood', payload: { userId: userId.current, emoji: m } }); setParticipants(prev => prev.map(p => p.isMe ? { ...p, mood: m } : p)); }} className="w-7 h-7 flex items-center justify-center hover:scale-150 transition-all text-sm filter grayscale hover:grayscale-0">{m}</button>
                     ))}
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  {/* Chat Input */}
                  <div className="flex-1 flex items-center bg-black/20 rounded-3xl px-1 border border-white/10 focus-within:border-pink-500/50 transition-all">
                     <input 
                       value={chatInput} 
                       onChange={e => setChatInput(e.target.value)} 
                       onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                       placeholder="Envie um acolhimento..." 
                       className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/20 outline-none" 
                     />
                     <button onClick={handleSendMessage} className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white mr-1 hover:bg-white/20 transition-all"><Send size={18} /></button>
                  </div>

                  {/* Recording & Heart buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSendHeart} 
                      disabled={!selectedTargetId || heartsSent.has(selectedTargetId)} 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-xl ${selectedTargetId && !heartsSent.has(selectedTargetId) ? 'bg-white text-pink-500 scale-110 active:scale-95' : 'bg-white/5 opacity-10 cursor-not-allowed'}`}
                    >
                      {heartsSent.has(selectedTargetId) ? '✔️' : <Heart size={24} fill="currentColor" />}
                    </button>
                    <button 
                      onClick={toggleRecording} 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl ${isRecordingMsg ? 'bg-red-500 animate-pulse text-white' : 'bg-pink-500 text-white hover:scale-105 active:scale-95'}`}
                    >
                      {isRecordingMsg ? <StopCircle size={22} /> : <Mic size={22} />}
                    </button>
                  </div>
                </div>

                {/* Sub-chat (Last messages) - Increased height and improved readability */}
                <div ref={chatRef} className="h-28 overflow-y-auto px-4 py-3 bg-white/40 rounded-3xl space-y-2 no-scrollbar scroll-smooth border border-black/5 shadow-inner">
                   {chatMessages.length === 0 && <div className="text-[10px] text-pink-900/40 font-black uppercase py-4 text-center">Inicie um acolhimento enviando uma mensagem...</div>}
                   {chatMessages.map(m => (
                     <div key={m.id} className="text-[12px] flex items-start gap-2 animate-in fade-in slide-in-from-bottom-1 bg-white/30 backdrop-blur-sm p-2 rounded-2xl border border-white/50 shadow-sm">
                        <span className="text-pink-600 font-black shrink-0">{m.name}:</span>
                        <span className="text-gray-900 font-medium break-words leading-tight">{m.text}</span>
                        {m.audio && (
                           <button onClick={() => { const a = new Audio(m.audio); a.play(); }} className="flex items-center gap-1.5 px-3 py-1 bg-pink-500/20 rounded-full text-pink-700 hover:bg-pink-500/30 transition-all ml-auto">
                              <Volume2 size={12} /> 
                              <span className="text-[9px] font-black uppercase">Ouvir</span>
                           </button>
                        )}
                     </div>
                   ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Mural */
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
             {desabafos.length === 0 && <div className="p-12 text-center text-gray-400 font-bold italic">Nenhum desabafo ainda...</div>}
             {desabafos.map(d => (
              <div key={d.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-4 group hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex justify-between items-center font-bold text-sm text-pink-600">
                   <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">👩</div> Mãe {d.author}</div>
                   <span className="text-[9px] text-gray-300 uppercase tracking-widest">{d.time}</span>
                </div>
                <button 
                  onClick={() => { const a = new Audio(d.audioData); a.play(); }} 
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black bg-gray-50 text-gray-400 hover:bg-pink-500 hover:text-white transition-all"
                >
                   <Play size={18} fill="currentColor" /> OUVIR DESABAFO
                </button>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RadioDasMaes;
