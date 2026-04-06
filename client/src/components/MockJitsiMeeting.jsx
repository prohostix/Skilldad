import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Mic, MicOff, Video, VideoOff, Users, MessageSquare,
  Monitor, Circle, PhoneOff, X, Smile, StopCircle,
  Settings, Grid, Layout, CameraOff, AlertCircle, PenTool
} from 'lucide-react';

const HIDE_DELAY = 4000;

/**
 * MockJitsiMeeting
 * Uses real getUserMedia for camera/mic — shows live local video feed.
 * Remote participants remain simulated (no real P2P WebRTC in mock mode).
 */
const MockJitsiMeeting = ({ sessionId, isHost = false, onLeave }) => {
  // ── Media State ──────────────────────────────────────────────────────────
  const [localStream, setLocalStream]   = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [mediaError, setMediaError]     = useState(null);
  const localVideoRef = useRef(null);
  const streamRef     = useRef(null);

  const [screenStream, setScreenStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenVideoRef = useRef(null);

  // ── Meeting State ─────────────────────────────────────────────────────────
  const [loading, setLoading]   = useState(true);
  const [joined, setJoined]     = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [viewMode, setViewMode] = useState('stage');
  const [elapsed, setElapsed]   = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'System', text: 'Connected to session.', time: '', isSystem: true },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'You', isHost, video: true, audio: true, isLocal: true }
  ]);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [showMockWhiteboard, setShowMockWhiteboard] = useState(false);

  const hideTimerRef = useRef(null);
  const timerRef     = useRef(null);
  const chatEndRef   = useRef(null);

  // ── Acquire camera + mic on mount ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        if (cancelled) return;
        console.warn('[MockJitsi] getUserMedia failed:', err.message);
        setMediaError(err.name === 'NotAllowedError'
          ? 'Camera/microphone permission denied. Please allow access in your browser.'
          : `Could not access devices: ${err.message}`);
      }
    };

    startMedia();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Attach stream to video element whenever either changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach screen stream to video element
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, viewMode]);

  // ── Toggle mic track ─────────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) { setAudioEnabled(v => !v); return; }
    stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    const newState = stream.getAudioTracks()[0]?.enabled ?? false;
    setAudioEnabled(newState);
    setParticipants(prev => prev.map(p => p.isLocal ? { ...p, audio: newState } : p));
  }, []);

  // ── Toggle video track ────────────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) { setVideoEnabled(v => !v); return; }
    stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    const newState = stream.getVideoTracks()[0]?.enabled ?? false;
    setVideoEnabled(newState);
    setParticipants(prev => prev.map(p => p.isLocal ? { ...p, video: newState } : p));
  }, []);

  // ── Toggle screen share ──────────────────────────────────────────────────
  const toggleScreenShare = async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
        };
        setScreenStream(stream);
        setIsScreenSharing(true);
        setViewMode('stage'); // Auto switch to stage view when sharing screen
      } catch (err) {
        console.warn('[MockJitsi] getDisplayMedia failed:', err.message);
      }
    }
  };

  // ── Controls auto-hide ────────────────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimerRef.current);
  }, [resetHideTimer]);

  // ── Join sequence ─────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      setJoined(true);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);

      if (isHost) {
        try {
          const ui  = JSON.parse(localStorage.getItem('userInfo') || '{}');
          const tok = localStorage.getItem('token') || ui.token;
          if (tok) axios.put(`/api/sessions/${sessionId}/start`, {}, {
            headers: { Authorization: `Bearer ${tok}` }
          }).catch(() => {});
        } catch (_) {}
      }

      // Simulated remote participants appear after 2 s
      setTimeout(() => {
        setParticipants(prev => [
          ...prev,
          ...(isHost ? [
            { id: 2, name: 'Student A',  isHost: false, video: true,  audio: true  },
            { id: 3, name: 'Student B',  isHost: false, video: false, audio: true  },
          ] : [
            { id: 2, name: 'Instructor', isHost: true,  video: true,  audio: true  },
            { id: 3, name: 'Peer',       isHost: false, video: true,  audio: false },
          ]),
        ]);
      }, 2000);
    }, 1200);

    return () => { clearTimeout(t); clearInterval(timerRef.current); };
  }, [isHost, sessionId]);

  // Simulate active speaker
  useEffect(() => {
    if (!joined) return;
    const iv = setInterval(() => {
      setParticipants(prev => {
        if (prev.length <= 1) return prev;
        const remote = prev.filter(p => !p.isLocal);
        if (!remote.length) return prev;
        const pick = remote[Math.floor(Math.random() * remote.length)];
        setActiveSpeakerId(pick.id);
        return prev;
      });
    }, 4000);
    return () => clearInterval(iv);
  }, [joined]);

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, showChat]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const fmt = s => {
    const m  = String(Math.floor(s / 60)).padStart(2, '0');
    const sc = String(s % 60).padStart(2, '0');
    return `${m}:${sc}`;
  };

  const handleLeave = e => {
    e?.preventDefault();
    if (!isHost) { exitMeeting(); return; }
    setShowEndConfirm(true);
  };

  const confirmEnd = async () => {
    setIsEnding(true);
    try {
      const ui  = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const tok = localStorage.getItem('token') || ui.token;
      await axios.put(`/api/sessions/${sessionId}/end`, {}, {
        headers: { Authorization: `Bearer ${tok}` }
      });
    } catch (e) { console.error('[MockJitsi]', e.message); }
    finally { exitMeeting(); }
  };

  const exitMeeting = () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
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

  // ── Loading / Left screens ────────────────────────────────────────────────
  if (loading) return (
    <div className="jitsi-mock flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-6 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <h2 className="text-white text-lg font-semibold">Connecting...</h2>
        <p className="text-white/40 text-sm mt-2">Initialising camera &amp; microphone</p>
      </div>
    </div>
  );

  if (!joined) return (
    <div className="jitsi-mock flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center p-12 bg-[#1c1c1c] rounded-2xl border border-white/5 shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-blue-500/10 flex items-center justify-center">
          <PhoneOff className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Meeting Ended</h3>
        <p className="text-white/50 mb-8">The session has concluded.</p>
        <button onClick={onLeave} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold transition-all active:scale-95">
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  const sidebarOpen = showChat || showParticipants;
  const localParticipant = participants.find(p => p.isLocal);
  const remoteParticipants = participants.filter(p => !p.isLocal);
  const spotlight = participants.find(p => p.id === activeSpeakerId) || participants.find(p => p.isHost) || participants[0];

  return (
    <div
      className={`jitsi-mock h-full w-full flex flex-col bg-[#0a0a0a] overflow-hidden relative`}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* ── Media Permission Banner ── */}
      {mediaError && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 flex items-center gap-2 text-amber-300 text-sm">
          <AlertCircle size={15} className="shrink-0" />
          <span>{mediaError}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Video Stage ── */}
        <div className="flex-1 flex flex-col relative overflow-hidden">

          {/* Top HUD */}
          <div className={`absolute top-0 left-0 right-0 z-30 p-3 flex justify-between items-start transition-opacity duration-500 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">SkillDad Session</span>
              <span className="text-white/40 text-xs tabular-nums">{fmt(elapsed)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(v => v === 'stage' ? 'grid' : 'stage')}
                className="p-2.5 bg-black/50 backdrop-blur-md hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all"
                title="Toggle view"
              >
                {viewMode === 'stage' ? <Grid size={17} /> : <Layout size={17} />}
              </button>
              <button className="p-2.5 bg-black/50 backdrop-blur-md hover:bg-white/10 rounded-xl border border-white/10 text-white/50 transition-all" title="Settings">
                <Settings size={17} />
              </button>
            </div>
          </div>

          {/* Video tiles */}
          <div className="flex-1 p-4 overflow-hidden">
            {viewMode === 'stage' ? (
              <div className="flex flex-col h-full gap-3">
                {/* Spotlight: local user with real camera */}
                <div className="flex-1 min-h-0">
                  {isScreenSharing ? (
                    <ScreenShareTile videoRef={screenVideoRef} />
                  ) : spotlight?.isLocal ? (
                    <LocalVideoTile
                      videoRef={localVideoRef}
                      participant={localParticipant}
                      videoEnabled={videoEnabled}
                      audioEnabled={audioEnabled}
                      isActive={true}
                      large
                    />
                  ) : (
                    <RemoteVideoTile participant={spotlight} isActive={true} large />
                  )}
                </div>
                {/* Thumbnail strip */}
                <div className="h-28 flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                  {/* Local tile in strip if spotlight is remote */}
                  {!spotlight?.isLocal && (
                    <div className="w-44 flex-shrink-0">
                      <LocalVideoTile
                        videoRef={localVideoRef}
                        participant={localParticipant}
                        videoEnabled={videoEnabled}
                        audioEnabled={audioEnabled}
                        isActive={false}
                      />
                    </div>
                  )}
                  {remoteParticipants.filter(p => p.id !== spotlight?.id).map(p => (
                    <div key={p.id} className="w-44 flex-shrink-0">
                      <RemoteVideoTile participant={p} isActive={activeSpeakerId === p.id} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Grid view */
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
                {isScreenSharing && (
                  <ScreenShareTile videoRef={screenVideoRef} />
                )}
                <LocalVideoTile
                  videoRef={localVideoRef}
                  participant={localParticipant}
                  videoEnabled={videoEnabled}
                  audioEnabled={audioEnabled}
                  isActive={false}
                />
                {remoteParticipants.map(p => (
                  <RemoteVideoTile key={p.id} participant={p} isActive={activeSpeakerId === p.id} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div className="w-80 bg-[#141414] border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
              <h4 className="text-white font-semibold text-sm">
                {showChat ? 'Meeting Chat' : `Participants (${participants.length})`}
              </h4>
              <button onClick={() => { setShowChat(false); setShowParticipants(false); }} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {showParticipants && (
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${p.isHost ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.name} {p.isLocal && '(You)'}</p>
                      <p className="text-white/40 text-xs">{p.isHost ? 'Host' : 'Participant'}</p>
                    </div>
                    <div className="flex gap-1.5 text-white/30 shrink-0">
                      {p.audio ? <Mic size={13} /> : <MicOff size={13} className="text-red-400" />}
                      {p.video ? <Video size={13} /> : <VideoOff size={13} className="text-red-400" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showChat && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={msg.isSystem ? 'text-center' : ''}>
                      {msg.isSystem ? (
                        <span className="text-[10px] uppercase tracking-wider text-white/30 bg-white/5 px-2 py-1 rounded">
                          {msg.text}
                        </span>
                      ) : (
                        <div className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-white/50">{msg.sender}</span>
                            <span className="text-[10px] text-white/20">{msg.time}</span>
                          </div>
                          <div className={`px-3 py-2 rounded-2xl text-sm max-w-[90%] ${msg.sender === 'You' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-white/90 rounded-tl-none'}`}>
                            {msg.text}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendChat} className="p-3 border-t border-white/5 shrink-0">
                  <div className="relative">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Message everyone..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400">
                      <Smile size={18} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Floating Controls Bar ── */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-1 bg-[#1c1c1c]/95 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl">

          {/* Mic */}
          <button
            onClick={toggleAudio}
            className={`p-3.5 rounded-xl transition-all ${audioEnabled ? 'text-white hover:bg-white/10' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
            title={audioEnabled ? 'Mute' : 'Unmute'}
          >
            {audioEnabled ? <Mic size={21} /> : <MicOff size={21} />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-xl transition-all ${videoEnabled ? 'text-white hover:bg-white/10' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
            title={videoEnabled ? 'Stop video' : 'Start video'}
          >
            {videoEnabled ? <Video size={21} /> : <VideoOff size={21} />}
          </button>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Chat */}
          <button
            onClick={() => { setShowChat(v => !v); setShowParticipants(false); }}
            className={`p-3.5 rounded-xl transition-all ${showChat ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/10'}`}
            title="Chat"
          >
            <MessageSquare size={21} />
          </button>

          {/* Participants */}
          <button
            onClick={() => { setShowParticipants(v => !v); setShowChat(false); }}
            className={`p-3.5 rounded-xl transition-all relative ${showParticipants ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/10'}`}
            title="Participants"
          >
            <Users size={21} />
            <span className="absolute top-1.5 right-1.5 bg-blue-500 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#1c1c1c] font-bold">
              {participants.length}
            </span>
          </button>

          {/* Screen Share */}
          <button 
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-xl transition-all ${isScreenSharing ? 'bg-blue-600 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            title="Share screen"
          >
            <Monitor size={21} />
          </button>
          
          {/* Mock Native Whiteboard Placeholder */}
          <button 
            onClick={() => setShowMockWhiteboard(v => !v)}
            className={`p-3.5 rounded-xl transition-all ${showMockWhiteboard ? 'bg-blue-600 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            title="Open Jitsi Builtin Whiteboard"
          >
            <PenTool size={21} />
          </button>

          {/* Record */}
          <button
            onClick={() => setIsRecording(v => !v)}
            className={`p-3.5 rounded-xl transition-all ${isRecording ? 'text-red-400 hover:bg-red-500/10' : 'text-white hover:bg-white/10'}`}
            title={isRecording ? 'Stop recording' : 'Record'}
          >
            {isRecording ? <StopCircle size={21} /> : <Circle size={21} />}
          </button>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Leave / End */}
          <button
            onClick={handleLeave}
            className="px-5 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all active:scale-95 flex items-center gap-2 font-semibold shadow-lg shadow-red-900/30"
          >
            <PhoneOff size={18} />
            <span className="text-sm">{isHost ? 'End' : 'Leave'}</span>
          </button>
        </div>
      </div>

      {/* ── End Confirm Modal ── */}
      {showEndConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1c1c] border border-white/10 w-full max-w-sm rounded-2xl p-7 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">End for Everyone?</h3>
            <p className="text-white/40 text-sm mb-7">This will disconnect all participants and conclude the session.</p>
            <div className="flex gap-3">
              <button disabled={isEnding} onClick={() => setShowEndConfirm(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium">
                Cancel
              </button>
              <button disabled={isEnding} onClick={confirmEnd} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                {isEnding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'End Session'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Mock Native Whiteboard Overlay */}
      {showMockWhiteboard && (
        <div className="absolute inset-x-0 bottom-[80px] top-0 z-30 bg-white m-4 rounded-xl flex items-center justify-center border border-white/20 shadow-2xl overflow-hidden shadow-white/10">
            <div className="text-center p-8">
                <PenTool size={48} className="mx-auto text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Built-in Jitsi Whiteboard</h2>
                <p className="text-gray-500 max-w-sm mx-auto">
                    This is a placeholder for the local Mock environment. <br/><br/>
                    When you run the real Jitsi SDK (<code>JITSI_MOCK_MODE=false</code>), the official Excalidraw-based Jitsi Whiteboard will seamlessly appear here automatically.
                </p>
                <button 
                    onClick={() => setShowMockWhiteboard(false)}
                    className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-semibold"
                >
                    Close Mock Whiteboard
                </button>
            </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .jitsi-mock { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

// ── Local video tile (real camera feed) ─────────────────────────────────────
const LocalVideoTile = ({ videoRef, participant: p, videoEnabled, audioEnabled, isActive, large = false }) => (
  <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#1a1a1a] border-2 transition-all duration-300 ${isActive ? 'border-blue-500 shadow-xl shadow-blue-500/15' : 'border-white/5'}`}>
    {/* Live camera feed */}
    <video
      ref={videoRef}
      autoPlay
      muted        /* always mute local to prevent echo */
      playsInline
      className={`absolute inset-0 w-full h-full object-cover ${!videoEnabled ? 'invisible' : ''}`}
      style={{ transform: 'scaleX(-1)' }} /* mirror effect */
    />

    {/* Video off overlay */}
    {!videoEnabled && (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#222]">
        <div className={`rounded-full flex items-center justify-center text-white font-bold bg-gray-600 ${large ? 'w-24 h-24 text-4xl' : 'w-12 h-12 text-xl'}`}>
          {p?.name?.charAt(0) || 'Y'}
        </div>
        <p className="text-white/30 text-xs mt-3 flex items-center gap-1"><CameraOff size={11} /> Camera off</p>
      </div>
    )}

    {/* Name tag */}
    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg z-10">
      {!audioEnabled && <MicOff size={11} className="text-red-400" />}
      <span className="text-white text-xs font-semibold">You</span>
    </div>

    {isActive && <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl pointer-events-none" />}
  </div>
);

// ── Remote video tile (simulated) ────────────────────────────────────────────
const RemoteVideoTile = ({ participant: p, isActive, large = false }) => (
  <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#1a1a1a] border-2 transition-all duration-300 ${isActive ? 'border-blue-500 shadow-xl shadow-blue-500/15' : 'border-white/5'}`}>
    <div className={`absolute inset-0 flex items-center justify-center ${p.video ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-[#222]'}`}>
      {p.video ? (
        <div className="w-full h-full opacity-60 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`rounded-full flex items-center justify-center text-white font-bold ${p.isHost ? 'bg-blue-700' : 'bg-gray-600'} ${large ? 'w-24 h-24 text-4xl' : 'w-12 h-12 text-xl'}`}>
              {p.name.charAt(0)}
            </div>
          </div>
          {isActive && (
            <div className="absolute top-2 right-2 flex gap-0.5 items-end">
              {[3, 2, 4, 2, 3].map((h, i) => (
                <div key={i} className="w-1 bg-blue-500 rounded-full animate-bounce" style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-full flex items-center justify-center text-white font-bold ${p.isHost ? 'bg-blue-700' : 'bg-gray-600'} ${large ? 'w-24 h-24 text-4xl' : 'w-12 h-12 text-xl'}`}>
          {p.name.charAt(0)}
        </div>
      )}
    </div>

    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg z-10">
      {!p.audio && <MicOff size={11} className="text-red-400" />}
      <span className="text-white text-xs font-semibold truncate max-w-[100px]">
        {p.name}{p.isHost && <span className="text-blue-400 ml-1 text-[10px]">Host</span>}
      </span>
    </div>

    {isActive && <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl pointer-events-none animate-pulse" />}
  </div>
);

// ── Screen share tile ───────────────────────────────────────────────────────
const ScreenShareTile = ({ videoRef }) => (
  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1a1a1a] border-2 border-blue-500 shadow-xl shadow-blue-500/15">
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="absolute inset-0 w-full h-full object-contain"
    />
    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg z-10">
      <Monitor size={11} className="text-blue-400" />
      <span className="text-white text-xs font-semibold">Your Screen</span>
    </div>
  </div>
);

export default MockJitsiMeeting;
