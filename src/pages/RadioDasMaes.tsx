import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Headphones, Mic, StopCircle, Send, Trash2, Heart, Share2, Volume2,
  Loader2, MessageSquarePlus, Radio, Info, PhoneCall, PhoneOff, Play, Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { supabase } from '../integrations/supabase/client';

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

/* ─── Floating heart particle ─── */
const HeartParticle = ({ startX, startY, id, onDone }: {
  startX: number; startY: number; id: number; onDone: () => void;
}) => {
  const vx = (Math.random() - 0.5) * 140;
  const vy = -(Math.random() * 180 + 60);
  const dur = 1.4 + Math.random() * 0.8;
  useEffect(() => { const t = setTimeout(onDone, (dur + 0.3) * 1000); return () => clearTimeout(t); }, []); // eslint-disable-line
  return (
    <motion.span
      initial={{ x: startX, y: startY, opacity: 1, scale: 1.4 }}
      animate={{ x: startX + vx, y: startY + vy, opacity: 0, scale: 0.3 }}
      transition={{ duration: dur, ease: [0.15, 0.85, 0.35, 1] }}
      className="fixed pointer-events-none select-none text-2xl z-[9999]"
      style={{ left: 0, top: 0 }}
    >❤️</motion.span>
  );
};

/* ─── Score popup ─── */
const ScorePopup = ({ x, y, id, onDone }: { x: number; y: number; id: number; onDone: () => void }) => {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }, []); // eslint-disable-line
  return (
    <motion.div
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{ x, y: y - 55, opacity: 0, scale: 1.4 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="fixed pointer-events-none select-none z-[9998] font-black text-pink-400 text-base"
      style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}
    >+1 ❤️</motion.div>
  );
};

/* ─── Participant bubble ─── */
const MAX_BUBBLE_SCALE = 1.6;
const BASE_BUBBLE_SIZE = 56;

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

  const heartScale = Math.min(1 + (participant.hearts || 0) * 0.08, MAX_BUBBLE_SCALE);
  const bubblePx = Math.round(BASE_BUBBLE_SIZE * heartScale);

  return (
    <motion.div
      ref={el => onBubbleRef(participant.id, el)}
      initial={{ scale: 0, opacity: 0 }}
      animate={isReceivingHeart
        ? { scale: [heartScale, heartScale * 1.3, heartScale], opacity: 1 }
        : { scale: heartScale, opacity: 1, y: [0, -8, 0, 7, 0] }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ stiffness: 220, damping: 18, y: { duration: 4.5 + index * 0.6, repeat: Infinity, ease: 'easeInOut' } }}
      className="absolute flex flex-col items-center gap-1.5 cursor-pointer"
      style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)' }}
      onClick={onClick}
    >
      {isSelected && !participant.isMe && (
        <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity }}
          className="absolute rounded-full border-2 border-pink-400"
          style={{ width: bubblePx + 16, height: bubblePx + 16, top: -8, left: -8 }} />
      )}
      
      {/* Audio pulse effect when bubble "sends" audio */}
      {participant.playingAudio && (
        <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 0.6, repeat: Infinity }}
          className="absolute rounded-full bg-pink-400/50" style={{ width: bubblePx + 20, height: bubblePx + 20, top: -10, left: -10 }} />
      )}

      <motion.div animate={{ width: bubblePx, height: bubblePx }} transition={{ type: 'spring' }}
        className="rounded-full bg-gradient-to-br from-pink-300/80 to-rose-500/60 flex items-center justify-center shadow-2xl border-4 border-white/30 ring-2 ring-pink-400/20 overflow-hidden relative"
        style={{ fontSize: Math.round(bubblePx * 0.4) }}>
        {participant.emoji || '🌸'}
        {participant.hasUnplayedAudio && (
           <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-bounce" />
        )}
      </motion.div>
      <span className="text-[9px] font-black text-white/80 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full truncate max-w-[78px]">
        {participant.isMe ? `${participant.name}` : participant.name}
      </span>
      {(participant.hearts || 0) > 0 && (
        <span className="text-[9px] font-black text-white bg-pink-500 px-1.5 py-0.5 rounded-full -mt-1 shadow">{participant.hearts} ❤️</span>
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

  /* ── Room state ── */
  const [hasJoinedLive, setHasJoinedLive] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<any>(null);
  const [heartParticles, setHeartParticles] = useState<any[]>([]);
  const [scorePopups, setScorePopups] = useState<any[]>([]);
  const [receivingHeartId, setReceivingHeartId] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ id: string; name: string; text?: string; audio?: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  const [isRecordingMsg, setIsRecordingMsg] = useState(false);
  const [recordedMsgBlob, setRecordedMsgBlob] = useState<Blob | null>(null);

  const channelRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const bubbleRefsMap = useRef<Map<any, HTMLDivElement>>(new Map());
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [myName] = useState(() => {
    try { const p = localStorage.getItem('almas_empreendedora_profile'); return p ? JSON.parse(p).nomeEmpreendedora || 'Mãe' : 'Mãe'; } catch { return 'Mãe'; }
  });
  const [myEmoji] = useState(() => avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)]);
  const userId = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  const handleBubbleRef = useCallback((id: any, el: HTMLDivElement | null) => {
    if (el) bubbleRefsMap.current.set(id, el);
    else bubbleRefsMap.current.delete(id);
  }, []);

  /* ── Real-time Sync ── */
  const joinSocialRoom = () => {
    setHasJoinedLive(true);
    
    const channel = supabase.channel('radio-social-room', {
      config: { presence: { key: userId.current } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: any[] = [];
        Object.keys(state).forEach((key) => {
          const u = (state[key] as any)[0];
          users.push({ ...u, id: key, isMe: key === userId.current });
        });
        setParticipants(users);
      })
      .on('broadcast', { event: 'chat-msg' }, ({ payload }) => {
        setChatMessages(prev => [...prev, payload]);
      })
      .on('broadcast', { event: 'heart-event' }, ({ payload }) => {
        triggerHeartVisuals(payload.targetId);
      })
      .on('broadcast', { event: 'audio-msg' }, ({ payload }) => {
        setChatMessages(prev => [...prev, payload]);
        // Visual indicator on sender bubble
        setParticipants(prev => prev.map(p => p.id === payload.id ? { ...p, hasUnplayedAudio: true } : p));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: myName, emoji: myEmoji, hearts: 0 });
        }
      });

    channelRef.current = channel;
    toast.success('Entrou na sala interativa! 🌸');
  };

  const leaveSocialRoom = () => {
    channelRef.current?.unsubscribe();
    setHasJoinedLive(false);
    setParticipants([]);
    setChatMessages([]);
    toast.info('Saiu da sala.');
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

  const handleSendHeart = () => {
    if (!selectedTargetId) { toast.info('Selecione uma bolha primeiro.'); return; }
    channelRef.current?.send({ type: 'broadcast', event: 'heart-event', payload: { targetId: selectedTargetId } });
    triggerHeartVisuals(selectedTargetId);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = { id: Math.random().toString(), name: myName, text: chatInput.trim() };
    channelRef.current?.send({ type: 'broadcast', event: 'chat-msg', payload: msg });
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  /* ── Participant Interaction ── */
  const handleSelectParticipant = (p: any) => {
    if (p.isMe) return;
    setSelectedTargetId((prev: any) => prev === p.id ? null : p.id);
  };

  /* ── Audio Message Recording ── */
  const startRecordingMsg = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(s);
      recorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedMsgBlob(b);
        s.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setIsRecordingMsg(true);
    } catch { toast.error('Microfone negado.'); }
  };

  const stopRecordingMsg = () => {
    recorderRef.current?.stop();
    setIsRecordingMsg(false);
  };

  const sendAudioMessage = () => {
    if (!recordedMsgBlob) return;
    const reader = new FileReader();
    reader.readAsDataURL(recordedMsgBlob);
    reader.onloadend = () => {
      const b64 = reader.result as string;
      const msg = { id: userId.current, name: myName, audio: b64 };
      channelRef.current?.send({ type: 'broadcast', event: 'audio-msg', payload: msg });
      setChatMessages(prev => [...prev, { ...msg, id: Math.random().toString() }]);
      setRecordedMsgBlob(null);
      toast.success('Áudio enviado!');
    };
  };

  const playMsgAudio = (b64: string, senderId?: string) => {
    const a = new Audio(b64);
    if (senderId) {
      setParticipants(prev => prev.map(p => p.id === senderId ? { ...p, playingAudio: true, hasUnplayedAudio: false } : p));
      a.onended = () => setParticipants(prev => prev.map(p => p.id === senderId ? { ...p, playingAudio: false } : p));
    }
    a.play();
  };

  /* ── Old Feed Audio Handling ── */
  const [playingFeedId, setPlayingFeedId] = useState<number | null>(null);
  const audioFeedRef = useRef<HTMLAudioElement | null>(null);
  const handlePlayFeedAudio = (d: any) => {
    if (playingFeedId === d.id) { audioFeedRef.current?.pause(); setPlayingFeedId(null); return; }
    audioFeedRef.current?.pause();
    if (d.audioData) {
      const a = new Audio(d.audioData); a.onended = () => setPlayingFeedId(null); a.play(); audioFeedRef.current = a; setPlayingFeedId(d.id);
    } else { toast.error('Áudio não encontrado.'); }
  };
  const handleDeleteDesabafo = async (id: number) => {
    await deleteDesabafoFromDB(id); setDesabafos(prev => prev.filter(d => d.id !== id));
    toast.success('Deletado.');
  };
  const handleApoiar = (id: number) => {
    setDesabafos(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (d.hasLiked) return d;
      toast.success('Abraço enviado! 🫂');
      const novo = { ...d, likes: (d.likes || 0) + 1, hasLiked: true };
      saveDesabafoToDB(novo); return novo;
    }));
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <AnimatePresence>
        {heartParticles.map(p => <HeartParticle key={p.id} {...p} onDone={() => setHeartParticles(v => v.filter(x => x.id !== p.id))} />)}
        {scorePopups.map(p => <ScorePopup key={p.id} {...p} onDone={() => setScorePopups(v => v.filter(x => x.id !== p.id))} />)}
      </AnimatePresence>

      <div className="bg-white/65 shadow-xl backdrop-blur-md rounded-[2.5rem] p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-[var(--texto-escuro)] tracking-tighter">Voz & <span className="text-[var(--rosa-forte)]">Acolhimento</span></h1>
          <div className="flex bg-[var(--ativo-bg)] p-1 rounded-2xl border border-[var(--rosa-medio)]/20 shadow-inner">
            <button onClick={() => setActiveTab('podcast')} className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'podcast' ? 'bg-white text-[var(--rosa-forte)] shadow' : 'text-gray-400'}`}>Sala Interativa</button>
            <button onClick={() => setActiveTab('desabafos')} className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'desabafos' ? 'bg-white text-[var(--rosa-forte)] shadow' : 'text-gray-400'}`}>Mural das Mães</button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'podcast' ? (
          <motion.div key="social" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-[#0f0610] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[var(--rosa-forte)]/20">
              <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white/50 text-sm font-bold uppercase tracking-widest"><Radio size={14} className="text-pink-500" /> Sala Social</div>
                {hasJoinedLive && <span className="text-[10px] text-white/30 font-black">{participants.length} PRESENTES</span>}
              </div>

              <div className={`relative w-full overflow-hidden transition-all ${hasJoinedLive ? 'h-96' : 'h-64'} bg-gradient-to-b from-[#1a0b14] to-black`}>
                {!hasJoinedLive ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <span className="text-6xl animate-bounce">💬</span>
                    <button onClick={joinSocialRoom} className="px-10 py-4 bg-pink-500 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                      Entrar no Chat Interativo
                    </button>
                    <p className="text-white/20 text-[10px] uppercase font-bold text-center">Envie áudios, corações e mensagens em tempo real</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {participants.map((p, i) => (
                      <FloatingBubble key={p.id} participant={p} index={i} total={participants.length}
                        isSelected={selectedTargetId === p.id} isReceivingHeart={receivingHeartId === p.id}
                        onClick={() => handleSelectParticipant(p)} onBubbleRef={handleBubbleRef} />
                    ))}
                  </AnimatePresence>
                )}
                
                {hasJoinedLive && !selectedTargetId && participants.length > 1 && (
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-[9px] text-white/40 font-bold border border-white/5">
                      CLIQUE EM UMA MÃE PARA ENVIAR ❤️
                   </div>
                )}
              </div>

              {hasJoinedLive && (
                <div className="bg-black/40 border-t border-white/5">
                  <div ref={chatRef} className="h-32 overflow-y-auto px-5 py-3 space-y-1.5">
                    {chatMessages.map(m => (
                      <div key={m.id} className="text-xs text-white/70 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
                        <span className="text-pink-400 font-bold shrink-0">{m.name}:</span>
                        {m.text && <span>{m.text}</span>}
                        {m.audio && (
                           <button onClick={() => playMsgAudio(m.audio!, m.id)} className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition-all text-pink-300">
                             <Volume2 size={12} /> <span className="text-[10px] font-black uppercase">Ouvir Áudio</span>
                           </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="px-4 py-4 bg-black/50 flex gap-2 items-center">
                    {/* Recording UI */}
                    {isRecordingMsg ? (
                       <button onClick={stopRecordingMsg} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-black text-xs animate-pulse flex items-center justify-center gap-2">
                         <StopCircle size={16} /> PARAR E ENVIAR ÁUDIO
                       </button>
                    ) : recordedMsgBlob ? (
                       <div className="flex-1 flex gap-2">
                          <button onClick={() => setRecordedMsgBlob(null)} className="px-4 py-2.5 bg-white/10 text-white/40 rounded-xl font-bold text-xs uppercase">Cancelar</button>
                          <button onClick={sendAudioMessage} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-black text-xs">ENVIAR NOTA DE VOZ 🎙️</button>
                       </div>
                    ) : (
                      <>
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Sua mensagem..." className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:bg-white/10 transition-all" />
                        <button onClick={handleSendMessage} className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20"><Send size={18} /></button>
                        <button onClick={startRecordingMsg} className="w-12 h-12 bg-pink-500/20 text-pink-500 border border-pink-500/30 rounded-xl flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all"><Mic size={18} /></button>
                        <button onClick={handleSendHeart} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${selectedTargetId ? 'bg-pink-500 shadow-lg shadow-pink-500/40 scale-110' : 'bg-white/5 opacity-20'}`}>❤️</button>
                      </>
                    )}
                    <button onClick={leaveSocialRoom} className="p-2 text-white/20 hover:text-red-400 transition-colors ml-2"><PhoneOff size={18} /></button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Mural Tab */
          <div className="space-y-5">
             <div className="bg-white p-7 rounded-[2rem] shadow-xl border border-pink-50">
                <h2 className="text-lg font-black text-gray-800 mb-4 italic">Postar no Mural de Voz</h2>
                <button onClick={() => toast.info('Clique em Iniciar Gravação para criar um desabafo duradouro!')} className="w-full py-4 rounded-2xl bg-pink-50 text-pink-500 font-black text-sm uppercase flex items-center justify-center gap-2 border-2 border-pink-100 border-dashed">
                  <Mic size={18} /> Use o Microfone abaixo
                </button>
             </div>
             {desabafos.map(d => (
              <div key={d.id} className="bg-white/90 p-5 rounded-[2rem] shadow-md border border-white flex flex-col gap-4">
                <div className="flex justify-between items-center"><span className="font-bold text-sm text-pink-600">Mãe {d.author}</span><span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{d.time}</span></div>
                <button onClick={() => handlePlayFeedAudio(d)} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black transition-all ${playingFeedId === d.id ? 'bg-pink-500 text-white shadow-lg' : 'bg-gray-50 text-gray-500'}`}>
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
