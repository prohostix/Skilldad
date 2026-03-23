import { useEffect, useRef, useState } from 'react';
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';
import axios from 'axios';
import MockZoomMeeting from './MockZoomMeeting';
import './ZoomMeeting.css';

/**
 * ZoomMeeting Component
 * Embeds Zoom Meeting SDK for joining live sessions
 */
const ZoomMeeting = ({ sessionId, isHost = false, token: propToken, onLeave, onError }) => {
  // refs to track initialization status and client to avoid re-render loops
  const initializationInProgress = useRef(false);
  const isInitializedRef = useRef(false); // Renamed to avoid any potential shadowing/naming collision
  const zoomClient = useRef(null);
  const meetingSDKElement = useRef(null);

  const [useMockMode, setUseMockMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeZoom = async () => {
      // Small pre-flight delay to ensure DOM and libraries are fully ready
      await new Promise(r => setTimeout(r, 100));

      // Prevent multiple initialization attempts
      if (!sessionId || initializationInProgress.current || isInitializedRef.current) {
        console.log('[Zoom] Skipping initialization - already in progress or initialized');
        return;
      }

      console.log('[Zoom] Starting initialization...');
      initializationInProgress.current = true;

      try {
        if (!mounted) return;

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

        const response = await axios.get(`/api/sessions/${sessionId}/zoom-config`, config);
        const sdkConfig = response.data;

        if (!mounted) return;

        if (sdkConfig.sdkKey && sdkConfig.sdkKey.startsWith('MOCK_')) {
          setUseMockMode(true);
          setLoading(false);
          initializationInProgress.current = false;
          return;
        }

        // Wait for the DOM element to be ready
        let retryCount = 0;
        const maxRetries = 20; // Reduced retries
        while (!meetingSDKElement.current && retryCount < maxRetries && mounted) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 50)); // Faster polling
        }

        if (!meetingSDKElement.current) {
          throw new Error('Meeting container failed to initialize');
        }

        if (!mounted) return;

        console.log('[Zoom] DOM element ready, initializing SDK...');

        // Create and store client in ref
        const client = ZoomMtgEmbedded.createClient();
        zoomClient.current = client;

        await client.init({
          zoomAppRoot: meetingSDKElement.current,
          language: 'en-US',
          patchJsMedia: true, // Enabled for better media handling in broadcasting
          leaveOnPageUnload: true,
          sdkKey: sdkConfig.sdkKey,
          appKey: sdkConfig.sdkKey,
          customize: {
            video: {
              isResizable: false,
              viewSizes: {
                default: { width: '100%', height: '100%' },
                ribbon: { width: 0, height: 0 } // Hide the ribbon to focus on speaker
              },
              popper: {
                disableDraggable: true
              }
            },
            chat: {
              isVisible: true,
              isResizable: true,
              anchor: 'right'
            }
          }
        });

        // Optimized stabilization delay to remove perceived lag
        console.log('[Zoom] SDK initialized. Stabilization delay (800ms)...');
        if (!mounted) return;
        await new Promise(r => setTimeout(r, 800));

        console.log('[Zoom] Joining meeting...');

        // Try joining with modern parameters first
        try {
          await client.join({
            signature: sdkConfig.signature,
            meetingNumber: sdkConfig.meetingNumber,
            password: sdkConfig.passWord,
            userName: sdkConfig.userName,
            userEmail: sdkConfig.userEmail,
            sdkKey: sdkConfig.sdkKey,
            appKey: sdkConfig.sdkKey,
            galleryViewColumnSize: 1, // Only show 1 person (speaker) in broadcasting mode
            view: 'speaker' // Force speaker view for broadcasting
          });
        } catch (joinErr) {
          console.warn('[Zoom] Initial join failed, retrying legacy...', joinErr);
          if (!mounted) return;
          await client.join({
            signature: sdkConfig.signature,
            meetingNumber: sdkConfig.meetingNumber,
            password: sdkConfig.passWord,
            userName: sdkConfig.userName,
            userEmail: sdkConfig.userEmail,
            galleryViewColumnSize: 1
          });
        }

        console.log('[Zoom] Successfully joined meeting');

        if (mounted) {
          isInitializedRef.current = true;
          setLoading(false);
        }

      } catch (err) {
        // Advanced error serialization for better diagnostics
        const errorDetails = {};
        if (err) {
          Object.getOwnPropertyNames(err).forEach(key => {
            errorDetails[key] = err[key];
          });
        }
        console.error('[Zoom] Error details:', errorDetails);

        if (!mounted) return;

        const errorMessage = err.response?.data?.message || err.message || 'Failed to join meeting';
        setError(errorMessage);
        setLoading(false);

        // Reset flags so user can try again without refresh
        isInitializedRef.current = false;
        initializationInProgress.current = false;

        if (onError) {
          onError(errorMessage);
        }
      } finally {
        initializationInProgress.current = false;
      }
    };

    if (sessionId && !isInitializedRef.current) {
      initializeZoom();
    }

    return () => {
      mounted = false;
      // Note: We don't automatically leave here to prevent re-render flickers, 
      // the leaveMeeting() is handled by the manual Leave button or page unload.
    };
  }, [sessionId, propToken, onError]); // isHost removed from deps as it doesn't change init logic

  const handleLeave = () => {
    if (zoomClient.current) {
      try {
        zoomClient.current.leaveMeeting();
        if (onLeave) {
          onLeave();
        }
      } catch (err) {
        console.error('[Zoom] Error leaving meeting:', err);
      }
    }
  };

  if (useMockMode) {
    return <MockZoomMeeting sessionId={sessionId} isHost={isHost} onLeave={handleLeave} />;
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-[#0a0a0b] border border-red-500/30 rounded-xl overflow-hidden">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Studio Connection Failed</h3>
          <p className="text-white/40 text-sm mb-8 leading-relaxed">{error}</p>
          <button
            onClick={onLeave}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-black tracking-widest uppercase transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] bg-black rounded-xl overflow-hidden shadow-2xl">
      <div
        ref={meetingSDKElement}
        className="w-full h-full zoom-meeting-container"
        style={{ width: '100%', height: '100%', position: 'relative' }}
      />

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <p className="text-white font-black tracking-[0.3em] uppercase text-sm">Connecting to Live Studio</p>
            <p className="text-white/40 text-[10px] mt-2 font-medium tracking-widest uppercase">Initializing Secure Broadcast Stream...</p>
          </div>
        </div>
      )}

      {isInitializedRef.current && (
        <>
          {/* Top Bar Indicator - Professional Studio Style */}
          <div className="absolute top-6 left-8 z-[10003] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>
                <span className="text-white text-[11px] font-black uppercase tracking-[0.25em]">Live Studio</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2">
                 <Video size={14} className="text-primary" />
                 <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase">{sessionId}</span>
              </div>
            </div>
          </div>

          {/* Premium Leave/End Button */}
          <div className="absolute top-6 right-8 z-[10003] animate-in fade-in slide-in-from-top-4 duration-1000">
            <button
              onClick={handleLeave}
              className="group relative px-8 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[11px] font-black rounded-2xl border border-red-500/30 hover:border-red-600 transition-all duration-300 flex items-center gap-3 overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="tracking-[0.15em]">{isHost ? 'END BROADCAST' : 'LEAVE STUDIO'}</span>
            </button>
          </div>

          {/* Bottom Branding Watermark */}
          <div className="absolute bottom-6 right-8 z-[10003] pointer-events-none opacity-40">
            <p className="text-white text-[10px] font-black tracking-[0.4em] uppercase">SkillDad Studio Pro</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ZoomMeeting;
