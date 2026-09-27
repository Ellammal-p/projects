/**
 * MindCare AI Platform - Main Engine, Themes & Audio Soundscapes
 */

const VIDEO_STREAMS = {
    ocean: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    rain: 'https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-pane-1598-large.mp4',
    sunset: 'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-the-clouds-4074-large.mp4',
    aurora: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-fast-line-lights-1087-large.mp4',
    pets: 'https://assets.mixkit.co/videos/preview/mixkit-dog-cat-and-rabbit-resting-together-42774-large.mp4'
};

document.addEventListener('DOMContentLoaded', function () {
    console.log("MindCare Engine initialized.");

    // Load saved background theme
    const savedTheme = localStorage.getItem('mindcare_theme') || 'theme-sunset';
    setTheme(savedTheme);

    // Initialize Canvas Particle Background
    initParticleCanvas();

    // Check if video wallpaper is enabled explicitly by user
    if (localStorage.getItem('mindcare_video_enabled') === 'true') {
        const savedVideo = localStorage.getItem('mindcare_video') || 'ocean';
        setVideoWallpaper(savedVideo);
    } else {
        disableVideoBg();
    }

    // Tooltip initialization
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

/**
 * Dynamic Theme Switcher
 */
function setTheme(themeName) {
    document.body.className = '';
    document.body.classList.add(themeName);
    localStorage.setItem('mindcare_theme', themeName);
}

/**
 * Full-Screen Video Background Controller
 */
function setVideoWallpaper(key) {
    const video = document.getElementById('bgVideo');
    if (!video) return;

    const url = VIDEO_STREAMS[key] || VIDEO_STREAMS['ocean'];
    video.src = url;
    video.style.display = 'block';

    video.play().then(() => {
        localStorage.setItem('mindcare_video', key);
        localStorage.setItem('mindcare_video_enabled', 'true');
        showToast('Video Wallpaper', `Active video: ${key.toUpperCase()}`, 'info');
    }).catch(err => {
        console.log("Video load error/fallback", err);
        disableVideoBg();
    });
}

function disableVideoBg() {
    const video = document.getElementById('bgVideo');
    if (video) {
        video.pause();
        video.style.display = 'none';
    }
    localStorage.setItem('mindcare_video_enabled', 'false');
}

function toggleVideoBg() {
    const video = document.getElementById('bgVideo');
    if (video && video.style.display !== 'none') {
        disableVideoBg();
        showToast('Video Disabled', 'Switched to clean CSS wallpaper', 'info');
    } else {
        const savedVideo = localStorage.getItem('mindcare_video') || 'ocean';
        setVideoWallpaper(savedVideo);
    }
}

function setVideoOpacity(val) {
    const overlay = document.querySelector('.bg-video-overlay');
    if (overlay) {
        overlay.style.background = `rgba(15, 23, 42, ${val})`;
    }
    const range = document.getElementById('bgOpacityRange');
    if (range) range.value = val;
}

/**
 * Ambient Canvas Particle Renderer
 */
function initParticleCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.3 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/**
 * Web Audio API Soundscape Synthesizer
 */
let audioCtx = null;
let currentSoundType = null;
let activeNodes = [];

function toggleSoundscape(type) {
    if (currentSoundType === type) {
        stopSoundscape();
        return;
    }

    stopSoundscape();
    currentSoundType = type;

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const soundBtn = document.getElementById(`sound_${type}`);
    if (soundBtn) soundBtn.classList.add('active');

    showToast('Soundscape Playing', `Now playing relaxing ${type} soundscape 🎧`, 'info');

    if (type === 'cat_purr') {
        playCatPurr();
    } else if (type === 'ocean') {
        playOceanWaves();
    } else if (type === 'rain') {
        playRainfall();
    } else if (type === 'chimes') {
        playSoftChimes();
    }
}

function stopSoundscape() {
    activeNodes.forEach(node => {
        try { node.stop(); node.disconnect(); } catch (e) {}
    });
    activeNodes = [];

    document.querySelectorAll('.sound-btn').forEach(btn => btn.classList.remove('active'));
    currentSoundType = null;
}

function playCatPurr() {
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 90;

    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 22;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.25;

    lfo.connect(gainNode.gain);
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start();
    lfo.start();
    activeNodes.push(whiteNoise, lfo);
}

function playOceanWaves() {
    const bufferSize = audioCtx.sampleRate * 4;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.2;

    lfo.connect(gainNode.gain);
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start();
    lfo.start();
    activeNodes.push(whiteNoise, lfo);
}

function playRainfall() {
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.0;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.15;

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    whiteNoise.start();
    activeNodes.push(whiteNoise);
}

function playSoftChimes() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 3.5);

    activeNodes.push(osc);
}

function showToast(title, message, type = 'info') {
    let toastContainer = document.getElementById('globalToastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'globalToastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1090';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast_' + Date.now();
    const bgClass = type === 'error' ? 'bg-danger text-white' : type === 'success' ? 'bg-success text-white' : 'bg-primary text-white';

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}:</strong> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastEl = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
    bsToast.show();
}
