import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Headphones, Mic, StopCircle, Send, Trash2, Heart, Share2, Volume2,
  Loader2, MessageSquarePlus, Radio, Info, PhoneCall, PhoneOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

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
        ? { scale: [heartScale, heartScale * 1.3, heartScale], opacity: 1, y: [0, -12, 0] }
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
      {participant.speaking && (
        <motion.div animate={{ scale: [1, 1.9, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 0.9, repeat: Infinity }}
          className="absolute rounded-full bg-pink-400/40" style={{ width: bubblePx + 16, height: bubblePx + 16, top: -8, left: -8 }} />
      )}
      <motion.div animate={{ width: bubblePx, height: bubblePx }} transition={{ type: 'spring' }}
        className="rounded-full bg-gradient-to-br from-pink-300/80 to-rose-500/60 flex items-center justify-center shadow-2xl border-4 border-white/30 ring-2 ring-pink-400/20 overflow-hidden"
        style={{ fontSize: Math.round(bubblePx * 0.4) }}>
        {participant.emoji || '🌸'}
      </motion.div>
      <span className="text-[9px] font-black text-white/80 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full truncate max-w-[78px]">
        {participant.isMe ? `${participant.name} (você)` : participant.name}
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

  /* ── Jitsi Live state ── */
  const [hasJoinedLive, setHasJoinedLive] = useState(false);
  const [isJoiningLive, setIsJoiningLive] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<any>(null);
  const [heartParticles, setHeartParticles] = useState<any[]>([]);
  const [scorePopups, setScorePopups] = useState<any[]>([]);
  const [receivingHeartId, setReceivingHeartId] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ id: number; name: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [micLevel, setMicLevel] = useState(0);

  const jitsiApiRef = useRef<any>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const bubbleRefsMap = useRef<Map<any, HTMLDivElement>>(new Map());

  const [myName] = useState(() => {
    try { const p = localStorage.getItem('almas_empreendedora_profile'); return p ? JSON.parse(p).nomeEmpreendedora || 'Mãe' : 'Mãe'; } catch { return 'Mãe'; }
  });
  const [myEmoji] = useState(() => avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  const handleBubbleRef = useCallback((id: any, el: HTMLDivElement | null) => {
    if (el) bubbleRefsMap.current.set(id, el);
    else bubbleRefsMap.current.delete(id);
  }, []);

  /* ── Jitsi Integration ── */
  const handleJoinLiveRoom = async () => {
    if (!window.JitsiMeetExternalAPI) {
      toast.error('Carregando sistema de áudio... tente novamente em 2 segundos.');
      return;
    }
    setIsJoiningLive(true);
    try {
      const domain = 'meet.jit.si';
      const options = {
        roomName: 'AlmasAtipicas_Radio_Live_Acolhimento',
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: { displayName: `${myName}|${myEmoji}` },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: true,
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          hideConferenceTimer: true,
          toolbarButtons: []
        },
        interfaceConfigOverwrite: {
          HIDE_INVITE_ON_CONNECTION_MSG: true,
          RECENT_LIST_ENABLED: false,
          TOOLBAR_BUTTONS: []
        }
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      api.addEventListeners({
        videoConferenceJoined: (local: any) => {
          setParticipants([{ id: local.id, name: myName, emoji: myEmoji, speaking: false, isMe: true, hearts: 0 }]);
          setHasJoinedLive(true);
          setIsJoiningLive(false);
          toast.success('🎙️ Conectada à Sala de Apoio!');
        },
        participantJoined: (p: any) => {
          const [name, emoji] = p.displayName?.split('|') || [p.displayName, '🌸'];
          setParticipants(prev => [...prev.filter(x => x.id !== p.id), { id: p.id, name, emoji, speaking: false, hearts: 0 }]);
          toast.info(`${name} entrou na sala!`);
        },
        participantLeft: (p: any) => {
          setParticipants(prev => prev.filter(x => x.id !== p.id));
          if (selectedTargetId === p.id) setSelectedTargetId(null);
        },
        endpointTextMessageReceived: (data: any) => {
          try {
            const msg = JSON.parse(data.eventData.text);
            if (msg.type === 'heart' && msg.targetId) {
              triggerHeartVisuals(msg.targetId);
            } else if (msg.type === 'chat') {
              setChatMessages(prev => [...prev, { id: Date.now(), name: msg.name, text: msg.text }]);
            }
          } catch (e) { console.error('Data error:', e); }
        },
        audioLevelChanged: (data: any) => {
          setMicLevel(data.audioLevel * 100);
          setParticipants(prev => prev.map(p => p.isMe ? { ...p, speaking: data.audioLevel > 0.05 } : p));
        }
      });
    } catch (err) {
      console.error(err);
      toast.error('Erro ao conectar.');
      setIsJoiningLive(false);
    }
  };

  const handleLeaveLiveRoom = () => {
    jitsiApiRef.current?.dispose();
    jitsiApiRef.current = null;
    setHasJoinedLive(false);
    setParticipants([]);
    setSelectedTargetId(null);
    setHeartParticles([]);
    setScorePopups([]);
    setChatMessages([]);
    toast.success('Você saiu da sala.');
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
    setParticipants(prev => prev.map(p => p.id === targetId ? { ...p, hearts: Math.min((p.hearts || 0) + 1, 20) } : p));
  };

  const handleSendHeart = () => {
    if (!selectedTargetId) { toast.info('Selecione uma bolha primeiro.'); return; }
    jitsiApiRef.current?.executeCommand('sendEndpointTextMessage', '', JSON.stringify({ type: 'heart', targetId: selectedTargetId }));
    triggerHeartVisuals(selectedTargetId);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    jitsiApiRef.current?.executeCommand('sendEndpointTextMessage', '', JSON.stringify({ type: 'chat', name: myName, text: chatInput.trim() }));
    setChatMessages(prev => [...prev, { id: Date.now(), name: myName, text: chatInput.trim() }]);
    setChatInput('');
  };

  /* ── Audio Recorder ── */
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [playingFeedId, setPlayingFeedId] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioFeedRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let t: any;
    if (isRecording) t = setInterval(() => setRecordingTime(v => v + 1), 1000);
    else setRecordingTime(0);
    return () => clearInterval(t);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(s);
      mediaRecorderRef.current = mr; chunksRef.current = [];
      mr.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => { setAudioBlob(new Blob(chunksRef.current, { type: 'audio/webm' })); s.getTracks().forEach(track => track.stop()); };
      mr.start(); setIsRecording(true);
    } catch { toast.error('Microfone negado.'); }
  };
  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  const handlePostAudio = () => {
    if (!audioBlob) return; setIsUploading(true);
    const r = new FileReader(); r.readAsDataURL(audioBlob);
    r.onloadend = async () => {
      const d = { id: Date.now(), author: myName, city: 'Seguro', content: '', likes: 0, time: 'Agora', duration: '00:00', audioData: r.result, isUserAuthor: true };
      await saveDesabafoToDB(d); setDesabafos([d, ...desabafos]); setIsUploading(false); setAudioBlob(null); toast.success('Postado!');
    };
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <AnimatePresence>
        {heartParticles.map(p => <HeartParticle key={p.id} {...p} onDone={() => setHeartParticles(v => v.filter(x => x.id !== p.id))} />)}
        {scorePopups.map(p => <ScorePopup key={p.id} {...p} onDone={() => setScorePopups(v => v.filter(x => x.id !== p.id))} />)}
      </AnimatePresence>

      <div className="bg-white/65 shadow-xl backdrop-blur-md rounded-[2.5rem] border border-white/60 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-[var(--texto-escuro)]">Voz & <span className="text-[var(--rosa-forte)]">Acolhimento</span></h1>
          <div className="flex bg-[var(--ativo-bg)] p-1 rounded-2xl border border-[var(--rosa-medio)]/20 shadow-inner">
            <button onClick={() => setActiveTab('podcast')} className={`px-5 py-2 rounded-xl text-sm font-black ${activeTab === 'podcast' ? 'bg-white text-[var(--rosa-forte)] shadow' : 'text-gray-400'}`}>Sala ao Vivo</button>
            <button onClick={() => setActiveTab('desabafos')} className={`px-5 py-2 rounded-xl text-sm font-black ${activeTab === 'desabafos' ? 'bg-white text-[var(--rosa-forte)] shadow' : 'text-gray-400'}`}>Voz das Mães</button>
          </div>
        </div>
      </div>

      <div ref={jitsiContainerRef} className="hidden opacity-0 pointer-events-none" style={{ width: 0, height: 0 }} />

      <AnimatePresence mode="wait">
        {activeTab === 'podcast' ? (
          <motion.div key="pod" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-[#0f0610] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[var(--rosa-forte)]/20">
              <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex justify-between">
                <div className="flex items-center gap-2 text-white/50 text-sm italic font-serif"><Radio size={14} className="text-red-500" /> Sala de Apoio</div>
                {hasJoinedLive && <span className="text-[10px] text-white/30 font-black uppercase">{participants.length} pessoas</span>}
              </div>
              <div className={`relative w-full overflow-hidden transition-all ${hasJoinedLive ? 'h-96' : 'h-64'} bg-[#1a0b14]`}>
                {!hasJoinedLive ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <span className="text-6xl">🎙️</span>
                    <button onClick={handleJoinLiveRoom} disabled={isJoiningLive} className="px-8 py-4 bg-pink-500 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                      {isJoiningLive ? 'Conectando...' : 'Entrar na Sala'}
                    </button>
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
              </div>
              {hasJoinedLive && (
                <>
                  <div ref={chatRef} className="h-28 overflow-y-auto px-5 pt-3 pb-1 bg-black/25 space-y-1">
                    {chatMessages.map(m => <div key={m.id} className="text-xs text-white/70"><span className="text-pink-400 font-bold">{m.name}:</span> {m.text}</div>)}
                  </div>
                  <div className="px-4 py-3 bg-black/30 border-t border-white/5 flex gap-2">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Mensagem..." className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-white outline-none" />
                    <button onClick={handleSendMessage} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"><Send size={14} /></button>
                    <button onClick={handleSendHeart} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${selectedTargetId ? 'bg-pink-500' : 'bg-white/10 opacity-30'}`}>❤️</button>
                    <button onClick={handleLeaveLiveRoom} className="px-4 h-10 bg-red-500 text-white font-bold rounded-xl text-[10px] uppercase">Sair</button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          /* ── Desabafos Tab Simplificado ── */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100 text-center">
              <h2 className="text-xl font-bold mb-4">Novo Desabafo</h2>
              <button onClick={isRecording ? stopRecording : startRecording} className={`w-full py-4 rounded-xl font-bold ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-pink-500 text-white'}`}>
                {isRecording ? 'Parar Gravação' : 'Iniciar Microfone'}
              </button>
              {audioBlob && <button onClick={handlePostAudio} className="w-full mt-2 py-4 bg-green-500 text-white font-bold rounded-xl">Publicar</button>}
            </div>
            {desabafos.map(d => (
              <div key={d.id} className="bg-white p-5 rounded-3xl shadow-md border border-gray-50 flex flex-col gap-4">
                <div className="flex justify-between items-center"><span className="font-bold text-sm text-pink-600">{d.author}</span><span className="text-[10px] text-gray-400">{d.time}</span></div>
                <button onClick={() => handlePlayFeedAudio(d)} className="w-full py-3 bg-gray-100 rounded-xl flex items-center justify-center gap-2 font-bold text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-all">
                  <Headphones size={16} /> Ouvir Desabafo ({d.duration || 'Gravação'})
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleApoiar(d.id)} className={`flex-1 py-2 rounded-xl border text-xs font-bold ${d.hasLiked ? 'bg-pink-500 text-white' : 'text-pink-500 border-pink-100'}`}>Apoiar {d.likes > 0 && `(${d.likes})`}</button>
                  {d.isUserAuthor && <button onClick={() => handleDeleteDesabafo(d.id)} className="px-4 py-2 border border-red-100 text-red-400 rounded-xl"><Trash2 size={14} /></button>}
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
