import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JitsiMeeting from '../../components/JitsiMeeting';
import MeetingRecordingPlayer from '../../components/MeetingRecordingPlayer';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import { ArrowLeft, Users, Clock, Calendar, Video, PenLine } from 'lucide-react';
import Whiteboard from '../../components/Whiteboard';
import { useSocket } from '../../context/SocketContext';

/**
 * SessionDetail Page
 * Displays session information and embeds Jitsi meeting for live sessions
 */

const parseSafeDate = (dateish) => {
  if (!dateish) return new Date();
  if (typeof dateish === 'string' && (dateish.includes('Z') || /[\+\-]\d{2}:\d{2}$/.test(dateish))) {
    return new Date(dateish);
  }
  if (typeof dateish === 'string' && dateish.includes('T')) {
    const [d, t] = dateish.split('T');
    const [y, m, day] = d.split('-').map(Number);
    const [h, min] = t.split(':').map(Number);
    const ld = new Date(y, m - 1, day, h, min);
    return isNaN(ld.getTime()) ? new Date(dateish) : ld;
  }
  return new Date(dateish);
};

const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [inMeeting, setInMeeting] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [studentCanDraw, setStudentCanDraw] = useState(true);
  const { socket } = useSocket();

  // Browser Screen/Audio Recording Engine
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    if (!socket) return;
    const onPermission = ({ canStudentsDraw }) => setStudentCanDraw(canStudentsDraw !== false);
    socket.on('whiteboard:permission', onPermission);
    return () => socket.off('whiteboard:permission', onPermission);
  }, [socket]);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = localStorage.getItem('token') || userInfo.token;

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.get(`/api/sessions/${sessionId}`, config);
      setSession(data);

      // Determine if user is host (instructor or university owner)
      const uId = userInfo._id || userInfo.id;
      const instId = data.instructor?._id || data.instructor;
      const uniId = data.university?._id || data.university;

      const isInstructor = instId && uId && instId.toString() === uId.toString();
      const isUniversity = uniId && uId && uniId.toString() === uId.toString();
      const isPartner = data.partner_id && uId && data.partner_id.toString() === uId.toString();
      setIsHost(!!(isInstructor || isUniversity || isPartner));

      setLoading(false);
    } catch (err) {
      console.error('[SessionDetail] Error fetching session:', err);
      setError(err.response?.data?.message || 'Failed to load session details');
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      // Prompt user to select screen/window/tab to capture, requesting system audio too
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      const tracks = [];
      if (displayStream.getVideoTracks().length > 0) {
        tracks.push(displayStream.getVideoTracks()[0]);
      }

      // Mix tab audio and mic audio if possible
      const audioTracks = displayStream.getAudioTracks();
      let mixedStream = displayStream;

      if (audioTracks.length > 0) {
        mixedStream = new MediaStream([displayStream.getVideoTracks()[0], audioTracks[0]]);
      }

      recordedChunksRef.current = [];
      let options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }

      const recorder = new MediaRecorder(mixedStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        displayStream.getTracks().forEach(t => t.stop());
        mixedStream.getTracks().forEach(t => t.stop());

        const blob = new Blob(recordedChunksRef.current, { type: options.mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `SkillDad-Session-${sessionId}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);

        setIsRecording(false);
      };

      displayStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      };

      recorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('[Recording] Failed to start browser recording:', err.message);
      alert(`Recording could not be started: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleStartMeeting = () => {
    setInMeeting(true);
  };

  const handleLeaveMeeting = () => {
    setInMeeting(false);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const role = userInfo.role || 'student';
    navigate(role === 'student' ? '/dashboard/live-classes' : `/${role}/live-sessions`);
  };

  const handleMeetingError = (errorMessage) => {
    console.error('[SessionDetail] Meeting error:', errorMessage);
    setError(errorMessage);
  };

  const formatDate = (dateString) => {
    const date = parseSafeDate(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = parseSafeDate(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) {
      return `${mb.toFixed(2)} MB`;
    }
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0b2e] to-[#0a0118] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <p className="text-white/60">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0b2e] to-[#0a0118] flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Session</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <ModernButton
            onClick={() => {
              const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
              const role = userInfo.role || 'student';
              navigate(role === 'student' ? '/dashboard/live-classes' : `/${role}/live-sessions`);
            }}
            variant="secondary"
          >
            <ArrowLeft size={16} />
            Back to Sessions
          </ModernButton>
        </GlassCard>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // If in meeting, show full-screen Jitsi component
  if (inMeeting) {
    return (
      <div
        className="fixed inset-0 z-[100] bg-black flex flex-col"
        style={{ overflow: 'visible' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-[#1a1a1a] border-b border-white/10 px-6 py-3 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-white leading-tight">{session.topic}</h1>
              <p className="text-white/40 text-xs mt-0.5">
                {isHost ? 'Host' : 'Student'} &bull; {session.status}
                {session.instructor?.name ? ` \u2022 ${session.instructor.name}` : ''}
              </p>
            </div>
            
            {/* If host, show custom recording controls */}
            {isHost && (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleRecording}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isRecording 
                      ? 'bg-red-500/20 border-red-500/35 text-red-400 animate-pulse' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500' : 'bg-white/40'}`} />
                  {isRecording ? 'Recording (Click to Stop)' : 'Record Session'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Jitsi container — fills all remaining height after header */}
        <div
          style={{
            flex: '1 1 0',
            position: 'relative',
            minHeight: 0,
            height: 0,       /* flex-1 needs height:0 to actually shrink/grow */
            width: '100%',
            overflow: 'visible',
          }}
        >
          <JitsiMeeting
            key={sessionId}
            sessionId={sessionId}
            isHost={isHost}
            onLeave={handleLeaveMeeting}
            onError={handleMeetingError}
          />
        </div>

        {/* Whiteboard Overlay */}
        {whiteboardOpen && (
          <Whiteboard
            sessionId={sessionId}
            isHost={isHost}
            canDraw={isHost || studentCanDraw}
            onClose={() => setWhiteboardOpen(false)}
          />
        )}
      </div>
    );
  }

  // Show session details with join button
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505] p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const role = userInfo.role || 'student';
            navigate(role === 'student' ? '/dashboard/live-classes' : `/${role}/live-sessions`);
          }}
          className="group flex items-center gap-3 text-white/40 hover:text-primary mb-10 transition-all"
        >
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-xs font-black tracking-widest uppercase">Return to Hub</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <GlassCard className="p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg ${
                    session.status === 'live' 
                      ? 'bg-red-600/10 text-red-500 border-red-600/20' 
                      : session.status === 'scheduled'
                        ? 'bg-amber-600/10 text-amber-500 border-amber-600/20'
                        : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                    {session.status === 'live' ? '• Live Broadcast' : session.status === 'scheduled' ? 'Upcoming Session' : 'Archive available'}
                  </div>
                  {session.course?.title && (
                    <span className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                      {session.course.title}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">{session.topic}</h1>
                <p className="text-white/50 text-base lg:text-lg leading-relaxed mb-10 max-w-2xl">{session.description}</p>

                <div className="flex flex-wrap gap-8 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-white/20 text-[9px] font-black tracking-widest uppercase">Date</p>
                      <p className="text-white text-sm font-bold">{formatDate(session.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-white/20 text-[9px] font-black tracking-widest uppercase">Schedule</p>
                      <p className="text-white text-sm font-bold">{formatTime(session.startTime)} ({session.duration} min)</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Join Section */}
            {(session.status === 'live' || session.status === 'scheduled') && (
              <GlassCard className={`p-10 border-2 transition-all duration-500 ${
                session.status === 'live' ? 'border-primary/40 bg-primary/5' : 'border-white/5 bg-transparent'
              }`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white mb-2">
                       {session.status === 'live' ? (isHost ? 'Studio is Live' : 'The Broadcast is Live!') : (isHost ? 'Ready to Broadcast?' : 'Scheduled for Broadcast')}
                    </h2>
                    <p className="text-white/40 text-sm max-w-md">
                      {session.status === 'live' 
                        ? (isHost ? 'Your audience is watching. Enter the studio to resume your session.' : 'Join now to participate in this interactive learning experience.')
                        : (isHost ? 'Enter the studio to prepare your camera. Your students will be notified the second you join!' : `This session will go live at ${formatTime(session.startTime)}. Please return 5 minutes before the start time.`)
                      }
                    </p>
                  </div>
                  
                  {(session.status === 'live' || (session.status === 'scheduled' && isHost)) ? (
                    <button
                      onClick={handleStartMeeting}
                      className="whitespace-nowrap px-10 py-4 bg-primary hover:bg-primary/90 text-white text-[11px] font-black tracking-widest uppercase rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                    >
                      <Video size={18} />
                      {session.status === 'live' ? (isHost ? 'Back to Studio' : 'Watch Broadcast') : 'Start Broadcast'}
                    </button>
                  ) : (
                    <div className="px-10 py-4 bg-white/5 border border-white/10 text-white/40 text-[10px] font-black tracking-widest uppercase rounded-2xl cursor-not-allowed italic">
                      Waiting for Schedule
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Instructor Details */}
            <GlassCard className="p-8">
              <h3 className="text-white/20 text-[10px] font-black tracking-widest uppercase mb-6">Instructor in Charge</h3>
              {session.instructor && (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 flex items-center justify-center text-primary text-xl font-black">
                    {session.instructor.name?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <p className="text-white font-bold leading-tight">{session.instructor.name || session.instructor.email}</p>
                    <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mt-1">Lead Instructor</p>
                  </div>
                </div>
              )}
              <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Engagement</span>
                  <span className="text-white font-bold">
                    {typeof session.enrolledStudents === 'number'
                      ? session.enrolledStudents
                      : (Array.isArray(session.enrolledStudents)
                        ? session.enrolledStudents.length
                        : (session.enrolledCount || session.enrolled_count || 0))} Students
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Broadcasting Type</span>
                  <span className="text-primary font-black uppercase tracking-widest text-[9px]">Premium Studio</span>
                </div>
              </div>
            </GlassCard>

            {/* Session ended / Recording */}
            {session.status === 'ended' && (
              <GlassCard className="p-8 bg-emerald-500/5 border-emerald-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <svg size={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white text-sm font-bold uppercase tracking-wide">Archived Content</h3>
                </div>
                <p className="text-white/40 text-xs leading-relaxed mb-6">This broadcast has concluded. You can access the recording below.</p>
                
                {session.recording?.status === 'completed' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/30 lowercase italic">duration: {formatDuration(session.recording.durationMs)}</span>
                      <span className="text-white/30 lowercase italic">size: {formatFileSize(session.recording.fileSizeBytes)}</span>
                    </div>
                  </div>
                )}
              </GlassCard>
            )}
          </div>
        </div>

        {/* Recording Player Full Width */}
        {session.status === 'ended' && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-6 mb-12 flex items-center gap-4">
               <div className="h-px flex-1 bg-white/5"></div>
               Review Broadcast Recording
               <div className="h-px flex-1 bg-white/5"></div>
            </h2>
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/5">
              <MeetingRecordingPlayer
                sessionId={sessionId}
                onError={handleMeetingError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetail;
