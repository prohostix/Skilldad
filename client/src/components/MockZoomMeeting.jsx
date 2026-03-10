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
    <div className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden">
      {/* Mock Mode Banner */}
      <div className="absolute top-0 left-0 right-0 bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 z-50">
        <p className="text-yellow-400 text-xs text-center font-medium">
          🧪 MOCK MODE - Development Environment (No real Zoom connection)
        </p>
      </div>

      {/* Video Grid */}
      <div className="absolute inset-0 top-10 bottom-20 p-4 grid grid-cols-2 gap-4 overflow-auto">
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
              className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
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

      {/* Participant Count */}
      <div className="absolute top-14 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-white/60" />
          <span className="text-white text-sm font-medium">{participants.length}</span>
        </div>
      </div>
    </div>
  );
};

export default MockZoomMeeting;
