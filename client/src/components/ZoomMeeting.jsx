import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';
import axios from 'axios';
import { Video, Radio, X } from 'lucide-react';
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
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeZoom = async () => {
      // Prevent multiple initialization attempts
      if (!sessionId || initializationInProgress.current || isInitializedRef.current) {
        console.log('[Zoom] Skipping initialization - already in progress or initialized');
        return;
      }

      console.log('[Zoom] Starting initialization...');
      initializationInProgress.current = true;

      // Small pre-flight delay to ensure DOM and libraries are fully ready
      await new Promise(r => setTimeout(r, 100));

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
          leaveOnPageUnload: true,
          sdkKey: sdkConfig.sdkKey,
          customize: {
            video: {
              isResizable: true,
              viewSizes: {
                default: { width: 1000, height: 600 },
                ribbon: { width: 300, height: 700 }
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

        // Clean modern join options avoiding deprecated keys and crash-inducing gallery limits
        try {
          await client.join({
            signature: sdkConfig.signature,
            meetingNumber: sdkConfig.meetingNumber,
            password: sdkConfig.passWord,
            userName: sdkConfig.userName,
            userEmail: sdkConfig.userEmail
          });
        } catch (joinErr) {
          console.warn('[Zoom] Initial join failed...', joinErr);
          throw joinErr;
        }

        console.log('[Zoom] Successfully joined meeting');

        // Mark session as live in backend for students to join
        if (isHost) {
          try {
            await axios.put(`/api/sessions/${sessionId}/start`, {}, config);
            console.log('[Zoom] Session marked as live on backend');
          } catch (e) {
            console.warn('[Zoom] Failed to mark session live:', e.message);
          }
        }

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

  const handleLeave = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[Zoom] handleLeave triggered, isHost:', isHost);
    
    // If not host, just leave
    if (!isHost) {
      exitMeeting();
      return;
    }

    // Show custom confirmation modal for host
    setShowEndConfirm(true);
  };

  const confirmEndSession = async () => {
    setIsEnding(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = propToken || localStorage.getItem('token') || userInfo.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      console.log(`[Zoom] Host is ending session ${sessionId}...`);
      await axios.put(`/api/sessions/${sessionId}/end`, {}, config);
      console.log(`[Zoom] Session ${sessionId} marked as ended in database.`);
      
      exitMeeting();
    } catch (err) {
      console.error('[Zoom] Failed to update session status on leave:', err.message);
      setIsEnding(false);
      setShowEndConfirm(false);
      // Fallback: still let them leave if it's really stuck
      if (window.confirm("Backend update failed. Force exit studio?")) {
        exitMeeting();
      }
    }
  };

  const exitMeeting = () => {
    if (zoomClient.current) {
      try {
        zoomClient.current.leaveMeeting();
      } catch (err) {
        console.error('[Zoom] Error leaving meeting:', err);
      }
    }
    if (onLeave) {
      onLeave();
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
      {/* Custom Confirmation Modal using Portal to prevent flickering/blinking */}
      {showEndConfirm && createPortal(
        <div 
          className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div className="w-full max-w-md p-10 bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 mx-auto mb-8 rounded-[1.5rem] bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 shadow-inner">
              <Radio size={40} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-white text-center mb-3 tracking-tight">End Broadcast?</h3>
            <p className="text-white/40 text-center text-sm mb-10 leading-relaxed font-medium">
              This will disconnect all audience members and immediately begin the recording archival process in your dashboard.
            </p>
            <div className="flex gap-5">
              <button
                disabled={isEnding}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEndConfirm(false); }}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-[1.25rem] text-[11px] font-black tracking-widest uppercase transition-all border border-white/5 hover:border-white/10"
              >
                Cancel
              </button>
              <button
                disabled={isEnding}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmEndSession(); }}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-[1.25rem] text-[11px] font-black tracking-widest uppercase transition-all shadow-[0_15px_30px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3 active:scale-95"
              >
                {isEnding ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <X size={16} />
                    Confirm End
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ZoomMeeting;
