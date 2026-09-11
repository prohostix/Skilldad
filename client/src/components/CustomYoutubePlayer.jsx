import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { getMediaUrl } from '../utils/media';

// Loads the YouTube IFrame Player API script once and shares readiness across
// every player instance on the page (multiple lessons can mount this component).
let apiLoadPromise = null;
const loadYoutubeApi = () => {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });
  return apiLoadPromise;
};

const CustomYoutubePlayer = ({ url, title, thumbnail, onEnded }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isReady, setIsReady] = useState(false);
  // The YouTube iframe isn't created until the student presses play. Before that,
  // we show our own poster image + play button — a plain <img>, not an iframe —
  // so there's no YouTube "cued" thumbnail/branding to hide in the first place.
  const [started, setStarted] = useState(false);

  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  // Extract YouTube ID
  const getYoutubeId = (urlStr) => {
    if (!urlStr) return '';
    const match = urlStr.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/|youtube\.com\/embed\/)([\w-]+)/);
    return match ? match[1] : '';
  };

  const videoId = getYoutubeId(url);

  useEffect(() => {
    if (!started || !videoId || !mountRef.current) return;
    let destroyed = false;

    loadYoutubeApi().then((YT) => {
      if (destroyed || !mountRef.current) return;
      playerRef.current = new YT.Player(mountRef.current, {
        videoId,
        // autoplay is always 1 here — the player is only ever created after the
        // student clicks the poster. Using the playerVars flag (rather than an
        // imperative .playVideo() call after the API script finishes loading)
        // avoids the async gap that can make browsers silently block playback,
        // which previously left the video "cued" showing YouTube's own UI.
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 0,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            if (destroyed) return;
            setIsReady(true);
            setDuration(playerRef.current.getDuration() || 0);
          },
          onStateChange: (event) => {
            if (destroyed) return;
            const YTState = window.YT.PlayerState;
            if (event.data === YTState.PLAYING) {
              setIsPlaying(true);
              setDuration(playerRef.current.getDuration() || 0);
            } else if (event.data === YTState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === YTState.ENDED) {
              setIsPlaying(false);
              if (onEndedRef.current) onEndedRef.current();
            }
          }
        }
      });
    });

    return () => {
      destroyed = true;
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, videoId]);

  // Poll current time while playing (YouTube's API has no continuous timeupdate event)
  useEffect(() => {
    if (isPlaying && isReady) {
      pollIntervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 250);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isPlaying, isReady]);

  const handlePlayPause = () => {
    if (!started) {
      setStarted(true);
      return;
    }
    if (!playerRef.current || !isReady) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current && isReady) {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current && isReady) {
      playerRef.current.setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const handleMuteToggle = () => {
    if (!playerRef.current || !isReady) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 50);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(err));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Format time (seconds -> mm:ss)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  if (!videoId) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full bg-black overflow-hidden group ${isFullscreen ? 'h-full rounded-none border-0 shadow-none' : 'aspect-video rounded-2xl border border-white/10 shadow-2xl'}`}
    >
      {/* Before the student presses play, there is no iframe in the DOM at all —
          just our own poster image + play button — so there is no YouTube "cued"
          thumbnail/branding to hide in the first place. */}
      {!started && (
        <div
          onClick={handlePlayPause}
          className="absolute inset-0 z-[15] bg-cover bg-center flex items-center justify-center cursor-pointer"
          style={{ backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)` }}
        >
          {/* A custom cover, when set, renders as a real <img> on top of the YouTube
              thumbnail base layer above - if its file is missing/404s, onError hides
              it instead of leaving a blank poster, and the YouTube thumbnail underneath
              still shows through. */}
          {thumbnail && (
            <img
              src={thumbnail.startsWith('http') ? thumbnail : getMediaUrl(thumbnail)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          {/* A global light-mode rule (`html.light-mode [class*="bg-black/"] { background-color:
              #FFFFFF !important }`) matches this div's bg-black/30 class and turns the intended
              translucent tint into solid opaque white, hiding the poster image underneath - an
              #id selector is the simplest way to out-specificity that !important rule. */}
          <style dangerouslySetInnerHTML={{ __html: `#yt-poster-tint { background-color: rgba(0,0,0,0.3) !important; }` }} />
          <div id="yt-poster-tint" className="absolute inset-0" />
          <div className="relative hover:scale-110 transition-all duration-300">
            <Play
              size={48}
              className="text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              fill="#4B2E83"
              stroke="white"
              strokeWidth={1.5}
            />
          </div>
        </div>
      )}

      {/* YouTube Player — only created once started=true. controls=0/modestbranding/
          rel=0 suppress YouTube's own UI, and pointer-events-none means the iframe
          never receives real hover/click events. Scaled up from center so both
          the top edge (title/channel overlay) and bottom edge (share/watch-later/
          logo chrome) grow past the container's clipped bounds equally and stay
          hidden, at the cost of a small crop on both sides. */}
      {started && (
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ transform: 'scale(1.33)', transformOrigin: 'center' }}
        >
          <div ref={mountRef} className="w-full h-full" />
        </div>
      )}


      {/* Center Play Button Overlay — shown when video is paused */}
      {started && !isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-25"
        >
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <Play 
              size={48} 
              className="text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]" 
              fill="#4B2E83" 
              stroke="white" 
              strokeWidth={1.5} 
            />
          </div>
        </div>
      )}

      {/* Top Edge Blur & Gradient Overlay — only in fullscreen, tight height to cleanly cover the 16px white space */}
      {started && isFullscreen && (
        <div 
          className="absolute top-0 inset-x-0 pointer-events-none z-30 h-5 sm:h-6 bg-gradient-to-b from-black/95 via-black/70 to-transparent backdrop-blur-sm" 
        />
      )}

      {/* Bottom Edge Blur & Gradient Overlay — only in fullscreen, tight height */}
      {started && isFullscreen && (
        <div 
          className="absolute bottom-0 inset-x-0 pointer-events-none z-10 h-5 sm:h-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent backdrop-blur-sm" 
        />
      )}

      {/* Intercept Overlay */}
      <div
        onClick={handlePlayPause}
        className="absolute inset-0 cursor-pointer z-20"
      />


      {/* Control Skin Layer — single row, hugging the very bottom edge, so it
          physically occupies the same strip where YouTube's native share/
          watch-later/more-videos icons render in fullscreen (rather than
          trying to suppress them directly, which fullscreen doesn't allow
          reliably). */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pt-3 pb-2 flex items-center gap-4 text-white transition-all duration-300 z-40 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
      >
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="p-1.5 rounded-lg bg-[#4B2E83] hover:bg-[#5B3A9E] text-white hover:scale-105 transition-all shadow-md shrink-0"
        >
          {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
        </button>

        {/* Time Indicator */}
        <span className="text-[11px] font-bold font-inter tracking-wider text-slate-200 shrink-0">
          {formatTime(currentTime)} <span className="text-white/30">/</span> {formatTime(duration)}
        </span>

        {/* Progress Timeline bar — fills the space between the buttons */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 rounded-full appearance-none cursor-pointer transition-all"
          style={{
            minHeight: 'unset',
            height: '10px',
            accentColor: '#4B2E83',
            background: `linear-gradient(to right, #4B2E83 0%, #4B2E83 ${
              duration ? (currentTime / duration) * 100 : 0
            }%, rgba(255,255,255,0.2) ${
              duration ? (currentTime / duration) * 100 : 0
            }%, rgba(255,255,255,0.2) 100%)`
          }}
        />

        {/* Mute/Volume controls */}
        <div className="flex items-center gap-2 group/volume shrink-0">
          <button
            onClick={handleMuteToggle}
            className="p-1 text-slate-300 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-0 opacity-0 group-hover/volume:w-16 group-hover/volume:opacity-100 rounded-full appearance-none cursor-pointer transition-all duration-300"
            style={{
              minHeight: 'unset',
              height: '8px',
              accentColor: '#4B2E83',
              background: `linear-gradient(to right, #4B2E83 0%, #4B2E83 ${
                isMuted ? 0 : volume
              }%, rgba(255,255,255,0.2) ${
                isMuted ? 0 : volume
              }%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-1 text-slate-300 hover:text-white transition-colors hover:scale-105 shrink-0"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </div>
  );
};

export default CustomYoutubePlayer;
