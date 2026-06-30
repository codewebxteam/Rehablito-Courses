import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Settings,
  Check,
  ChevronRight,
  Signal,
} from "lucide-react";
import { useCourse } from "../context/CourseContext";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const extractVideoId = (video) => {
  if (!video) return null;
  if (video.videoId) return video.videoId;
  if (video.url) {
    try {
      const u = new URL(video.url);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    } catch (_) {}
  }
  return null;
};

const formatTime = (time) => {
  if (!time || isNaN(time) || time <= 0) return "0:00";
  const h = Math.floor(time / 3600);
  const m = Math.floor((time % 3600) / 60);
  const s = Math.floor(time % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const CourseVideoPlayer = ({
  course,
  playlist = [],
  initialIndex = 0,
  onClose,
}) => {
  // ── Build lecture list (stable, computed once) ──
  const lecturesRef = useRef(null);
  if (!lecturesRef.current) {
    if (playlist?.length > 0) lecturesRef.current = playlist;
    else if (course.lectures?.length > 0) lecturesRef.current = course.lectures;
    else {
      const vid = course.youtubeId || course.videoId;
      if (vid)
        lecturesRef.current = [
          { id: "main", videoId: vid, title: course.title },
        ];
      else if (course.url)
        lecturesRef.current = [
          { id: "url", url: course.url, title: course.title },
        ];
      else lecturesRef.current = [];
    }
  }
  const lectures = lecturesRef.current;

  const { updateCourseProgress } = useCourse();

  // ── All mutable values live in refs — zero stale-closure risk ──
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const uiTickRef = useRef(null);
  const syncTickRef = useRef(null);
  const durationPollRef = useRef(null);
  const playerReadyRef = useRef(false);
  const currentIdxRef = useRef(
    Math.min(initialIndex, Math.max(0, lectures.length - 1)),
  );
  const durationRef = useRef(0);
  const currentTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const watchSecsRef = useRef(0);
  const lastProgressRef = useRef(0);
  const isMutedRef = useRef(false);
  const playbackSpeedRef = useRef(1);

  // ── React UI state (only what needs a re-render) ──
  const [currentIndex, setCurrentIndex] = useState(currentIdxRef.current);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadedFrac, setLoadedFrac] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // NEW: CSS-rotation landscape fallback (iOS Safari / browsers that block requestFullscreen)
  const [isCSSLandscape, setIsCSSLandscape] = useState(false);
  const [tapSide, setTapSide] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState("main");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [qualityLevel, setQualityLevel] = useState("auto");

  const QUALITIES = [
    { label: "Auto", value: "auto" },
    { label: "1080p HD", value: "hd1080" },
    { label: "720p HD", value: "hd720" },
    { label: "480p", value: "large" },
    { label: "360p", value: "medium" },
    { label: "240p", value: "small" },
  ];

  // ─────────────────────────────────────────────
  // Interval helpers
  // ─────────────────────────────────────────────
  const clearAllTicks = useCallback(() => {
    clearInterval(uiTickRef.current);
    clearInterval(syncTickRef.current);
    clearInterval(durationPollRef.current);
    uiTickRef.current = null;
    syncTickRef.current = null;
    durationPollRef.current = null;
  }, []);

  // Poll for duration — YouTube often returns 0 right after loadVideoById
  const startDurationPoll = useCallback(() => {
    clearInterval(durationPollRef.current);
    let tries = 0;
    durationPollRef.current = setInterval(() => {
      tries++;
      const p = playerRef.current;
      if (!p || typeof p.getDuration !== "function") return;
      try {
        const d = p.getDuration();
        if (d && !isNaN(d) && d > 0) {
          durationRef.current = d;
          setDuration(d);
          clearInterval(durationPollRef.current);
          durationPollRef.current = null;
        }
      } catch (_) {}
      if (tries > 40) {
        clearInterval(durationPollRef.current);
        durationPollRef.current = null;
      }
    }, 500);
  }, []);

  // Sync watch time to DB
  const syncProgress = useCallback(() => {
    const p = playerRef.current;
    if (!p || !playerReadyRef.current) return;
    try {
      const t = p.getCurrentTime?.() ?? currentTimeRef.current;
      const d = durationRef.current;
      if (!d || d <= 0) return;
      const total = lectures.length;
      const pct = 100 / total;
      const calc = currentIdxRef.current * pct + (t / d) * pct;
      const final = Math.max(calc, lastProgressRef.current);
      const secs = watchSecsRef.current;
      watchSecsRef.current = 0;
      if (secs > 0 || final > lastProgressRef.current) {
        lastProgressRef.current = final;
        const cId = course.courseId || course.id;
        if (cId) {
          updateCourseProgress(cId, Math.min(final, 100), secs);
        }
      }
    } catch (_) {}
  }, [lectures.length, course.courseId, course.id, updateCourseProgress]);

  // 1-second UI ticker
  const startUITick = useCallback(() => {
    clearInterval(uiTickRef.current);
    uiTickRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p || !playerReadyRef.current) return;
      try {
        if (p.getPlayerState?.() !== 1) return;
        const t = p.getCurrentTime?.();
        const d = p.getDuration?.();
        if (typeof t === "number" && !isNaN(t) && !isDraggingRef.current) {
          currentTimeRef.current = t;
          setCurrentTime(t);
        }
        if (typeof d === "number" && d > 0 && durationRef.current !== d) {
          durationRef.current = d;
          setDuration(d);
        }
        const lf = p.getVideoLoadedFraction?.() ?? 0;
        setLoadedFrac(lf);
        watchSecsRef.current += 1;
      } catch (_) {}
    }, 1000);
  }, []);

  // 30-second DB sync
  const startSyncTick = useCallback(() => {
    clearInterval(syncTickRef.current);
    syncTickRef.current = setInterval(syncProgress, 30_000);
  }, [syncProgress]);

  // ─────────────────────────────────────────────
  // Load a new video by index into the EXISTING player
  // ─────────────────────────────────────────────
  const loadVideoAtIndex = useCallback(
    (idx) => {
      const video = lectures[idx];
      if (!video) return;
      const vid = extractVideoId(video);
      if (!vid) return;

      // Reset everything for the new video
      playerReadyRef.current = false;
      durationRef.current = 0;
      currentTimeRef.current = 0;
      watchSecsRef.current = 0;
      setCurrentTime(0);
      setDuration(0);
      setLoadedFrac(0);
      setIsLoading(true);
      setIsPlaying(false);
      clearInterval(uiTickRef.current);
      uiTickRef.current = null;

      const p = playerRef.current;
      if (p && typeof p.loadVideoById === "function") {
        try {
          p.loadVideoById({ videoId: vid, startSeconds: 0 });
          // playerReadyRef is re-set to true when PLAYING state fires
        } catch (e) {
          console.error("loadVideoById failed:", e);
        }
      }
    },
    [lectures],
  );

  // ─────────────────────────────────────────────
  // Init YouTube IFrame API — runs ONCE
  // ─────────────────────────────────────────────
  useEffect(() => {
    const startIdx = currentIdxRef.current;
    const firstVid = extractVideoId(lectures[startIdx]);
    if (!firstVid) return;

    const buildPlayer = () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (_) {}
        playerRef.current = null;
      }
      playerReadyRef.current = false;

      playerRef.current = new window.YT.Player("yt-iframe-target", {
        videoId: firstVid,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady(e) {
            playerReadyRef.current = true;
            try {
              e.target.setPlaybackRate(playbackSpeedRef.current);
            } catch (_) {}
            e.target.playVideo();
            startDurationPoll();
            startUITick();
            startSyncTick();
            setIsLoading(false);
          },

          onStateChange(e) {
            const S = window.YT.PlayerState;
            switch (e.data) {
              case S.PLAYING: // 1
                // KEY FIX: mark player ready again after loadVideoById
                playerReadyRef.current = true;
                setIsPlaying(true);
                setIsLoading(false);
                try {
                  const d = e.target.getDuration();
                  if (d > 0) {
                    durationRef.current = d;
                    setDuration(d);
                  }
                } catch (_) {}
                startUITick();
                startDurationPoll();
                break;

              case S.PAUSED: // 2
                setIsPlaying(false);
                clearInterval(uiTickRef.current);
                uiTickRef.current = null;
                try {
                  const t = e.target.getCurrentTime();
                  if (!isNaN(t)) {
                    currentTimeRef.current = t;
                    setCurrentTime(t);
                  }
                } catch (_) {}
                syncProgress();
                break;

              case S.BUFFERING: // 3
                setIsLoading(true);
                break;

              case S.ENDED: // 0
                setIsPlaying(false);
                clearInterval(uiTickRef.current);
                uiTickRef.current = null;
                syncProgress();
                // Auto-advance to next lecture
                {
                  const next = currentIdxRef.current + 1;
                  if (next < lectures.length) {
                    currentIdxRef.current = next;
                    setCurrentIndex(next);
                    loadVideoAtIndex(next);
                  }
                }
                break;

              case 5: // CUED
                playerReadyRef.current = true;
                setIsLoading(false);
                try {
                  const d = e.target.getDuration();
                  if (d > 0) {
                    durationRef.current = d;
                    setDuration(d);
                  }
                } catch (_) {}
                break;

              default:
                break;
            }
          },

          onPlaybackQualityChange(e) {
            setQualityLevel(e.data);
          },
          onError() {
            setIsLoading(false);
          },
        },
      });
    };

    if (window.YT?.Player) {
      buildPlayer();
    } else {
      if (!document.getElementById("yt-api-script")) {
        const s = document.createElement("script");
        s.id = "yt-api-script";
        s.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(s);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        buildPlayer();
      };
    }

    return () => {
      clearAllTicks();
      syncProgress();
      try {
        playerRef.current?.destroy();
      } catch (_) {}
      playerRef.current = null;
      playerReadyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once only

  // ─────────────────────────────────────────────
  // Fullscreen change listener
  // Covers all vendor prefixes + resets CSS landscape if user
  // presses Escape / back button to exit native fullscreen
  // ─────────────────────────────────────────────
  useEffect(() => {
    const h = () => {
      const inFS = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(inFS);
      if (!inFS) {
        // User exited via Escape / back — undo CSS rotate too
        setIsCSSLandscape(false);
        try {
          window.screen.orientation?.unlock?.();
        } catch (_) {}
      } else {
        // Re-attempt orientation lock every time native FS is entered
        try {
          window.screen.orientation?.lock?.("landscape");
        } catch (_) {}
      }
    };
    document.addEventListener("fullscreenchange", h);
    document.addEventListener("webkitfullscreenchange", h);
    document.addEventListener("mozfullscreenchange", h);
    document.addEventListener("MSFullscreenChange", h);
    return () => {
      document.removeEventListener("fullscreenchange", h);
      document.removeEventListener("webkitfullscreenchange", h);
      document.removeEventListener("mozfullscreenchange", h);
      document.removeEventListener("MSFullscreenChange", h);
    };
  }, []);

  // ── Keep controls visible when settings panel is open ──
  useEffect(() => {
    if (showSettings) setShowControls(true);
  }, [showSettings]);

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────
  const revealControls = useCallback(() => {
    setShowControls(true);
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      // Read live player state from the ref — never stale
      const playing = playerRef.current?.getPlayerState?.() === 1;
      if (playing) setShowControls(false);
    }, 3000);
  }, []);

  const togglePlay = useCallback(
    (e) => {
      e?.stopPropagation();
      if (showSettings) {
        setShowSettings(false);
        setSettingsMenu("main");
        return;
      }
      const p = playerRef.current;
      if (!p || !playerReadyRef.current) return;
      try {
        p.getPlayerState() === 1 ? p.pauseVideo() : p.playVideo();
      } catch (_) {}
    },
    [showSettings],
  );

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p || !playerReadyRef.current) return;
    try {
      if (isMutedRef.current) {
        p.unMute();
        isMutedRef.current = false;
        setIsMuted(false);
      } else {
        p.mute();
        isMutedRef.current = true;
        setIsMuted(true);
      }
    } catch (_) {}
  }, []);

  // uses durationRef.current — never stale
  const seekTo = useCallback((seconds) => {
    const p = playerRef.current;
    if (!p || !playerReadyRef.current) return;
    try {
      const max = durationRef.current || 0;
      const clamped = Math.max(0, max > 0 ? Math.min(seconds, max) : seconds);
      p.seekTo(clamped, true);
      currentTimeRef.current = clamped;
      setCurrentTime(clamped);
    } catch (_) {}
  }, []);

  const handleDoubleTap = useCallback(
    (side) => {
      const delta = side === "left" ? -10 : 10;
      seekTo(currentTimeRef.current + delta);
      setTapSide(side);
      setTimeout(() => setTapSide(null), 700);
    },
    [seekTo],
  );

  // onChange → visual only, onMouseUp/onTouchEnd → actual seek
  const handleSeekChange = useCallback((e) => {
    isDraggingRef.current = true;
    const v = parseFloat(e.target.value);
    currentTimeRef.current = v;
    setCurrentTime(v);
  }, []);

  const handleSeekCommit = useCallback(
    (e) => {
      isDraggingRef.current = false;
      seekTo(parseFloat(e.target.value));
    },
    [seekTo],
  );

  // playNext / playPrev update BOTH the ref and call loadVideoAtIndex directly
  const playNext = useCallback(() => {
    const next = currentIdxRef.current + 1;
    if (next >= lectures.length) return;
    currentIdxRef.current = next;
    setCurrentIndex(next);
    loadVideoAtIndex(next);
  }, [lectures.length, loadVideoAtIndex]);

  const playPrev = useCallback(() => {
    const prev = currentIdxRef.current - 1;
    if (prev < 0) return;
    currentIdxRef.current = prev;
    setCurrentIndex(prev);
    loadVideoAtIndex(prev);
  }, [loadVideoAtIndex]);

  const handleSpeedChange = useCallback((speed) => {
    playbackSpeedRef.current = speed;
    const p = playerRef.current;
    if (p && playerReadyRef.current) {
      try {
        p.setPlaybackRate(speed);
      } catch (_) {}
    }
    setPlaybackSpeed(speed);
    setShowSettings(false);
    setSettingsMenu("main");
  }, []);

  const handleQualityChange = useCallback((quality) => {
    const p = playerRef.current;
    if (p && playerReadyRef.current) {
      try {
        p.setPlaybackQuality(quality);
      } catch (_) {}
    }
    setQualityLevel(quality);
    setShowSettings(false);
    setSettingsMenu("main");
  }, []);

  // ─────────────────────────────────────────────
  // toggleFullscreen — 3-layer landscape strategy
  //
  //  Layer 1: Native fullscreen + screen.orientation.lock("landscape")
  //           Works on: Android Chrome, desktop browsers
  //
  //  Layer 2: CSS rotation fallback (transform: rotate(90deg) + swapped w/h)
  //           Works on: iOS Safari, browsers that block requestFullscreen
  //           (PWA mode, embedded WebViews, older browsers)
  //
  //  Layer 3: Vendor-prefixed fullscreen (webkit / moz / ms)
  //           Covers: older Safari macOS, Firefox, IE11 edge cases
  // ─────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    const isCurrentlyFullscreen =
      !!document.fullscreenElement ||
      !!document.webkitFullscreenElement ||
      !!document.mozFullScreenElement ||
      !!document.msFullscreenElement ||
      isCSSLandscape;

    if (!isCurrentlyFullscreen) {
      // ── ENTER fullscreen ──────────────────────────────────────────────
      const el = containerRef.current;
      if (!el) return;

      // Try native fullscreen (all vendor prefixes)
      const requestFS =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;

      let nativeSucceeded = false;
      if (requestFS) {
        try {
          await requestFS.call(el);
          nativeSucceeded = true;
        } catch (_) {
          // Native fullscreen blocked (iOS Safari, some PWAs) — fall through
        }
      }

      if (nativeSucceeded) {
        // Try to lock orientation — best-effort, never throws to the user
        try {
          await window.screen.orientation?.lock?.("landscape");
        } catch (_) {}
      } else {
        // ── CSS rotation fallback ──
        // Rotate the entire player 90° and swap width ↔ height so it
        // fills the viewport in landscape on any screen size / OS
        setIsCSSLandscape(true);
        setIsFullscreen(true);
      }
    } else {
      // ── EXIT fullscreen ───────────────────────────────────────────────
      if (isCSSLandscape) {
        setIsCSSLandscape(false);
        setIsFullscreen(false);
      } else {
        const exitFS =
          document.exitFullscreen ||
          document.webkitExitFullscreen ||
          document.mozCancelFullScreen ||
          document.msExitFullscreen;
        try {
          if (exitFS) await exitFS.call(document);
        } catch (_) {}
        try {
          window.screen.orientation?.unlock?.();
        } catch (_) {}
      }
    }
  }, [isCSSLandscape]);

  // ─────────────────────────────────────────────
  // Derived
  // ─────────────────────────────────────────────
  const currentVideo = lectures[currentIndex] || {};
  const qualityLabel =
    QUALITIES.find((q) => q.value === qualityLevel)?.label ?? "Auto";
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ─────────────────────────────────────────────
  // CSS-landscape inline style
  // Applied to the root container when native fullscreen is unavailable.
  // Rotates 90° around the viewport centre and swaps w/h so the box
  // perfectly fills the screen in landscape orientation.
  // ─────────────────────────────────────────────
  const cssLandscapeStyle = isCSSLandscape
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        width: "100vh", // rotated: height becomes the wide axis
        height: "100vw", // rotated: width becomes the tall axis
        transform: "translate(-50%, -50%) rotate(90deg)",
        transformOrigin: "center center",
        zIndex: 9999,
      }
    : {};

  // ─────────────────────────────────────────────
  // Coming Soon Check (NEW ADDITION)
  // ─────────────────────────────────────────────
  const isCourseComingSoon =
    course?.isComingSoon === true ||
    course?.status === "coming_soon" ||
    course?.status === "Coming Soon";

  if (isCourseComingSoon) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center select-none overflow-hidden touch-none p-4">
        <div className="absolute top-0 left-0 right-0 z-30 h-16 flex items-center px-4 md:px-6">
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white shrink-0"
          >
            <X className="size-5 md:size-6" />
          </button>
        </div>
        <div className="flex flex-col items-center text-center max-w-lg p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-tr from-[#5edff4] to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(94,223,244,0.3)]">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            Coming Soon
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            This course is currently marked as "Coming Soon". High-quality video
            content and materials will be unlocked here shortly.
          </p>
          <button
            onClick={onClose}
            className="mt-8 px-8 py-3 rounded-xl bg-[#5edff4] text-black hover:bg-[#4bc8dc] transition-all font-semibold text-sm shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex flex-col select-none overflow-hidden touch-none"
      style={cssLandscapeStyle}
      onMouseMove={revealControls}
      onTouchStart={revealControls}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ══════════════════════════════
          TOP BAR  (z-30)
      ══════════════════════════════ */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 h-16
          bg-gradient-to-b from-black/90 to-transparent
          flex items-center justify-between px-4 md:px-6
          transition-opacity duration-300
          ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="flex items-center gap-4 text-white min-w-0">
          <button
            onClick={() => {
              syncProgress();
              onClose();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full shrink-0"
          >
            <X className="size-5 md:size-6" />
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-sm md:text-lg text-white drop-shadow line-clamp-1">
              {currentVideo.title}
            </h2>
            <p className="text-[10px] md:text-xs text-slate-300 drop-shadow line-clamp-1">
              {course.title}&nbsp;·&nbsp;{currentIndex + 1}/{lectures.length}
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="relative z-40">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings((s) => !s);
              setSettingsMenu("main");
            }}
            className={`p-2 rounded-full transition-all ${
              showSettings
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Settings className="size-5 md:size-6" />
          </button>

          {showSettings && (
            <div
              className="absolute top-14 right-0 w-64 max-h-[75vh] bg-black/95 backdrop-blur-xl
                border border-white/10 rounded-2xl shadow-2xl z-50 text-white overflow-y-auto overflow-x-hidden custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {settingsMenu === "main" && (
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => setSettingsMenu("speed")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-white/10 rounded-xl"
                  >
                    <span className="text-sm font-medium">Playback Speed</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      {playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`}
                      <ChevronRight size={16} />
                    </div>
                  </button>
                </div>
              )}

              {settingsMenu === "speed" && (
                <div className="p-2">
                  <button
                    onClick={() => setSettingsMenu("main")}
                    className="w-full text-left p-3 text-xs text-slate-400 uppercase font-bold
                      border-b border-white/10 mb-1 flex items-center gap-2"
                  >
                    <ChevronRight size={14} className="rotate-180" /> Back
                  </button>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className="w-full flex items-center gap-3 p-3.5 hover:bg-white/10 rounded-xl text-sm"
                    >
                      {playbackSpeed === s ? (
                        <Check size={16} className="text-[#5edff4]" />
                      ) : (
                        <span className="w-4" />
                      )}
                      {s === 1 ? "Normal" : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════
          VIDEO AREA
          z-0  → iframe (pointer-events:none)
          z-10 → click/doubletap layer (video area only, NOT over controls)
          z-20 → spinner / pause icon
          z-30 → top bar & bottom bar (always above click layer)
      ══════════════════════════════ */}
      <div className="flex-1 relative bg-black">
        {/* YouTube iframe */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            id="yt-iframe-target"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 pointer-events-none">
            <Loader2 className="size-14 text-[#5edff4] animate-spin drop-shadow-2xl" />
          </div>
        )}

        {/* Double-tap flash */}
        {tapSide && (
          <div
            className={`absolute top-0 bottom-0 w-1/3 z-20 flex items-center justify-center
            bg-white/5 backdrop-blur-sm pointer-events-none
            ${tapSide === "left" ? "left-0 rounded-r-[50px]" : "right-0 rounded-l-[50px]"}`}
          >
            <div className="flex flex-col items-center text-white animate-bounce">
              {tapSide === "left" ? (
                <RotateCcw size={40} />
              ) : (
                <RotateCw size={40} />
              )}
              <span className="text-sm font-black mt-2">10s</span>
            </div>
          </div>
        )}

        {/* Paused icon */}
        {!isPlaying && !isLoading && !showSettings && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="p-6 bg-black/40 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
              <Play size={48} className="fill-white text-white translate-x-1" />
            </div>
          </div>
        )}

        {/*
          Click / doubletap layer — z-10 so it stays BELOW the
          top bar (z-30) and bottom controls (z-30).
          This is what makes buttons always clickable.
        */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/3 h-full"
            onClick={togglePlay}
            onDoubleClick={() => handleDoubleTap("left")}
          />
          <div className="flex-1 h-full" onClick={togglePlay} />
          <div
            className="w-1/3 h-full"
            onClick={togglePlay}
            onDoubleClick={() => handleDoubleTap("right")}
          />
        </div>
      </div>

      {/* ══════════════════════════════
          BOTTOM CONTROLS  (z-30)
          Above the click layer — all buttons always receive clicks
      ══════════════════════════════ */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30
          bg-gradient-to-t from-black/95 via-black/60 to-transparent
          px-4 md:px-8 pb-6 pt-16
          transition-opacity duration-300
          ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Seek bar */}
        <div className="relative h-8 flex items-center w-full mb-3 group">
          {/* Track */}
          <div
            className="absolute left-0 right-0 h-1.5 group-hover:h-2.5
            bg-white/20 rounded-full overflow-hidden transition-all duration-200"
          >
            <div
              className="absolute top-0 left-0 h-full bg-white/30"
              style={{ width: `${loadedFrac * 100}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-[#5edff4] shadow-[0_0_12px_rgba(94,223,244,0.5)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Thumb */}
          <div
            className="absolute w-4 h-4 bg-[#5edff4] border-2 border-white rounded-full shadow-lg
              pointer-events-none group-hover:scale-125 transition-transform z-10"
            style={{ left: `${progressPct}%`, transform: "translateX(-50%)" }}
          />

          {/* Range — onChange = visual only; onMouseUp/onTouchEnd = real seek */}
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeekChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
        </div>

        {/* Button row */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 md:gap-5">
            <button
              onClick={playPrev}
              disabled={currentIndex === 0}
              className={`text-white hover:text-[#5edff4] active:scale-90 transition-all
                ${currentIndex === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <SkipBack className="size-7 md:size-8 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="text-white hover:text-[#5edff4] active:scale-90 transition-all"
            >
              {isPlaying ? (
                <Pause className="size-9 md:size-10 fill-current" />
              ) : (
                <Play className="size-9 md:size-10 fill-current" />
              )}
            </button>

            <button
              onClick={playNext}
              disabled={currentIndex === lectures.length - 1}
              className={`text-white hover:text-[#5edff4] active:scale-90 transition-all
                ${currentIndex === lectures.length - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <SkipForward className="size-7 md:size-8 fill-current" />
            </button>

            <div className="hidden md:flex items-center gap-1.5 ml-1">
              <span className="text-xs font-mono text-[#5edff4] font-bold">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs font-mono text-slate-500">/</span>
              <span className="text-xs font-mono text-slate-300">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-5">
            <div className="md:hidden text-xs font-mono text-slate-200">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <button
              onClick={toggleMute}
              className="text-white hover:text-[#5edff4] transition-colors"
            >
              {isMuted ? (
                <VolumeX className="size-5 md:size-6" />
              ) : (
                <Volume2 className="size-5 md:size-6" />
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-[#5edff4] transition-colors"
            >
              {isFullscreen || isCSSLandscape ? (
                <Minimize className="size-5 md:size-6" />
              ) : (
                <Maximize className="size-5 md:size-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseVideoPlayer;
