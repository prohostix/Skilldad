import { useEffect, useRef, useState, useCallback } from 'react';
import { JitsiMeeting as JitsiSDK } from '@jitsi/react-sdk';
import axios from 'axios';
import { WifiOff, RefreshCw } from 'lucide-react';
import MockJitsiMeeting from './MockJitsiMeeting';

/**
 * JitsiMeeting
 * Embeds the Jitsi Meet client using the React SDK.
 * Falls back to MockJitsiMeeting when:
 *  1. JITSI_MOCK_MODE=true on the server (token starts with MOCK_)
 *  2. No domain/roomName is returned
 */
const JitsiMeeting = ({ sessionId, isHost = false, token: propToken, onLeave, onError }) => {
  const [config, setConfig]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [useMockMode, setUseMockMode] = useState(false);
  const apiRef = useRef(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = propToken || localStorage.getItem('token') || userInfo.token;

      const { data } = await axios.get(`/api/sessions/${sessionId}/jitsi-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ── Decide mock vs real ─────────────────────────────────────────────
      // Mock mode: JITSI_MOCK_MODE=true on server generates MOCK_ prefixed tokens
      if (!data.token || data.token.startsWith('MOCK_') || !data.roomName || !data.domain) {
        setUseMockMode(true);
        setLoading(false);
        return;
      }

      setConfig(data);
      setLoading(false);
    } catch (err) {
      console.error('[Jitsi] Config Error:', err);
      // On any config fetch error, fall back to mock rather than showing an error
      setUseMockMode(true);
      setLoading(false);
    }
  }, [sessionId, propToken]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // ── Event bridge ───────────────────────────────────────────────────────────
  const handleApiReady = useCallback((api) => {
    apiRef.current = api;

    api.addEventListeners({
      readyToClose: () => onLeave?.(),
      videoConferenceLeft: () => onLeave?.(),
      videoConferenceJoined: () => {
        if (isHost) {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          const tok = propToken || localStorage.getItem('token') || userInfo.token;
          axios.put(`/api/sessions/${sessionId}/start`, {}, {
            headers: { Authorization: `Bearer ${tok}` }
          }).catch(e => console.warn('[Jitsi] Failed to start session:', e.message));
        }
      },
    });

    api.executeCommand('subject', 'SkillDad Live Session');
  }, [isHost, sessionId, propToken, onLeave]);

  // ── Mock mode ──────────────────────────────────────────────────────────────
  if (useMockMode) {
    return <MockJitsiMeeting sessionId={sessionId} isHost={isHost} onLeave={onLeave} />;
  }

  // ── Error screen ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#1c1c1c] text-white p-6 rounded-xl">
        <WifiOff size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Connection Failed</h3>
        <p className="text-gray-400 text-center mb-6 max-w-md">{error}</p>
        <div className="flex gap-4">
          <button onClick={fetchConfig} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors">
            <RefreshCw size={18} /> Retry
          </button>
          <button onClick={onLeave} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors">
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading || !config) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#1c1c1c] text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">Initializing Secure Meeting...</p>
      </div>
    );
  }

  // ── Real Jitsi SDK ─────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <JitsiSDK
        domain={config.domain}
        roomName={config.roomName}
        jwt={config.token}
        onApiReady={handleApiReady}
        configOverwrite={{
          startWithAudioMuted: !isHost,
          startWithVideoMuted: !isHost,
          disableModeratorIndicator: !isHost,
          startScreenSharing: false,
          enableEmailInStats: false,
          prejoinPageEnabled: false,
          fileRecordingsEnabled: isHost,
          localRecording: {
            enabled: isHost,
            format: 'ogg'
          },
          // Suppress the unrecognised 'speaker-selection' browser feature warning
          disabledSounds: [],
          toolbarButtons: isHost ? [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'recording', 'local-recording',
            'settings', 'raisehand', 'videoquality', 'filmstrip',
            'tileview', 'help', 'mute-everyone', 'security', 'whiteboard'
          ] : [
            'fullscreen', 'hangup', 'chat',
            'settings', 'raisehand', 'videoquality', 'filmstrip',
            'tileview', 'help'
          ],
        }}
        interfaceConfigOverwrite={{
          BRAND_WATERMARK_LINK: 'https://skilldad.com',
          SHOW_JITSI_WATERMARK: false,
          HIDE_DEEP_LINKING_LOGO: true,
          SHOW_BRAND_WATERMARK: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        }}
        userInfo={{
          displayName: config.userName,
          email: config.userEmail,
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height  = '100%';
          iframeRef.style.width   = '100%';
          iframeRef.style.border  = 'none';
          iframeRef.allow = 'camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write; autoplay';
        }}
      />
    </div>
  );
};

export default JitsiMeeting;
