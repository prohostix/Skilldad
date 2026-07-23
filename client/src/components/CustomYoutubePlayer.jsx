import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

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

const CustomYoutubePlayer = ({ url, title, onEnded }) => {
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
      className="relative w-full aspect-video bg-black overflow-hidden group rounded-2xl border border-white/10 shadow-2xl"
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
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Play size={28} className="text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* YouTube Player — only created once started=true. controls=0/modestbranding/
          rel=0 suppress YouTube's own UI, and pointer-events-none means the iframe
          never receives real hover/click events. Rendered at natural size with no
          crop/stretch, since a vertical crop here previously clipped subtitles
          rendered near the bottom of the frame. */}
      {started && (
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
          <div ref={mountRef} className="w-full h-full" />
        </div>
      )}

      {/* Pause Cover — YouTube shows its own title bar + suggested-video overlay
          whenever the video is paused via the API, with no parameter to disable
          it. Since a paused frame isn't changing anyway, fully covering it while
          not playing hides that native UI completely instead of trying to mask
          pieces of it. */}
      {started && !isPlaying && (
        <div className="absolute inset-0 z-[15] pointer-events-none flex items-center justify-center bg-black">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Play size={28} className="text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Intercept Overlay */}
      <div
        onClick={handlePlayPause}
        className="absolute inset-0 cursor-pointer z-10"
      />

      {/* Control Skin Layer — single row, hugging the very bottom edge, so it
          physically occupies the same strip where YouTube's native share/
          watch-later/more-videos icons render in fullscreen (rather than
          trying to suppress them directly, which fullscreen doesn't allow
          reliably). */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pt-3 pb-2 flex items-center gap-4 text-white transition-all duration-300 z-20 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-primary text-white hover:scale-105 transition-all shadow-md shrink-0"
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
          className="flex-1 h-1 bg-white/20 hover:h-1.5 rounded-lg appearance-none cursor-pointer accent-primary transition-all"
          style={{
            background: `linear-gradient(to right, #5B5CFF 0%, #5B5CFF ${
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
            className="w-0 group-hover/volume:w-16 h-1 rounded bg-white/20 appearance-none cursor-pointer accent-primary transition-all duration-300 overflow-hidden"
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
