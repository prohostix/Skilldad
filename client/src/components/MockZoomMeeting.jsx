import { useEffect, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Users, MessageSquare, Share2, Settings, X, Play } from 'lucide-react';

/**
 * MockZoomMeeting Component
 * Simulates a Zoom meeting interface for development/testing
 * 
 * @param {string} sessionId - The session ID
 * @param {boolean} isHost - Whether the user is the host
 * @param {function} onLeave - Callback when user leaves the meeting
 * @param {function} onError - Callback when an error occurs
 */
const MockZoomMeeting = ({ sessionId, isHost = false, onLeave, onError }) => {
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'You', isHost: isHost, video: true, audio: true }
  ]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, name: 'Instructor', text: 'Welcome everyone to the systemic architecture class!', time: '10:05 AM', isInstructor: true },
    { id: 2, name: 'Student 1', text: 'Hello! Really looking forward to this.', time: '10:06 AM', isInstructor: false }
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      name: 'You',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInstructor: isHost
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessage('');
  };

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
    <div className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden flex">
      {/* Main content area */}
      <div className={`flex-1 relative transition-all duration-300 ${chatOpen ? 'mr-0 md:mr-0' : ''}`}>
        {/* Mock Mode Banner */}
        <div className="absolute top-0 left-0 right-0 bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 z-50">
          <p className="text-yellow-400 text-xs text-center font-medium">
            🧪 MOCK MODE - Development Environment (No real Zoom connection)
          </p>
        </div>

        {/* Video Grid */}
        <div className={`absolute inset-0 top-10 bottom-20 p-4 grid gap-4 overflow-auto ${chatOpen ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}`}>
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="relative bg-gray-800/50 border border-white/10 rounded-lg overflow-hidden aspect-video flex items-center justify-center"
            >
              {participant.video ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {participant.name.charAt(0)}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <VideoOff className="w-12 h-12 text-white/30" />
                </div>
              )}

              {/* Participant Info */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-medium">{participant.name}</span>
                  {participant.isHost && (
                    <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">Host</span>
                  )}
                </div>
                {!participant.audio && (
                  <div className="bg-red-500/80 p-1.5 rounded-full">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-white/10 px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-lg transition-colors ${audioEnabled
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                title={audioEnabled ? 'Mute' : 'Unmute'}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-lg transition-colors ${videoEnabled
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                title={videoEnabled ? 'Stop Video' : 'Start Video'}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Center Controls */}
            <div className="flex items-center gap-3">
              <button
                className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Participants"
              >
                <Users className="w-5 h-5" />
              </button>

              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`p-3 rounded-lg transition-colors ${chatOpen
                  ? 'bg-primary text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                title="Chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Share Screen"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Right Controls */}
            <button
              onClick={handleLeave}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="w-80 bg-gray-900/95 border-l border-white/10 flex flex-col z-[60] shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-900">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Meeting Chat</h4>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/40 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold ${msg.isInstructor ? 'text-primary' : 'text-emerald-400'}`}>
                    {msg.name} {msg.isInstructor && '(Host)'}
                  </span>
                  <span className="text-[10px] text-white/20">{msg.time}</span>
                </div>
                <div className="bg-white/5 border border-white/5 p-3 rounded-lg rounded-tl-none">
                  <p className="text-xs text-white/80">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10 bg-gray-900">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-primary transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-light"
              >
                <Play size={14} className="fill-current" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Participant Count */}
      {!chatOpen && (
        <div className="absolute top-14 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/60" />
            <span className="text-white text-sm font-medium">{participants.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};


export default MockZoomMeeting;
