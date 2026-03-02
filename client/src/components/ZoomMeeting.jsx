import { useEffect, useRef, useState } from 'react';
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';
import axios from 'axios';
import MockZoomMeeting from './MockZoomMeeting';
import './ZoomMeeting.css';

/**
 * ZoomMeeting Component
 * Embeds Zoom Meeting SDK for joining live sessions
 * 
 * @param {string} sessionId - The session ID to join
 * @param {boolean} isHost - Whether the user is the host (instructor/university)
 * @param {string} token - Authentication token (optional, will use localStorage if not provided)
 * @param {function} onLeave - Callback when user leaves the meeting
 * @param {function} onError - Callback when an error occurs
 */
const ZoomMeeting = ({ sessionId, isHost = false, token: propToken, onLeave, onError }) => {
  // Check if we should use mock mode (when SDK config returns mock data)
  const [useMockMode, setUseMockMode] = useState(false);
  const meetingSDKElement = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sdkClient, setSdkClient] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeZoom = async () => {
      try {
        if (!mounted) return;
        
        console.log('[Zoom] Starting initialization...');
        console.log('[Zoom] Session ID:', sessionId);
        console.log('[Zoom] Is Host:', isHost);

        // Fetch SDK configuration from backend
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = propToken || localStorage.getItem('token') || userInfo.token;

        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        console.log(`[Zoom] Fetching SDK config for session: ${sessionId}`);
        const response = await axios.get(`/api/sessions/${sessionId}/zoom-config`, config);
        console.log('[Zoom] SDK config response:', response.data);
        const sdkConfig = response.data;

        if (!mounted) return;

        // Check if we're in mock mode (SDK key starts with MOCK_)
        if (sdkConfig.sdkKey && sdkConfig.sdkKey.startsWith('MOCK_')) {
          console.log('[Zoom] Mock mode detected, using MockZoomMeeting component');
          setUseMockMode(true);
          setLoading(false);
          return;
        }

        console.log('[Zoom] SDK config received, waiting for DOM element...');
        
        // Wait for DOM element to be ready (it's rendered now that we're not in loading state)
        let retryCount = 0;
        const maxRetries = 20;
        
        while (!meetingSDKElement.current && retryCount < maxRetries && mounted) {
          retryCount++;
          console.log(`[Zoom] Waiting for element... retry ${retryCount}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!meetingSDKElement.current) {
          throw new Error('Meeting container failed to initialize');
        }

        if (!mounted) return;

        console.log('[Zoom] DOM element ready, initializing SDK...');

        // Initialize Zoom SDK
        const client = ZoomMtgEmbedded.createClient();
        
        if (!mounted) return;
        setSdkClient(client);

        // Initialize the SDK with the meeting container
        await client.init({
          zoomAppRoot: meetingSDKElement.current,
          language: 'en-US',
          patchJsMedia: true,
          leaveOnPageUnload: true
        });

        console.log('[Zoom] SDK initialized, joining meeting...');

        if (!mounted) return;

        // Join the meeting
        await client.join({
          sdkKey: sdkConfig.sdkKey,
          signature: sdkConfig.signature,
          meetingNumber: sdkConfig.meetingNumber,
          password: sdkConfig.passWord,
          userName: sdkConfig.userName,
          userEmail: sdkConfig.userEmail,
          tk: '', // Registration token (not used)
          zak: '' // Zoom access token (not used for SDK)
        });

        console.log('[Zoom] Successfully joined meeting');
        
        // The Zoom SDK handles video rendering automatically
        // No manual optimization needed
        
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }

      } catch (err) {
        console.error('[Zoom] Error initializing Zoom:', err);
        if (!mounted) return;
        
        const errorMessage = err.response?.data?.message || err.message || 'Failed to join meeting';
        setError(errorMessage);
        setLoading(false);

        if (onError) {
          onError(errorMessage);
        }
      }
    };

    // Only initialize if we have sessionId and haven't initialized yet
    if (sessionId && !initialized) {
      console.log('[Zoom] useEffect triggered - starting initialization');
      initializeZoom();
    }

    // Cleanup function
    return () => {
      mounted = false;
      if (sdkClient) {
        try {
          console.log('[Zoom] Cleaning up SDK client');
          sdkClient.leaveMeeting();
        } catch (err) {
          console.warn('[Zoom] Error during cleanup:', err);
        }
      }
    };
  }, [sessionId, isHost, propToken, initialized]);

  const handleLeave = () => {
    if (sdkClient) {
      try {
        sdkClient.leaveMeeting();
        if (onLeave) {
          onLeave();
        }
      } catch (err) {
        console.error('[Zoom] Error leaving meeting:', err);
      }
    }
  };

  // Use mock component if in mock mode
  if (useMockMode) {
    return <MockZoomMeeting sessionId={sessionId} isHost={isHost} onLeave={onLeave} onError={onError} />;
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-black/40 border border-red-500/30 rounded-lg">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Unable to Join Meeting</h3>
          <p className="text-white/60 text-sm mb-6">{error}</p>
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
    <div className="relative w-full h-full">
      {/* Zoom Meeting Container - Always rendered so ref is available */}
      <div
        ref={meetingSDKElement}
        className="w-full h-full zoom-meeting-container"
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '100%',
          position: 'relative'
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
            <p className="text-white/60 text-sm">Connecting to meeting...</p>
          </div>
        </div>
      )}

      {/* Leave Meeting Button */}
      {initialized && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default ZoomMeeting;
