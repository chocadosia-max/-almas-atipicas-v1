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

/* ─── Viewport Petal (fixed, flies across entire screen) ─── */
const ViewportPetal = ({ startX, startY, id, onDone }: { startX: number; startY: number; id: number; onDone: () => void }) => {
  const vx = (Math.random() - 0.5) * 600;
  const vy = -(Math.random() * 450 + 120);
  const rotate = Math.random() * 900 - 450;
  const dur = 3.5 + Math.random() * 1.5;

  useEffect(() => {
    const t = setTimeout(onDone, (dur + 0.5) * 1000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  return (
    <motion.span
      key={id}
      initial={{ x: startX, y: startY, opacity: 0.95, scale: 2.2, rotate: 0 }}
      animate={{ x: startX + vx, y: startY + vy, opacity: 0, scale: 0.3, rotate }}
      transition={{ duration: dur, ease: [0.2, 0.8, 0.4, 1] }}
      className="fixed pointer-events-none select-none text-5xl z-[9999]"
      style={{ left: 0, top: 0 }}
    >🌸</motion.span>
  );
};

/* ─── Rose Message — floats on stage overlay ─── */
const RoseMessage = ({
  msg, onExpire, onExplode
}: { msg: any; onExpire: () => void; onExplode: (x: number, y: number) => void }) => {
  const [exploded, setExploded] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(doExplode, 120_000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const doExplode = useCallback(() => {
    if (exploded) return;
    setExploded(true);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      onExplode(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    setTimeout(() => { setVisible(false); onExpire(); }, 1400);
  }, [exploded, onExplode, onExpire]);

  if (!visible) return null;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ scale: 0, opacity: 0, y: 16 }}
      animate={{ scale: exploded ? 0 : 1, opacity: exploded ? 0 : 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      className="relative flex items-end gap-2 mb-3 group"
      onClick={doExplode}
    >
      {/* Avatar bubble */}
      <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-lg shrink-0 shadow-lg">
        {msg.avatar}
      </div>

      {/* Message */}
      <div className={`relative max-w-[75%] cursor-pointer ${exploded ? 'pointer-events-none' : ''}`}>
        {!exploded && (
          <motion.span
            animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="absolute -top-4 -left-2 text-xl z-10 drop-shadow-lg"
          >🌹</motion.span>
        )}
        <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xl group-hover:bg-white/25 transition-all">
          <p className="text-[10px] font-black text-pink-300 mb-0.5 uppercase tracking-widest">{msg.name}</p>
          <p className="text-sm text-white/90 font-medium leading-relaxed">{msg.text}</p>
          <p className="text-[9px] text-white/30 font-bold mt-1 text-right">toque para libertar 🌸</p>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Floating Participant Bubble ─── */
const avatarEmojis = ['🌸','🌺','🌷','🌻','🦋','🌙','⭐','🫶','💜','🌿'];

const FloatingBubble = ({ participant, index, total }: { participant: any; index: number; total: number }) => {
  // Distribute bubbles evenly in a soft ellipse across the stage
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const rx = 32, ry = 22;
  const cx = 50 + Math.cos(angle) * rx;
  const cy = 45 + Math.sin(angle) * ry;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1, opacity: 1,
        y: [0, -10, 0, 8, 0],
        x: [0, 4, 0, -4, 0],
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        scale: { type: 'spring', stiffness: 260, damping: 20 },
        opacity: { duration: 0.35 },
        y: { duration: 4.5 + index * 0.6, repeat: Infinity, ease: 'easeInOut' },
        x: { duration: 3.8 + index * 0.45, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="absolute flex flex-col items-center gap-1.5"
      style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)' }}
    >
      {/* Mic-active pulse ring */}
      {participant.speaking && (
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute rounded-full"
          style={{ width: 70, height: 70, top: -7, left: -7, background: 'radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)' }}
        />
      )}
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-300/80 to-rose-500/60 flex items-center justify-center text-3xl shadow-2xl border-4 border-white/30 backdrop-blur-sm ring-2 ring-pink-400/20">
        {participant.emoji}
      </div>
      <span className="text-[9px] font-black text-white/80 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full truncate max-w-[70px] shadow-sm">
        {participant.isMe ? `${participant.name} (você)` : participant.name}
      </span>
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
  const [roseMessages, setRoseMessages] = useState<any[]>([]);
  const [viewportPetals, setViewportPetals] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [micActive, setMicActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [myName] = useState(() => {
    try { const p = localStorage.getItem('almas_empreendedora_profile'); return p ? JSON.parse(p).nomeEmpreendedora || 'Mãe' : 'Mãe'; } catch { return 'Mãe'; }
  });
  const [myEmoji] = useState(() => avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)]);

  // Scroll only the chat container, never the whole page
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [roseMessages]);

  // Simulated participants join after entering
  useEffect(() => {
    if (!hasJoinedLive) return;
    const names: [string, string][] = [['Carla','🌸'],['Bianca','🌺'],['Fernanda','🦋'],['Juliana','🌙'],['Renata','💜']];
    let i = 0;
    const id = setInterval(() => {
      if (i >= names.length) { clearInterval(id); return; }
      const [name, emoji] = names[i++];
      setParticipants(prev => [...prev, { id: Date.now() + i, name, emoji, speaking: false }]);
    }, 3500);
    return () => clearInterval(id);
  }, [hasJoinedLive]);

  // Audio analyser to detect speaking
  const startMicAnalyser = (stream: MediaStream) => {
    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        const isSpeaking = avg > 12;
        setParticipants(prev => prev.map(p => p.isMe ? { ...p, speaking: isSpeaking } : p));
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
      setParticipants([{ id: 0, name: myName, emoji: myEmoji, speaking: false, isMe: true }]);
      setHasJoinedLive(true);
      toast.success('🎙️ Microfone ativo! Bem-vinda à Sala de Apoio!');
    } catch (err: any) {
      console.error(err);
      toast.error('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
    setIsJoiningLive(false);
  };

  const handleLeaveLiveRoom = () => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setMicActive(false);
    setHasJoinedLive(false);
    setParticipants([]);
    setRoseMessages([]);
    setViewportPetals([]);
    toast.success('Você saiu da sala. Até logo! 🌸');
  };

  // Fire petals across the viewport from the position of the exploding message
  const handleExplode = useCallback((x: number, y: number) => {
    const newPetals = Array.from({ length: 18 }, (_, i) => ({ id: Date.now() + i, startX: x, startY: y }));
    setViewportPetals(prev => [...prev, ...newPetals]);
  }, []);

  const removePetal = useCallback((id: number) => {
    setViewportPetals(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleSendRose = () => {
    if (!chatInput.trim()) return;
    const newMsg = { id: Date.now(), name: myName, emoji: myEmoji, avatar: myEmoji, text: chatInput.trim() };
    setRoseMessages(prev => [...prev, newMsg]);
    setChatInput('');
    // also trigger a small burst from bottom-center immediately for feedback
    setViewportPetals(prev => [
      ...prev,
      ...Array.from({ length: 10 }, (_, i) => ({ id: Date.now() + 100 + i, startX: window.innerWidth / 2, startY: window.innerHeight - 100 }))
    ]);
  };

  const removeRoseMessage = useCallback((id: number) => {
    setRoseMessages(prev => prev.filter(m => m.id !== id));
  }, []);

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => { setAudioBlob(new Blob(chunksRef.current, { type: 'audio/webm' })); stream.getTracks().forEach(t => t.stop()); };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info('Microfone ativado. Pode falar!');
    } catch { toast.error('Não foi possível acessar o microfone.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); }
  };

  const handlePostAudio = () => {
    if (!audioBlob) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const newD = { id: Date.now(), author: myName || 'Você', city: 'Seguro', content: 'Desabafo em áudio', likes: 0, time: 'Agora mesmo', duration: formatTime(recordingTime), isNew: true, audioData: reader.result as string, isUserAuthor: true };
      try { await saveDesabafoToDB(newD); setDesabafos([newD, ...desabafos]); setIsUploading(false); setAudioBlob(null); toast.success('Seu desabafo foi postado!'); }
      catch { setIsUploading(false); toast.error('Erro ao salvar! Áudio muito grande.'); }
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
    await deleteDesabafoFromDB(id);
    setDesabafos(prev => prev.filter(d => d.id !== id));
    toast.success('Áudio deletado.');
  };

  const handleApoiar = (id: number) => {
    setDesabafos(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (d.hasLiked) { toast.info('Você já apoiou esta mãe.'); return d; }
      toast.success('Abraço de apoio enviado! 🫂');
      const novo = { ...d, likes: (d.likes || 0) + 1, hasLiked: true };
      saveDesabafoToDB(novo); return novo;
    }));
  };

  /* ══ RENDER ══ */
  return (
    <div className="max-w-6xl mx-auto pb-12">

      {/* ── Global viewport petals overlay ── */}
      <AnimatePresence>
        {viewportPetals.map(p => (
          <ViewportPetal key={p.id} id={p.id} startX={p.startX} startY={p.startY} onDone={() => removePetal(p.id)} />
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white/65 shadow-xl backdrop-blur-[12px] rounded-[2.5rem] border border-white/60 p-6 mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
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
          <motion.div key="podcast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>

            {/* ══ IMMERSIVE LIVE ROOM ══ */}
            <div className="bg-[#0f0610] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[var(--rosa-forte)]/20 relative" style={{ minHeight: hasJoinedLive ? 680 : 420 }}>

              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-30">
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 rounded-full text-[10px] font-black text-white"
                  >
                    <Radio size={11} /> AO VIVO
                  </motion.span>
                  <span className="text-white/70 font-serif italic text-base">Sala de Apoio</span>
                </div>
                {hasJoinedLive && (
                  <div className="flex items-center gap-3">
                    {micActive && (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-green-400 uppercase tracking-widest">
                        <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                        MIC ON
                      </span>
                    )}
                    <span className="text-[10px] font-black text-white/30 uppercase">{participants.length} na sala</span>
                  </div>
                )}
              </div>

              {/* Stage */}
              <div className={`relative w-full transition-all duration-700 ${hasJoinedLive ? 'h-80 md:h-96' : 'h-64'} bg-gradient-to-b from-[#1a0b14] via-[#110810] to-[#060308] overflow-hidden`}>

                {/* Ambient radial glow */}
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute w-96 h-96 rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '50%', top: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.3), transparent 70%)' }}
                  />
                </div>
                {/* Pulse rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[1,2,3].map(i => (
                    <motion.div key={i}
                      animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.06, 0, 0.06] }}
                      transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.2 }}
                      className="absolute rounded-full border border-pink-400/20"
                      style={{ width: 80 + i * 60, height: 80 + i * 60 }}
                    />
                  ))}
                </div>

                {!hasJoinedLive ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 2.2 }} className="text-6xl drop-shadow-2xl">🎙️</motion.span>
                    <p className="text-white/30 text-xs font-bold tracking-[0.3em] uppercase text-center px-12 leading-loose">
                      Entre na sala de voz<br/>para encontrar outras mães
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {participants.map((p, i) => (
                      <FloatingBubble key={p.id} participant={p} index={i} total={participants.length} />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* ── Rose Chat overlay (visible only when joined) ── */}
              <AnimatePresence>
                {hasJoinedLive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="relative border-t border-white/5"
                  >
                    {/* Messages feed — ref scroll, no page jump */}
                    <div ref={chatContainerRef} className="h-56 overflow-y-auto px-5 pt-5 pb-2 space-y-1 bg-gradient-to-b from-[#130a10] to-[#0a0609]">
                      {roseMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-white/20 text-xs font-bold italic text-center">
                            Envie uma rosa 🌹 — ela explodirá em pétalas pela tela
                          </p>
                        </div>
                      ) : (
                        <AnimatePresence mode="popLayout">
                          {roseMessages.map(msg => (
                            <RoseMessage
                              key={msg.id}
                              msg={msg}
                              onExpire={() => removeRoseMessage(msg.id)}
                              onExplode={handleExplode}
                            />
                          ))}
                        </AnimatePresence>
                      )}
                    </div>

                    {/* Input bar */}
                    <div className="px-5 py-4 bg-black/30 border-t border-white/5 flex items-center gap-3">
                      <span className="text-xl shrink-0">🌹</span>
                      <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendRose()}
                        maxLength={120}
                        placeholder="Escreva uma mensagem de rosa..."
                        className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/90 font-medium placeholder:text-white/20 outline-none focus:bg-white/15 focus:border-pink-500/40 transition-all"
                      />
                      <button
                        onClick={handleSendRose}
                        disabled={!chatInput.trim()}
                        className="w-11 h-11 rounded-2xl bg-[var(--rosa-forte)] text-white flex items-center justify-center disabled:opacity-30 hover:scale-110 active:scale-90 transition-all shadow-lg shadow-pink-500/30"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Control footer */}
              <div className="flex items-center justify-between px-6 py-5 bg-black/40 border-t border-white/5">
                {hasJoinedLive ? (
                  <button onClick={handleLeaveLiveRoom} className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all border border-red-500/20 hover:border-red-500">
                    <PhoneOff size={16} /> Sair da Chamada
                  </button>
                ) : (
                  <button onClick={handleJoinLiveRoom} disabled={isJoiningLive} className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[var(--rosa-forte)] to-rose-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-2xl shadow-pink-700/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                    {isJoiningLive ? <Loader2 size={20} className="animate-spin" /> : <PhoneCall size={20} />}
                    {isJoiningLive ? 'Conectando...' : 'Entrar em Chamada'}
                  </button>
                )}
                <div className="text-[10px] text-white/20 font-bold italic flex items-center gap-1.5">
                  {micActive ? <><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> microfone ativo</> : '🎙️ voz apenas'}
                </div>
              </div>
            </div>

            {/* How it works card (below when not joined) */}
            {!hasJoinedLive && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 bg-gradient-to-br from-[#1A0B10] to-[#2d0a1a] rounded-[2.5rem] p-8 shadow-2xl border border-[var(--rosa-forte)]/15">
                <h3 className="text-white font-serif italic text-xl mb-5 flex items-center gap-3">🌸 Como funciona a Sala</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: '🎙️', title: 'Chamada de Voz', desc: 'Microfone ativado direto pelo navegador, sem instalação. Sua bolhinha pulsa quando você fala.' },
                    { icon: '🫧', title: 'Bolhas Flutuantes', desc: 'Cada mãe que entra ganha uma bolhinha animada. A sala fica viva conforme mais mães chegam.' },
                    { icon: '🌹', title: 'Chat de Rosas', desc: 'Mensagens surgem como rosas. Toque nelas para explodirem em pétalas pela tela toda.' },
                    { icon: '🔒', title: 'Espaço Seguro', desc: 'Exclusivo para mães da comunidade. Sem câmera obrigatória.' },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }} className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <div className="text-white font-black text-sm mb-1">{item.title}</div>
                        <div className="text-white/40 text-xs font-medium leading-relaxed">{item.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </motion.div>
        ) : (
          /* ══ DESABAFOS TAB ══ */
          <motion.div key="desabafos" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recorder */}
            <div className="lg:col-span-5">
              <div className="bg-white/80 shadow-2xl backdrop-blur-md rounded-[2.5rem] border-2 border-[var(--rosa-forte)]/20 p-8 sticky top-24">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-5">
                    <Mic className="text-[var(--rosa-forte)]" size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-[var(--texto-escuro)] mb-2 italic">Seu Desabafo Real</h2>
                  <p className="text-[var(--texto-medio)] font-medium text-sm">Gravando diretamente do seu microfone.</p>
                </div>
                <div className="bg-[#4B1528] rounded-3xl p-8 mb-6 relative flex items-center justify-center min-h-[180px] overflow-hidden">
                  {isRecording ? (
                    <div className="flex items-center gap-1.5 h-12">
                      {[...Array(14)].map((_, i) => (
                        <motion.div key={i} animate={{ height: [8, Math.random() * 48 + 8, 8] }} transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.04 }} className="w-1.5 bg-[var(--rosa-claro)] rounded-full" />
                      ))}
                    </div>
                  ) : audioBlob ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-white text-center">
                      <Volume2 size={44} className="mx-auto mb-3 text-green-400" />
                      <span className="font-black text-base">Áudio Capturado</span>
                      <p className="text-[10px] opacity-50 mt-1">Pronto para postar</p>
                    </motion.div>
                  ) : (
                    <div className="text-white/20 font-black text-xs uppercase tracking-[0.3em]">Microfone Pronto</div>
                  )}
                  {isRecording && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-red-500 rounded-full text-white text-[10px] font-black uppercase animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" /> AO VIVO {formatTime(recordingTime)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {!audioBlob ? (
                    <button onClick={isRecording ? stopRecording : startRecording} className={`w-full py-5 rounded-[2rem] font-black text-base transition-all flex items-center justify-center gap-3 shadow-xl ${isRecording ? 'bg-white text-red-500 border-2 border-red-500 animate-pulse' : 'bg-[var(--rosa-forte)] text-white hover:bg-[#b04066]'}`}>
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

            {/* Feed */}
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
                  Nenhum desabafo ainda. Seja a primeira a compartilhar sua voz!
                </div>
              ) : desabafos.map(d => (
                <motion.div key={d.id} layout initial={d.isNew ? { opacity: 0, scale: 0.9, y: -20 } : false} animate={{ opacity: 1, scale: 1, y: 0 }} className={`bg-white/90 shadow-xl rounded-[2rem] border p-5 hover:shadow-2xl transition-all ${d.isNew ? 'border-[var(--rosa-forte)]/40 ring-2 ring-[var(--rosa-forte)]/10' : 'border-white'}`}>
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center font-black text-[var(--rosa-forte)] border-2 border-white shadow-sm shrink-0">{d.author[0]}</div>
                    <div>
                      <h4 className="font-bold text-[var(--texto-escuro)] text-sm flex items-center gap-2">{d.author}{d.isNew && <span className="bg-[var(--rosa-forte)] text-white text-[8px] px-2 py-0.5 rounded-full">NOVO</span>}</h4>
                      <p className="text-[10px] text-[var(--texto-claro)] uppercase font-black">{d.city} • {d.time}</p>
                    </div>
                  </div>
                  <div onClick={() => handlePlayFeedAudio(d)} className={`bg-[var(--ativo-bg)] rounded-2xl p-3 flex items-center gap-3 cursor-pointer mb-4 transition-colors ${playingFeedId === d.id ? 'bg-pink-100 ring-2 ring-[var(--rosa-forte)]/50' : 'hover:bg-pink-50'}`}>
                    <button className={`w-10 h-10 ${playingFeedId === d.id ? 'bg-white text-[var(--rosa-forte)]' : 'bg-[var(--rosa-forte)] text-white'} rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform shrink-0`}>
                      {playingFeedId === d.id
                        ? <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
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
                      <Heart size={15} fill={d.hasLiked ? 'currentColor' : 'none'} /> {d.hasLiked ? 'APOIADA' : 'APOIAR'} {d.likes > 0 && `(${d.likes})`}
                    </button>
                    {d.isUserAuthor ? (
                      <button onClick={() => handleDeleteDesabafo(d.id)} className="flex-1 py-3 rounded-xl bg-white border border-red-100 flex items-center justify-center gap-2 text-xs font-black text-red-500 hover:bg-red-50 transition-all active:scale-95">
                        <Trash2 size={15} /> EXCLUIR
                      </button>
                    ) : (
                      <button onClick={() => toast.success('Link copiado!')} className="flex-1 py-3 rounded-xl bg-white border border-pink-100 flex items-center justify-center gap-2 text-xs font-black text-[var(--texto-claro)] hover:bg-gray-50 transition-all active:scale-95">
                        <Share2 size={15} /> ENVIAR
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
