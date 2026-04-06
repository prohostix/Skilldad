import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Mic, MicOff, Video, VideoOff, Users, MessageSquare,
  Monitor, Circle, PhoneOff, ChevronUp, X, Smile, StopCircle
} from 'lucide-react';

const HIDE_DELAY = 3000; // ms before controls auto-hide

const MockZoomMeeting = ({ sessionId, isHost = false, onLeave }) => {
  const [loading, setLoading]           = useState(true);
  const [joined, setJoined]             = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isRecording, setIsRecording]   = useState(false);
  const [showChat, setShowChat]         = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showEndConfirm, setShowEndConfirm]     = useState(false);
  const [isEnding, setIsEnding]         = useState(false);
  const [controlsVisible, setControlsVisible]   = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Sarah M.', text: 'Hello everyone!', time: '10:01 AM' },
    { id: 2, sender: 'John D.',  text: 'Can everyone hear me?', time: '10:02 AM' },
  ]);
  const [chatInput, setChatInput]       = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'You', isHost, video: true, audio: true }
  ]);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [elapsed, setElapsed]           = useState(0);

  const hideTimerRef  = useRef(null);
  const timerRef      = useRef(null);
  const chatEndRef    = useRef(null);
  const containerRef  = useRef(null);

  /* ── auto-hide controls on inactivity ── */
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimerRef.current);
  }, [resetHideTimer]);

  /* ── join + mock participants ── */
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      setJoined(true);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);

      if (isHost) {
        try {
          const ui   = JSON.parse(localStorage.getItem('userInfo') || '{}');
          const tok  = localStorage.getItem('token') || ui.token;
          if (tok) axios.put(`/api/sessions/${sessionId}/start`, {}, { headers: { Authorization: `Bearer ${tok}` } })
            .catch(() => {});
        } catch (_) {}
      }

      setTimeout(() => {
        setParticipants(prev => [
          ...prev,
          ...(isHost
            ? [
                { id: 2, name: 'Student A', isHost: false, video: true,  audio: true  },
                { id: 3, name: 'Student B', isHost: false, video: false, audio: true  },
                { id: 4, name: 'Student C', isHost: false, video: true,  audio: false },
              ]
            : [
                { id: 2, name: 'Instructor', isHost: true,  video: true,  audio: true  },
                { id: 3, name: 'Student A',  isHost: false, video: true,  audio: false },
                { id: 4, name: 'Student B',  isHost: false, video: false, audio: true  },
              ]),
        ]);
      }, 2000);
    }, 1500);

    return () => { clearTimeout(t); clearInterval(timerRef.current); };
  }, [isHost, sessionId]);

  /* ── simulate active speaker ── */
  useEffect(() => {
    if (!joined) return;
    const iv = setInterval(() => {
      setParticipants(prev => {
        const idx = Math.floor(Math.random() * prev.length);
        setActiveSpeakerId(prev[idx]?.id ?? null);
        return prev;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [joined]);

  /* ── scroll chat to bottom ── */
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const fmt = s => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sc = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sc}`;
  };

  const handleLeave = e => {
    e?.preventDefault(); e?.stopPropagation();
    if (!isHost) { exitMeeting(); return; }
    setShowEndConfirm(true);
  };

  const confirmEnd = async () => {
    setIsEnding(true);
    try {
      const ui  = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const tok = localStorage.getItem('token') || ui.token;
      await axios.put(`/api/sessions/${sessionId}/end`, {}, { headers: { Authorization: `Bearer ${tok}` } });
    } catch (e) { console.error('[MockZoom]', e.message); }
    finally { exitMeeting(); }
  };

  const exitMeeting = () => {
    clearInterval(timerRef.current);
    setJoined(false);
    onLeave?.();
  };

  const sendChat = e => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(), sender: 'You', text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setChatInput('');
  };

  const toggleSidebar = panel => {
    if (panel === 'chat') { setShowChat(v => !v); setShowParticipants(false); }
    else                  { setShowParticipants(v => !v); setShowChat(false); }
  };

  /* ── loading / left screens ── */
  if (loading) return (
    <div className="zoom-shell flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-[#0e72ed]/30 border-t-[#0e72ed] animate-spin" />
        <p className="text-white/60 text-sm">Joining meeting…</p>
      </div>
    </div>
  );

  if (!joined) return (
    <div className="zoom-shell flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0e72ed]/10 border border-[#0e72ed]/30 flex items-center justify-center">
          <Video className="w-8 h-8 text-[#0e72ed]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">You left the meeting</h3>
        <button onClick={onLeave} className="mt-4 px-6 py-2 bg-[#0e72ed] hover:bg-[#0a5bbf] rounded text-white text-sm font-medium transition-colors">
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  const sidebarOpen = showChat || showParticipants;
  const spotlight   = participants.find(p => p.id === activeSpeakerId) || participants.find(p => p.isHost) || participants[0];
  const thumbs      = participants.filter(p => p.id !== spotlight.id);

  return (
    <div
      ref={containerRef}
      className="zoom-shell flex flex-col"
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* ── top bar ── */}
      <div className={`zoom-topbar transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm font-medium">SkillDad Meeting</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40 text-xs font-mono tabular-nums">{fmt(elapsed)}</span>
        </div>
        <div className="flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              REC
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-0.5 rounded text-white text-[11px] font-semibold">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
          <span className="text-white/30 text-xs">{participants.length} participants</span>
        </div>
      </div>

      {/* ── main body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* video area */}
        <div className="flex flex-col flex-1 overflow-hidden bg-[#1c1c1c] relative">

          {/* spotlight */}
          <div className="flex-1 flex items-center justify-center p-3 overflow-hidden">
            <VideoTile
              participant={spotlight}
              isActive={activeSpeakerId === spotlight.id}
              large
            />
          </div>

          {/* thumbnail strip */}
          {thumbs.length > 0 && (
            <div className="flex gap-2 px-3 pb-3 overflow-x-auto flex-shrink-0 zoom-thumb-strip">
              {thumbs.map(p => (
                <VideoTile key={p.id} participant={p} isActive={activeSpeakerId === p.id} />
              ))}
            </div>
          )}
        </div>

        {/* sidebar */}
        <div className={`zoom-sidebar ${sidebarOpen ? 'zoom-sidebar--open' : ''}`}>
          {sidebarOpen && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {showChat ? 'In-Meeting Chat' : `Participants (${participants.length})`}
                </span>
                <button onClick={() => { setShowChat(false); setShowParticipants(false); }} className="text-white/40 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
                  <X size={15} />
                </button>
              </div>

              {showParticipants && (
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-[#0e72ed] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white/80 text-sm flex-1 truncate">
                        {p.name}{p.isHost ? <span className="text-white/30 text-xs ml-1">(Host)</span> : null}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        {p.audio  ? <Mic size={13} className="text-white/50" /> : <MicOff size={13} className="text-red-400" />}
                        {p.video  ? <Video size={13} className="text-white/50" /> : <VideoOff size={13} className="text-red-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showChat && (
                <>
                  <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {chatMessages.map(msg => (
                      <div key={msg.id}>
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-white text-xs font-semibold">{msg.sender}</span>
                          <span className="text-white/25 text-[10px]">{msg.time}</span>
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={sendChat} className="p-3 border-t border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-2 bg-[#333] rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-[#0e72ed]/50 transition-all">
                      <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="Type message here…"
                        className="flex-1 bg-transparent text-white text-xs outline-none placeholder-white/25"
                      />
                      <button type="button" className="text-white/25 hover:text-white/60 transition-colors">
                        <Smile size={14} />
                      </button>
                    </div>
                    <p className="text-white/20 text-[10px] mt-1.5 text-center">Press Enter to send to everyone</p>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── bottom control bar ── */}
      <div className={`zoom-controls transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* left */}
        <div className="flex items-center gap-1">
          <CtrlBtn
            icon={audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            label={audioEnabled ? 'Mute' : 'Unmute'}
            danger={!audioEnabled}
            onClick={() => setAudioEnabled(v => !v)}
            chevron
          />
          <CtrlBtn
            icon={videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            label={videoEnabled ? 'Stop Video' : 'Start Video'}
            danger={!videoEnabled}
            onClick={() => setVideoEnabled(v => !v)}
            chevron
          />
        </div>

        {/* center */}
        <div className="flex items-center gap-1">
          <CtrlBtn icon={<Users size={20} />}         label="Participants" active={showParticipants} badge={participants.length} onClick={() => toggleSidebar('participants')} />
          <CtrlBtn icon={<MessageSquare size={20} />} label="Chat"         active={showChat}         onClick={() => toggleSidebar('chat')} />
          <CtrlBtn icon={<Monitor size={20} />}       label="Share Screen" onClick={() => {}} />
          {isHost && (
            <CtrlBtn
              icon={isRecording ? <StopCircle size={20} /> : <Circle size={20} />}
              label={isRecording ? 'Stop Rec' : 'Record'}
              danger={isRecording}
              onClick={() => setIsRecording(v => !v)}
            />
          )}
        </div>

        {/* right */}
        <div className="flex items-center">
          <button
            onClick={handleLeave}
            className="flex items-center gap-2 bg-[#e02020] hover:bg-[#c01010] active:scale-95 text-white px-5 py-2 rounded text-sm font-semibold transition-all duration-150"
          >
            <PhoneOff size={16} />
            {isHost ? 'End' : 'Leave'}
          </button>
        </div>
      </div>

      {/* ── end confirm modal ── */}
      {showEndConfirm && createPortal(
        <div className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
          <div className="w-full max-w-sm bg-[#2d2d2d] border border-white/10 rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-white text-base font-semibold mb-2">End Meeting for All?</h3>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              This will end the meeting for all participants and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button disabled={isEnding}
                onClick={e => { e.preventDefault(); e.stopPropagation(); setShowEndConfirm(false); }}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded text-sm font-medium transition-colors">
                Cancel
              </button>
              <button disabled={isEnding}
                onClick={e => { e.preventDefault(); e.stopPropagation(); confirmEnd(); }}
                className="flex-1 py-2.5 bg-[#e02020] hover:bg-[#c01010] text-white rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {isEnding
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'End Meeting for All'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

/* ── VideoTile ── */
const VideoTile = ({ participant: p, isActive, large = false }) => (
  <div className={`
    zoom-tile
    ${large ? 'zoom-tile--large' : 'zoom-tile--thumb'}
    ${isActive ? 'zoom-tile--active' : ''}
  `}>
    <div className={`w-full h-full flex items-center justify-center ${p.video ? 'bg-gradient-to-br from-[#2a2a3e] to-[#1a1a2e]' : 'bg-[#2d2d2d]'}`}>
      <div className={`rounded-full flex items-center justify-center text-white font-bold shadow-lg
        ${large ? 'w-24 h-24 text-4xl' : 'w-10 h-10 text-lg'}
        ${p.isHost ? 'bg-[#0e72ed]' : 'bg-[#444]'}
      `}>
        {p.name.charAt(0).toUpperCase()}
      </div>
    </div>
    {/* name tag */}
    <div className="zoom-tile__name">
      {!p.audio && <MicOff size={large ? 11 : 9} className="text-red-400 flex-shrink-0" />}
      <span className="truncate">{p.name}{p.isHost ? ' (Host)' : ''}</span>
    </div>
    {/* active speaker pulse */}
    {isActive && <div className="zoom-tile__speaker-ring" />}
  </div>
);

/* ── CtrlBtn ── */
const CtrlBtn = ({ icon, label, danger, active, onClick, chevron, badge }) => (
  <button onClick={onClick} className={`zoom-ctrl-btn ${danger ? 'zoom-ctrl-btn--danger' : ''} ${active ? 'zoom-ctrl-btn--active' : ''}`}>
    <span className="relative">
      {icon}
      {chevron && <ChevronUp size={9} className="absolute -right-3 -top-0.5 text-white/30" />}
      {badge != null && (
        <span className="absolute -top-2 -right-2 bg-[#0e72ed] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {badge}
        </span>
      )}
    </span>
    <span className="zoom-ctrl-btn__label">{label}</span>
  </button>
);

export default MockZoomMeeting;
