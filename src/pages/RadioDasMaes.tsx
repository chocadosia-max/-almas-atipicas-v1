import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Headphones, Mic, StopCircle, Send, Trash2, Heart, Share2, Volume2,
  Loader2, MessageSquarePlus, Users, Radio, Info, PhoneCall, PhoneOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";

/* ─── IndexedDB helpers ─── */
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

/* ─── Rose Petal ─── */
const RosePetal = ({ vx, vy, delay }: { vx: number; vy: number; delay: number }) => (
  <motion.span
    initial={{ x: 0, y: 0, opacity: 0.65, scale: 1, rotate: 0 }}
    animate={{ x: vx, y: vy, opacity: 0, scale: 0.25, rotate: Math.random() * 720 - 360 }}
    transition={{ duration: 1.5 + Math.random() * 0.5, delay, ease: 'easeOut' }}
    className="absolute pointer-events-none select-none text-sm"
  >🌸</motion.span>
);

/* ─── Rose Message Bubble ─── */
const RoseMessage = ({ msg, onExpire }: { msg: any; onExpire: () => void }) => {
  const [exploded, setExploded] = useState(false);
  const [petals, setPetals] = useState<any[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(trigger, 120_000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const trigger = useCallback(() => {
    if (exploded) return;
    setExploded(true);
    setPetals(Array.from({ length: 14 }, (_, i) => ({
      id: i,
      vx: (Math.random() - 0.5) * 220,
      vy: -(Math.random() * 140 + 40),
      delay: i * 0.04,
    })));
    setTimeout(() => { setVisible(false); onExpire(); }, 1900);
  }, [exploded, onExpire]);

  if (!visible) return null;

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0, y: 18 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      className="relative flex items-end gap-2 mb-3"
    >
      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-base shrink-0 shadow border-2 border-white">
        {msg.avatar}
      </div>
      <div className={`relative max-w-[80%] ${exploded ? 'pointer-events-none' : 'cursor-pointer'}`} onClick={trigger}>
        {!exploded && (
          <motion.span
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-3 -left-3 text-lg z-10"
          >🌹</motion.span>
        )}
        <div className="bg-white/90 backdrop-blur-md border border-pink-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg hover:shadow-pink-200/50 transition-all">
          <p className="text-[11px] font-black text-pink-600 mb-0.5 uppercase tracking-widest">{msg.name}</p>
          <p className="text-sm text-[#4B1528] font-medium leading-relaxed">{msg.text}</p>
          <p className="text-[9px] text-gray-300 font-black mt-1 text-right">toque para libertar 🌸</p>
        </div>
        <AnimatePresence>
          {petals.map(p => <RosePetal key={p.id} vx={p.vx} vy={p.vy} delay={p.delay} />)}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ─── Floating Bubble ─── */
const avatarEmojis = ['🌸','🌺','🌷','🌻','🦋','🌙','⭐','🫶','💜','🌿'];
const FloatingBubble = ({ participant, index }: { participant: any; index: number }) => {
  const angle = (index / 8) * Math.PI * 2;
  const cx = 50 + Math.cos(angle) * 28;
  const cy = 50 + Math.sin(angle) * 18;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: [0, -8, 0, 7, 0], x: [0, 3, 0, -3, 0] }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        scale: { duration: 0.4 }, opacity: { duration: 0.4 },
        y: { duration: 4 + index * 0.7, repeat: Infinity, ease: 'easeInOut' },
        x: { duration: 3.5 + index * 0.5, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="absolute flex flex-col items-center gap-1"
      style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)' }}
    >
      {participant.speaking && (
        <motion.div
          animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="absolute rounded-full bg-[var(--rosa-forte)]/40"
          style={{ width: 56, height: 56, top: -4, left: -4 }}
        />
      )}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-2xl shadow-xl border-4 border-white/80 ring-2 ring-pink-300/30">
        {participant.emoji}
      </div>
      <span className="text-[9px] font-black text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full truncate max-w-[60px]">
        {participant.name}
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
  const [chatInput, setChatInput] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [myName] = useState(() => {
    try { const p = localStorage.getItem('almas_empreendedora_profile'); return p ? JSON.parse(p).nomeEmpreendedora || 'Mãe' : 'Mãe'; } catch { return 'Mãe'; }
  });
  const [myEmoji] = useState(() => avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [roseMessages]);

  // Simulate other moms joining
  useEffect(() => {
    if (!hasJoinedLive) return;
    const names: [string, string][] = [['Carla','🌸'],['Bianca','🌺'],['Fernanda','🦋'],['Juliana','🌙']];
    let i = 0;
    const id = setInterval(() => {
      if (i >= names.length) { clearInterval(id); return; }
      const [name, emoji] = names[i++];
      setParticipants(prev => [...prev, { id: Date.now() + i, name, emoji, speaking: false }]);
    }, 4000);
    return () => clearInterval(id);
  }, [hasJoinedLive]);

  const handleJoinLiveRoom = async () => {
    setIsJoiningLive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setParticipants([{ id: 0, name: myName, emoji: myEmoji, speaking: false, isMe: true }]);
      setHasJoinedLive(true);
      toast.success('Você entrou na Sala de Apoio 🎙️ Microfone ativo!');
    } catch { toast.error('Não foi possível acessar o microfone. Verifique as permissões.'); }
    setIsJoiningLive(false);
  };

  const handleLeaveLiveRoom = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setHasJoinedLive(false);
    setParticipants([]);
    setRoseMessages([]);
    toast.success('Você saiu da sala. Até logo! 🌸');
  };

  const handleSendRose = () => {
    if (!chatInput.trim()) return;
    setRoseMessages(prev => [...prev, { id: Date.now(), name: myName, emoji: myEmoji, avatar: myEmoji, text: chatInput.trim() }]);
    setChatInput('');
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
      const newD = { id: Date.now(), author: myName || 'Você (Autora)', city: 'Seguro', content: 'Desabafo em áudio', likes: 0, time: 'Agora mesmo', duration: formatTime(recordingTime), isNew: true, audioData: reader.result as string, isUserAuthor: true };
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
    toast.success('Áudio deletado com sucesso.');
  };

  const handleApoiar = async (id: number) => {
    setDesabafos(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (d.hasLiked) { toast.info('Você já apoiou esta mãe.'); return d; }
      toast.success('Você enviou um abraço de apoio!', { icon: '🫂' });
      const novo = { ...d, likes: (d.likes || 0) + 1, hasLiked: true };
      saveDesabafoToDB(novo); return novo;
    }));
  };

  /* ══ RENDER ══ */
  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white/65 shadow-xl backdrop-blur-[12px] rounded-[2.5rem] border border-white/60 p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-left font-sans">
            <h1 className="text-4xl font-black text-[var(--texto-escuro)] mb-2 tracking-tight">
              Voz & <span className="text-[var(--rosa-forte)]">Acolhimento</span>
            </h1>
            <p className="text-[var(--texto-medio)] font-medium">Chamada ao vivo e desabafos em tempo real.</p>
          </div>
          <div className="flex bg-[var(--ativo-bg)] p-1.5 rounded-2xl border border-[var(--rosa-medio)]/20 shadow-inner">
            <button onClick={() => setActiveTab('podcast')} className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'podcast' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'}`}>
              <Headphones size={18} /> Sala ao Vivo
            </button>
            <button onClick={() => setActiveTab('desabafos')} className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'desabafos' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'}`}>
              <Mic size={18} /> Voz das Mães
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT PANEL */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {activeTab === 'podcast' ? (
              <motion.div key="live-room" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-5">

                {/* ── Stage ── */}
                <div className="bg-[#1A0B10] rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[var(--rosa-forte)]/30">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full text-[10px] font-black text-white animate-pulse">
                        <Radio size={12} /> AO VIVO
                      </span>
                      <span className="text-white font-serif italic text-base flex items-center gap-2">
                        <Users size={15} className="text-[var(--rosa-forte)]" /> Sala de Apoio
                      </span>
                    </div>
                    {hasJoinedLive && <span className="text-[10px] font-black text-white/40 uppercase">{participants.length} na sala</span>}
                  </div>

                  {/* Bubble stage */}
                  <div className="relative w-full h-52 bg-gradient-to-b from-[#1A0B10] to-[#0b0408] overflow-hidden">
                    {/* Pulse rings decoration */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0, 0.08] }} transition={{ duration: 4, repeat: Infinity }} className="w-56 h-56 rounded-full border border-pink-400/20" />
                      <div className="absolute w-36 h-36 rounded-full border border-pink-400/10" />
                    </div>

                    {!hasJoinedLive ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-5xl">🎙️</motion.span>
                        <p className="text-white/30 text-xs font-bold tracking-widest uppercase text-center px-8 leading-relaxed">
                          Entre na sala de voz para<br/>encontrar outras mães
                        </p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {participants.map((p, i) => <FloatingBubble key={p.id} participant={p} index={i} />)}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Control bar */}
                  <div className="px-5 py-4 flex items-center justify-between bg-black/25 border-t border-white/5">
                    {hasJoinedLive ? (
                      <button onClick={handleLeaveLiveRoom} className="flex items-center gap-2 px-5 py-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all">
                        <PhoneOff size={16} /> Sair da Chamada
                      </button>
                    ) : (
                      <button onClick={handleJoinLiveRoom} disabled={isJoiningLive} className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--rosa-forte)] to-rose-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                        {isJoiningLive ? <Loader2 size={18} className="animate-spin" /> : <PhoneCall size={18} />}
                        {isJoiningLive ? 'Conectando...' : 'Entrar em Chamada'}
                      </button>
                    )}
                    <span className="text-[10px] text-white/20 font-bold italic">🎙️ voz apenas</span>
                  </div>
                </div>

                {/* ── Rose Chat ── */}
                <AnimatePresence>
                  {hasJoinedLive && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-pink-100 shadow-xl overflow-hidden">
                      <div className="px-6 pt-5 pb-3 border-b border-pink-50 flex items-center justify-between">
                        <span className="font-black text-[var(--texto-escuro)] text-sm flex items-center gap-2">🌹 Chat de Rosas</span>
                        <span className="text-[9px] text-pink-300 font-black uppercase tracking-widest">somem em 2 min</span>
                      </div>
                      <div className="h-48 overflow-y-auto px-4 py-3 relative">
                        {roseMessages.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-pink-200 text-xs font-bold italic text-center px-6">
                            Envie uma rosa 🌹<br/>Ela florescerá e depois soltará pétalas pela tela
                          </div>
                        ) : (
                          <AnimatePresence mode="popLayout">
                            {roseMessages.map(msg => <RoseMessage key={msg.id} msg={msg} onExpire={() => removeRoseMessage(msg.id)} />)}
                          </AnimatePresence>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="px-4 pb-4 pt-2 border-t border-pink-50">
                        <div className="flex gap-2 items-center bg-pink-50/60 rounded-2xl border border-pink-100 px-4 py-2">
                          <span className="text-base shrink-0">🌹</span>
                          <input
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendRose()}
                            maxLength={120}
                            placeholder="Escreva uma mensagem de rosa..."
                            className="flex-1 bg-transparent outline-none text-sm font-medium text-[#4B1528] placeholder:text-pink-200"
                          />
                          <button onClick={handleSendRose} disabled={!chatInput.trim()} className="w-8 h-8 rounded-full bg-[var(--rosa-forte)] text-white flex items-center justify-center disabled:opacity-30 hover:scale-110 active:scale-90 transition-all">
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            ) : (
              /* ── Recorder panel ── */
              <motion.div key="recorder-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white/80 shadow-2xl backdrop-blur-md rounded-[2.5rem] border-2 border-[var(--rosa-forte)]/20 p-8 sticky top-24">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-6">
                    <Mic className="text-[var(--rosa-forte)]" size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-[var(--texto-escuro)] mb-2 italic">Seu Desabafo Real</h2>
                  <p className="text-[var(--texto-medio)] font-medium">Gravando diretamente do seu microfone.</p>
                </div>
                <div className="bg-[#4B1528] rounded-3xl p-10 mb-8 relative flex items-center justify-center min-h-[200px] overflow-hidden">
                  {isRecording ? (
                    <div className="flex items-center gap-2 h-14">
                      {[...Array(12)].map((_, i) => (
                        <motion.div key={i} animate={{ height: [10, Math.random() * 56 + 8, 10] }} transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.04 }} className="w-2 bg-[var(--rosa-claro)] rounded-full" />
                      ))}
                    </div>
                  ) : audioBlob ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-white text-center">
                      <Volume2 size={48} className="mx-auto mb-4 text-green-400" />
                      <span className="font-black text-lg">Áudio Capturado</span>
                      <p className="text-[10px] opacity-60">Pronto para postar</p>
                    </motion.div>
                  ) : (
                    <div className="text-white/20 font-black text-sm uppercase tracking-[0.3em]">Microfone Pronto</div>
                  )}
                  {isRecording && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-red-500 rounded-full text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" /> AO VIVO {formatTime(recordingTime)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  {!audioBlob ? (
                    <button onClick={isRecording ? stopRecording : startRecording} className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${isRecording ? 'bg-white text-red-500 border-2 border-red-500 animate-pulse' : 'bg-[var(--rosa-forte)] text-white hover:bg-[#b04066]'}`}>
                      {isRecording ? <><StopCircle size={24} /> PARAR E SALVAR</> : <><Mic size={24} /> INICIAR GRAVAÇÃO</>}
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => setAudioBlob(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2 border border-gray-200">
                        <Trash2 size={18} /> Apagar
                      </button>
                      <button onClick={handlePostAudio} disabled={isUploading} className="flex-[2] py-4 rounded-2xl bg-[var(--rosa-forte)] text-white font-black shadow-lg hover:bg-[#b04066] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {isUploading ? <><Loader2 size={18} className="animate-spin" /> POSTANDO...</> : <><Send size={18} /> PUBLICAR DESABAFO</>}
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-6 p-4 bg-pink-50 border border-pink-100 rounded-2xl flex gap-3 text-xs text-[var(--rosa-forte)] font-bold">
                  <Info size={20} className="shrink-0" /> Sua gravação é privada até que você clique em publicar.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'podcast' ? (
              <motion.div key="live-info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-gradient-to-br from-[#1A0B10] to-[#2d0a1a] rounded-[2.5rem] p-8 shadow-2xl border border-[var(--rosa-forte)]/20">
                  <h3 className="text-white font-serif italic text-2xl mb-6 flex items-center gap-3">🌸 Como funciona a Sala</h3>
                  <div className="space-y-4">
                    {[
                      { icon: '🎙️', title: 'Chamada de Voz', desc: 'Ao clicar em "Entrar em Chamada" seu microfone é ativado. Você pode ouvir e ser ouvida em tempo real pelas outras mães.' },
                      { icon: '🫧', title: 'Bolhas Flutuantes', desc: 'Cada mãe que entra ganha uma bolhinha flutuante com seu emoji e nome. A sala fica viva conforme mais mães chegam.' },
                      { icon: '🌹', title: 'Chat de Rosas', desc: 'Envie mensagens em forma de rosa. Elas ficam visíveis por 2 minutos e então explodem em pétalas translúcidas pela tela.' },
                      { icon: '🔒', title: 'Espaço Seguro', desc: 'A sala é exclusiva para mães da comunidade Almas Atípicas. Sem câmera, apenas vozes e amor.' },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-2xl shrink-0">{item.icon}</span>
                        <div>
                          <div className="text-white font-black text-sm mb-1">{item.title}</div>
                          <div className="text-white/50 text-xs font-medium leading-relaxed">{item.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="desabafos-feed" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)] rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-1 flex items-center gap-3"><MessageSquarePlus /> Ouvindo o Coração</h2>
                    <p className="text-sm font-bold opacity-80">Aqui você nunca está sozinha. Use o apoio para abraçar uma mãe.</p>
                  </div>
                  <Radio className="absolute -right-8 -bottom-8 size-40 opacity-10 rotate-12" />
                </div>

                {desabafos.length === 0 ? (
                  <div className="text-center p-8 bg-white/50 rounded-[2rem] border border-white/50 text-[var(--texto-medio)] font-bold">
                    Nenhum desabafo ainda. Seja a primeira a compartilhar sua voz!
                  </div>
                ) : desabafos.map(d => (
                  <motion.div key={d.id} layout initial={d.isNew ? { opacity: 0, scale: 0.9, y: -20 } : false} animate={{ opacity: 1, scale: 1, y: 0 }} className={`bg-white/90 shadow-xl rounded-[2rem] border p-6 hover:shadow-2xl transition-all ${d.isNew ? 'border-[var(--rosa-forte)]/40 ring-2 ring-[var(--rosa-forte)]/10' : 'border-white'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center font-black text-[var(--rosa-forte)] border-2 border-white shadow-sm">{d.author[0]}</div>
                          <div>
                            <h4 className="font-bold text-[var(--texto-escuro)] flex items-center gap-2">{d.author}{d.isNew && <span className="bg-[var(--rosa-forte)] text-white text-[8px] px-2 py-0.5 rounded-full">NOVO</span>}</h4>
                            <p className="text-[10px] text-[var(--texto-claro)] uppercase font-black">{d.city} • {d.time}</p>
                          </div>
                        </div>
                        <div onClick={() => handlePlayFeedAudio(d)} className={`bg-[var(--ativo-bg)] rounded-3xl p-4 flex items-center gap-4 group cursor-pointer transition-colors ${playingFeedId === d.id ? 'bg-pink-100 ring-2 ring-[var(--rosa-forte)]/50' : 'hover:bg-pink-50'}`}>
                          <button className={`w-10 h-10 ${playingFeedId === d.id ? 'bg-white text-[var(--rosa-forte)]' : 'bg-[var(--rosa-forte)] text-white'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            {playingFeedId === d.id
                              ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                              : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                          </button>
                          <div className="flex-1 space-y-2">
                            <div className="h-1 bg-white/60 rounded-full overflow-hidden">
                              <motion.div animate={{ width: playingFeedId === d.id ? ['0%','100%'] : '0%' }} transition={{ duration: 60, ease: 'linear' }} className="h-full bg-[var(--rosa-forte)]" />
                            </div>
                            <div className="flex justify-between text-[8px] font-black text-[var(--texto-claro)] uppercase">
                              <span className={playingFeedId === d.id ? 'text-[var(--rosa-forte)] animate-pulse' : ''}>{playingFeedId === d.id ? 'TOCANDO...' : '00:00'}</span>
                              <span>{d.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-4 flex md:flex-col justify-around gap-2">
                        <button onClick={() => handleApoiar(d.id)} className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-black transition-all active:scale-95 ${d.hasLiked ? 'bg-[var(--rosa-forte)] text-white border-[var(--rosa-forte)]' : 'bg-white border-pink-100 text-[var(--rosa-forte)] hover:bg-pink-50'}`}>
                          <Heart size={16} fill={d.hasLiked ? 'currentColor' : 'none'} /> {d.hasLiked ? 'APOIADA' : 'APOIAR'} {d.likes > 0 && `(${d.likes})`}
                        </button>
                        {d.isUserAuthor ? (
                          <button onClick={() => handleDeleteDesabafo(d.id)} className="flex-1 py-3 px-4 rounded-xl bg-white border border-red-100 flex items-center justify-center gap-2 text-xs font-black text-red-500 hover:bg-red-50 transition-all active:scale-95">
                            <Trash2 size={16} /> EXCLUIR
                          </button>
                        ) : (
                          <button onClick={() => toast.success('Link copiado!')} className="flex-1 py-3 px-4 rounded-xl bg-white border border-pink-100 flex items-center justify-center gap-2 text-xs font-black text-[var(--texto-claro)] hover:bg-gray-50 transition-all active:scale-95">
                            <Share2 size={16} /> ENVIAR
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RadioDasMaes;
