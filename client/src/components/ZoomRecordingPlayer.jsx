import { useEffect, useRef, useState } from 'react';
import { Play, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

/**
 * ZoomRecordingPlayer Component
 * Plays Zoom cloud recordings in an embedded player.
 * If recordingUrl is not provided, it can fetch it using sessionId.
 * 
 * @param {string} recordingUrl - Zoom recording play URL (optional)
 * @param {string} sessionId - Session ID to fetch playback URL (optional)
 * @param {string} title - Video title
 * @param {function} onEnded - Callback when video ends
 * @param {function} onError - Callback when error occurs
 */
const ZoomRecordingPlayer = ({ recordingUrl, sessionId, title, onEnded, onError }) => {
  const [url, setUrl] = useState(recordingUrl);
  const [loading, setLoading] = useState(!recordingUrl && !!sessionId);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    if (recordingUrl) {
      setUrl(recordingUrl);
      setLoading(false);
    } else if (sessionId) {
      fetchPlaybackUrl();
    } else {
      setError('No recording URL or Session ID provided');
      setLoading(false);
    }
  }, [recordingUrl, sessionId]);

  const fetchPlaybackUrl = async () => {
    try {
      setLoading(true);
      setError(null);

      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = localStorage.getItem('token') || userInfo.token;

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const { data } = await axios.get(`/api/sessions/${sessionId}/recording/playback`, config);

      if (data.playUrl) {
        setUrl(data.playUrl);
      } else {
        throw new Error('No playback URL returned from server');
      }

      setLoading(false);
    } catch (err) {
      console.error('[Zoom Recording] Error fetching playback URL:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch recording URL';
      setError(errorMessage);
      setLoading(false);

      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handleVideoError = (e) => {
    console.error('[Zoom Recording] Error loading video:', e);
    // If video fails, it might be due to an expired URL. 
    // If we have a sessionId, we can try to refresh once.
    if (sessionId && !retrying) {
      setRetrying(true);
      fetchPlaybackUrl();
      return;
    }

    const errorMessage = 'Failed to load recording. The URL may have expired or the recording is not yet available.';
    setError(errorMessage);
    setLoading(false);

    if (onError) {
      onError(errorMessage);
    }
  };

  const handleVideoEnded = () => {
    console.log('[Zoom Recording] Video ended');
    if (onEnded) {
      onEnded();
    }
  };

  if (error) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-black/40 border border-red-500/30 rounded-lg">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Recording Unavailable</h3>
          <p className="text-white/60 text-sm mb-4">{error}</p>
          {sessionId && (
            <button
              onClick={fetchPlaybackUrl}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Retry Fetching Recording
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-black/40 border border-primary/30 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <p className="text-white/60 text-sm">Loading recording...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={playerRef}
        className="w-full h-full"
        controls
        controlsList="nodownload"
        onError={handleVideoError}
        onEnded={handleVideoEnded}
        poster={`https://via.placeholder.com/1280x720/1a1a1a/ffffff?text=${encodeURIComponent(title || 'Zoom Recording')}`}
        autoPlay
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Custom overlay */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white text-[10px] font-bold uppercase tracking-wider">Zoom Cloud Recording</span>
        </div>
      </div>
    </div>
  );
};

export default ZoomRecordingPlayer;

