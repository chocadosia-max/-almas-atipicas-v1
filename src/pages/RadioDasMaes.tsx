import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Headphones, Mic, StopCircle, Send, Trash2, Heart, Share2, Volume2,
  Loader2, MessageSquarePlus, Radio, Info, PhoneCall, PhoneOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";

/* ─── IndexedDB ─── */
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

/* ─── Floating heart particle (fixed viewport) ─── */
const HeartParticle = ({ startX, startY, id, onDone }: {
  startX: number; startY: number; id: number; onDone: () => void;
}) => {
  const vx = (Math.random() - 0.5) * 140;
  const vy = -(Math.random() * 180 + 60);
  const dur = 1.4 + Math.random() * 0.8;
  const size = ['text-xl', 'text-2xl', 'text-3xl'][Math.floor(Math.random() * 3)];
  useEffect(() => { const t = setTimeout(onDone, (dur + 0.3) * 1000); return () => clearTimeout(t); }, []); // eslint-disable-line
  return (
    <motion.span
      initial={{ x: startX, y: startY, opacity: 1, scale: 1.4, rotate: 0 }}
      animate={{ x: startX + vx, y: startY + vy, opacity: 0, scale: 0.3, rotate: (Math.random() - 0.5) * 60 }}
      transition={{ duration: dur, ease: [0.15, 0.85, 0.35, 1] }}
      className={`fixed pointer-events-none select-none ${size} z-[9999]`}
      style={{ left: 0, top: 0 }}
    >❤️</motion.span>
  );
};

/* ─── Score popup ("+1 ❤️" floating up) ─── */
const ScorePopup = ({ x, y, id, onDone }: { x: number; y: number; id: number; onDone: () => void }) => {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }, []); // eslint-disable-line
  return (
    <motion.div
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{ x, y: y - 55, opacity: 0, scale: 1.4 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="fixed pointer-events-none select-none z-[9998] font-black text-pink-400 text-base drop-shadow-lg"
      style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}
    >+1 ❤️</motion.div>
  );
};

/* ─── Participant bubble ─── */
// Grows with hearts received, capped at scale 1.6
const MAX_BUBBLE_SCALE = 1.6;
const BASE_BUBBLE_SIZE = 56; // px (w-14 h-14)

const FloatingBubble = ({
  participant, index, total, isSelected, isReceivingHeart, onClick, onBubbleRef
}: {
  participant: any; index: number; total: number;
  isSelected: boolean; isReceivingHeart: boolean;
  onClick: () => void; onBubbleRef: (id: any, el: HTMLDivElement | null) => void;
}) => {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const cx = 50 + Math.cos(angle) * 32;
  const cy = 45 + Math.sin(angle) * 22;

  // Scale grows with hearts, capped
  const heartScale = Math.min(1 + (participant.hearts || 0) * 0.08, MAX_BUBBLE_SCALE);
  const bubblePx = Math.round(BASE_BUBBLE_SIZE * heartScale);

  return (
    <motion.div
      ref={el => onBubbleRef(participant.id, el)}
      initial={{ scale: 0, opacity: 0 }}
      animate={isReceivingHeart
        ? { scale: [heartScale, heartScale * 1.3, heartScale * 0.9, heartScale * 1.1, heartScale], opacity: 1, y: [0, -12, 0] }
        : { scale: heartScale, opacity: 1, y: [0, -8, 0, 7, 0], x: [0, 3, 0, -3, 0] }}
      exit={{ scale: 0, opacity: 0 }}
      transition={isReceivingHeart
        ? { duration: 0.6, ease: 'easeInOut' }
        : {
          scale: { type: 'spring', stiffness: 220, damping: 18 },
          opacity: { duration: 0.3 },
          y: { duration: 4.5 + index * 0.6, repeat: Infinity, ease: 'easeInOut' },
          x: { duration: 3.8 + index * 0.45, repeat: Infinity, ease: 'easeInOut' },
        }}
      className="absolute flex flex-col items-center gap-1.5 cursor-pointer"
      style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)' }}
      onClick={onClick}
    >
      {/* Selected ring */}
      {isSelected && !participant.isMe && (
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute rounded-full border-2 border-pink-400"
          style={{ width: bubblePx + 16, height: bubblePx + 16, top: -(8), left: -(8) }}
        />
      )}
      {/* Speaking pulse */}
      {participant.speaking && (
        <motion.div
          animate={{ scale: [1, 1.9, 1], opacity: [0.45, 0, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          className="absolute rounded-full"
          style={{ width: bubblePx + 16, height: bubblePx + 16, top: -8, left: -8, background: 'radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)' }}
        />
      )}
      {/* Heart burst animation ring */}
      {isReceivingHeart && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.55 }}
          className="absolute rounded-full bg-pink-400/30"
          style={{ width: bubblePx, height: bubblePx }}
        />
      )}

      {/* Main circle — size grows with hearts */}
      <motion.div
        animate={{ width: bubblePx, height: bubblePx }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="rounded-full bg-gradient-to-br from-pink-300/80 to-rose-500/60 flex items-center justify-center shadow-2xl border-4 border-white/30 ring-2 ring-pink-400/20 overflow-hidden"
        style={{ fontSize: Math.round(bubblePx * 0.42) }}
      >
        {participant.emoji}
      </motion.div>

      {/* Name */}
      <span className="text-[9px] font-black text-white/80 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full truncate max-w-[78px]">
        {participant.isMe ? `${participant.name} (você)` : participant.name}
      </span>

      {/* Heart counter badge */}
      {(participant.hearts || 0) > 0 && (
        <motion.span
          key={participant.hearts}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[9px] font-black text-white bg-[var(--rosa-forte)] px-1.5 py-0.5 rounded-full -mt-1 shadow"
        >
          {participant.hearts} ❤️
        </motion.span>
      )}

      {/* Select label */}
      {!participant.isMe && isSelected && (
        <motion.span
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[8px] font-black text-pink-300 uppercase tracking-widest -mt-0.5"
        >selecionada</motion.span>
      )}
    </motion.div>
  );
};

/* ══════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════ */
const RadioDasMaes = () => {
  const [activeTab, setActiveTab] = useState<'podcast' | 'desabafos'>('podcast');
  const [desabafos, setDesabafos] = useState<any[]>([]);

  useEffect(() => {
    getDesabafosFromDB().then(data => {
      if (data && data.length > 0) { data.sort((a, b) => b.id - a.id); setDesabafos(data); }
      else {
        const saved = localStorage.getItem('almas_desabafos_2');
        if (saved) { try { const p = JSON.parse(saved); setDesabafos(p); p.forEach((i: any) => saveDesabafoToDB(i)); } catch {} }
      }
    });
  }, []);

  /* ── Live Room ── */
  const [hasJoinedLive, setHasJoinedLive] = useState(false);
  const [isJoiningLive, setIsJoiningLive] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<any>(null);
  const [heartParticles, setHeartParticles] = useState<any[]>([]);
  const [scorePopups, setScorePopups] = useState<any[]>([]);
  const [receivingHeartId, setReceivingHeartId] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ id: number; name: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const bubbleRefsMap = useRef<Map<any, HTMLDivElement>>(new Map());
  const heartBtnRef = useRef<HTMLButtonElement>(null);

  const [myName] = useState(() => {
    try { const p = localStorage.getItem('almas_empreendedora_profile'); return p ? JSON.parse(p).nomeEmpreendedora || 'Mãe' : 'Mãe'; } catch { return 'Mãe'; }
  });
  const [myEmoji] = useState(() => avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)]);

  const handleBubbleRef = useCallback((id: any, el: HTMLDivElement | null) => {
    if (el) bubbleRefsMap.current.set(id, el);
    else bubbleRefsMap.current.delete(id);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  /* ── Mic analyser ── */
  const startMicAnalyser = (stream: MediaStream) => {
    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setMicLevel(avg);
        setParticipants(prev => prev.map(p => p.isMe ? { ...p, speaking: avg > 10 } : p));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}
  };

  const handleJoinLiveRoom = async () => {
    setIsJoiningLive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setMicActive(true);
      startMicAnalyser(stream);
      setParticipants([{ id: 0, name: myName, emoji: myEmoji, speaking: false, isMe: true, hearts: 0 }]);
      setHasJoinedLive(true);
      toast.success('🎙️ Microfone ativo! Bem-vinda à Sala de Apoio!');
    } catch (err: any) {
      console.error('Mic error:', err);
      toast.error('Não foi possível acessar o microfone. Verifique as permissões.');
    }
    setIsJoiningLive(false);
  };

  const handleLeaveLiveRoom = () => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setMicActive(false);
    setMicLevel(0);
    setHasJoinedLive(false);
    setParticipants([]);
    setSelectedTargetId(null);
    setHeartParticles([]);
    setScorePopups([]);
    setChatMessages([]);
    toast.success('Você saiu da sala. Até logo! 🌸');
  };

  /* ── Select participant by clicking bubble ── */
  const handleSelectParticipant = (p: any) => {
    if (p.isMe) { toast.info('Você não pode enviar coração para si mesma! 😄'); return; }
    setSelectedTargetId(prev => prev === p.id ? null : p.id);
    toast.success(`${p.name} selecionada para receber ❤️`);
  };

  /* ── Send heart ── */
  const handleSendHeart = () => {
    const target = participants.find(p => p.id === selectedTargetId);
    if (!target) { toast.info('Clique na bolha de uma mãe para escolher quem receberá o ❤️'); return; }

    // Get target bubble position for particles
    const targetEl = bubbleRefsMap.current.get(target.id);
    let originX = window.innerWidth / 2;
    let originY = window.innerHeight / 2;
    if (targetEl) {
      const r = targetEl.getBoundingClientRect();
      originX = r.left + r.width / 2;
      originY = r.top + r.height / 2;
    }

    // Spawn heart particles bursting from target bubble
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      startX: originX + (Math.random() - 0.5) * 30,
      startY: originY + (Math.random() - 0.5) * 20,
    }));
    setHeartParticles(prev => [...prev, ...newParticles]);

    // Score popup
    setScorePopups(prev => [...prev, { id: Date.now() + 500, x: originX, y: originY - 20 }]);

    // Bubble receives heart animation
    setReceivingHeartId(target.id);
    setTimeout(() => setReceivingHeartId(null), 700);

    // Update heart count (capped at 20 for display)
    setParticipants(prev => prev.map(p =>
      p.id === target.id ? { ...p, hearts: Math.min((p.hearts || 0) + 1, 20) } : p
    ));

    toast.success(`❤️ enviado para ${target.name}!`);
  };

  const removeHeartParticle = useCallback((id: number) => {
    setHeartParticles(prev => prev.filter(p => p.id !== id));
  }, []);
  const removeScorePopup = useCallback((id: number) => {
    setScorePopups(prev => prev.filter(p => p.id !== id));
  }, []);

  /* ── Send chat message ── */
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now(), name: myName, text: chatInput.trim() }]);
    setChatInput('');
  };

  /* ── Recorder ── */
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [playingFeedId, setPlayingFeedId] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioFeedRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timer: any;
    if (isRecording) { timer = setInterval(() => setRecordingTime(t => t + 1), 1000); }
    else { setRecordingTime(0); }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const startRecording = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(s);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => { setAudioBlob(new Blob(chunksRef.current, { type: 'audio/webm' })); s.getTracks().forEach(t => t.stop()); };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info('Microfone ativado!');
    } catch { toast.error('Não foi possível acessar o microfone.'); }
  };

  const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); } };

  const handlePostAudio = () => {
    if (!audioBlob) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const newD = { id: Date.now(), author: myName || 'Você', city: 'Seguro', content: '', likes: 0, time: 'Agora mesmo', duration: formatTime(recordingTime), isNew: true, audioData: reader.result as string, isUserAuthor: true };
      try { await saveDesabafoToDB(newD); setDesabafos([newD, ...desabafos]); setIsUploading(false); setAudioBlob(null); toast.success('Seu desabafo foi postado!'); }
      catch { setIsUploading(false); toast.error('Erro ao salvar!'); }
    };
  };

  const handlePlayFeedAudio = (d: any) => {
    if (playingFeedId === d.id) { audioFeedRef.current?.pause(); setPlayingFeedId(null); return; }
    audioFeedRef.current?.pause();
    if (d.audioData) {
      const a = new Audio(d.audioData); a.onended = () => setPlayingFeedId(null); a.play(); audioFeedRef.current = a; setPlayingFeedId(d.id);
    } else { toast.error('Áudio não encontrado.'); }
  };

  const handleDeleteDesabafo = async (id: number) => {
    if (playingFeedId === id) { audioFeedRef.current?.pause(); setPlayingFeedId(null); }
    await deleteDesabafoFromDB(id); setDesabafos(prev => prev.filter(d => d.id !== id));
    toast.success('Deletado.');
  };

  const handleApoiar = (id: number) => {
    setDesabafos(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (d.hasLiked) { toast.info('Já apoiou esta mãe.'); return d; }
      toast.success('Abraço de apoio enviado! 🫂');
      const novo = { ...d, likes: (d.likes || 0) + 1, hasLiked: true };
      saveDesabafoToDB(novo); return novo;
    }));
  };

  /* ══ RENDER ══ */
  return (
    <div className="max-w-6xl mx-auto pb-12">

      {/* ── Heart particles (fixed viewport) ── */}
      <AnimatePresence>
        {heartParticles.map(p => (
          <HeartParticle key={p.id} id={p.id} startX={p.startX} startY={p.startY} onDone={() => removeHeartParticle(p.id)} />
        ))}
        {scorePopups.map(p => (
          <ScorePopup key={p.id} id={p.id} x={p.x} y={p.y} onDone={() => removeScorePopup(p.id)} />
        ))}
      </AnimatePresence>

      {/* Header tabs */}
      <div className="bg-white/65 shadow-xl backdrop-blur-[12px] rounded-[2.5rem] border border-white/60 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--texto-escuro)] tracking-tight">
              Voz & <span className="text-[var(--rosa-forte)]">Acolhimento</span>
            </h1>
            <p className="text-[var(--texto-medio)] font-medium text-sm mt-1">Chamada ao vivo e desabafos em tempo real.</p>
          </div>
          <div className="flex bg-[var(--ativo-bg)] p-1.5 rounded-2xl border border-[var(--rosa-medio)]/20 shadow-inner">
            <button onClick={() => setActiveTab('podcast')} className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'podcast' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'}`}>
              <Headphones size={16} /> Sala ao Vivo
            </button>
            <button onClick={() => setActiveTab('desabafos')} className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'desabafos' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'}`}>
              <Mic size={16} /> Voz das Mães
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'podcast' ? (
          <motion.div key="podcast" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}>

            {/* ══ LIVE ROOM ══ */}
            <div className="bg-[#0f0610] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[var(--rosa-forte)]/20">

              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 rounded-full text-[10px] font-black text-white">
                    <Radio size={11} /> AO VIVO
                  </motion.span>
                  <span className="text-white/60 font-serif italic">Sala de Apoio</span>
                </div>
                {hasJoinedLive && (
                  <div className="flex items-center gap-4">
                    {micActive && (
                      <div className="flex items-center gap-1.5">
                        <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                        <div className="flex items-end gap-px h-3">
                          {[0.3, 0.6, 1, 0.7, 0.4].map((b, i) => (
                            <motion.div key={i}
                              animate={{ height: [`${b * 3 + 2}px`, `${Math.min(b * (micLevel / 15 + 1), 12)}px`, `${b * 3 + 2}px`] }}
                              transition={{ duration: 0.18, repeat: Infinity }}
                              className="w-1 bg-green-400 rounded-full" />
                          ))}
                        </div>
                        <span className="text-[9px] font-black text-green-400">MIC</span>
                      </div>
                    )}
                    <span className="text-[10px] text-white/30 font-black">{participants.length} na sala</span>
                  </div>
                )}
              </div>

              {/* Stage — bubbles only */}
              <div className={`relative w-full overflow-hidden transition-all duration-500 ${hasJoinedLive ? 'h-80' : 'h-64'} bg-gradient-to-b from-[#1a0b14] via-[#100810] to-[#060308]`}>
                {/* Ambient glow reacts to mic */}
                <motion.div
                  animate={{ opacity: hasJoinedLive ? 0.14 + (micLevel / 255) * 0.38 : 0.07, scale: 1 + (micLevel / 255) * 0.25 }}
                  transition={{ duration: 0.12 }}
                  className="absolute w-full h-full pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(236,72,153,0.3), transparent 65%)' }}
                />
                {/* Stars */}
                {[...Array(16)].map((_, i) => (
                  <motion.div key={i}
                    animate={{ opacity: [0.1, 0.55, 0.1] }}
                    transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.18 }}
                    className="absolute w-1 h-1 rounded-full bg-white/40"
                    style={{ left: `${(i * 19 + 4) % 94}%`, top: `${(i * 27 + 8) % 82}%` }}
                  />
                ))}

                {!hasJoinedLive ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-6xl">🎙️</motion.span>
                    <p className="text-white/25 text-xs font-bold tracking-[0.25em] uppercase text-center px-8">Entre na sala e clique nas bolhas para enviar ❤️</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {participants.map((p, i) => (
                      <FloatingBubble
                        key={p.id} participant={p} index={i} total={participants.length}
                        isSelected={selectedTargetId === p.id}
                        isReceivingHeart={receivingHeartId === p.id}
                        onClick={() => handleSelectParticipant(p)}
                        onBubbleRef={handleBubbleRef}
                      />
                    ))}
                  </AnimatePresence>
                )}

                {/* Hint overlay when joined but no target selected */}
                {hasJoinedLive && !selectedTargetId && participants.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-white/30 font-bold backdrop-blur-sm bg-black/20 px-4 py-1.5 rounded-full whitespace-nowrap"
                  >
                    👆 Clique em uma bolha para selecionar · depois ❤️
                  </motion.div>
                )}
              </div>

              {/* Chat + heart controls (visible when joined) */}
              <AnimatePresence>
                {hasJoinedLive && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>

                    {/* Chat messages */}
                    <div ref={chatRef} className="h-28 overflow-y-auto px-5 pt-3 pb-1 bg-black/25 space-y-1.5">
                      {chatMessages.length === 0 ? (
                        <p className="text-white/20 text-xs italic text-center mt-4">Nenhuma mensagem ainda...</p>
                      ) : chatMessages.map(m => (
                        <div key={m.id} className="flex items-baseline gap-2">
                          <span className="text-[10px] font-black text-pink-400 shrink-0">{m.name}:</span>
                          <span className="text-xs text-white/70">{m.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Input bar */}
                    <div className="px-4 py-3 bg-black/30 border-t border-white/5 flex items-center gap-2.5">
                      <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        maxLength={120}
                        placeholder="Envie uma mensagem para a sala..."
                        className="flex-1 bg-white/8 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 outline-none focus:bg-white/12 focus:border-pink-500/40 transition-all"
                      />
                      {/* Send message */}
                      <button onClick={handleSendMessage} disabled={!chatInput.trim()}
                        className="w-10 h-10 rounded-2xl bg-white/10 text-white/60 flex items-center justify-center disabled:opacity-25 hover:bg-white/20 active:scale-90 transition-all">
                        <Send size={15} />
                      </button>
                      {/* ❤️ Send heart to selected */}
                      <button ref={heartBtnRef} onClick={handleSendHeart}
                        title={selectedTargetId ? 'Enviar ❤️' : 'Clique em uma bolha primeiro'}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all active:scale-90 ${selectedTargetId ? 'bg-pink-500 shadow-lg shadow-pink-500/30 hover:bg-pink-400 hover:scale-110' : 'bg-white/10 opacity-40 cursor-not-allowed'}`}>
                        ❤️
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer controls */}
              <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-t border-white/5">
                {hasJoinedLive ? (
                  <button onClick={handleLeaveLiveRoom}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all border border-red-500/20">
                    <PhoneOff size={16} /> Sair da Chamada
                  </button>
                ) : (
                  <button onClick={handleJoinLiveRoom} disabled={isJoiningLive}
                    className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[var(--rosa-forte)] to-rose-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-2xl shadow-pink-700/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                    {isJoiningLive ? <Loader2 size={20} className="animate-spin" /> : <PhoneCall size={20} />}
                    {isJoiningLive ? 'Conectando...' : 'Entrar em Chamada'}
                  </button>
                )}
                <span className="text-[10px] text-white/20 font-bold italic">
                  {hasJoinedLive ? '❤️ clique na bolha · depois envie ❤️' : '🎙️ voz apenas · sem câmera'}
                </span>
              </div>
            </div>

            {/* How it works */}
            {!hasJoinedLive && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="mt-6 bg-gradient-to-br from-[#1A0B10] to-[#2d0a1a] rounded-[2.5rem] p-7 shadow-2xl border border-[var(--rosa-forte)]/15">
                <h3 className="text-white font-serif italic text-xl mb-5">🌸 Como funciona a Sala</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { icon: '🎙️', title: 'Voz Real', desc: 'Seu microfone é capturado pelo navegador. A bolha pulsa quando você fala.' },
                    { icon: '❤️', title: 'Enviar Coração', desc: 'Clique na bolha da mãe que quer apoiar, depois clique em ❤️. A bolha dela cresce a cada coração recebido!' },
                    { icon: '📈', title: 'Crescimento', desc: 'Quanto mais corações uma mãe receber, maior a bolhinha dela fica na sala. Máximo de crescimento para não poluir a tela.' },
                    { icon: '✨', title: 'Ambiente Vivo', desc: 'Brilho rosa reage à sua voz. Estrelas decoram o fundo. Cada sessão é única e especial.' },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07 }}
                      className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <div className="text-white font-black text-sm mb-0.5">{item.title}</div>
                        <div className="text-white/40 text-xs leading-relaxed">{item.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </motion.div>
        ) : (
          /* ══ DESABAFOS TAB ══ */
          <motion.div key="desabafos" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <div className="bg-white/80 shadow-2xl backdrop-blur-md rounded-[2.5rem] border-2 border-[var(--rosa-forte)]/20 p-8 sticky top-24">
                <div className="text-center mb-7">
                  <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-5">
                    <Mic className="text-[var(--rosa-forte)]" size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-[var(--texto-escuro)] mb-2 italic">Seu Desabafo Real</h2>
                  <p className="text-[var(--texto-medio)] font-medium text-sm">Gravando diretamente do seu microfone.</p>
                </div>
                <div className="bg-[#4B1528] rounded-3xl p-8 mb-6 relative flex items-center justify-center min-h-[160px] overflow-hidden">
                  {isRecording ? (
                    <div className="flex items-center gap-1.5 h-12">
                      {[...Array(14)].map((_, i) => (
                        <motion.div key={i} animate={{ height: [8, Math.random() * 44 + 8, 8] }} transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.04 }} className="w-1.5 bg-[var(--rosa-claro)] rounded-full" />
                      ))}
                    </div>
                  ) : audioBlob ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-white text-center">
                      <Volume2 size={44} className="mx-auto mb-3 text-green-400" />
                      <span className="font-black">Áudio Capturado</span>
                      <p className="text-[10px] opacity-50 mt-1">Pronto para postar</p>
                    </motion.div>
                  ) : (
                    <div className="text-white/20 font-black text-xs uppercase tracking-[0.25em]">Microfone Pronto</div>
                  )}
                  {isRecording && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-red-500 rounded-full text-white text-[10px] font-black uppercase animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" /> AO VIVO {formatTime(recordingTime)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {!audioBlob ? (
                    <button onClick={isRecording ? stopRecording : startRecording}
                      className={`w-full py-5 rounded-[2rem] font-black text-base transition-all flex items-center justify-center gap-3 shadow-xl ${isRecording ? 'bg-white text-red-500 border-2 border-red-500 animate-pulse' : 'bg-[var(--rosa-forte)] text-white hover:bg-[#b04066]'}`}>
                      {isRecording ? <><StopCircle size={22} /> PARAR E SALVAR</> : <><Mic size={22} /> INICIAR GRAVAÇÃO</>}
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => setAudioBlob(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2 border border-gray-200">
                        <Trash2 size={16} /> Apagar
                      </button>
                      <button onClick={handlePostAudio} disabled={isUploading} className="flex-[2] py-4 rounded-2xl bg-[var(--rosa-forte)] text-white font-black shadow-lg hover:bg-[#b04066] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {isUploading ? <><Loader2 size={16} className="animate-spin" /> POSTANDO...</> : <><Send size={16} /> PUBLICAR DESABAFO</>}
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-5 p-4 bg-pink-50 border border-pink-100 rounded-2xl flex gap-3 text-xs text-[var(--rosa-forte)] font-bold">
                  <Info size={18} className="shrink-0" /> Sua gravação é privada até que você clique em publicar.
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-5">
              <div className="p-6 bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)] rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-xl font-black mb-1 flex items-center gap-3"><MessageSquarePlus size={20} /> Ouvindo o Coração</h2>
                  <p className="text-sm font-bold opacity-80">Aqui você nunca está sozinha.</p>
                </div>
                <Radio className="absolute -right-8 -bottom-8 size-36 opacity-10 rotate-12" />
              </div>
              {desabafos.length === 0 ? (
                <div className="text-center p-10 bg-white/50 rounded-[2rem] border border-white/50 text-[var(--texto-medio)] font-bold">
                  Nenhum desabafo ainda. Seja a primeira!
                </div>
              ) : desabafos.map(d => (
                <motion.div key={d.id} layout initial={d.isNew ? { opacity: 0, scale: 0.9, y: -20 } : false} animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`bg-white/90 shadow-xl rounded-[2rem] border p-5 hover:shadow-2xl transition-all ${d.isNew ? 'border-[var(--rosa-forte)]/40 ring-2 ring-[var(--rosa-forte)]/10' : 'border-white'}`}>
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center font-black text-[var(--rosa-forte)] border-2 border-white shadow-sm shrink-0">{d.author[0]}</div>
                    <div>
                      <h4 className="font-bold text-[var(--texto-escuro)] text-sm flex items-center gap-2">{d.author}{d.isNew && <span className="bg-[var(--rosa-forte)] text-white text-[8px] px-2 py-0.5 rounded-full">NOVO</span>}</h4>
                      <p className="text-[10px] text-[var(--texto-claro)] uppercase font-black">{d.city} • {d.time}</p>
                    </div>
                  </div>
                  <div onClick={() => handlePlayFeedAudio(d)} className={`bg-[var(--ativo-bg)] rounded-2xl p-3 flex items-center gap-3 cursor-pointer mb-4 transition-colors ${playingFeedId === d.id ? 'bg-pink-100 ring-2 ring-[var(--rosa-forte)]/50' : 'hover:bg-pink-50'}`}>
                    <button className={`w-10 h-10 ${playingFeedId === d.id ? 'bg-white text-[var(--rosa-forte)]' : 'bg-[var(--rosa-forte)] text-white'} rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
                      {playingFeedId === d.id
                        ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                    </button>
                    <div className="flex-1">
                      <div className="h-1 bg-white/60 rounded-full overflow-hidden">
                        <motion.div animate={{ width: playingFeedId === d.id ? ['0%','100%'] : '0%' }} transition={{ duration: 60, ease: 'linear' }} className="h-full bg-[var(--rosa-forte)]" />
                      </div>
                      <div className="flex justify-between text-[9px] font-black text-[var(--texto-claro)] uppercase mt-1">
                        <span className={playingFeedId === d.id ? 'text-[var(--rosa-forte)] animate-pulse' : ''}>{playingFeedId === d.id ? 'TOCANDO...' : '00:00'}</span>
                        <span>{d.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApoiar(d.id)} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black transition-all active:scale-95 ${d.hasLiked ? 'bg-[var(--rosa-forte)] text-white border-[var(--rosa-forte)]' : 'bg-white border-pink-100 text-[var(--rosa-forte)] hover:bg-pink-50'}`}>
                      <Heart size={14} fill={d.hasLiked ? 'currentColor' : 'none'} /> {d.hasLiked ? 'APOIADA' : 'APOIAR'} {d.likes > 0 && `(${d.likes})`}
                    </button>
                    {d.isUserAuthor ? (
                      <button onClick={() => handleDeleteDesabafo(d.id)} className="flex-1 py-3 rounded-xl bg-white border border-red-100 flex items-center justify-center gap-2 text-xs font-black text-red-500 hover:bg-red-50 transition-all active:scale-95">
                        <Trash2 size={14} /> EXCLUIR
                      </button>
                    ) : (
                      <button onClick={() => toast.success('Link copiado!')} className="flex-1 py-3 rounded-xl bg-white border border-pink-100 flex items-center justify-center gap-2 text-xs font-black text-[var(--texto-claro)] hover:bg-gray-50 transition-all active:scale-95">
                        <Share2 size={14} /> ENVIAR
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RadioDasMaes;
