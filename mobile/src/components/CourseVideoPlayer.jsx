import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Modal,
  StatusBar,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useEnrollment } from '../context/EnrollmentContext';

const extractVideoId = (video) => {
  if (!video) return 'aqz-KE-bpKQ';
  if (video.videoId) return video.videoId;
  if (video.youtubeId) return video.youtubeId;
  if (video.url) {
    try {
      const u = new URL(video.url);
      if (u.hostname.includes('youtube.com')) return u.searchParams.get('v') || 'aqz-KE-bpKQ';
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1) || 'aqz-KE-bpKQ';
    } catch (_) {}
  }
  return 'aqz-KE-bpKQ';
};

export default function CourseVideoPlayer({
  course = {},
  playlist = [],
  initialIndex = 0,
  onClose,
}) {
  const { toggleLessonCompleted } = useEnrollment();

  // Compute lectures list matching website logic
  const lectures = useMemo(() => {
    if (playlist && playlist.length > 0) return playlist;
    if (course.lectures && course.lectures.length > 0) return course.lectures;
    const vid = course.youtubeId || course.videoId;
    if (vid) return [{ id: 'main', videoId: vid, title: course.title || 'Main Video' }];
    return [{ id: 'main', videoId: 'aqz-KE-bpKQ', title: course.title || 'Main Video' }];
  }, [playlist, course]);

  const [currentIndex, setCurrentIndex] = useState(
    Math.min(initialIndex, Math.max(0, lectures.length - 1))
  );

  const webViewRef = useRef(null);

  // Generate HTML replicating 100% of website's CourseVideoPlayer.jsx UI & logic
  const playerHTML = useMemo(() => {
    const serializedLectures = JSON.stringify(
      lectures.map((l, i) => ({
        id: l.id || `l_${i}`,
        title: l.title || `Lesson ${i + 1}`,
        videoId: extractVideoId(l),
        duration: l.duration || '12:00',
      }))
    );

    const initialVid = extractVideoId(lectures[currentIndex]);
    const courseTitle = course.title || 'Rehablito Course';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${courseTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { -webkit-tap-highlight-color: transparent; user-select: none; }
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .custom-range { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; }
    .custom-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #5edff4; border: 2px solid #fff; box-shadow: 0 0 10px rgba(94, 223, 244, 0.7); }
    @keyframes bounceBadge {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    .animate-badge { animation: bounceBadge 0.6s ease infinite; }
  </style>
</head>
<body class="bg-black text-white w-full h-full relative overflow-hidden">
  <div id="player-container" class="w-full h-full relative flex flex-col justify-between overflow-hidden">
    
    <!-- TOP BAR (z-30) -->
    <div id="top-bar" class="absolute top-0 left-0 right-0 z-30 h-16 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between px-4 transition-opacity duration-300 opacity-100">
      <div class="flex items-center gap-3 min-w-0 flex-1 mr-2">
        <button id="close-btn" class="p-2.5 bg-white/10 active:bg-white/20 rounded-full text-white shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <div class="min-w-0 flex-1">
          <h2 id="lecture-title" class="font-bold text-sm text-white truncate drop-shadow"></h2>
          <p id="course-meta" class="text-[11px] text-slate-300 truncate drop-shadow"></p>
        </div>
      </div>

      <!-- Settings Icon -->
      <div class="relative z-40">
        <button id="settings-btn" class="p-2.5 rounded-full bg-white/10 active:bg-white/20 text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>

        <!-- Speed Dropdown Menu -->
        <div id="speed-menu" class="hidden absolute top-12 right-0 w-48 bg-black/95 border border-white/15 rounded-2xl shadow-2xl p-2 z-50 text-white">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-white/10">Playback Speed</div>
          <div class="space-y-1 mt-1">
            <button onclick="setSpeed(0.5)" class="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 flex justify-between"><span>0.5x</span><span id="chk-0.5"></span></button>
            <button onclick="setSpeed(0.75)" class="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 flex justify-between"><span>0.75x</span><span id="chk-0.75"></span></button>
            <button onclick="setSpeed(1)" class="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 flex justify-between font-bold text-[#5edff4]"><span>Normal (1.0x)</span><span id="chk-1">✓</span></button>
            <button onclick="setSpeed(1.25)" class="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 flex justify-between"><span>1.25x</span><span id="chk-1.25"></span></button>
            <button onclick="setSpeed(1.5)" class="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 flex justify-between"><span>1.5x</span><span id="chk-1.5"></span></button>
            <button onclick="setSpeed(2)" class="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 flex justify-between"><span>2.0x</span><span id="chk-2"></span></button>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN VIDEO CONTAINER -->
    <div class="flex-1 w-full h-full relative bg-black flex items-center justify-center">
      <!-- YouTube Target -->
      <div id="yt-player-target" class="w-full h-full pointer-events-none"></div>

      <!-- Loading Spinner -->
      <div id="loader" class="absolute inset-0 z-20 flex items-center justify-center bg-black/40 pointer-events-none">
        <div class="w-12 h-12 border-4 border-[#5edff4] border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Paused Big Play Overlay -->
      <div id="paused-overlay" class="hidden absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div class="p-5 bg-black/50 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
          <svg class="w-12 h-12 fill-white text-white translate-x-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      <!-- Double Tap Indicators -->
      <div id="double-tap-left" class="hidden absolute left-0 top-0 bottom-0 w-1/3 z-20 flex items-center justify-center bg-white/10 rounded-r-[50px] pointer-events-none">
        <div class="flex flex-col items-center animate-badge">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"></path>
          </svg>
          <span class="text-sm font-black text-white mt-1">-10s</span>
        </div>
      </div>

      <div id="double-tap-right" class="hidden absolute right-0 top-0 bottom-0 w-1/3 z-20 flex items-center justify-center bg-white/10 rounded-l-[50px] pointer-events-none">
        <div class="flex flex-col items-center animate-badge">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"></path>
          </svg>
          <span class="text-sm font-black text-white mt-1">+10s</span>
        </div>
      </div>

      <!-- Touch Interaction Layer -->
      <div id="touch-layer" class="absolute inset-0 z-10 flex">
        <div id="touch-left" class="w-1/3 h-full"></div>
        <div id="touch-center" class="flex-1 h-full"></div>
        <div id="touch-right" class="w-1/3 h-full"></div>
      </div>
    </div>

    <!-- BOTTOM CONTROLS (z-30) -->
    <div id="bottom-bar" class="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-6 pt-12 transition-opacity duration-300 opacity-100">
      <!-- Seekbar -->
      <div class="relative h-7 flex items-center w-full mb-2">
        <div class="absolute left-0 right-0 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div id="buffer-bar" class="absolute top-0 left-0 h-full bg-white/30" style="width: 0%;"></div>
          <div id="progress-bar" class="absolute top-0 left-0 h-full bg-[#5edff4] shadow-[0_0_12px_rgba(94,223,244,0.5)]" style="width: 0%;"></div>
        </div>
        <div id="progress-thumb" class="absolute w-3.5 h-3.5 bg-[#5edff4] border-2 border-white rounded-full shadow-lg pointer-events-none" style="left: 0%; transform: translateX(-50%);"></div>
        <input id="seek-range" type="range" min="0" max="100" step="0.1" value="0" class="custom-range absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20">
      </div>

      <!-- Buttons Row -->
      <div class="flex items-center justify-between w-full">
        <!-- Left buttons -->
        <div class="flex items-center gap-4">
          <!-- Prev Button -->
          <button id="prev-btn" class="text-white active:scale-90 transition-transform">
            <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>

          <!-- Play/Pause Button -->
          <button id="play-btn" class="text-white active:scale-90 transition-transform">
            <svg id="play-icon" class="w-9 h-9 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <svg id="pause-icon" class="w-9 h-9 fill-current hidden" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>

          <!-- Next Button -->
          <button id="next-btn" class="text-white active:scale-90 transition-transform">
            <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>

          <!-- Time Display -->
          <div class="text-xs font-mono text-slate-300 ml-1">
            <span id="current-time-text" class="text-[#5edff4] font-bold">0:00</span> / <span id="duration-text">0:00</span>
          </div>
        </div>

        <!-- Right buttons -->
        <div class="flex items-center gap-4">
          <!-- Mute/Unmute -->
          <button id="mute-btn" class="text-white active:scale-90">
            <svg id="vol-on-icon" class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            <svg id="vol-off-icon" class="w-6 h-6 fill-current hidden" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const lectures = ${serializedLectures};
    let currentIdx = ${currentIndex};
    const courseTitle = "${courseTitle.replace(/"/g, '\\"')}";

    let player = null;
    let isPlaying = false;
    let isMuted = false;
    let currentSpeed = 1;
    let isDragging = false;
    let duration = 0;
    let currentTime = 0;
    let controlsTimer = null;
    let lastTapLeft = 0;
    let lastTapRight = 0;

    const topBar = document.getElementById('top-bar');
    const bottomBar = document.getElementById('bottom-bar');
    const playBtn = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const pausedOverlay = document.getElementById('paused-overlay');
    const loader = document.getElementById('loader');
    const lectureTitleEl = document.getElementById('lecture-title');
    const courseMetaEl = document.getElementById('course-meta');
    const progressBar = document.getElementById('progress-bar');
    const bufferBar = document.getElementById('buffer-bar');
    const progressThumb = document.getElementById('progress-thumb');
    const seekRange = document.getElementById('seek-range');
    const currentTimeText = document.getElementById('current-time-text');
    const durationText = document.getElementById('duration-text');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volOnIcon = document.getElementById('vol-on-icon');
    const volOffIcon = document.getElementById('vol-off-icon');
    const settingsBtn = document.getElementById('settings-btn');
    const speedMenu = document.getElementById('speed-menu');
    const closeBtn = document.getElementById('close-btn');

    function formatTime(s) {
      if (!s || isNaN(s) || s <= 0) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function updateHeader() {
      const cur = lectures[currentIdx] || {};
      lectureTitleEl.textContent = cur.title || 'Lesson ' + (currentIdx + 1);
      courseMetaEl.textContent = courseTitle + ' · ' + (currentIdx + 1) + '/' + lectures.length;
      prevBtn.style.opacity = currentIdx === 0 ? '0.3' : '1';
      nextBtn.style.opacity = currentIdx === lectures.length - 1 ? '0.3' : '1';
    }

    function revealControls() {
      topBar.style.opacity = '1';
      bottomBar.style.opacity = '1';
      topBar.style.pointerEvents = 'auto';
      bottomBar.style.pointerEvents = 'auto';
      clearTimeout(controlsTimer);
      controlsTimer = setTimeout(() => {
        if (isPlaying && speedMenu.classList.contains('hidden')) {
          topBar.style.opacity = '0';
          bottomBar.style.opacity = '0';
          topBar.style.pointerEvents = 'none';
          bottomBar.style.pointerEvents = 'none';
        }
      }, 3500);
    }

    function togglePlay() {
      if (!player) return;
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      revealControls();
    }

    function toggleMute() {
      if (!player) return;
      if (isMuted) {
        player.unMute();
        isMuted = false;
        volOnIcon.classList.remove('hidden');
        volOffIcon.classList.add('hidden');
      } else {
        player.mute();
        isMuted = true;
        volOnIcon.classList.add('hidden');
        volOffIcon.classList.remove('hidden');
      }
    }

    function setSpeed(sp) {
      currentSpeed = sp;
      if (player && player.setPlaybackRate) {
        player.setPlaybackRate(sp);
      }
      speedMenu.classList.add('hidden');
      [0.5, 0.75, 1, 1.25, 1.5, 2].forEach(s => {
        const el = document.getElementById('chk-' + s);
        if (el) el.textContent = s === sp ? '✓' : '';
      });
      revealControls();
    }

    function loadLecture(idx) {
      if (idx < 0 || idx >= lectures.length) return;
      currentIdx = idx;
      updateHeader();
      loader.classList.remove('hidden');
      pausedOverlay.classList.add('hidden');
      
      const vId = lectures[currentIdx].videoId;
      if (player && player.loadVideoById) {
        player.loadVideoById({ videoId: vId, startSeconds: 0 });
      }

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LESSON_CHANGE',
          index: currentIdx,
          lessonId: lectures[currentIdx].id
        }));
      }
    }

    // Double tap forward / backward
    document.getElementById('touch-left').addEventListener('click', () => {
      const now = Date.now();
      if (now - lastTapLeft < 300) {
        if (player && player.getCurrentTime) {
          player.seekTo(Math.max(0, player.getCurrentTime() - 10), true);
        }
        const badge = document.getElementById('double-tap-left');
        badge.classList.remove('hidden');
        setTimeout(() => badge.classList.add('hidden'), 600);
      } else {
        togglePlay();
      }
      lastTapLeft = now;
      revealControls();
    });

    document.getElementById('touch-right').addEventListener('click', () => {
      const now = Date.now();
      if (now - lastTapRight < 300) {
        if (player && player.getCurrentTime) {
          player.seekTo(player.getCurrentTime() + 10, true);
        }
        const badge = document.getElementById('double-tap-right');
        badge.classList.remove('hidden');
        setTimeout(() => badge.classList.add('hidden'), 600);
      } else {
        togglePlay();
      }
      lastTapRight = now;
      revealControls();
    });

    document.getElementById('touch-center').addEventListener('click', () => {
      togglePlay();
    });

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', () => loadLecture(currentIdx - 1));
    nextBtn.addEventListener('click', () => loadLecture(currentIdx + 1));
    muteBtn.addEventListener('click', toggleMute);

    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speedMenu.classList.toggle('hidden');
      revealControls();
    });

    closeBtn.addEventListener('click', () => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CLOSE' }));
      }
    });

    // Seek input
    seekRange.addEventListener('input', (e) => {
      isDragging = true;
      const pct = parseFloat(e.target.value);
      progressBar.style.width = pct + '%';
      progressThumb.style.left = pct + '%';
      if (duration > 0) {
        currentTimeText.textContent = formatTime((pct / 100) * duration);
      }
    });

    seekRange.addEventListener('change', (e) => {
      isDragging = false;
      const pct = parseFloat(e.target.value);
      if (player && duration > 0) {
        player.seekTo((pct / 100) * duration, true);
      }
    });

    // YouTube Iframe API Loader
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('yt-player-target', {
        videoId: '${initialVid}',
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          fs: 0,
          disablekb: 1,
          origin: window.location.origin || 'http://localhost'
        },
        events: {
          onReady: (e) => {
            loader.classList.add('hidden');
            e.target.playVideo();
            revealControls();
          },
          onStateChange: (e) => {
            if (e.data === 1) { // PLAYING
              isPlaying = true;
              loader.classList.add('hidden');
              pausedOverlay.classList.add('hidden');
              playIcon.classList.add('hidden');
              pauseIcon.classList.remove('hidden');
              revealControls();
            } else if (e.data === 2) { // PAUSED
              isPlaying = false;
              playIcon.classList.remove('hidden');
              pauseIcon.classList.add('hidden');
              pausedOverlay.classList.remove('hidden');
              revealControls();
            } else if (e.data === 3) { // BUFFERING
              loader.classList.remove('hidden');
            } else if (e.data === 0) { // ENDED
              isPlaying = false;
              playIcon.classList.remove('hidden');
              pauseIcon.classList.add('hidden');
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'LESSON_COMPLETED',
                  lessonId: lectures[currentIdx].id
                }));
              }
              if (currentIdx < lectures.length - 1) {
                loadLecture(currentIdx + 1);
              }
            }
          }
        }
      });
    }

    // UI Tick loop
    setInterval(() => {
      if (!player || !player.getDuration) return;
      try {
        const d = player.getDuration();
        if (d && d > 0 && d !== duration) {
          duration = d;
          durationText.textContent = formatTime(d);
        }
        if (player.getPlayerState && player.getPlayerState() === 1 && !isDragging) {
          const t = player.getCurrentTime();
          currentTime = t;
          currentTimeText.textContent = formatTime(t);
          if (duration > 0) {
            const pct = Math.min(100, (t / duration) * 100);
            progressBar.style.width = pct + '%';
            progressThumb.style.left = pct + '%';
            seekRange.value = pct;
          }
          const loaded = player.getVideoLoadedFraction ? player.getVideoLoadedFraction() : 0;
          bufferBar.style.width = (loaded * 100) + '%';
        }
      } catch (err) {}
    }, 1000);

    updateHeader();

    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  </script>
</body>
</html>`;
  }, [lectures, currentIndex, course.title]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'CLOSE') {
        if (onClose) onClose();
      } else if (data.type === 'LESSON_CHANGE') {
        setCurrentIndex(data.index);
      } else if (data.type === 'LESSON_COMPLETED') {
        const cId = course.courseId || course.id || 'autism-adhd';
        if (data.lessonId) {
          toggleLessonCompleted(cId, data.lessonId);
        }
      }
    } catch (e) {}
  };

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <WebView
          ref={webViewRef}
          source={{ html: playerHTML }}
          style={styles.webview}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          bounces={false}
          originWhitelist={['*']}
          mixedContentMode="always"
          userAgent={
            Platform.OS === 'android'
              ? 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
              : undefined
          }
          onMessage={handleMessage}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
