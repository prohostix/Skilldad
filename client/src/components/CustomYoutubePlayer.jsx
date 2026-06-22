import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

const CustomYoutubePlayer = ({ url, title, onEnded }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Extract YouTube ID
  const getYoutubeId = (urlStr) => {
    if (!urlStr) return '';
    const match = urlStr.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]+)/);
    return match ? match[1] : '';
  };

  const videoId = getYoutubeId(url);

  // Post messages to YouTube IFrame
  const postCommand = (func, args = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: func,
          args: args
        }),
        '*'
      );
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      postCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      postCommand('playVideo');
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    postCommand('seekTo', [newTime, true]);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    postCommand('setVolume', [newVolume]);
    if (newVolume > 0 && isMuted) {
      postCommand('unMute');
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      postCommand('unMute');
      setIsMuted(false);
      postCommand('setVolume', [volume || 50]);
    } else {
      postCommand('mute');
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

  // Listen to messages from YouTube player
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'infoDelivery' && data.info) {
          const info = data.info;
          if (info.currentTime !== undefined) {
            setCurrentTime(info.currentTime);
          }
          if (info.duration !== undefined) {
            setDuration(info.duration);
          }
          if (info.playerState !== undefined) {
            setIsPlaying(info.playerState === 1);
            if (info.playerState === 0 && onEnded) {
              onEnded();
            }
          }
        }
      } catch (err) {
        // Ignore parsing errors of other messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEnded]);

  if (!videoId) return null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video bg-black overflow-hidden group rounded-2xl border border-white/10 shadow-2xl"
    >
      {/* Cropped YouTube Player with Pointer Events Disabled */}
      <div className="absolute inset-0 overflow-hidden w-full h-full pointer-events-none select-none">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&fs=0`}
          title={title}
          className="absolute border-0 w-full"
          style={{
            top: '-9%',
            left: 0,
            height: '118%',
          }}
        />
      </div>

      {/* Intercept Overlay */}
      <div 
        onClick={handlePlayPause}
        className="absolute inset-0 cursor-pointer z-10"
      />

      {/* Control Skin Layer */}
      <div 
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col gap-3 transition-all duration-300 z-20 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Progress Timeline bar */}
        <div className="flex items-center gap-3 w-full">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 hover:h-1.5 rounded-lg appearance-none cursor-pointer accent-primary transition-all"
            style={{
              background: `linear-gradient(to right, #5B5CFF 0%, #5B5CFF ${
                duration ? (currentTime / duration) * 100 : 0
              }%, rgba(255,255,255,0.2) ${
                duration ? (currentTime / duration) * 100 : 0
              }%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Buttons & Labels bar */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button 
              onClick={handlePlayPause}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-primary text-white hover:scale-105 transition-all shadow-md"
            >
              {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
            </button>

            {/* Time Indicator */}
            <span className="text-[11px] font-bold font-inter tracking-wider text-slate-200">
              {formatTime(currentTime)} <span className="text-white/30">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Mute/Volume controls */}
            <div className="flex items-center gap-2 group/volume">
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
              className="p-1 text-slate-300 hover:text-white transition-colors hover:scale-105"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomYoutubePlayer;
