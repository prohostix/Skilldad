import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';
import axios from 'axios';
import { Radio, X, WifiOff, RefreshCw } from 'lucide-react';
import MockZoomMeeting from './MockZoomMeeting';
import './ZoomMeeting.css';

/**
 * ZoomMeeting
 * Embeds the Zoom Meeting SDK Embedded client.
 * All join/leave/end logic is preserved exactly.
 * UI improvements: loading state, error fallback, cleanup on unmount,
 * responsive wrapper, single Leave/End button via parent header.
 */
const ZoomMeeting = ({ sessionId, isHost = false, token: propToken, onLeave, onError }) => {
  const initializationInProgress = useRef(false);
  const isInitializedRef         = useRef(false);
  const zoomClient               = useRef(null);
  const meetingSDKElement        = useRef(null);
  const mountedRef               = useRef(true);

  const [useMockMode,     setUseMockMode]     = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [loadingStep,     setLoadingStep]      = useState('Connecting…');
  const [error,           setError]           = useState(null);
  const [showEndConfirm,  setShowEndConfirm]  = useState(false);
  const [isEnding,        setIsEnding]        = useState(false);

  const observerRef = useRef(null);

  /* ── Cleanup on unmount ─────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
        if (observerRef.current._intervalId) {
          clearInterval(observerRef.current._intervalId);
        }
      }
      if (zoomClient.current) {
        try { zoomClient.current.leaveMeeting(); } catch (_) {}
        zoomClient.current = null;
      }
    };
  }, []);

  /* ── SDK Initialization ─────────────────────────────────── */
  useEffect(() => {
    if (!sessionId || initializationInProgress.current || isInitializedRef.current) return;

    const initializeZoom = async () => {
      initializationInProgress.current = true;
      console.log('[Zoom] Starting initialization…');

      await new Promise(r => setTimeout(r, 100)); // DOM settle

      try {
        if (!mountedRef.current) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token    = propToken || localStorage.getItem('token') || userInfo.token;
        if (!token) throw new Error('Authentication required. Please log in.');

        const config = {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        };

        setLoadingStep('Fetching session config…');
        const { data: sdkConfig } = await axios.get(`/api/sessions/${sessionId}/zoom-config`, config);
        if (!mountedRef.current) return;

        // Mock mode
        if (sdkConfig.sdkKey?.startsWith('MOCK_')) {
          setUseMockMode(true);
          setLoading(false);
          initializationInProgress.current = false;
          return;
        }

        // Wait for mount point
        setLoadingStep('Preparing meeting room…');
        let retries = 0;
        while (!meetingSDKElement.current && retries < 20 && mountedRef.current) {
          retries++;
          await new Promise(r => setTimeout(r, 50));
        }
        if (!meetingSDKElement.current) throw new Error('Meeting container failed to initialize');
        if (!mountedRef.current) return;

        console.log('[Zoom] DOM ready, initializing SDK…');

        // Destroy stale client
        if (zoomClient.current) {
          try { zoomClient.current.leaveMeeting(); } catch (_) {}
          zoomClient.current = null;
        }

        const client = ZoomMtgEmbedded.createClient();
        zoomClient.current = client;

        setLoadingStep('Loading Zoom SDK…');
        await client.init({
          zoomAppRoot: meetingSDKElement.current,
          language: 'en-US',
          leaveOnPageUnload: true,
          customize: {
            video: {
              isResizable: false,
              defaultViewType: 'gallery',
              popper: { disableDraggable: true },
            },
            chat: { isVisible: true, anchor: 'right' },
            meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
          },
        });

        console.log('[Zoom] SDK initialized. Stabilizing…');
        if (!mountedRef.current) return;
        await new Promise(r => setTimeout(r, 800));

        setLoadingStep('Joining meeting…');
        console.log('[Zoom] Joining meeting…');
        await client.join({
          signature:     sdkConfig.signature,
          meetingNumber: sdkConfig.meetingNumber,
          password:      sdkConfig.passWord,
          userName:      sdkConfig.userName,
          userEmail:     sdkConfig.userEmail,
        });

        console.log('[Zoom] Successfully joined meeting');

        if (isHost) {
          try {
            await axios.put(`/api/sessions/${sessionId}/start`, {}, config);
            console.log('[Zoom] Session marked as live on backend');
          } catch (e) {
            console.warn('[Zoom] Failed to mark session live:', e.message);
          }
        }

        if (mountedRef.current) {
          isInitializedRef.current = true;
          setLoading(false);

          // MutationObserver: re-show toolbar whenever SDK hides it via inline styles
          // This handles screen share mode where SDK sets display:none on the footer
          const startToolbarObserver = () => {
            const root = meetingSDKElement.current;
            if (!root) return;

            // All selectors the SDK uses for its toolbar
            const TOOLBAR_SELECTORS = [
              '.footer',
              '.footer__btns-container',
              '#wc-footer',
              '.wc-footer',
              '[class*="wc-footer"]',
              '[class*="meeting-footer"]',
              '[class*="footer-container"]',
            ];

            const forceShowToolbar = () => {
              TOOLBAR_SELECTORS.forEach(sel => {
                root.querySelectorAll(sel).forEach(el => {
                  // Always force visible regardless of current state
                  el.style.setProperty('display', 'flex', 'important');
                  el.style.setProperty('visibility', 'visible', 'important');
                  el.style.setProperty('opacity', '1', 'important');
                  el.style.setProperty('pointer-events', 'auto', 'important');
                  el.style.setProperty('height', 'auto', 'important');
                  el.style.setProperty('min-height', '64px', 'important');
                  el.style.setProperty('overflow', 'visible', 'important');
                  el.style.setProperty('position', 'relative', 'important');
                  el.style.setProperty('z-index', '1000', 'important');
                });
              });
            };

            // MutationObserver as primary watcher
            observerRef.current = new MutationObserver(() => {
              forceShowToolbar();
            });

            observerRef.current.observe(root, {
              subtree: true,
              attributes: true,
              attributeFilter: ['style', 'class'],
              childList: true,
            });

            // setInterval as fallback — runs every 500ms to catch
            // cases where SDK re-hides toolbar after observer fires
            const intervalId = setInterval(() => {
              if (!mountedRef.current) {
                clearInterval(intervalId);
                return;
              }
              forceShowToolbar();

              // If SDK is in minimized/suspension mode, click the expand button
              // to force it back to full view
              const expandBtn = root.querySelector(
                '[class*="suspension-window"] [class*="expand"], ' +
                '[class*="suspension-window"] button[title*="expand" i], ' +
                '[class*="suspension-window"] button[aria-label*="expand" i], ' +
                '[class*="minimize"] button[class*="restore"], ' +
                '[class*="wc-mini"] button'
              );
              if (expandBtn) {
                expandBtn.click();
                console.log('[Zoom] Clicked expand button to exit minimized mode');
              }
            }, 500);

            // Store interval id for cleanup
            observerRef.current._intervalId = intervalId;

            // Run once immediately
            forceShowToolbar();
          };

          startToolbarObserver();
        }

      } catch (err) {
        const details = {};
        if (err) Object.getOwnPropertyNames(err).forEach(k => { details[k] = err[k]; });
        console.error('[Zoom] Error details:', details);

        if (!mountedRef.current) return;

        const msg = err.response?.data?.message || err.message || 'Failed to join meeting';
        setError(msg);
        setLoading(false);
        isInitializedRef.current         = false;
        initializationInProgress.current = false;
        onError?.(msg);
      } finally {
        initializationInProgress.current = false;
      }
    };

    initializeZoom();
  }, [sessionId, propToken, onError, isHost]);

  /* ── Leave / End handlers ───────────────────────────────── */
  const handleLeave = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!isHost) { exitMeeting(); return; }
    setShowEndConfirm(true);
  }, [isHost]);

  const confirmEndSession = async () => {
    setIsEnding(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token    = propToken || localStorage.getItem('token') || userInfo.token;
      await axios.put(`/api/sessions/${sessionId}/end`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log(`[Zoom] Session ${sessionId} ended.`);
      exitMeeting();
    } catch (err) {
      console.error('[Zoom] Failed to end session:', err.message);
      setIsEnding(false);
      setShowEndConfirm(false);
      if (window.confirm('Backend update failed. Force exit?')) exitMeeting();
    }
  };

  const exitMeeting = () => {
    if (zoomClient.current) {
      try { zoomClient.current.leaveMeeting(); } catch (e) { console.error('[Zoom] leaveMeeting error:', e); }
    }
    onLeave?.();
  };

  /* ── Retry ──────────────────────────────────────────────── */
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setLoadingStep('Connecting…');
    isInitializedRef.current         = false;
    initializationInProgress.current = false;
  };

  /* ── Mock mode ──────────────────────────────────────────── */
  if (useMockMode) {
    return <MockZoomMeeting sessionId={sessionId} isHost={isHost} onLeave={handleLeave} />;
  }

  /* ── Error state ────────────────────────────────────────── */
  if (error) {
    return (
      <div className="zm-error-screen">
        <div className="zm-error-card">
          <div className="zm-error-icon">
            <WifiOff size={32} />
          </div>
          <h3 className="zm-error-title">Unable to Join Meeting</h3>
          <p className="zm-error-msg">{error}</p>
          <div className="zm-error-actions">
            <button className="zm-btn-retry" onClick={handleRetry}>
              <RefreshCw size={15} />
              Try Again
            </button>
            <button className="zm-btn-leave" onClick={onLeave}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────────── */
  return (
    <div
      className="zoom-sdk-wrapper"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* SDK mount point */}
      <div
        id="zoom-sdk-root"
        ref={meetingSDKElement}
        className="zoom-meeting-container"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="zm-loading-overlay">
          <div className="zm-loading-card">
            <div className="zm-loading-spinner" />
            <p className="zm-loading-title">Joining Meeting</p>
            <p className="zm-loading-step">{loadingStep}</p>
          </div>
        </div>
      )}

      {/* End meeting confirmation modal */}
      {showEndConfirm && createPortal(
        <div
          className="zm-confirm-backdrop"
          onClick={e => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div className="zm-confirm-card">
            <div className="zm-confirm-icon">
              <Radio size={28} className="animate-pulse" />
            </div>
            <h3 className="zm-confirm-title">End Meeting for All?</h3>
            <p className="zm-confirm-msg">
              This will disconnect all participants and archive the recording.
            </p>
            <div className="zm-confirm-actions">
              <button
                disabled={isEnding}
                className="zm-confirm-cancel"
                onClick={e => { e.preventDefault(); e.stopPropagation(); setShowEndConfirm(false); }}
              >
                Cancel
              </button>
              <button
                disabled={isEnding}
                className="zm-confirm-end"
                onClick={e => { e.preventDefault(); e.stopPropagation(); confirmEndSession(); }}
              >
                {isEnding
                  ? <div className="zm-btn-spinner" />
                  : <><X size={14} /> End for All</>
                }
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
