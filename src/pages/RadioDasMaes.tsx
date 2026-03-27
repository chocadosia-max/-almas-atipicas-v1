import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Headphones, Mic, StopCircle, Send, Trash2, Heart, Share2, Volume2,
  Loader2, MessageSquarePlus, Radio, Info, PhoneCall, PhoneOff, Play, Pause,
  Users, Sparkles, Music, Leaf, Flower2, Wind, Smile, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { supabase } from '../integrations/supabase/client';

/* ─── IndexedDB (Unchanged) ─── */
const DB_NAME_RAD = 'AlmasRadioDB';
const STORE_NAME_RAD = 'desabafos';
const initRadioDB = () => new Promise<IDBDatabase>((resolve, reject) => {
  const req = indexedDB.open(DB_NAME_RAD, 1);
  req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME_RAD, { keyPath: 'id' });
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});
const saveDesabafoToDB = async (item: any) => {
  const db = await initRadioDB();
  const tx = db.transaction(STORE_NAME_RAD, 'readwrite');
  tx.objectStore(STORE_NAME_RAD).put(item);
  return new Promise((res, rej) => { tx.oncomplete = () => res(undefined); tx.onerror = () => rej(tx.error); });
};
const getDesabafosFromDB = async () => {
  const db = await initRadioDB();
  const tx = db.transaction(STORE_NAME_RAD, 'readonly');
  const req = tx.objectStore(STORE_NAME_RAD).getAll();
  return new Promise<any[]>((res, rej) => { req.onsuccess = () => res(req.result || []); req.onerror = () => rej(req.error); });
};
const deleteDesabafoFromDB = async (id: number) => {
  const db = await initRadioDB();
  const tx = db.transaction(STORE_NAME_RAD, 'readwrite');
  tx.objectStore(STORE_NAME_RAD).delete(id);
  return new Promise((res, rej) => { tx.oncomplete = () => res(undefined); tx.onerror = () => rej(tx.error); });
};

const avatarEmojis = ['🌸', '🌺', '🌷', '🌻', '🦋', '🌙', '⭐', '🫶', '💜', '🌿'];
const moodEmojis = ['😊', '😴', '🤯', '🫶', '🧘', '☕', '🌟', '🌙', '🫂'];
const affirmations = [
  "Você é a melhor mãe para o seu filho. 🤍",
  "Respire fundo, você está segura aqui. ✨",
  "Seu cansaço é real, mas seu amor é maior. 🌱",
  "Um dia de cada vez, você está indo bem. 🌸",
  "Nenhuma de nós está sozinha. 🫂",
  "Sua dedicação é o milagre de alguém. 🌟",
  "Você merece esse momento de pausa. 🍵"
];

/* ─── Particles & Overlays ─── */

// Petal Particle
const Petal = ({ id, onDone }: { id: number; onDone: () => void }) => {
  const startX = Math.random() * 100;
  const delay = Math.random() * 5;
  const duration = 8 + Math.random() * 5;
  useEffect(() => { const t = setTimeout(onDone, (duration + delay) * 1000); return () => clearTimeout(t); }, []); // eslint-disable-line
  return (
    <motion.div
      initial={{ top: '-10%', left: `${startX}%`, opacity: 0, rotate: 0 }}
      animate={{ 
        top: '110%', 
        left: [`${startX}%`, `${startX + (Math.random() * 10 - 5)}%`],
        opacity: [0, 0.8, 0.8, 0],
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
      }}
      transition={{ duration, delay, ease: 'linear' }}
      className="fixed pointer-events-none select-none text-xl z-[99]"
    >🌸</motion.div>
  );
};

// Floating Affirmation (Shooting Star)
const FloatingAffirmation = ({ text, id, onDone }: { text: string; id: number; onDone: () => void }) => {
  useEffect(() => { const t = setTimeout(onDone, 9000); return () => clearTimeout(t); }, []); // eslint-disable-line
  return (
    <motion.div
      initial={{ x: '-100%', y: '20%', opacity: 0 }}
      animate={{ x: '110%', y: '15%', opacity: [0, 1, 1, 0] }}
      transition={{ duration: 8, ease: 'easeInOut' }}
      className="fixed pointer-events-none select-none z-[10] whitespace-nowrap"
      style={{ top: `${20 + Math.random() * 15}%` }}
    >
      <span className="bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-[10px] sm:text-xs font-serif italic text-white/50 shadow-2xl">
        {text}
      </span>
    </motion.div>
  );
};

// Fireflies (Ambient)
const Firefly = ({ mousePos }: { mousePos: { x: number; y: number } }) => {
  const id = useMemo(() => Math.random(), []);
  const startX = useMemo(() => Math.random() * 100, []);
  const startY = useMemo(() => Math.random() * 100, []);
  return (
    <motion.div
      animate={{ 
        x: [0, Math.random() * 100 - 50, 0],
        y: [0, Math.random() * 100 - 50, 0],
        opacity: [0.1, 0.5, 0.1],
        scale: [1, 1.3, 1]
      }}
      transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute w-1 h-1 bg-yellow-200/40 rounded-full blur-[1px] pointer-events-none"
      style={{ left: `${startX}%`, top: `${startY}%` }}
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
  const defaultCx = 50 + Math.cos(angle) * 32;
  const defaultCy = 45 + Math.sin(angle) * 22;
  
  // Group Hug target: move towards center (50, 45)
  const cx = isHugging ? 50 + Math.cos(angle) * 8 : defaultCx;
  const cy = isHugging ? 45 + Math.sin(angle) * 6 : defaultCy;

  const heartScale = Math.min(1 + (participant.hearts || 0) * 0.08, MAX_BUBBLE_SCALE);
  const bubblePx = Math.round(BASE_BUBBLE_SIZE * heartScale);

  return (
    <motion.div
      ref={el => onBubbleRef(participant.id, el)}
      initial={{ scale: 0, opacity: 0 }}
      animate={isReceivingHeart
        ? { scale: [heartScale, heartScale * 1.3, heartScale], opacity: 1 }
        : { scale: heartScale, opacity: 1, y: [0, -8, 0, 7, 0] }}
      transition={{ 
        scale: { type: 'spring', stiffness: 200 },
        y: { duration: 4 + index * 0.5, repeat: Infinity, ease: 'easeInOut' },
        left: { type: 'spring', stiffness: 50, damping: 20 },
        top: { type: 'spring', stiffness: 50, damping: 20 }
      }}
      className="absolute flex flex-col items-center gap-1.5 cursor-pointer z-20"
      style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)' }}
      onClick={onClick}
    >
      {isSelected && !participant.isMe && (
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity }}
          className="absolute rounded-full border-2 border-pink-400"
          style={{ width: bubblePx + 16, height: bubblePx + 16, top: -8, left: -8 }} />
      )}
      
      {participant.playingAudio && (
        <motion.div animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 0.6, repeat: Infinity }}
          className="absolute rounded-full bg-pink-400/50" style={{ width: bubblePx + 20, height: bubblePx + 20, top: -10, left: -10 }} />
      )}

      {/* Mood Badge */}
      {participant.mood && (
         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-1 bg-white shadow-lg rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-pink-100 z-30">
            {participant.mood}
         </motion.div>
      )}

      <motion.div animate={{ width: bubblePx, height: bubblePx }} transition={{ type: 'spring' }}
        className="rounded-full bg-gradient-to-br from-pink-300 to-rose-500 flex items-center justify-center shadow-2xl border-4 border-white/30 ring-2 ring-pink-400/20 overflow-hidden relative">
        <span style={{ fontSize: Math.round(bubblePx * 0.4) }}>{participant.emoji || '🌸'}</span>
        {participant.hasUnplayedAudio && (
           <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-bounce" />
        )}
      </motion.div>
      <span className="text-[9px] font-black text-white/80 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full truncate max-w-[84px]">
        {participant.isMe ? `${participant.name}` : participant.name}
      </span>
      {(participant.hearts || 0) > 0 && (
        <span className="text-[9px] font-black text-white bg-pink-500 px-1.5 py-0.5 rounded-full -mt-1 shadow-md">{participant.hearts} ❤️</span>
      )}
    </motion.div>
  );
};

const MAX_BUBBLE_SCALE = 1.6;
const BASE_BUBBLE_SIZE = 56;

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
  const [scorePopups, setScorePopups] = useState<any[]>([]);
  const [receivingHeartId, setReceivingHeartId] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ id: string; name: string; text?: string; audio?: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [heartsSent, setHeartsSent] = useState<Set<string>>(new Set());

  // Interactive Room States
  const [isHugging, setIsHugging] = useState(false);
  const [isPetalRainActive, setIsPetalRainActive] = useState(false);
  const [petals, setPetals] = useState<number[]>([]);
  const [activeAffirmation, setActiveAffirmation] = useState<{ id: number; text: string } | null>(null);
  const [isAmbientAudioActive, setIsAmbientAudioActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const bubbleRefsMap = useRef<Map<any, HTMLDivElement>>(new Map());
  const userId = useRef(Math.random().toString(36).substr(2, 9));

  const [myName] = useState(() => {
    try { const p = localStorage.getItem('almas_empreendedora_profile'); return p ? JSON.parse(p).nomeEmpreendedora || 'Mãe' : 'Mãe'; } catch { return 'Mãe'; }
  });
  const [myEmoji] = useState(() => avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)]);

  useEffect(() => {
    getDesabafosFromDB().then(data => {
      if (data && data.length > 0) { data.sort((a, b) => b.id - a.id); setDesabafos(data); }
    });
  }, []);

  // Ambient Music Logic
  useEffect(() => {
    const audio = new Audio('https://www.bensound.com/bensound-music/bensound-tomorrow.mp3'); // Safe placeholder Lo-Fi
    audio.loop = true;
    audio.volume = 0.2;
    ambientAudioRef.current = audio;
    return () => { audio.pause(); ambientAudioRef.current = null; };
  }, []);

  const toggleAmbientMusic = () => {
    if (isAmbientAudioActive) { ambientAudioRef.current?.pause(); }
    else { ambientAudioRef.current?.play().catch(() => toast.info('Clique em qualquer lugar para ativar a música!')); }
    setIsAmbientAudioActive(!isAmbientAudioActive);
  };

  // Affirmations Cycle
  useEffect(() => {
    if (!hasJoinedLive) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const text = affirmations[Math.floor(Math.random() * affirmations.length)];
        setActiveAffirmation({ id: Date.now(), text });
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [hasJoinedLive]);

  /* ── Sync ── */
  const joinSocialRoom = () => {
    setHasJoinedLive(true);
    const channel = supabase.channel('radio-social-room', { config: { presence: { key: userId.current } } });
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).map(key => ({ ...(state[key] as any)[0], id: key, isMe: key === userId.current }));
        setParticipants(users);
      })
      .on('broadcast', { event: 'chat-msg' }, ({ payload }) => setChatMessages(prev => [...prev, payload]))
      .on('broadcast', { event: 'heart-event' }, ({ payload }) => triggerHeartVisuals(payload.targetId))
      .on('broadcast', { event: 'audio-msg' }, ({ payload }) => {
        setChatMessages(prev => [...prev, payload]);
        setParticipants(prev => prev.map(p => p.id === payload.id ? { ...p, hasUnplayedAudio: true } : p));
      })
      .on('broadcast', { event: 'group-hug' }, () => triggerGroupHug())
      .on('broadcast', { event: 'petal-rain' }, () => triggerPetalRain())
      .on('broadcast', { event: 'update-mood' }, ({ payload }) => {
        setParticipants(prev => prev.map(p => p.id === payload.userId ? { ...p, mood: payload.emoji } : p));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await channel.track({ name: myName, emoji: myEmoji, hearts: 0, mood: null });
      });
    channelRef.current = channel;
  };

  const leaveSocialRoom = () => {
    channelRef.current?.unsubscribe();
    setHasJoinedLive(false);
    setParticipants([]);
    setChatMessages([]);
  };

  /* ── Interactive Actions ── */
  const triggerGroupHug = () => {
    setIsHugging(true);
    setTimeout(() => setIsHugging(false), 3500);
    toast('🫂 Abraço coletivo ativado!');
  };

  const triggerPetalRain = () => {
    setPetals(Array.from({ length: 40 }, (_, i) => Date.now() + i));
    setIsPetalRainActive(true);
    setTimeout(() => setIsPetalRainActive(false), 12000);
  };

  const triggerHeartVisuals = (targetId: any) => {
    const target = participants.find(p => p.id === targetId);
    if (!target) return;
    const targetEl = bubbleRefsMap.current.get(targetId);
    let ox = window.innerWidth / 2, oy = window.innerHeight / 2;
    if (targetEl) {
      const r = targetEl.getBoundingClientRect();
      ox = r.left + r.width / 2; oy = r.top + r.height / 2;
    }
    setHeartParticles(prev => [...prev, ...Array.from({ length: 12 }, (_, i) => ({ id: Date.now() + i, startX: ox, startY: oy }))]);
    setScorePopups(prev => [...prev, { id: Date.now() + 500, x: ox, y: oy - 20 }]);
    setReceivingHeartId(targetId);
    setTimeout(() => setReceivingHeartId(null), 700);
    setParticipants(prev => prev.map(p => p.id === targetId ? { ...p, hearts: (p.hearts || 0) + 1 } : p));
  };

  const sendGroupHug = () => channelRef.current?.send({ type: 'broadcast', event: 'group-hug', payload: {} });
  const sendPetalRain = () => channelRef.current?.send({ type: 'broadcast', event: 'petal-rain', payload: {} });
  const updateMyMood = (emoji: string) => {
    channelRef.current?.send({ type: 'broadcast', event: 'update-mood', payload: { userId: userId.current, emoji } });
    setParticipants(prev => prev.map(p => p.isMe ? { ...p, mood: emoji } : p));
    toast.info(`Status atualizado para ${emoji}`);
  };

  /* ── Chat/Audio ── */
  const [isRecordingMsg, setIsRecordingMsg] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (isRecordingMsg) {
      recorderRef.current?.stop();
      setIsRecordingMsg(false);
    } else {
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
      } catch { toast.error('Sem mic.'); }
    }
  };

  const playMsgAudio = (b64: string, senderId?: string) => {
    const a = new Audio(b64);
    if (senderId) {
      setParticipants(prev => prev.map(p => p.id === senderId ? { ...p, playingAudio: true, hasUnplayedAudio: false } : p));
      a.onended = () => setParticipants(prev => prev.map(p => p.id === senderId ? { ...p, playingAudio: false } : p));
    }
    a.play();
  };

  /* ── Feed Handlers (Same as before) ── */
  const audioFeedRef = useRef<HTMLAudioElement | null>(null);
  const [playingFeedId, setPlayingFeedId] = useState<number | null>(null);
  const handlePlayFeedAudio = (d: any) => {
    if (playingFeedId === d.id) { audioFeedRef.current?.pause(); setPlayingFeedId(null); return; }
    audioFeedRef.current?.pause();
    const a = new Audio(d.audioData); a.onended = () => setPlayingFeedId(null); a.play(); audioFeedRef.current = a; setPlayingFeedId(d.id);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12" onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}>
      
      {/* ── Visual Overlays ── */}
      <AnimatePresence>
        {heartParticles.map(p => (
          <motion.span key={p.id} initial={{ x: p.startX, y: p.startY, opacity: 1 }} animate={{ x: p.startX + (Math.random()-0.5)*150, y: p.startY - 150, opacity: 0 }} transition={{ duration: 1.5 }} className="fixed pointer-events-none select-none text-2xl z-[9999]" style={{ left: 0, top: 0 }}>❤️</motion.span>
        ))}
        {scorePopups.map(p => (
          <motion.div key={p.id} initial={{ x: p.x, y: p.y, opacity: 1 }} animate={{ y: p.y - 60, opacity: 0 }} transition={{ duration: 1.2 }} className="fixed pointer-events-none select-none z-[9998] font-black text-pink-400 text-sm" style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}>+1 ❤️</motion.div>
        ))}
        {petals.map(id => <Petal key={id} id={id} onDone={() => setPetals(v => v.filter(x => x !== id))} />)}
        {activeAffirmation && <FloatingAffirmation key={activeAffirmation.id} id={activeAffirmation.id} text={activeAffirmation.text} onDone={() => setActiveAffirmation(null)} />}
      </AnimatePresence>

      <div className="bg-white/60 shadow-xl backdrop-blur-xl rounded-[2.5rem] p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-[var(--texto-escuro)]">Voz & <span className="text-[var(--rosa-forte)]">Acolhimento</span></h1>
          <div className="flex bg-white/20 p-1 rounded-2xl border border-white/40 shadow-inner">
            <button onClick={() => setActiveTab('podcast')} className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'podcast' ? 'bg-white text-[var(--rosa-forte)] shadow' : 'text-gray-400'}`}>Sala Interativa</button>
            <button onClick={() => setActiveTab('desabafos')} className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'desabafos' ? 'bg-white text-[var(--rosa-forte)] shadow' : 'text-gray-400'}`}>Mural das Mães</button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'podcast' ? (
          <motion.div key="social" className="relative group">
            
            {/* Ambient Soundscape Toggle */}
            <button onClick={toggleAmbientMusic} className={`absolute -top-4 -right-4 z-[90] w-12 h-12 rounded-full flex items-center justify-center transition-all ${isAmbientAudioActive ? 'bg-pink-500 text-white shadow-pink-500/40 shadow-xl scale-110' : 'bg-white shadow-lg text-gray-300'}`}>
               <Music size={20} className={isAmbientAudioActive ? 'animate-pulse' : ''} />
            </button>

            <div className="bg-[#0f0610] rounded-[3rem] overflow-hidden shadow-2xl border border-[var(--rosa-forte)]/20 relative">
              
              {/* Garden Indicators */}
              <div className="absolute bottom-40 left-0 w-full flex justify-center gap-3 opacity-30 pointer-events-none z-10">
                {participants.length > 0 && Array.from({ length: Math.min(participants.length, 8) }).map((_, i) => (
                  <motion.div key={i} animate={{ y: [0, -4, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 + i }} className="text-2xl">🌷</motion.div>
                ))}
              </div>

              <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center text-white/50 text-[10px] font-black tracking-widest uppercase">
                <div className="flex items-center gap-2"><Sparkles size={12} className="text-yellow-400" /> Sala de Acolhimento</div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5"><Users size={12} /> {participants.length} PRESENTES</div>
                </div>
              </div>

              <div className={`relative w-full overflow-hidden transition-all ${hasJoinedLive ? 'h-[440px]' : 'h-72'} bg-gradient-to-b from-[#1a0b14] to-black`}>
                
                {/* Fireflies background */}
                {hasJoinedLive && Array.from({ length: 12 }).map((_, i) => <Firefly key={i} mousePos={mousePos} />)}

                {!hasJoinedLive ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <span className="text-6xl animate-pulse">🌙</span>
                    <button onClick={joinSocialRoom} className="px-12 py-5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black rounded-3xl shadow-2xl shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all">
                      Abrir Sala Social
                    </button>
                    <p className="text-white/20 text-[10px] uppercase font-bold text-center tracking-widest">Conecte-se com outras mães no silêncio da noite</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {participants.map((p, i) => (
                      <FloatingBubble key={p.id} participant={p} index={i} total={participants.length}
                        isSelected={selectedTargetId === p.id} isReceivingHeart={receivingHeartId === p.id}
                        isHugging={isHugging} onClick={() => handleSelectParticipant(p)} onBubbleRef={handleBubbleRef} />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {hasJoinedLive && (
                <div className="bg-black/50 backdrop-blur-3xl border-t border-white/5 p-4 flex flex-col gap-4">
                  
                  {/* Quick Actions (Petals, Hug, Mood) */}
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex gap-2">
                       <button onClick={sendGroupHug} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-[10px] font-black uppercase flex items-center gap-2 transition-all">
                          <Users size={12} /> Abraço Coletivo
                       </button>
                       <button onClick={sendPetalRain} className="px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 rounded-full text-[10px] font-black uppercase flex items-center gap-2 transition-all">
                          <Leaf size={12} /> Chuva de Pétalas
                       </button>
                    </div>
                    {/* Mood Picker */}
                    <div className="flex gap-1.5 p-1.5 bg-white/5 rounded-full border border-white/5">
                       {moodEmojis.slice(0, 5).map(m => (
                          <button key={m} onClick={() => updateMyMood(m)} className="w-8 h-8 flex items-center justify-center hover:scale-125 transition-all grayscale-[0.5] hover:grayscale-0">{m}</button>
                       ))}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div ref={chatRef} className="flex-1 h-36 overflow-y-auto px-4 py-2 bg-black/30 rounded-3xl space-y-2 border border-white/5">
                       {chatMessages.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-10 text-[10px] font-black uppercase"><p>Sussurros de Apoio</p></div>}
                       {chatMessages.map(m => (
                         <div key={m.id} className="text-xs text-white/60 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-pink-400/80 font-bold shrink-0">{m.name}:</span>
                            {m.text && <span>{m.text}</span>}
                            {m.audio && (
                               <button onClick={() => playMsgAudio(m.audio!, m.id)} className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/20 rounded-full text-pink-300 hover:bg-pink-500/30 transition-all">
                                 <Play size={10} fill="currentColor" /> <span className="text-[9px] font-black uppercase">Ouvir</span>
                               </button>
                            )}
                         </div>
                       ))}
                    </div>
                    <div className="flex flex-col gap-2">
                       <button onClick={toggleRecording} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isRecordingMsg ? 'bg-red-500 animate-pulse text-white' : 'bg-pink-500 text-white shadow-lg shadow-pink-500/30 hover:scale-105'}`}>
                          {isRecordingMsg ? <StopCircle size={24} /> : <Mic size={24} />}
                       </button>
                       <button onClick={handleSendHeart} disabled={!selectedTargetId || heartsSent.has(selectedTargetId)} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${selectedTargetId && !heartsSent.has(selectedTargetId) ? 'bg-white text-pink-500 shadow-xl' : 'bg-white/5 opacity-10'}`}>
                          {heartsSent.has(selectedTargetId) ? '✔️' : <Heart size={24} fill="currentColor" />}
                       </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                     <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Digite um acolhimento..." className="flex-1 bg-white/5 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:bg-white/10 border border-white/5 transition-all" />
                     <button onClick={handleSendMessage} className="px-6 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all font-black text-xs uppercase">Enviar</button>
                     <button onClick={leaveSocialRoom} className="p-3 text-white/10 hover:text-red-500 transition-colors"><PhoneOff size={18} /></button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Mural Tab */
          <div className="space-y-5">
             <div className="p-8 bg-white/80 rounded-[3rem] shadow-xl border border-pink-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 mb-4"><Mic size={28} /></div>
                <h2 className="text-xl font-black text-gray-800 italic">Mural de Voz</h2>
                <p className="text-xs text-gray-400 mt-2 max-w-xs">Grave um desabafo duradouro ou uma palavra de força para outras mães.</p>
             </div>
             {desabafos.map(d => (
              <div key={d.id} className="bg-white p-5 rounded-[2.5rem] shadow-md border border-gray-50 flex flex-col gap-4">
                <div className="flex justify-between items-center"><span className="font-bold text-sm text-pink-600">Mãe {d.author}</span><span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{d.time}</span></div>
                <button onClick={() => handlePlayFeedAudio(d)} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black transition-all ${playingFeedId === d.id ? 'bg-pink-500 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                   {playingFeedId === d.id ? <Pause size={18} fill="white" /> : <Play size={18} fill="currentColor" />}
                   OUVIR DESABAFO
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleApoiar(d.id)} className={`flex-1 py-2.5 rounded-xl border text-[10px] font-black transition-all ${d.hasLiked ? 'bg-pink-500 text-white border-pink-500' : 'text-pink-500 border-pink-100 hover:bg-pink-50'}`}>APOIAR {d.likes > 0 && `(${d.likes})`}</button>
                  {d.isUserAuthor && <button onClick={() => handleDeleteDesabafo(d.id)} className="px-4 py-2 bg-red-50 text-red-400 rounded-xl"><Trash2 size={14} /></button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RadioDasMaes;
