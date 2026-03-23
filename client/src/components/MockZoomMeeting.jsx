import { useEffect, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Users, MessageSquare, Share2, Settings } from 'lucide-react';

/**
 * MockZoomMeeting Component
 * Simulates a Zoom meeting interface for development/testing
 * 
 * @param {boolean} isHost - Whether the user is the host
 * @param {function} onLeave - Callback when user leaves the meeting
 */
const MockZoomMeeting = ({ isHost = false, onLeave }) => {
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState([
    { id: 1, name: 'You', isHost: isHost, video: true, audio: true }
  ]);

  useEffect(() => {
    // Simulate joining delay
    const timer = setTimeout(() => {
      setLoading(false);
      setJoined(true);

      // Add mock participants after a delay
      setTimeout(() => {
        if (!isHost) {
          setParticipants(prev => [
            ...prev,
            { id: 2, name: 'Instructor', isHost: true, video: true, audio: true },
            { id: 3, name: 'Student 1', isHost: false, video: true, audio: false },
            { id: 4, name: 'Student 2', isHost: false, video: false, audio: true }
          ]);
        } else {
          setParticipants(prev => [
            ...prev,
            { id: 2, name: 'Student 1', isHost: false, video: true, audio: true },
            { id: 3, name: 'Student 2', isHost: false, video: true, audio: false }
          ]);
        }
      }, 2000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isHost]);

  const handleLeave = () => {
    setJoined(false);
    if (onLeave) {
      onLeave();
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    setParticipants(prev =>
      prev.map(p => p.id === 1 ? { ...p, video: !videoEnabled } : p)
    );
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    setParticipants(prev =>
      prev.map(p => p.id === 1 ? { ...p, audio: !audioEnabled } : p)
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-primary/30 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <p className="text-white/60 text-sm">Connecting to mock meeting...</p>
          <p className="text-white/40 text-xs mt-2">🧪 Development Mode</p>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-primary/30 rounded-lg">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <Video className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Meeting Ended</h3>
          <p className="text-white/60 text-sm mb-6">You have left the meeting</p>
          <button
            onClick={onLeave}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#050505] rounded-xl overflow-hidden shadow-2xl border border-white/5">
      {/* Premium Studio Background / Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none z-10"></div>
      
      {/* Mock Mode Banner - Professional Style */}
      <div className="absolute top-0 left-0 right-0 bg-amber-500/10 backdrop-blur-md border-b border-amber-500/20 px-4 py-1.5 z-[60]">
        <p className="text-amber-500/80 text-[10px] text-center font-bold tracking-[0.2em] uppercase">
          Studio Simulation Mode • {isHost ? 'Host Console' : 'Broadcasting View'}
        </p>
      </div>

      {/* Main Broadcasting Area (Spotlight) */}
      <div className="absolute inset-0 pt-10 pb-20 overflow-hidden flex items-center justify-center p-6">
        <div className="relative w-full h-full max-w-5xl mx-auto rounded-2xl overflow-hidden bg-[#111] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
          {/* Main Video (Host) */}
          {participants.find(p => p.isHost)?.video ? (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center relative">
              {/* Animated pulses for "Live" effect */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-primary/40 leading-none"></div>
              
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl relative z-10">
                {participants.find(p => p.isHost)?.name.charAt(0)}
                <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping opacity-30"></div>
              </div>
              
              {/* Studio Overlay Labels */}
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-md shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-[10px] font-black tracking-widest uppercase">LIVE</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
                  <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase">REC 00:45:12</span>
                </div>
              </div>

              {/* Speaker Identity Tag */}
              <div className="absolute bottom-6 left-6">
                <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl flex flex-col">
                  <span className="text-primary text-[10px] font-black tracking-widest uppercase mb-1">Speaker</span>
                  <span className="text-white text-xl font-bold">{participants.find(p => p.isHost)?.name}</span>
                  <span className="text-white/40 text-[10px] mt-1 font-medium tracking-wide uppercase italic">Lead Instructor @ SkillDad</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-20 h-20 text-white/10 mx-auto mb-4" />
                <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Camera is Off</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants Sidebar/Ribbon (Minimized) */}
      <div className="absolute top-24 right-10 flex flex-col gap-3 z-50">
        <div className="bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group/p relative cursor-pointer hover:bg-white/10 transition-colors">
            <Users size={16} className="text-white/40 group-hover/p:text-primary transition-colors" />
            <div className="absolute left-0 top-0 translate-x-[-110%] bg-black/80 p-2 rounded-lg border border-white/10 opacity-0 group-hover/p:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
              <span className="text-white text-[10px] font-bold uppercase">{participants.length} Active Participants</span>
            </div>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          {participants.filter(p => !p.isHost).slice(0, 3).map((p, i) => (
             <div key={p.id} className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-lg">
                <span className="text-white/60 text-xs font-bold">{p.name.charAt(0)}</span>
             </div>
          ))}
          {participants.length > 4 && (
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white/40 text-[10px] font-bold">+{participants.length - 4}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Preview Overlay (Bottom Left) */}
      <div className="absolute bottom-28 left-10 z-50 pointer-events-none max-w-xs">
        <div className="space-y-2 opacity-60">
           <div className="bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/10 flex gap-2 items-start">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-[10px] text-blue-400 font-bold">S</div>
              <div>
                <p className="text-white/40 text-[9px] font-bold uppercase">Sarah M.</p>
                <p className="text-white/90 text-[11px] leading-tight mt-0.5">This architecture is amazing! Love the Microservices approach.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Professional Studio Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-[#0a0a0b]/95 to-transparent border-t border-white/5 flex items-center justify-center px-10 z-[60]">
        <div className="w-full max-w-5xl flex items-center justify-between">
          {/* Left: AV Controls */}
          <div className="flex items-center gap-4">
             <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-lg transition-all ${audioEnabled
                      ? 'text-white/60 hover:text-white hover:bg-white/10'
                      : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    }`}
                >
                  {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-lg transition-all ${videoEnabled
                      ? 'text-white/60 hover:text-white hover:bg-white/10'
                      : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    }`}
                >
                  {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
             </div>

             {isHost && (
               <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-xl border border-primary/20 transition-all group">
                 <Share2 size={16} />
                 <span className="text-[11px] font-black tracking-widest uppercase">Share Stream</span>
               </button>
             )}
          </div>

          {/* Center: Main Broadcast Actions */}
          <div className="flex items-center gap-6">
            <button className="text-white/40 hover:text-primary transition-colors flex flex-col items-center gap-1 group">
              <MessageSquare size={18} />
              <span className="text-[9px] font-bold tracking-widest uppercase group-hover:text-primary transition-colors">Chat</span>
            </button>
            <button className="text-white/40 hover:text-primary transition-colors flex flex-col items-center gap-1 group">
              <Users size={18} />
              <span className="text-[9px] font-bold tracking-widest uppercase group-hover:text-primary transition-colors">Audience</span>
            </button>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <button className="text-white/40 hover:text-primary transition-colors flex flex-col items-center gap-1 group">
              <Settings size={18} />
              <span className="text-[9px] font-bold tracking-widest uppercase group-hover:text-primary transition-colors">Settings</span>
            </button>
          </div>

          {/* Right: Exit Action */}
          <div className="flex items-center gap-6">
             {isHost && (
               <div className="flex flex-col items-end mr-4">
                 <span className="text-red-500 text-[10px] font-black tracking-[0.2em] uppercase mb-1">Broadcasting</span>
                 <span className="text-white/40 text-[9px] font-semibold tabular-nums">01:14:45</span>
               </div>
             )}
             <button
                onClick={handleLeave}
                className="group relative px-8 py-3 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white text-[11px] font-black rounded-xl border border-red-500/30 hover:border-red-600 transition-all duration-300 tracking-[0.1em] shadow-[0_0_30px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
             >
                {isHost ? 'END BROADCAST' : 'LEAVE STUDIO'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockZoomMeeting;
