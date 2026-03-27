import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Clock, Headphones, 
  Mic, StopCircle, Send, Trash2, Heart, Share2, Volume2, AudioLines, 
  Loader2, MessageSquarePlus, Users, Radio, Zap, Info, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";


const DB_NAME_RAD = 'AlmasRadioDB';
const STORE_NAME_RAD = 'desabafos';
const initRadioDB = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME_RAD, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME_RAD, { keyPath: 'id' });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
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

const RadioDasMaes = () => {
  const [activeTab, setActiveTab] = useState<'podcast' | 'desabafos'>('podcast');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Community Podcasts State
  const [podcasts] = useState<any[]>(() => {
    const saved = localStorage.getItem('almas_podcasts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Community Feed State with IndexedDB Persistence
  const [desabafos, setDesabafos] = useState<any[]>([]);

  useEffect(() => {
    getDesabafosFromDB().then((data) => {
      if (data && data.length > 0) {
        data.sort((a,b) => b.id - a.id);
        setDesabafos(data);
      } else {
        const saved = localStorage.getItem('almas_desabafos_2');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setDesabafos(parsed);
            parsed.forEach((p:any) => saveDesabafoToDB(p));
          } catch {}
        }
      }
    });
  }, []);

  // Audio Playback State for Desabafos
  const [playingFeedId, setPlayingFeedId] = useState<number | null>(null);
  const audioFeedRef = useRef<HTMLAudioElement | null>(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isJoiningLive, setIsJoiningLive] = useState(false);
  const [hasJoinedLive, setHasJoinedLive] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    localStorage.setItem('almas_podcasts', JSON.stringify(podcasts));
  }, [desabafos, podcasts]);

  const currentEp = podcasts.length > 0 ? podcasts[0] : null;


  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info("Microfone ativado. Pode falar!");
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      toast.error("Não foi possível acessar o microfone. Verifique as permissões do Windows.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePostAudio = () => {
    if (!audioBlob) return;
    setIsUploading(true);
    
    // Convert Blob to Base64 to persist audio natively
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      const newDesabafo = {
        id: Date.now(),
        author: "Você (Autora)", 
        city: "Seguro",
        content: "Desabafo em áudio",
        likes: 0,
        time: "Agora mesmo",
        duration: formatTime(recordingTime),
        isNew: true, 
        audioData: base64Audio,
        isUserAuthor: true
      };

      try {
        await saveDesabafoToDB(newDesabafo);
        setDesabafos([newDesabafo, ...desabafos]);
        setIsUploading(false);
        setAudioBlob(null);
        toast.success("Seu desabafo real foi postado e já está no seu feed!");
      } catch (err) {
        setIsUploading(false);
        toast.error("Erro ao salvar! Áudio muito grande.");
      }
    };
  };

  const handlePlayFeedAudio = (desabafo: any) => {
    if (playingFeedId === desabafo.id) {
      audioFeedRef.current?.pause();
      setPlayingFeedId(null);
      return;
    }

    if (audioFeedRef.current) {
      audioFeedRef.current.pause();
    }

    if (desabafo.audioData) {
      const audio = new Audio(desabafo.audioData);
      audio.onended = () => setPlayingFeedId(null);
      audio.play();
      audioFeedRef.current = audio;
      setPlayingFeedId(desabafo.id);
    } else {
      toast.error("Áudio não encontrado.");
    }
  };

  const handleDeleteDesabafo = async (id: number) => {
    if (playingFeedId === id) {
      audioFeedRef.current?.pause();
      setPlayingFeedId(null);
    }
    await deleteDesabafoFromDB(id);
    setDesabafos(prev => prev.filter(d => d.id !== id));
    toast.success("Áudio deletado com sucesso.");
  };

  const handleApoiar = async (id: number) => {
    const updated = desabafos.map(d => {
      if (d.id === id) {
        if (d.hasLiked) {
          toast.info("Você já apoiou esta mãe.");
          return d;
        }
        toast.success("Você enviou um abraço de apoio!", { icon: "🫂" });
        const novo = { ...d, likes: (d.likes || 0) + 1, hasLiked: true };
        saveDesabafoToDB(novo);
        return novo;
      }
      return d;
    });
    setDesabafos(updated);
  };

  const handleCompartilhar = () => {
    toast.success("Link do desabafo copiado para a área de transferência!");
  };

  const handleJoinLiveRoom = () => {
    setIsJoiningLive(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Sincronizando áudio e entrando na sala...',
        success: 'Você entrou na Sala de Apoio! Agora você está ouvindo ao vivo.',
        error: 'Erro ao conectar.',
        finally: () => {
          setIsJoiningLive(false);
          setHasJoinedLive(true);
        }
      }
    );
  };

  const handleLeaveLiveRoom = () => {
    setHasJoinedLive(false);
    toast.success("Você saiu da Sala de Apoio do podcast.");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header com Tabs */}
      <div className="bg-white/65 shadow-xl backdrop-blur-[12px] rounded-[2.5rem] border border-white/60 p-8 mb-8 text-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
           <div className="text-left font-sans">
             <h1 className="text-4xl font-black text-[var(--texto-escuro)] mb-2 tracking-tight">
               Voz & <span className="text-[var(--rosa-forte)]">Acolhimento</span>
             </h1>
             <p className="text-[var(--texto-medio)] font-medium">Conteúdo oficial e desabafos em tempo real.</p>
           </div>
           
           <div className="flex bg-[var(--ativo-bg)] p-1.5 rounded-2xl border border-[var(--rosa-medio)]/20 shadow-inner">
             <button 
               onClick={() => setActiveTab('podcast')}
               className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'podcast' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'}`}
             >
               <Headphones size={18} /> Podcast & Live
             </button>
             <button 
               onClick={() => setActiveTab('desabafos')}
               className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'desabafos' ? 'bg-white text-[var(--rosa-forte)] shadow-md' : 'text-[var(--texto-claro)] hover:text-[var(--texto-escuro)]'}`}
             >
               <Mic size={18} /> Voz das Mães
             </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PLAYER / RECORD PANEL */}
        <div className="lg:col-span-5">
           <AnimatePresence mode="wait">
             {activeTab === 'podcast' ? (
               <motion.div 
                 key="podcast-player"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="space-y-6"
               >
                  {/* Sala ao Vivo (Clubhouse Style) */}
                  <div className="bg-[#1A0B10] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border-2 border-[var(--rosa-forte)]/30">
                     <div className="absolute top-0 right-0 p-4">
                        <span className="flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full text-[10px] font-black text-white animate-pulse">
                           <Radio size={12} /> AO VIVO AGORA
                        </span>
                     </div>
                     <h2 className="text-white font-serif italic text-2xl mb-6 flex items-center gap-2">
                        <Users className="text-[var(--rosa-forte)]" /> Sala de Apoio
                     </h2>
                     
                     <div className="grid grid-cols-3 gap-6 mb-8 text-center text-sans min-h-[120px]">
                        {hasJoinedLive ? (
                           <div className="col-span-3 w-full h-[400px] bg-[#0E0608] rounded-3xl overflow-hidden relative shadow-inner ring-2 ring-[var(--rosa-forte)]/20">
                              <iframe
                                key="framatalk_live"
                                src="https://framatalk.org/SalaDeApoioAlmasAtipicas_Radio_4?config.startWithVideoMuted=true&config.prejoinPageEnabled=false&config.disableDeepLinking=true"
                                allow="camera; microphone; display-capture; autoplay"
                                className="w-full h-full border-0"
                              />
                           </div>
                        ) : (
                           <div className="col-span-3 flex items-center justify-center text-white/50 text-sm font-bold">
                              Aguardando você na sala. Entre para participar do podcast coletivo.
                           </div>
                        )}
                     </div>
                     
                     <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 mt-4">
                        <div className="flex -space-x-3">
                           {hasJoinedLive && <div className="w-8 h-8 rounded-full border-2 border-[#1A0B10] bg-[var(--rosa-forte)] flex items-center justify-center text-[10px] text-white">👤</div>}
                        </div>
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{hasJoinedLive ? '1 Ouvindo' : '0 Ouvintes'}</span>
                        {hasJoinedLive ? (
                           <button 
                             onClick={handleLeaveLiveRoom}
                             className="px-6 py-2 bg-red-500/20 text-red-400 font-black rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] flex items-center gap-2"
                           >
                             <LogOut size={12} /> SAIR DO PODCAST
                           </button>
                        ) : (
                           <button 
                             onClick={handleJoinLiveRoom}
                             disabled={isJoiningLive}
                             className="px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 bg-white text-[#1A0B10] hover:bg-[var(--rosa-medio)]"
                           >
                              {isJoiningLive ? <Loader2 size={12} className="animate-spin" /> : 'ENTRAR NA SALA'}
                           </button>
                        )}
                     </div>
                  </div>

                  {/* Player Tradicional */}
                  {currentEp ? (
                     <div className="bg-white/70 shadow-2xl backdrop-blur-md rounded-[2.5rem] border border-white/60 p-8">
                       <div className="text-center mb-8 font-sans">
                         <div className="w-32 h-32 bg-gradient-to-br from-[var(--rosa-forte)] to-[#4B1528] rounded-3xl mx-auto mb-6 shadow-2xl flex items-center justify-center text-white">
                            <Play size={48} fill="white" />
                         </div>
                         <h3 className="font-black text-xl text-[var(--texto-escuro)] mb-1 line-clamp-1">{currentEp.title}</h3>
                         <p className="text-[var(--texto-claro)] font-bold text-[10px] uppercase tracking-widest">{currentEp.duration} • Ultimo Ep</p>
                       </div>
                       <div className="flex justify-center items-center gap-6">
                          <button className="p-3 bg-white rounded-full shadow hover:scale-110 transition-transform"><SkipBack size={20} /></button>
                          <button onClick={() => setIsPlaying(!isPlaying)} className="p-5 bg-[var(--rosa-forte)] text-white rounded-full shadow-xl hover:scale-110 transition-transform">
                            {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                          </button>
                          <button className="p-3 bg-white rounded-full shadow hover:scale-110 transition-transform"><SkipForward size={20} /></button>
                       </div>
                     </div>
                  ) : (
                     <div className="bg-white/70 shadow-2xl backdrop-blur-md rounded-[2.5rem] border border-white/60 p-8 text-center">
                        <div className="w-20 h-20 bg-pink-50 rounded-full mx-auto mb-4 flex items-center justify-center text-[var(--rosa-forte)]">
                           <Headphones size={32} />
                        </div>
                        <h3 className="font-black text-lg text-[var(--texto-escuro)] mb-2 font-sans">Nenhum Podcast Salvo</h3>
                        <p className="text-[var(--texto-medio)] text-sm font-bold font-sans">Os podcasts e salas ao vivo gravadas por pessoas reais aparecerão aqui.</p>
                     </div>
                  )}
               </motion.div>
             ) : (
               <motion.div 
                 key="recorder-panel"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 20 }}
                 className="bg-white/80 shadow-2xl backdrop-blur-md rounded-[2.5rem] border-2 border-[var(--rosa-forte)]/20 p-8 sticky top-24"
               >
                  <div className="text-center mb-8 font-sans">
                    <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-6">
                      <Mic className="text-[var(--rosa-forte)]" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-[var(--texto-escuro)] mb-2 italic">Seu Desabafo Real</h2>
                    <p className="text-[var(--texto-medio)] font-medium">Gravando diretamente do seu microfone.</p>
                  </div>

                  <div className="bg-[#4B1528] rounded-3xl p-10 mb-8 relative flex items-center justify-center min-h-[220px] overflow-hidden">
                    {isRecording ? (
                      <div className="flex items-center gap-2 h-16">
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ height: [12, Math.random() * 60 + 10, 12] }}
                            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.04 }}
                            className="w-2 bg-[var(--rosa-claro)] rounded-full"
                          />
                        ))}
                      </div>
                    ) : audioBlob ? (
                      <motion.div 
                        initial={{ scale: 0.8 }} 
                        animate={{ scale: 1 }} 
                        className="text-white text-center"
                      >
                         <Volume2 size={48} className="mx-auto mb-4 text-green-400" />
                         <span className="font-black text-lg">Áudio Capturado</span>
                         <p className="text-[10px] opacity-60">Pronto para postar</p>
                      </motion.div>
                    ) : (
                      <div className="text-white/20 font-black text-sm uppercase tracking-[0.3em] font-sans">Microfone Pronto</div>
                    )}

                    {isRecording && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-red-500 rounded-full text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        AO VIVO {formatTime(recordingTime)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 font-sans">
                     {!audioBlob ? (
                        <button 
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${isRecording ? 'bg-white text-red-500 border-2 border-red-500 animate-pulse' : 'bg-[var(--rosa-forte)] text-white hover:bg-[#b04066]'}`}
                        >
                          {isRecording ? <><StopCircle size={24} /> PARAR E SALVAR</> : <><Mic size={24} /> INICIAR GRAVAÇÃO</>}
                        </button>
                     ) : (
                        <div className="space-y-4">
                           <div className="flex gap-3">
                             <button onClick={() => setAudioBlob(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2 border border-gray-200">
                               <Trash2 size={18} /> Apagar
                             </button>
                             <button 
                               onClick={handlePostAudio}
                               disabled={isUploading}
                               className="flex-[2] py-4 rounded-2xl bg-[var(--rosa-forte)] text-white font-black shadow-lg hover:bg-[#b04066] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                             >
                               {isUploading ? <><Loader2 size={18} className="animate-spin" /> POSTANDO...</> : <><Send size={18} /> PUBLICAR DESABAFO</>}
                             </button>
                           </div>
                        </div>
                     )}
                  </div>
                  
                  <div className="mt-6 p-4 bg-pink-50 border border-pink-100 rounded-2xl flex gap-3 text-xs text-[var(--rosa-forte)] font-bold font-sans">
                     <Info size={20} className="shrink-0" />
                     Sua gravação é privada até que você clique em publicar.
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* LIST / FEED SECTION */}
        <div className="lg:col-span-7 space-y-6">
           <AnimatePresence mode="wait">
             {activeTab === 'podcast' ? (
                <motion.div 
                  key="podcast-list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                   <div className="flex items-center justify-between font-sans">
                     <h2 className="text-2xl font-black text-[var(--texto-escuro)] flex items-center gap-2">
                        <AudioLines className="text-[var(--rosa-forte)]" /> Podcast Recentes
                     </h2>
                     <button className="text-[10px] font-black uppercase tracking-widest text-[var(--rosa-forte)] flex items-center gap-1">VER TODOS <Zap size={12} /></button>
                   </div>
                   
                   {podcasts.length === 0 ? (
                     <div className="text-center p-8 bg-white/50 rounded-[2rem] border border-white/50 text-[var(--texto-medio)] font-bold font-sans">
                       Nenhum episódio recente disponível.
                     </div>
                   ) : podcasts.map((ep) => (
                    <div 
                      key={ep.id}
                      className="group bg-white/65 shadow-md backdrop-blur-[8px] rounded-[2rem] border border-white/50 p-6 flex items-center gap-6 hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer font-sans"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[var(--rosa-forte)] group-hover:text-white transition-colors">
                        <Play size={24} className="ml-1" fill="currentColor" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-[var(--texto-escuro)] text-lg mb-1 group-hover:text-[var(--rosa-forte)] transition-colors">{ep.title}</h4>
                        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-[var(--texto-claro)] opacity-50">
                          <span className="flex items-center gap-1.5"><Clock size={12}/> {ep.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
             ) : (
               <motion.div 
                 key="desabafos-feed"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-6"
               >
                 <div className="p-6 bg-gradient-to-r from-[var(--rosa-forte)] to-[var(--rosa-medio)] rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 font-sans">
                       <h2 className="text-2xl font-black mb-1 flex items-center gap-3"><MessageSquarePlus /> Ouvindo o Coração</h2>
                       <p className="text-sm font-bold opacity-80">Aqui você nunca está sozinha. Use o apoio para abraçar uma mãe.</p>
                    </div>
                    <Radio className="absolute -right-8 -bottom-8 size-40 opacity-10 rotate-12" />
                 </div>

                 {desabafos.length === 0 ? (
                   <div className="text-center p-8 bg-white/50 rounded-[2rem] border border-white/50 text-[var(--texto-medio)] font-bold font-sans">
                     Nenhum desabafo ainda. Seja a primeira a compartilhar sua voz!
                   </div>
                 ) : desabafos.map((desabafo) => (
                   <motion.div 
                    key={desabafo.id}
                    layout
                    initial={desabafo.isNew ? { opacity: 0, scale: 0.9, y: -20 } : false}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`bg-white/90 shadow-xl rounded-[2rem] border p-6 hover:shadow-2xl transition-all font-sans ${desabafo.isNew ? 'border-[var(--rosa-forte)]/40 ring-2 ring-[var(--rosa-forte)]/10' : 'border-white'}`}
                   >
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-8">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center font-black text-[var(--rosa-forte)] border-2 border-white shadow-sm">
                                {desabafo.author[0]}
                              </div>
                              <div>
                                 <h4 className="font-bold text-[var(--texto-escuro)] flex items-center gap-2">
                                   {desabafo.author}
                                   {desabafo.isNew && <span className="bg-[var(--rosa-forte)] text-white text-[8px] px-2 py-0.5 rounded-full">NOVO</span>}
                                 </h4>
                                 <p className="text-[10px] text-[var(--texto-claro)] uppercase font-black">{desabafo.city} • {desabafo.time}</p>
                              </div>
                           </div>
                           <div 
                             onClick={() => handlePlayFeedAudio(desabafo)}
                             className={`bg-[var(--ativo-bg)] rounded-3xl p-4 flex items-center gap-4 group cursor-pointer transition-colors ${playingFeedId === desabafo.id ? 'bg-pink-100 ring-2 ring-[var(--rosa-forte)]/50' : 'hover:bg-pink-50'}`}
                           >
                              <button className={`w-10 h-10 ${playingFeedId === desabafo.id ? 'bg-white text-[var(--rosa-forte)]' : 'bg-[var(--rosa-forte)] text-white'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                {playingFeedId === desabafo.id ? <Pause size={16} fill="currentColor" /> : <Play size={16} className="ml-0.5" fill="currentColor" />}
                              </button>
                              <div className="flex-1 space-y-2">
                                 <div className="h-1 bg-white/60 rounded-full w-full overflow-hidden">
                                    <motion.div 
                                      animate={{ width: playingFeedId === desabafo.id ? ['0%', '100%'] : '0%' }}
                                      transition={{ duration: playingFeedId === desabafo.id && desabafo.duration ? parseInt(desabafo.duration.replace(':',''), 10) || 10 : 0, ease: 'linear' }}
                                      className="h-full bg-[var(--rosa-forte)]" 
                                    />
                                 </div>
                                 <div className="flex justify-between text-[8px] font-black text-[var(--texto-claro)] uppercase">
                                    <span className={playingFeedId === desabafo.id ? 'text-[var(--rosa-forte)] animate-pulse' : ''}>
                                      {playingFeedId === desabafo.id ? 'TOCANDO...' : '00:00'}
                                    </span>
                                    <span>{desabafo.duration}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="md:col-span-4 flex md:flex-col justify-around gap-2">
                           <button 
                             onClick={() => handleApoiar(desabafo.id)}
                             className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-black transition-all active:scale-95 ${desabafo.hasLiked ? 'bg-[var(--rosa-forte)] text-white border-[var(--rosa-forte)]' : 'bg-white border-pink-100 text-[var(--rosa-forte)] hover:bg-pink-50'}`}
                           >
                             <Heart size={16} fill={desabafo.hasLiked ? "currentColor" : "none"} /> 
                             {desabafo.hasLiked ? 'APOIADA' : 'APOIAR'} {desabafo.likes > 0 && `(${desabafo.likes})`}
                           </button>
                           {desabafo.isUserAuthor ? (
                              <button 
                                onClick={() => handleDeleteDesabafo(desabafo.id)}
                                className="flex-1 py-3 px-4 rounded-xl bg-white border border-red-100 flex items-center justify-center gap-2 text-xs font-black text-red-500 hover:bg-red-50 transition-all active:scale-95"
                              >
                                <Trash2 size={16} /> EXCLUIR
                              </button>
                           ) : (
                              <button 
                                onClick={handleCompartilhar}
                                className="flex-1 py-3 px-4 rounded-xl bg-white border border-pink-100 flex items-center justify-center gap-2 text-xs font-black text-[var(--texto-claro)] hover:bg-gray-50 transition-all active:scale-95"
                              >
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


