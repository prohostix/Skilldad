import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ZoomMeeting from '../../components/ZoomMeeting';
import ZoomRecordingPlayer from '../../components/ZoomRecordingPlayer';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import { ArrowLeft, Users, Clock, Calendar, Video } from 'lucide-react';

/**
 * SessionDetail Page
 * Displays session information and embeds Zoom meeting for live sessions
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
      setIsHost(!!(isInstructor || isUniversity));

      setLoading(false);
    } catch (err) {
      console.error('[SessionDetail] Error fetching session:', err);
      setError(err.response?.data?.message || 'Failed to load session details');
      setLoading(false);
    }
  };

  const handleStartMeeting = () => {
    setInMeeting(true);
  };

  const handleLeaveMeeting = () => {
    setInMeeting(false);
    navigate('/university/live-sessions');
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
            onClick={() => navigate('/university/live-sessions')}
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

  // If in meeting, show full-screen Zoom component
  if (inMeeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0b2e] to-[#0a0118] p-4">
        <div className="max-w-7xl mx-auto relative z-20 overflow-visible">
          <ZoomMeeting
            sessionId={sessionId}
            isHost={isHost}
            onLeave={handleLeaveMeeting}
            onError={handleMeetingError}
          />
        </div>
      </div>
    );
  }

  // Show session details with join button
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0b2e] to-[#0a0118] p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/university/live-sessions')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Sessions</span>
        </button>

        {/* Session Header */}
        <GlassCard className="p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${session.status === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  session.status === 'scheduled' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-white/10 text-white/60 border border-white/20'
                  }`}>
                  {session.status === 'live' ? '🔴 Live Now' :
                    session.status === 'scheduled' ? '📅 Scheduled' :
                      '✓ Ended'}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{session.topic}</h1>
              <p className="text-white/60 text-sm mb-4">{session.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar size={16} className="text-primary" />
                  <span>{formatDate(session.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Clock size={16} className="text-primary" />
                  <span>{formatTime(session.startTime)} · {session.duration} min</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Users size={16} className="text-primary" />
                  <span>{session.enrolledStudents?.length || 0} enrolled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Info */}
          {session.instructor && (
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-white/40 mb-1">Instructor</p>
              <p className="text-white font-medium">
                {session.instructor.name || session.instructor.email}
              </p>
            </div>
          )}
        </GlassCard>

        {/* Join Meeting Section */}
        {session.status === 'live' && (
          <GlassCard className="p-8 text-center border-primary/30 bg-primary/5">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
              <Video size={32} className="text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isHost ? 'Start Your Session' : 'Join Live Session'}
            </h2>
            <p className="text-white/60 mb-6">
              {isHost
                ? 'Click below to start hosting this live session'
                : 'The session is live. Click below to join the meeting'}
            </p>
            <ModernButton
              onClick={handleStartMeeting}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
            >
              <Video size={20} />
              {isHost ? 'Start Meeting' : 'Join Meeting'}
            </ModernButton>
          </GlassCard>
        )}

        {/* Scheduled Session Info */}
        {session.status === 'scheduled' && (
          <GlassCard className="p-8 text-center border-amber-500/30 bg-amber-500/5">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
              <Calendar size={32} className="text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Session Scheduled</h2>
            <p className="text-white/60 mb-2">
              This session will start on {formatDate(session.startTime)} at {formatTime(session.startTime)}
            </p>
            <p className="text-white/40 text-sm">
              {isHost ? 'You will be able to start the meeting when the scheduled time arrives' : 'You will receive a notification when the session goes live'}
            </p>
          </GlassCard>
        )}

        {/* Ended Session Info */}
        {session.status === 'ended' && (
          <>
            <GlassCard className="p-8 text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Session Ended</h2>
              <p className="text-white/60 mb-2">This session has concluded</p>

              {/* Recording Status */}
              {session.recording?.status === 'completed' && (
                <div className="mt-4">
                  <p className="text-primary text-sm font-semibold mb-2">✓ Recording Available</p>
                  {session.recording.durationMs && session.recording.fileSizeBytes && (
                    <div className="flex items-center justify-center gap-4 text-xs text-white/60">
                      <span>Duration: {formatDuration(session.recording.durationMs)}</span>
                      <span>•</span>
                      <span>Size: {formatFileSize(session.recording.fileSizeBytes)}</span>
                    </div>
                  )}
                </div>
              )}
              {session.recording?.status === 'processing' && (
                <p className="text-amber-400 text-sm mt-4">⏳ Recording is being processed...</p>
              )}
              {session.recording?.status === 'failed' && (
                <p className="text-red-400 text-sm mt-4">✗ Recording failed to process</p>
              )}
              {!session.recording && (
                <p className="text-white/40 text-sm mt-4">No recording available</p>
              )}
            </GlassCard>

            {/* Recording Player */}
            <ZoomRecordingPlayer
              sessionId={sessionId}
              onError={handleMeetingError}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SessionDetail;
