import * as THREE from 'three';

const VERSION = '2.0.1';

const CONFIG = {
    GLITCH_WAIT_MIN: 400,
    GLITCH_WAIT_MAX: 3500,
    GLITCH_PROBABILITY: 0.82,
    GLITCH_DURATION: 800,
    SWAP_INTERVAL: 100,
    ORIGINAL_LOGO: 'images/logos/pdi_logo_v2.6_black.png',
    WARP_AMBIENT: 52,
    WARP_RINGS: 2.0,
    WARP_RING_SCALE: 0.75,
    WARP_VELOCITY_FACTOR: 0.54,
    WARP_MAX_SCALE: 150,
    WARP_RADIUS_BASE: 900,
    WARP_RADIUS_VELOCITY_FACTOR: 0.24,
    WARP_SEED_SPEED: 0.08,
    WARP_SEED_VELOCITY_FACTOR: 0.11,
    WARP_MAX_SEED_INCREMENT: 0.10,
    WARP_RGB_BOOST_THRESHOLD: 3,
    WARP_RGB_BOOST_FACTOR: 0.05,
    NOISE_DENSITY_AMBIENT: 0.05,
    NOISE_DENSITY_BURST: 0.22,
    NOISE_FPS_AMBIENT: 15,
    NOISE_FPS_BURST: 30,
    NOISE_BURST_DURATION: 3000,
    NOISE_BURST_WAIT_MIN: 2000,
    NOISE_BURST_WAIT_MAX: 18000,
    NOISE_BURST_PROBABILITY: 0.6,
    ASSETS: [
        'images/symbols/texturelabs_vector_136.svg',
        'images/symbols/texturelabs_vector_140.svg',
        'images/symbols/texturelabs_vector_168.svg',
        'images/symbols/texturelabs_vector_199.svg',
        'images/symbols/texturelabs_vector_201.svg',
        'images/symbols/texturelabs_vector_204.svg',
        'images/symbols/texturelabs_vector_207.svg',
        'images/symbols/texturelabs_vector_231.svg',
        'images/symbols/texturelabs_vector_232.svg',
        'images/symbols/texturelabs_vector_267.svg',
        'images/symbols/texturelabs_vector_290.svg',
        'images/symbols/texturelabs_vector_291.svg',
        'images/symbols/texturelabs_vector_304.svg',
        'images/symbols/texturelabs_vector_304_1.svg',
        'images/symbols/texturelabs_vector_310.svg',
        'images/symbols/texturelabs_vector_310_1.svg'
    ]
};

const state = {
    isGlitching: false,
    logoElement: null,
    filterRedBaseline: null,
    filterBlueBaseline: null,
    filterRedIntense: null,
    filterBlueIntense: null,
    cursorX: 0,
    cursorY: 0,
    warpSeed: 0,
    warpScale: 0,
    warpSpeed: 0,
    warpPulse: 0,
    warpDirX: 0,
    warpDirY: 0,
    hasMouseMoved: false,
    warpDisplace: null,
    cursorGlow: null,
    isNoising: false,
    noiseInterval: null,
    siteActive: false,
    siteInited: false,
};

function preloadAssets() {
    CONFIG.ASSETS.forEach(path => {
        const img = new Image();
        img.src = path;
    });
}

function getRandomAsset() {
    return CONFIG.ASSETS[Math.floor(Math.random() * CONFIG.ASSETS.length)];
}

function startAssetGlitch() {
    if (!state.logoElement) return;

    function swap() {
        if (!state.isGlitching) return;
        state.logoElement.src = getRandomAsset();
        setTimeout(swap, CONFIG.SWAP_INTERVAL * (0.8 + Math.random() * 0.4));
    }
    swap();
}

function animateFilters() {
    if (state.isGlitching) {
        const offset = 9.6 + Math.random() * 16.8;
        const dy = offset * Math.random() * 0.4;
        if (state.filterRedIntense) {
            state.filterRedIntense.setAttribute('dx', (-offset).toFixed(1));
            state.filterRedIntense.setAttribute('dy', (-dy).toFixed(1));
        }
        if (state.filterBlueIntense) {
            state.filterBlueIntense.setAttribute('dx', offset.toFixed(1));
            state.filterBlueIntense.setAttribute('dy', dy.toFixed(1));
        }
        setTimeout(animateFilters, 24 + Math.random() * 49);
    } else {
        const offset = 3.6 + Math.random() * 8.4;
        const dy = offset * Math.random() * 0.3;
        const rgbBoost = Math.max(0, state.warpSpeed - CONFIG.WARP_RGB_BOOST_THRESHOLD) * CONFIG.WARP_RGB_BOOST_FACTOR;
        const effectiveOffset = offset * (1 + rgbBoost);
        if (state.filterRedBaseline) {
            state.filterRedBaseline.setAttribute('dx', (-effectiveOffset).toFixed(1));
            state.filterRedBaseline.setAttribute('dy', (-dy).toFixed(1));
        }
        if (state.filterBlueBaseline) {
            state.filterBlueBaseline.setAttribute('dx', effectiveOffset.toFixed(1));
            state.filterBlueBaseline.setAttribute('dy', dy.toFixed(1));
        }
        setTimeout(animateFilters, 80 + Math.random() * 210);
    }
}

function orchestrate() {
    if (!state.isGlitching && Math.random() < CONFIG.GLITCH_PROBABILITY) {
        state.isGlitching = true;
        if (state.logoElement) state.logoElement.src = getRandomAsset();
        document.body.classList.add('is-glitching');

        startAssetGlitch();

        setTimeout(() => {
            state.isGlitching = false;
            document.body.classList.remove('is-glitching');
            if (state.logoElement) state.logoElement.src = CONFIG.ORIGINAL_LOGO;
        }, CONFIG.GLITCH_DURATION);
    }

    const wait = CONFIG.GLITCH_WAIT_MIN + Math.random() * (CONFIG.GLITCH_WAIT_MAX - CONFIG.GLITCH_WAIT_MIN);
    setTimeout(orchestrate, wait);
}

function initCursorWarp() {
    state.warpDisplace = document.querySelector('#warp-displace');
    state.cursorGlow = document.querySelector('.cursor-glow');

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log('PDI warp: isSafari=' + isSafari + ' ua=' + navigator.userAgent.slice(0, 80));
    let warpTurbulence = null;
    let turbOffset = 0;

    if (isSafari) {
        // Use pre-defined #cursor-warp-s filter (HTML/CSS parsed at load time).
        // Safari refuses to render dynamically-injected SVG filter references.
        document.body.classList.add('is-safari');
        warpTurbulence = document.querySelector('#warp-s-turb');
        state.warpDisplace = document.querySelector('#warp-s-disp');
        state.warpScale = CONFIG.WARP_AMBIENT;
        console.log('PDI safari: is-safari class added. turb=' + !!warpTurbulence + ' disp=' + !!state.warpDisplace);
    }

    const warpDispImg = isSafari ? null : document.querySelector('#warp-disp-img');

    const MAP_SIZE = 256;
    const glCanvas = document.createElement('canvas');
    glCanvas.width = MAP_SIZE;
    glCanvas.height = MAP_SIZE;
    const gl = glCanvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
            || glCanvas.getContext('experimental-webgl', { premultipliedAlpha: false, alpha: true });

    let drawDispMap = function() {};
    let glLost = false;

    if (gl) {
        glCanvas.addEventListener('webglcontextlost', e => { e.preventDefault(); glLost = true; }, false);
        glCanvas.addEventListener('webglcontextrestored', () => { glLost = false; }, false);

        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`);
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, `
            precision mediump float;
            uniform float u_r,u_phase,u_pulse,u_rings,u_rscale;
            uniform vec2 u_lag;
            void main(){
                float diam=u_r*2.+4.;
                vec2 d=vec2(gl_FragCoord.x/${MAP_SIZE}.-0.5, 0.5-gl_FragCoord.y/${MAP_SIZE}.)*diam;
                float dist=length(d);
                if(dist>u_r){gl_FragColor=vec4(.502,.502,0.,0.);return;}
                float t=dist/u_r;
                float t_r=t/u_rscale;
                float mask=t<u_rscale?sin(t_r*3.14159265*u_rings)*(1.-t*.5):0.;
                vec2 ld=d-u_lag;
                float pd=length(ld);
                float wd=pd*pd/u_r;
                float ripple=sin(wd/(u_r*.35)-u_phase);
                float mag=mask*(1.+ripple*u_pulse);
                vec2 dir=dist>.5?d/dist:vec2(0.);
                gl_FragColor=vec4(
                    clamp(.502+dir.x*mag*.498,0.,1.),
                    clamp(.502+dir.y*mag*.498,0.,1.),
                    0.,abs(mask));
            }
        `);
        gl.compileShader(fs);

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
        const pLoc = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(pLoc);
        gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

        const uR     = gl.getUniformLocation(prog, 'u_r');
        const uPhase = gl.getUniformLocation(prog, 'u_phase');
        const uPulse = gl.getUniformLocation(prog, 'u_pulse');
        const uLag   = gl.getUniformLocation(prog, 'u_lag');
        const uRings  = gl.getUniformLocation(prog, 'u_rings');
        const uRscale = gl.getUniformLocation(prog, 'u_rscale');
        gl.uniform1f(uRings,  CONFIG.WARP_RINGS);
        gl.uniform1f(uRscale, CONFIG.WARP_RING_SCALE);

        let lastDiam = -1;
        let prevBlobURL = null;

        drawDispMap = function(cx, cy, radius, phase, pulse, lagX, lagY) {
            if (glLost) return;
            gl.uniform1f(uR, radius);
            gl.uniform1f(uPhase, phase);
            gl.uniform1f(uPulse, pulse);
            gl.uniform2f(uLag, lagX, lagY);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            const diam = Math.ceil(radius * 2) + 4;
            const half = diam / 2;
            if (warpDispImg) {
                warpDispImg.setAttribute('x', Math.round(cx - half));
                warpDispImg.setAttribute('y', Math.round(cy - half));
                if (diam !== lastDiam) {
                    warpDispImg.setAttribute('width', diam);
                    warpDispImg.setAttribute('height', diam);
                    lastDiam = diam;
                }
                glCanvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    warpDispImg.setAttribute('href', url);
                    warpDispImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url);
                    if (prevBlobURL) URL.revokeObjectURL(prevBlobURL);
                    prevBlobURL = url;
                });
            }
        };
    }

    let prevX = 0, prevY = 0, _dbgFrames = 0;
    let idleDrawn = false;

    document.addEventListener('mousemove', e => {
        if (!state.hasMouseMoved) {
            state.hasMouseMoved = true;
            document.body.classList.add('has-cursor');
        }
        idleDrawn = false;
        state.cursorX = e.clientX;
        state.cursorY = e.clientY;
    });

    document.addEventListener('touchstart', e => {
        state.warpSpeed = 0;
        state.cursorX = e.touches[0].clientX;
        state.cursorY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        state.cursorX = e.touches[0].clientX;
        state.cursorY = e.touches[0].clientY;
    }, { passive: true });

    function warpLoop() {
        if (!state.siteActive) { requestAnimationFrame(warpLoop); return; }
        const dx = state.cursorX - prevX;
        const dy = state.cursorY - prevY;
        prevX = state.cursorX;
        prevY = state.cursorY;

        const rawSpeed = Math.sqrt(dx * dx + dy * dy);
        state.warpSpeed = state.warpSpeed + (rawSpeed - state.warpSpeed) * 0.08;

        if (rawSpeed > 0.1) {
            state.warpDirX += (dx / rawSpeed - state.warpDirX) * 0.15;
            state.warpDirY += (dy / rawSpeed - state.warpDirY) * 0.15;
        }

        const targetScale = Math.min(
            CONFIG.WARP_AMBIENT + state.warpSpeed * CONFIG.WARP_VELOCITY_FACTOR,
            CONFIG.WARP_MAX_SCALE
        );
        state.warpScale = state.warpScale + (targetScale - state.warpScale) * 0.05;

        const pulseTarget = state.warpSpeed > 0.5 ? 1.0 : 0.0;
        const pulseRate = pulseTarget > state.warpPulse ? 0.08 : 0.019;
        state.warpPulse += (pulseTarget - state.warpPulse) * pulseRate;

        state.warpSeed += Math.min(
            CONFIG.WARP_SEED_SPEED + state.warpSpeed * CONFIG.WARP_SEED_VELOCITY_FACTOR,
            CONFIG.WARP_MAX_SEED_INCREMENT
        ) * state.warpPulse;

        const radius = CONFIG.WARP_RADIUS_BASE + state.warpSpeed * CONFIG.WARP_RADIUS_VELOCITY_FACTOR;

        if (isSafari) {
            turbOffset += 0.0035 * (1 + state.warpPulse * 2);
            if (warpTurbulence) {
                const freqX = 0.006 + 0.003 * Math.sin(turbOffset);
                const freqY = 0.005 + 0.002 * Math.cos(turbOffset * 0.73);
                warpTurbulence.setAttribute('baseFrequency', freqX.toFixed(5) + ' ' + freqY.toFixed(5));
            }
            if (state.warpDisplace) {
                const sv = state.warpScale.toFixed(1);
                if (_dbgFrames < 3) { console.log('PDI warp loop #' + _dbgFrames + ': scale=' + sv + ' pulse=' + state.warpPulse.toFixed(3) + ' disp=' + !!state.warpDisplace); _dbgFrames++; }
                state.warpDisplace.setAttribute('scale', sv);
            }
        } else {
            if (state.warpDisplace) {
                state.warpDisplace.setAttribute('scale', state.warpScale.toFixed(1));
            }
            if (state.hasMouseMoved) {
                const isActive = state.warpPulse > 0.01;
                if (isActive || !idleDrawn) {
                    const lagStrength = state.warpPulse * Math.min(state.warpSpeed * 3, radius * 0.3);
                    drawDispMap(
                        state.cursorX, state.cursorY, radius,
                        state.warpSeed, state.warpPulse,
                        -state.warpDirX * lagStrength,
                        -state.warpDirY * lagStrength
                    );
                    if (!isActive) idleDrawn = true;
                }
            }
        }

        if (state.cursorGlow) {
            state.cursorGlow.style.setProperty('--cx', state.cursorX + 'px');
            state.cursorGlow.style.setProperty('--cy', state.cursorY + 'px');
        }

        requestAnimationFrame(warpLoop);
    }

    requestAnimationFrame(warpLoop);
}

function initCrtNoise() {
    const canvas = document.getElementById('crt-noise');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawNoise() {
        if (!state.siteActive) return;
        const density = state.isNoising ? CONFIG.NOISE_DENSITY_BURST : CONFIG.NOISE_DENSITY_AMBIENT;
        const count = Math.floor(canvas.width * canvas.height * density);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < count; i++) {
            ctx.globalAlpha = 0.3 + Math.random() * 0.7;
            ctx.fillRect(
                Math.floor(Math.random() * canvas.width),
                Math.floor(Math.random() * canvas.height),
                1, 1
            );
        }
        ctx.globalAlpha = 1;
    }

    state.noiseInterval = setInterval(drawNoise, 1000 / CONFIG.NOISE_FPS_AMBIENT);

    function noiseBurstLoop() {
        if (!state.isNoising && Math.random() < CONFIG.NOISE_BURST_PROBABILITY) {
            state.isNoising = true;
            clearInterval(state.noiseInterval);
            state.noiseInterval = setInterval(drawNoise, 1000 / CONFIG.NOISE_FPS_BURST);
            setTimeout(() => {
                state.isNoising = false;
                clearInterval(state.noiseInterval);
                state.noiseInterval = setInterval(drawNoise, 1000 / CONFIG.NOISE_FPS_AMBIENT);
            }, CONFIG.NOISE_BURST_DURATION);
        }
        const wait = CONFIG.NOISE_BURST_WAIT_MIN +
            Math.random() * (CONFIG.NOISE_BURST_WAIT_MAX - CONFIG.NOISE_BURST_WAIT_MIN);
        setTimeout(noiseBurstLoop, wait);
    }

    noiseBurstLoop();
}

function initSiteEffects() {
    if (state.siteInited) return;
    state.siteInited = true;
    state.logoElement = document.querySelector('.hero__logo');

    const rgbSplit = document.querySelector('#rgb-split');
    const rgbSplitIntense = document.querySelector('#rgb-split-intense');
    if (rgbSplit) {
        const offsets = rgbSplit.querySelectorAll('feOffset');
        state.filterRedBaseline = offsets[0];
        state.filterBlueBaseline = offsets[1];
    }
    if (rgbSplitIntense) {
        const offsets = rgbSplitIntense.querySelectorAll('feOffset');
        state.filterRedIntense = offsets[0];
        state.filterBlueIntense = offsets[1];
    }

    if (!document.body.classList.contains('low-fi')) {
        animateFilters();
        initCursorWarp();
        initCrtNoise();
    }
}

/* =====================================================================
   3D ROOM
   ===================================================================== */

const ROOM = {
    W: 7.0,          // x extent
    D: 8.0,          // z extent
    H: 2.6,          // ceiling
    EYE: 1.62,
    SEAT_EYE: 1.08,
    RADIUS: 0.28,
    WALK: 1.45,
    RUN: 2.6,
    RT_HEIGHT: 400,  // internal render height — chunky lo-fi pixels
    TV_FPS: 30,
};

const TV_POS = new THREE.Vector3(0, 0, -3.45);   // floor point under the TV
const CHAIR_POS = new THREE.Vector3(0.05, 0, -1.05);
const CHAIR_YAW = 0.12;

const world = {
    mode: 'gate',          // gate | explore | sitting | watching | tween
    lastMode: 'explore',
    yaw: 0,
    pitch: 0,
    seatYaw: 0,
    pos: new THREE.Vector3(0.6, ROOM.EYE, 3.1),
    vel: new THREE.Vector3(),
    keys: {},
    bob: 0,
    glitch: 0,
    flashlightOn: true,
    colliders: [],
    interactables: [],
    tween: null,
    focus: null,
    touch: { move: new THREE.Vector2(), lookId: null, lookX: 0, lookY: 0, stickId: null },
    isTouch: matchMedia('(pointer: coarse)').matches,
    muted: false,
    startTime: 0,
    camGlitch: 0,
};

/* ---------- small helpers ---------- */

const rand = (a, b) => a + Math.random() * (b - a);
let seed = 333;
const srand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const srange = (a, b) => a + srand() * (b - a);

function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestMipmapLinearFilter;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    return t;
}

function grime(g, w, h, n, alpha, light) {
    for (let i = 0; i < n; i++) {
        const v = light ? 255 : 0;
        g.fillStyle = `rgba(${v},${v},${v},${srand() * alpha})`;
        const s = srange(1, 6);
        g.fillRect(srand() * w, srand() * h, s, s);
    }
}

function stain(g, x, y, r, alpha) {
    // stepped blotch — concentric jittered rects, no smooth gradients
    for (let k = 0; k < 14; k++) {
        const rr = r * (1 - k / 14);
        g.fillStyle = `rgba(20,14,8,${alpha / 6})`;
        g.beginPath();
        for (let a = 0; a < 6.283; a += 0.5) {
            const j = rr * srange(0.7, 1.15);
            g.lineTo(x + Math.cos(a) * j, y + Math.sin(a) * j * 1.3);
        }
        g.fill();
    }
}

function loadImage(src) {
    return new Promise((res) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => res(null);
        i.src = src;
    });
}

/* ---------- procedural textures ---------- */

function makeTextures() {
    const floor = canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = '#4a4440'; g.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 32) {          // planks
            const tone = srange(70, 105);
            g.fillStyle = `rgb(${tone},${tone * 0.9},${tone * 0.8})`;
            g.fillRect(0, y, w, 31);
            g.fillStyle = 'rgba(0,0,0,0.6)';
            g.fillRect(0, y + 31, w, 1);
            const seam = srand() * w;
            g.fillRect(seam, y, 1, 32);
            for (let k = 0; k < 6; k++) {           // grain
                g.fillStyle = `rgba(0,0,0,${srange(0.05, 0.2)})`;
                g.fillRect(0, y + srand() * 31, w, 1);
            }
        }
        grime(g, w, h, 1800, 0.35);
        for (let i = 0; i < 5; i++) stain(g, srand() * w, srand() * h, srange(10, 40), 0.5);
    }, [3, 3.4]);

    const wall = canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = '#8c877e'; g.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 16) {          // wallpaper stripes
            g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(x, 0, 6, h);
            g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(x + 9, 0, 2, h);
        }
        for (let y = 8; y < h; y += 32)             // tiny diamond motif
            for (let x = 3; x < w; x += 16) {
                g.fillStyle = 'rgba(0,0,0,0.12)';
                g.fillRect(x + ((y / 32) % 2) * 8, y, 3, 3);
            }
        grime(g, w, h, 1400, 0.25);
        for (let i = 0; i < 6; i++) {               // water damage runs
            const x = srand() * w; const len = srange(40, 200);
            g.fillStyle = 'rgba(30,22,10,0.18)';
            g.fillRect(x, 0, srange(2, 10), len);
        }
        stain(g, srand() * w, h * 0.8, 46, 0.4);
        // peeling patches
        for (let i = 0; i < 3; i++) {
            g.fillStyle = 'rgba(160,150,130,0.25)';
            g.fillRect(srand() * w, srand() * h, srange(10, 40), srange(10, 50));
        }
    }, [0.42, 0.42]);

    const ceiling = canvasTex(128, 128, (g, w, h) => {
        g.fillStyle = '#6a6760'; g.fillRect(0, 0, w, h);
        grime(g, w, h, 600, 0.3);
        for (let i = 0; i < 3; i++) stain(g, srand() * w, srand() * h, srange(10, 30), 0.7);
    }, [0.5, 0.5]);

    const fabric = canvasTex(64, 64, (g, w, h) => {
        g.fillStyle = '#6b5547'; g.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2) { g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(0, y, w, 1); }
        grime(g, w, h, 300, 0.4);
        stain(g, 30, 30, 18, 0.8);
    }, [2, 2]);

    const wood = canvasTex(64, 64, (g, w, h) => {
        g.fillStyle = '#6a5038'; g.fillRect(0, 0, w, h);
        for (let k = 0; k < 20; k++) { g.fillStyle = `rgba(0,0,0,${srange(0.05, 0.25)})`; g.fillRect(0, srand() * h, w, 1); }
        grime(g, w, h, 200, 0.3);
    });

    const cardboard = canvasTex(64, 64, (g, w, h) => {
        g.fillStyle = '#8a6e4c'; g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 30, w, 4);   // tape
        grime(g, w, h, 300, 0.3);
    });

    const mattress = canvasTex(128, 128, (g, w, h) => {
        g.fillStyle = '#8a8478'; g.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 16) for (let y = 0; y < h; y += 16) {
            g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + 7, y + 7, 2, 2);
        }
        for (let i = 0; i < 5; i++) stain(g, srand() * w, srand() * h, srange(10, 34), 0.9);
        grime(g, w, h, 500, 0.3);
    });

    const paper = canvasTex(32, 40, (g, w, h) => {
        g.fillStyle = '#c9c4b8'; g.fillRect(0, 0, w, h);
        for (let y = 6; y < h - 4; y += 3) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(4, y, srange(10, 24), 1); }
        grime(g, w, h, 40, 0.3);
    });

    const photo = canvasTex(32, 38, (g, w, h) => {
        g.fillStyle = '#d8d6d0'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#1a1a1a'; g.fillRect(3, 3, w - 6, w - 6);
        g.fillStyle = 'rgba(255,255,255,0.5)';                        // blurred figure
        g.fillRect(14, 10, 5, 6); g.fillRect(12, 16, 9, 10);
    });

    return { floor, wall, ceiling, fabric, wood, cardboard, mattress, paper, photo };
}

/* ---------- TV screen (the landing page, as a tape) ---------- */

async function makeTVScreen() {
    const W = 512, H = 384;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;

    // tinted copies: draw image, multiply by colour → white→colour, black→black
    function tint(src, color, w, h, whiten) {
        const t = document.createElement('canvas');
        t.width = w; t.height = h;
        const x = t.getContext('2d');
        if (whiten) {
            x.drawImage(src, 0, 0, w, h);
            x.globalCompositeOperation = 'source-in';
            x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
            x.globalCompositeOperation = 'destination-over';
        }
        x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
        x.globalCompositeOperation = 'source-over';
        if (!whiten) x.drawImage(src, 0, 0, w, h);
        else { /* already composited */ }
        x.globalCompositeOperation = 'multiply';
        x.fillStyle = color; x.fillRect(0, 0, w, h);
        return t;
    }
    function tintSet(img, w, h, whiten) {
        return { w: tint(img, '#ffffff', w, h, whiten), r: tint(img, '#ff0000', w, h, whiten), b: tint(img, '#0000ff', w, h, whiten), width: w, height: h };
    }

    const [logoImg, ...glyphImgs] = await Promise.all([
        loadImage(CONFIG.ORIGINAL_LOGO),
        ...CONFIG.ASSETS.map(loadImage),
    ]);
    const logo = logoImg ? tintSet(logoImg, 300, 300, false) : null;
    const glyphs = glyphImgs.filter(Boolean).map((img) => {
        const ar = (img.naturalWidth || 1) / (img.naturalHeight || 1);
        const h = 230, w = Math.round(h * ar);
        return tintSet(img, Math.min(w, 400), h, true);
    });

    try { await document.fonts.load('32px "Terminal Grotesque"'); } catch (e) { /* fall back */ }

    // pre-baked static frames
    const noise = [];
    for (let f = 0; f < 6; f++) {
        const n = document.createElement('canvas');
        n.width = 256; n.height = 192;
        const nx = n.getContext('2d');
        const d = nx.createImageData(256, 192);
        for (let i = 0; i < d.data.length; i += 4) {
            const v = Math.random() < 0.5 ? Math.random() * 255 : 0;
            d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
        }
        nx.putImageData(d, 0, 0);
        noise.push(n);
    }

    let glyph = null, glyphUntil = 0, roll = 0, last = 0, splitX = 6, splitT = 0;
    const screen = { tex, brightness: 0.5 };

    function drawSplit(set, x, y, dx, dy) {
        if (!set) return;
        g.drawImage(set.r, x - dx, y - dy);
        g.drawImage(set.b, x + dx, y + dy);
        g.drawImage(set.w, x, y);
    }

    screen.update = function (t) {
        if (t - last < 1000 / ROOM.TV_FPS) return;
        last = t;
        const burst = state.isGlitching;

        if (t > splitT) {          // mirrors animateFilters cadence
            splitX = burst ? rand(4.8, 13.2) : rand(1.8, 6);
            splitT = t + (burst ? rand(24, 73) : rand(80, 290));
        }
        if (burst && t > glyphUntil && glyphs.length) {
            glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
            glyphUntil = t + CONFIG.SWAP_INTERVAL * rand(0.8, 1.2);
        }

        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1;
        g.fillStyle = burst && Math.random() < 0.04 ? '#ddd' : '#000';
        g.fillRect(0, 0, W, H);
        g.globalCompositeOperation = 'lighter';

        const jx = Math.random() < 0.04 ? rand(-3, 3) : 0;
        const dy = splitX * Math.random() * 0.3;
        if (burst && glyph) {
            drawSplit(glyph, (W - glyph.width) / 2 + jx, 40, splitX, dy);
        } else {
            drawSplit(logo, (W - 300) / 2 + jx, 10, splitX, dy);
        }

        // tagline
        g.font = '30px "Terminal Grotesque", "Courier New", monospace';
        g.textAlign = 'center';
        const tag = 'designer films and exorcisms';
        g.fillStyle = '#ff0000'; g.fillText(tag, W / 2 - splitX * 0.6, 312);
        g.fillStyle = '#0000ff'; g.fillText(tag, W / 2 + splitX * 0.6, 312);
        g.fillStyle = '#ffffff'; g.fillText(tag, W / 2, 312);
        g.font = '16px "Courier New", monospace';
        g.fillText('@paranormal_dynamics_inc', W / 2, 342);

        // static
        g.imageSmoothingEnabled = false;
        g.globalAlpha = (burst || state.isNoising) ? 0.42 : 0.13;
        g.drawImage(noise[Math.floor(Math.random() * noise.length)], 0, 0, W, H);

        // rolling bar
        roll = (roll + (burst ? 9 : 2.2)) % (H + 80);
        g.globalAlpha = 0.07;
        g.fillStyle = '#fff';
        g.fillRect(0, roll - 80, W, 46);

        // scanlines + tear
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 0.35;
        g.fillStyle = '#000';
        for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
        if (burst) {
            g.globalAlpha = 1;
            for (let k = 0; k < 4; k++) {
                const y = Math.random() * H, h = rand(2, 14);
                g.drawImage(c, 0, y, W, h, rand(-30, 30), y, W, h);
            }
        }
        g.globalAlpha = 1;

        // light output tracks content
        screen.brightness = burst ? rand(0.5, 1.4) : 0.55 + Math.random() * 0.08;
        tex.needsUpdate = true;
    };

    return screen;
}

/* ---------- geometry helpers ---------- */

function box(w, h, d, mat, x, y, z, opts = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = true;
    return m;
}

function addCollider(x, z, hw, hd) {
    world.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
}

function wallMesh(width, height, mat, holes = []) {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0); s.lineTo(width / 2, 0); s.lineTo(width / 2, height); s.lineTo(-width / 2, height); s.closePath();
    holes.forEach(([cx, cy, hw, hh]) => {
        const p = new THREE.Path();
        p.moveTo(cx - hw, cy - hh); p.lineTo(cx - hw, cy + hh); p.lineTo(cx + hw, cy + hh); p.lineTo(cx + hw, cy - hh); p.closePath();
        s.holes.push(p);
    });
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), mat);
    m.receiveShadow = true;
    m.castShadow = true;
    return m;
}

/* ---------- build the room ---------- */

function buildRoom(scene, tx, tvScreen) {
    const { W, D, H } = ROOM;
    const lambert = (map, color = 0xffffff, extra = {}) => new THREE.MeshLambertMaterial({ map, color, ...extra });

    const wallMat = lambert(tx.wall);
    wallMat.shadowSide = THREE.DoubleSide;

    // floor + ceiling
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), lambert(tx.floor));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), lambert(tx.ceiling));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = H;
    scene.add(ceil);

    // walls (ShapeGeometry UVs are in metres → texture.repeat sets tile size)
    const WIN = { z: -0.4, y: 1.45, hw: 0.6, hh: 0.5 };
    const north = wallMesh(W, H, wallMat); north.position.set(0, 0, -D / 2); scene.add(north);
    const south = wallMesh(W, H, wallMat); south.position.set(0, 0, D / 2); south.rotation.y = Math.PI; scene.add(south);
    const west = wallMesh(D, H, wallMat); west.position.set(-W / 2, 0, 0); west.rotation.y = Math.PI / 2; scene.add(west);
    // east wall has the window hole; rotation -PI/2 maps local +x → world +z, so local x = world z
    const east = wallMesh(D, H, wallMat, [[WIN.z, WIN.y, WIN.hw, WIN.hh]]);
    east.position.set(W / 2, 0, 0); east.rotation.y = -Math.PI / 2; scene.add(east);
    // outer shell so moonlight only enters through the window
    const shellMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const shell = wallMesh(D, H, shellMat, [[WIN.z, WIN.y, WIN.hw, WIN.hh]]);
    shell.position.set(W / 2 + 0.12, 0, 0); shell.rotation.y = -Math.PI / 2; scene.add(shell);

    // skirting
    const skirt = lambert(tx.wood, 0x777777);
    scene.add(box(W, 0.1, 0.02, skirt, 0, 0.05, -D / 2 + 0.01, { cast: false }));
    scene.add(box(W, 0.1, 0.02, skirt, 0, 0.05, D / 2 - 0.01, { cast: false }));
    scene.add(box(0.02, 0.1, D, skirt, -W / 2 + 0.01, 0.05, 0, { cast: false }));

    // window: frame, boards, moonlit sky behind
    const winX = W / 2;
    const frameMat = lambert(tx.wood, 0x999999);
    scene.add(box(0.14, 0.06, WIN.hw * 2 + 0.12, frameMat, winX - 0.04, WIN.y - WIN.hh - 0.03, WIN.z));
    scene.add(box(0.14, 0.06, WIN.hw * 2 + 0.12, frameMat, winX - 0.04, WIN.y + WIN.hh + 0.03, WIN.z));
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(WIN.hw * 2.2, WIN.hh * 2.2), new THREE.MeshBasicMaterial({ color: 0x5f6c80 }));
    sky.position.set(winX + 0.4, WIN.y, WIN.z); sky.rotation.y = -Math.PI / 2;
    scene.add(sky);
    const boardMat = lambert(tx.wood, 0xaaaaaa);
    [[-0.32, 0.05], [-0.08, -0.04], [0.17, 0.06], [0.38, -0.02]].forEach(([dy, rot], i) => {
        const b = box(0.04, 0.17, WIN.hw * 2 + 0.3, boardMat, winX - 0.03, WIN.y + dy, WIN.z + (i % 2 ? 0.04 : -0.03));
        b.rotation.x = rot;
        scene.add(b);
    });

    // moonlight through the boards
    const moon = new THREE.SpotLight(0x9fb4d8, 60, 16, 0.32, 0.3, 1.3);
    moon.position.set(winX + 2.6, WIN.y + 1.4, WIN.z + 0.4);
    moon.target.position.set(1.2, 0, -0.1);
    moon.castShadow = true;
    moon.shadow.mapSize.set(512, 512);
    moon.shadow.bias = -0.002;
    scene.add(moon, moon.target);

    // door on the south wall + light leaking underneath
    const doorX = -1.6;
    scene.add(box(0.9, 2.05, 0.05, lambert(tx.wood, 0x8a8a8a), doorX, 1.025, D / 2 - 0.03));
    scene.add(box(1.04, 0.07, 0.07, frameMat, doorX, 2.08, D / 2 - 0.03));
    scene.add(box(0.07, 2.08, 0.07, frameMat, doorX - 0.485, 1.04, D / 2 - 0.03));
    scene.add(box(0.07, 2.08, 0.07, frameMat, doorX + 0.485, 1.04, D / 2 - 0.03));
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshLambertMaterial({ color: 0x777766 }));
    knob.position.set(doorX + 0.36, 1.0, D / 2 - 0.07); scene.add(knob);
    const gap = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.012), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }));
    gap.position.set(doorX, 0.006, D / 2 - 0.056); gap.rotation.y = Math.PI; scene.add(gap);
    const leak = new THREE.PointLight(0xffd59a, 0.25, 1.4, 2);
    leak.position.set(doorX, 0.04, D / 2 - 0.2); scene.add(leak);
    world.doorLeak = leak;

    // --- TV stand + CRT ---
    const tvGroup = new THREE.Group();
    tvGroup.position.copy(TV_POS);
    scene.add(tvGroup);
    const standMat = lambert(tx.wood, 0x777777);
    tvGroup.add(box(1.1, 0.04, 0.5, standMat, 0, 0.5, 0));
    tvGroup.add(box(1.1, 0.04, 0.5, standMat, 0, 0.12, 0));
    [[-0.53, -0.23], [0.53, -0.23], [-0.53, 0.23], [0.53, 0.23]].forEach(([x, z]) => tvGroup.add(box(0.04, 0.5, 0.04, standMat, x, 0.25, z)));
    // VCR on the lower shelf
    const vcr = box(0.44, 0.09, 0.32, new THREE.MeshLambertMaterial({ color: 0x1b1b1b }), -0.2, 0.185, 0.02);
    tvGroup.add(vcr);
    const vcrLed = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.012), new THREE.MeshBasicMaterial({ color: 0x33ff55 }));
    vcrLed.position.set(-0.05, 0.19, 0.181); tvGroup.add(vcrLed);
    world.vcrLed = vcrLed;
    // tapes stacked
    for (let i = 0; i < 4; i++) {
        const tp = box(0.19, 0.025, 0.105, new THREE.MeshLambertMaterial({ color: 0x111111 }), 0.3 + srange(-0.02, 0.02), 0.155 + i * 0.026, 0.03);
        tp.rotation.y = srange(-0.3, 0.3);
        tvGroup.add(tp);
    }

    const plastic = new THREE.MeshLambertMaterial({ color: 0x262422 });
    const tvBody = new THREE.Group();
    tvBody.position.set(0, 0.52, 0);
    tvBody.rotation.y = -0.05;
    tvGroup.add(tvBody);
    tvBody.add(box(0.74, 0.58, 0.36, plastic, 0, 0.29, 0.05));
    tvBody.add(box(0.56, 0.44, 0.22, plastic, 0, 0.29, -0.22));       // tube back
    // bezel around screen
    tvBody.add(box(0.74, 0.07, 0.03, plastic, 0, 0.545, 0.245));
    tvBody.add(box(0.74, 0.1, 0.03, plastic, 0, 0.05, 0.245));
    tvBody.add(box(0.08, 0.58, 0.03, plastic, -0.33, 0.29, 0.245));
    tvBody.add(box(0.12, 0.58, 0.03, plastic, 0.31, 0.29, 0.245));
    // knobs
    [0.42, 0.33].forEach((y) => {
        const k = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8), new THREE.MeshLambertMaterial({ color: 0x555555 }));
        k.rotation.x = Math.PI / 2; k.position.set(0.31, y, 0.265); tvBody.add(k);
    });
    // rabbit ears
    const antMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    tvBody.add(box(0.1, 0.03, 0.08, plastic, 0, 0.595, 0));
    [-0.5, 0.65].forEach((a) => {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.55, 4), antMat);
        rod.position.set(Math.sin(a) * 0.27, 0.61 + Math.cos(a) * 0.27, 0);
        rod.rotation.z = -a;
        rod.castShadow = true;
        tvBody.add(rod);
    });

    // curved glass
    const sg = new THREE.PlaneGeometry(0.54, 0.405, 16, 12);
    const p = sg.attributes.position;
    for (let i = 0; i < p.count; i++) {
        const x = p.getX(i) / 0.27, y = p.getY(i) / 0.2025;
        p.setZ(i, 0.025 * (1 - x * x * 0.6) * (1 - y * y * 0.6));
    }
    sg.computeVertexNormals();
    const screenMesh = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ map: tvScreen.tex }));
    screenMesh.position.set(-0.02, 0.3, 0.23);
    tvBody.add(screenMesh);

    // halo — lo-fi additive glow card
    const haloTex = canvasTex(64, 64, (g, w, h) => {
        for (let k = 0; k < 12; k++) {
            const s = (k / 12) * w;
            g.fillStyle = 'rgba(255,255,255,0.05)';
            g.fillRect((w - s) / 2, (h - s * 0.8) / 2, s, s * 0.8);
        }
    });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.75), new THREE.MeshBasicMaterial({
        map: haloTex, color: 0xb8c8ff, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    halo.position.set(-0.02, 0.3, 0.3);
    tvBody.add(halo);

    // TV light — the room's main source
    const tvLight = new THREE.SpotLight(0xc4d2ff, 6, 9, 1.2, 0.9, 1.6);
    tvLight.position.set(0, 0.3, 0.32);
    tvLight.target.position.set(0, -0.1, 3);
    tvLight.castShadow = true;
    tvLight.shadow.mapSize.set(512, 512);
    tvLight.shadow.bias = -0.003;
    tvBody.add(tvLight, tvLight.target);
    const tvFill = new THREE.PointLight(0xa8b8ff, 0.6, 2.2, 2);
    tvFill.position.set(0, 0.3, 0.4);
    tvBody.add(tvFill);

    world.screenMesh = screenMesh;
    world.tvLight = tvLight;
    world.tvFill = tvFill;
    world.halo = halo;
    tvBody.traverse((o) => { if (o.isMesh) o.userData.interact = 'tv'; });
    addCollider(TV_POS.x, TV_POS.z, 0.6, 0.32);

    // cable from TV to the wall outlet, across the floor
    const cablePts = [
        new THREE.Vector3(0.1, 0.55, TV_POS.z - 0.2),
        new THREE.Vector3(0.3, 0.01, TV_POS.z - 0.05),
        new THREE.Vector3(1.2, 0.01, TV_POS.z + 0.5),
        new THREE.Vector3(2.4, 0.01, TV_POS.z + 0.1),
        new THREE.Vector3(3.2, 0.01, TV_POS.z - 0.25),
        new THREE.Vector3(W / 2 - 0.02, 0.3, -D / 2 + 0.6),
    ];
    const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 60, 0.008, 4), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    cable.castShadow = true;
    scene.add(cable);
    scene.add(box(0.02, 0.1, 0.07, new THREE.MeshLambertMaterial({ color: 0x8a867c }), W / 2 - 0.01, 0.3, -D / 2 + 0.6));

    // --- armchair facing the TV ---
    const chair = new THREE.Group();
    chair.position.copy(CHAIR_POS);
    chair.rotation.y = CHAIR_YAW;
    scene.add(chair);
    const fab = lambert(tx.fabric);
    chair.add(box(0.72, 0.18, 0.7, fab, 0, 0.3, 0));                  // seat base
    chair.add(box(0.64, 0.12, 0.62, fab, 0, 0.45, -0.02));            // cushion
    chair.add(box(0.86, 0.85, 0.2, fab, 0, 0.62, 0.36));              // back
    const back2 = box(0.86, 0.2, 0.28, fab, 0, 1.0, 0.32); chair.add(back2);
    chair.add(box(0.14, 0.5, 0.82, fab, -0.4, 0.42, 0.02));           // arms
    chair.add(box(0.14, 0.5, 0.82, fab, 0.4, 0.42, 0.02));
    [[-0.38, -0.32], [0.38, -0.32], [-0.38, 0.4], [0.38, 0.4]].forEach(([x, z]) => chair.add(box(0.05, 0.22, 0.05, lambert(tx.wood), x, 0.11, z)));
    // torn stuffing
    const stuffing = box(0.12, 0.05, 0.1, new THREE.MeshLambertMaterial({ color: 0xbdb6a5 }), 0.22, 0.52, 0.12);
    stuffing.rotation.y = 0.5;
    chair.add(stuffing);
    chair.traverse((o) => { if (o.isMesh) o.userData.interact = 'chair'; });
    addCollider(CHAIR_POS.x, CHAIR_POS.z + 0.03, 0.47, 0.48);

    // side table + lamp (dead) + ashtray + bottle
    const sideT = new THREE.Group(); sideT.position.set(-0.85, 0, -1.0); scene.add(sideT);
    sideT.add(box(0.45, 0.03, 0.45, lambert(tx.wood), 0, 0.55, 0));
    [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].forEach(([x, z]) => sideT.add(box(0.03, 0.55, 0.03, lambert(tx.wood), x, 0.275, z)));
    const ash = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.03, 10), new THREE.MeshLambertMaterial({ color: 0x444444 }));
    ash.position.set(0.08, 0.58, 0.05); ash.castShadow = true; sideT.add(ash);
    addCollider(-0.85, -1.0, 0.25, 0.25);

    // --- mattress on the floor, against the east wall ---
    const mat = box(1.0, 0.18, 1.95, lambert(tx.mattress), W / 2 - 0.62, 0.09, 1.9);
    mat.rotation.y = 0.06;
    scene.add(mat);
    const blanket = box(0.9, 0.04, 0.9, lambert(tx.fabric, 0x777777), W / 2 - 0.66, 0.2, 2.4);
    blanket.rotation.y = -0.3; blanket.rotation.z = 0.04;
    scene.add(blanket);
    addCollider(W / 2 - 0.62, 1.9, 0.55, 1.0);

    // --- bookshelf on the west wall, half emptied onto the floor ---
    const shelf = new THREE.Group(); shelf.position.set(-W / 2 + 0.2, 0, -2.0); scene.add(shelf);
    const sw = lambert(tx.wood);
    shelf.add(box(0.36, 1.9, 0.03, sw, 0, 0.95, -0.5));
    shelf.add(box(0.36, 1.9, 0.03, sw, 0, 0.95, 0.5));
    shelf.add(box(0.03, 1.9, 1.0, sw, -0.17, 0.95, 0));
    for (let i = 0; i < 5; i++) shelf.add(box(0.36, 0.03, 1.0, sw, 0, 0.02 + i * 0.46, 0));
    for (let row = 0; row < 4; row++) {
        let z = -0.46;
        while (z < 0.42) {
            const t = srange(0.03, 0.07);
            if (srand() < 0.55) {
                const bh = srange(0.22, 0.34);
                const tone = srange(0.15, 0.45);
                const b = box(0.24, bh, t, new THREE.MeshLambertMaterial({ color: new THREE.Color(tone, tone * 0.85, tone * 0.75) }), 0.0, 0.035 + row * 0.46 + bh / 2, z);
                if (srand() < 0.2) b.rotation.x = 0.3;
                shelf.add(b);
            }
            z += t + 0.005;
        }
    }
    addCollider(-W / 2 + 0.2, -2.0, 0.22, 0.52);
    for (let i = 0; i < 9; i++) {
        const tone = srange(0.15, 0.4);
        const b = box(0.17, 0.035, 0.24, new THREE.MeshLambertMaterial({ color: new THREE.Color(tone, tone * 0.85, tone * 0.7) }),
            -W / 2 + srange(0.5, 1.5), 0.018, -2.0 + srange(-0.8, 0.9));
        b.rotation.y = srange(0, 6.28);
        scene.add(b);
    }

    // --- overturned wooden chair ---
    const oc = new THREE.Group(); oc.position.set(-1.7, 0.21, 1.3); oc.rotation.set(0, 0.7, Math.PI / 2); scene.add(oc);
    oc.add(box(0.42, 0.03, 0.42, sw, 0, 0.24, 0));
    [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].forEach(([x, z]) => oc.add(box(0.03, 0.45, 0.03, sw, x, 0.0, z)));
    oc.add(box(0.42, 0.45, 0.03, sw, 0, 0.47, 0.2));
    addCollider(-1.7, 1.3, 0.35, 0.35);

    // --- boxes ---
    const cb = lambert(tx.cardboard);
    [[W / 2 - 0.35, 0.25, -D / 2 + 0.4, 0.5, 0.5, 0.5, 0.1], [W / 2 - 0.4, 0.71, -D / 2 + 0.42, 0.42, 0.42, 0.42, -0.25],
     [W / 2 - 0.3, 0.2, -D / 2 + 1.05, 0.4, 0.4, 0.55, 0.3], [-W / 2 + 0.4, 0.3, D / 2 - 0.45, 0.6, 0.6, 0.5, 0.15],
     [-W / 2 + 1.1, 0.18, D / 2 - 0.4, 0.36, 0.36, 0.4, -0.4]].forEach(([x, y, z, w, h, d, r]) => {
        const b = box(w, h, d, cb, x, y, z); b.rotation.y = r; scene.add(b);
        if (y < 0.4) addCollider(x, z, w / 2 + 0.05, d / 2 + 0.05);
    });
    // an open box spilling papers
    const ob = box(0.45, 0.32, 0.4, cb, 1.5, 0.16, -2.2); ob.rotation.y = 0.8; scene.add(ob);
    addCollider(1.5, -2.2, 0.3, 0.3);

    // --- bare bulb (dead), swaying ---
    const pivot = new THREE.Group(); pivot.position.set(0.3, H, 0.4); scene.add(pivot);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.6, 4), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    cord.position.y = -0.3; cord.castShadow = true; pivot.add(cord);
    const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    socket.position.y = -0.62; pivot.add(socket);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshLambertMaterial({ color: 0x777766, transparent: true, opacity: 0.85 }));
    bulb.position.y = -0.68; bulb.castShadow = true; pivot.add(bulb);
    world.bulbPivot = pivot;

    // --- floor debris: papers, photos, bottles, cans ---
    const paperMat = lambert(tx.paper, 0xffffff, { side: THREE.DoubleSide });
    const photoMat = lambert(tx.photo, 0xffffff, { side: THREE.DoubleSide });
    const pg = new THREE.PlaneGeometry(0.21, 0.28);
    const phg = new THREE.PlaneGeometry(0.09, 0.105);
    for (let i = 0; i < 70; i++) {
        // clustered around chair / TV / open box
        const hub = [[0, -1.4], [0.2, -2.6], [1.5, -2.0], [-1.5, 0.8], [2.0, 1.0]][i % 5];
        const isPhoto = i % 7 === 0;
        const m = new THREE.Mesh(isPhoto ? phg : pg, isPhoto ? photoMat : paperMat);
        m.position.set(hub[0] + srange(-1, 1), 0.003 + i * 0.0002, hub[1] + srange(-0.9, 0.9));
        m.rotation.set(-Math.PI / 2 + srange(-0.05, 0.05), 0, srange(0, 6.28));
        m.receiveShadow = true;
        scene.add(m);
    }
    const glass = new THREE.MeshPhongMaterial({ color: 0x2f4a2a, transparent: true, opacity: 0.8, shininess: 80 });
    const bottleG = new THREE.CylinderGeometry(0.035, 0.035, 0.24, 8);
    for (let i = 0; i < 11; i++) {
        const b = new THREE.Mesh(bottleG, glass);
        const lying = srand() < 0.6;
        const x = srange(-2.8, 2.8), z = srange(-3.2, 3.4);
        if (Math.abs(x - CHAIR_POS.x) < 0.6 && Math.abs(z - CHAIR_POS.z) < 0.6) continue;
        b.position.set(x, lying ? 0.035 : 0.12, z);
        if (lying) { b.rotation.z = Math.PI / 2; b.rotation.y = srange(0, 6.28); }
        b.castShadow = true;
        scene.add(b);
    }
    const canMat = new THREE.MeshPhongMaterial({ color: 0x8d8d8d, shininess: 60 });
    for (let i = 0; i < 8; i++) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.12, 8), canMat);
        c.position.set(CHAIR_POS.x + srange(-0.9, 0.9), 0.033, CHAIR_POS.z + srange(-0.9, 0.2));
        c.rotation.set(0, srange(0, 6.28), Math.PI / 2);
        c.castShadow = true;
        scene.add(c);
    }

    // --- chalk glyphs on the walls (only really visible under the flashlight) ---
    return { glyphWalls: (glyphTex) => {
        const spots = [
            [-1.6, 1.5, -D / 2 + 0.006, 0, 0.6], [1.7, 1.7, -D / 2 + 0.006, 0, 0.45],
            [-W / 2 + 0.006, 1.3, 1.5, Math.PI / 2, 0.7], [W / 2 - 0.006, 1.4, 2.6, -Math.PI / 2, 0.5],
            [0.9, 1.6, D / 2 - 0.006, Math.PI, 0.55], [-W / 2 + 0.006, 1.6, -0.6, Math.PI / 2, 0.4],
        ];
        spots.forEach(([x, y, z, ry, s], i) => {
            const t = glyphTex[i % glyphTex.length];
            if (!t) return;
            const ar = t.image.width / t.image.height;
            const m = new THREE.Mesh(new THREE.PlaneGeometry(s * ar, s), new THREE.MeshLambertMaterial({
                color: 0xd8d4cc, alphaMap: t, transparent: true, opacity: 0.55, depthWrite: false,
                polygonOffset: true, polygonOffsetFactor: -2,
            }));
            m.position.set(x, y, z); m.rotation.y = ry; m.rotation.z = srange(-0.2, 0.2);
            scene.add(m);
        });
    } };
}

/* ---------- glyph alpha textures for wall chalk ---------- */

async function makeGlyphAlphaTextures() {
    const imgs = await Promise.all(CONFIG.ASSETS.slice(0, 8).map(loadImage));
    return imgs.filter(Boolean).map((img) => {
        const ar = (img.naturalWidth || 1) / (img.naturalHeight || 1);
        const h = 128, w = Math.max(16, Math.round(h * ar));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0, w, h);
        // alpha → luminance (alphaMap reads green), then scuff it like chalk
        g.globalCompositeOperation = 'source-in';
        g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'destination-over';
        g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'source-over';
        for (let i = 0; i < w * h * 0.12; i++) {
            g.fillStyle = 'rgba(0,0,0,0.7)';
            g.fillRect(Math.random() * w, Math.random() * h, 1, 1);
        }
        const t = new THREE.CanvasTexture(c);
        t.magFilter = THREE.NearestFilter;
        return t;
    });
}

/* ---------- post: low-res target → CRT camcorder pass ---------- */

function makePost(renderer) {
    const rt = new THREE.WebGLRenderTarget(4, 4, {
        type: THREE.HalfFloatType,
        magFilter: THREE.NearestFilter,
        minFilter: THREE.NearestFilter,
        depthBuffer: true,
    });
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { value: rt.texture },
            uTime: { value: 0 },
            uGlitch: { value: 0 },
            uRes: { value: new THREE.Vector2(1, 1) },
            uFade: { value: 1 },
        },
        vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
        fragmentShader: `
            uniform sampler2D tDiffuse; uniform float uTime,uGlitch,uFade; uniform vec2 uRes;
            varying vec2 vUv;
            float h(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
            void main(){
                vec2 cc=vUv-.5;
                float r2=dot(cc,cc);
                vec2 uv=.5+cc*(1.+.12*r2);                    // tube bulge
                float line=floor(uv.y*120.);
                float tear=step(1.-uGlitch*.3,h(vec2(line,floor(uTime*24.))));
                uv.x+=tear*(h(vec2(line,uTime))-.5)*.09*uGlitch;
                uv.x+=(h(vec2(floor(uTime*60.),3.))-.5)*.0015;  // horizontal jitter
                vec2 ca=cc*(.006+uGlitch*.03);
                vec3 col=vec3(texture2D(tDiffuse,uv+ca).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-ca).b);
                col=max(col,0.);
                col=col/(1.+col*.6);                          // soft clip
                float l=dot(col,vec3(.299,.587,.114));
                col=mix(vec3(l),col,.3);                      // nearly monochrome
                col=pow(col,vec3(1./2.2));                    // linear → display
                
                float n=h(vUv*uRes+fract(uTime*7.3)*100.);
                col+=(n-.5)*(.06+uGlitch*.18);                // grain
                col*=.86+.14*step(.5,fract(gl_FragCoord.y*.5)); // scanlines
                col*=smoothstep(.95,.3,length(cc*vec2(1.,1.1))*1.25); // vignette
                if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.)col=vec3(0.);
                gl_FragColor=vec4(col*uFade,1.);
            }`,
        depthTest: false,
        depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    const scene = new THREE.Scene();
    scene.add(quad);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return {
        rt, mat,
        resize(w, h) {
            const s = Math.min(1, ROOM.RT_HEIGHT / h);
            rt.setSize(Math.max(2, Math.round(w * s)), Math.max(2, Math.round(h * s)));
            mat.uniforms.uRes.value.set(w, h);
        },
        render(sceneMain, camera) {
            renderer.setRenderTarget(rt);
            renderer.render(sceneMain, camera);
            renderer.setRenderTarget(null);
            renderer.render(scene, cam);
        },
    };
}

/* ---------- audio: TV static + room drone (generated) ---------- */

function makeAudio(camera, tvObject) {
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const ctx = listener.context;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    const staticSnd = new THREE.PositionalAudio(listener);
    staticSnd.setBuffer(buf);
    staticSnd.setLoop(true);
    staticSnd.setRefDistance(0.6);
    staticSnd.setRolloffFactor(1.6);
    staticSnd.setVolume(0.16);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 0.5;
    staticSnd.setFilter(bp);
    tvObject.add(staticSnd);

    // 15.7 kHz CRT whine, quiet
    const whine = ctx.createOscillator(); whine.frequency.value = 15700;
    const wg = ctx.createGain(); wg.gain.value = 0.004;
    whine.connect(wg); wg.connect(staticSnd.panner);

    // room drone
    const drone = ctx.createGain(); drone.gain.value = 0.05;
    drone.connect(listener.getInput());
    [41, 43.7, 82.3].forEach((f) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = ctx.createGain(); g.gain.value = f > 80 ? 0.2 : 0.6;
        o.connect(g); g.connect(drone); o.start();
    });

    let started = false;
    return {
        start() {
            if (ctx.state === 'suspended') ctx.resume();
            if (!started) { staticSnd.play(); whine.start(); started = true; }
        },
        update(burst) { staticSnd.setVolume(burst ? 0.5 : 0.16); },
        setMuted(m) { listener.setMasterVolume(m ? 0 : 1); },
    };
}

/* ---------- player movement + collisions ---------- */

function resolveCollisions(p) {
    const r = ROOM.RADIUS;
    const lim = { x: ROOM.W / 2 - r - 0.03, z: ROOM.D / 2 - r - 0.03 };
    for (let it = 0; it < 2; it++) {
        for (const c of world.colliders) {
            const cx = Math.max(c.minX, Math.min(p.x, c.maxX));
            const cz = Math.max(c.minZ, Math.min(p.z, c.maxZ));
            const dx = p.x - cx, dz = p.z - cz;
            const d2 = dx * dx + dz * dz;
            if (d2 < r * r) {
                if (d2 > 1e-8) {
                    const d = Math.sqrt(d2);
                    p.x = cx + (dx / d) * r; p.z = cz + (dz / d) * r;
                } else {                 // centre inside box — push out the short way
                    const opts = [[c.minX - r - p.x, 0], [c.maxX + r - p.x, 0], [0, c.minZ - r - p.z], [0, c.maxZ + r - p.z]];
                    opts.sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]));
                    p.x += opts[0][0]; p.z += opts[0][1];
                }
            }
        }
        p.x = Math.max(-lim.x, Math.min(lim.x, p.x));
        p.z = Math.max(-lim.z, Math.min(lim.z, p.z));
    }
}

function angleLerp(a, b, t) {
    let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
}

function lookAngles(from, to) {
    const d = to.clone().sub(from);
    return { yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)) };
}

/* ---------- main ---------- */

async function initWorld() {
    const body = document.body;
    const canvas = document.getElementById('world');
    const hudPrompt = document.getElementById('hud-prompt');
    const hudTime = document.getElementById('hud-time');
    const fade = document.getElementById('fade');
    const touchAct = document.getElementById('touch-act');

    if (world.isTouch) {
        body.classList.add('is-touch');
        document.getElementById('gate-keys').textContent = 'left pad move · drag look · E interact';
    }

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    } catch (e) {
        console.warn('PDI: WebGL unavailable, falling back to the tape', e);
        enterSiteDirect();
        return;
    }
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;     // hard, aliased shadows

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.11);
    scene.add(new THREE.AmbientLight(0x6070a0, 0.012));
    scene.add(new THREE.HemisphereLight(0x303848, 0x0a0806, 0.03));

    const camera = new THREE.PerspectiveCamera(68, 1, 0.03, 30);
    camera.rotation.order = 'YXZ';
    scene.add(camera);

    // flashlight lags behind the head for weight
    const flashRig = new THREE.Group();
    scene.add(flashRig);
    const flashlight = new THREE.SpotLight(0xfff4e0, 15, 12, 0.45, 0.75, 1.5);
    flashlight.position.set(0.12, -0.12, 0);
    flashlight.castShadow = true;
    flashlight.shadow.mapSize.set(512, 512);
    flashlight.shadow.bias = -0.002;
    flashlight.shadow.camera.near = 0.1;
    flashRig.add(flashlight);
    flashlight.target.position.set(0.06, -0.08, -1);
    flashRig.add(flashlight.target);

    const tx = makeTextures();
    const tvScreen = await makeTVScreen();
    const room = buildRoom(scene, tx, tvScreen);
    makeGlyphAlphaTextures().then(room.glyphWalls);

    const post = makePost(renderer);
    let audio = null;

    function resize() {
        const w = window.innerWidth, h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        post.resize(w, h);
    }
    resize();
    window.addEventListener('resize', resize);

    // initial view — standing by the door, TV glowing at the far end
    const initLook = lookAngles(world.pos, new THREE.Vector3(TV_POS.x, 0.9, TV_POS.z));
    world.yaw = initLook.yaw; world.pitch = initLook.pitch - 0.05;

    /* ----- mode changes ----- */

    function setMode(m) {
        world.mode = m;
        body.classList.toggle('is-sitting', m === 'sitting' || (m === 'tween' && world.tweenSit));
        body.classList.toggle('is-watching', m === 'watching');
    }

    function play() {
        if (!audio) { try { audio = makeAudio(camera, world.screenMesh); } catch (e) { audio = { start() {}, update() {}, setMuted() {} }; } }
        audio.start();
        body.classList.add('is-playing');
        if (!world.startTime) world.startTime = performance.now();
        if (world.mode === 'gate') setMode(world.lastMode || 'explore');
        if (!world.isTouch && canvas.requestPointerLock) {
            const pr = canvas.requestPointerLock();
            if (pr && pr.catch) pr.catch(() => {});
        }
    }

    function pause() {
        if (world.mode === 'watching') return;
        world.lastMode = world.mode === 'tween' ? world.tweenEnd : world.mode;
        setMode('gate');
        body.classList.remove('is-playing');
        document.getElementById('gate-enter').textContent = '[ RESUME ]';
    }

    document.addEventListener('pointerlockchange', () => {
        if (!document.pointerLockElement && body.classList.contains('is-playing') && world.mode !== 'watching' && !world.leavingToSite) pause();
    });

    document.getElementById('gate-enter').addEventListener('click', play);
    document.getElementById('gate-skip').addEventListener('click', () => {
        world.startTime = world.startTime || performance.now();
        sitDown(true);
        enterSite();
    });

    function tweenTo(pos, yaw, pitch, dur, end, done) {
        world.tween = { fromPos: world.pos.clone(), toPos: pos.clone(), fromYaw: world.yaw, toYaw: yaw, fromPitch: world.pitch, toPitch: pitch, t: 0, dur, done };
        world.tweenEnd = end;
        world.tweenSit = end === 'sitting' || end === 'watching';
        setMode('tween');
    }

    const seatPos = () => new THREE.Vector3(
        CHAIR_POS.x - Math.sin(CHAIR_YAW) * 0.05, ROOM.SEAT_EYE, CHAIR_POS.z + Math.cos(CHAIR_YAW) * 0.05);
    const screenWorld = () => world.screenMesh.getWorldPosition(new THREE.Vector3());

    function sitDown(instant) {
        const sp = seatPos();
        const la = lookAngles(sp, screenWorld().add(new THREE.Vector3(0, -0.05, 0)));
        world.seatYaw = la.yaw;
        if (instant) {
            world.pos.copy(sp); world.yaw = la.yaw; world.pitch = la.pitch;
            setMode('sitting');
            return;
        }
        // drop down into the chair: up-and-over motion handled by tween easing
        tweenTo(sp, la.yaw, la.pitch, 1.1, 'sitting');
    }

    function standUp() {
        const p = new THREE.Vector3(CHAIR_POS.x - 0.8, ROOM.EYE, CHAIR_POS.z - 0.25);
        resolveCollisions(p);
        tweenTo(p, world.yaw + 0.3, 0, 0.8, 'explore');
    }

    function watch() {
        const sw = screenWorld();
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(world.screenMesh.getWorldQuaternion(new THREE.Quaternion()));
        const target = sw.clone().add(normal.multiplyScalar(0.36));
        const la = lookAngles(target, sw);
        tweenTo(target, la.yaw, la.pitch, 1.4, 'watching', enterSite);
    }

    function enterSite() {
        world.leavingToSite = true;
        if (document.pointerLockElement) document.exitPointerLock();
        fade.classList.add('is-on');
        setTimeout(() => {
            setMode('watching');
            state.siteActive = true;
            initSiteEffects();
            fade.classList.remove('is-on');
            world.leavingToSite = false;
            document.getElementById('site-leave').focus({ preventScroll: true });
        }, 380);
    }

    function enterSiteDirect() {
        body.classList.add('is-watching');
        state.siteActive = true;
        initSiteEffects();
        const leave = document.getElementById('site-leave');
        if (leave) leave.style.display = 'none';
    }

    function leaveSite() {
        if (world.mode !== 'watching') return;
        fade.classList.add('is-on');
        setTimeout(() => {
            state.siteActive = false;
            sitDown(true);
            setMode('sitting');
            fade.classList.remove('is-on');
            play();
        }, 380);
    }
    document.getElementById('site-leave').addEventListener('click', leaveSite);

    function interact() {
        if (world.mode === 'explore' && world.focus === 'chair') sitDown(false);
        else if (world.mode === 'explore' && world.focus === 'tv') sitDown(false);
        else if (world.mode === 'sitting') watch();
    }

    /* ----- input ----- */

    document.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (world.mode === 'watching') {
            if (k === 'escape' || k === 'backspace') { e.preventDefault(); leaveSite(); }
            return;
        }
        if (world.mode === 'gate') {
            if (k === 'enter' || k === ' ') { e.preventDefault(); play(); }
            return;
        }
        world.keys[k] = true;
        if (k === 'e' || k === 'enter') interact();
        const standKeys = ['q', 'c', ' ', 'w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
        if (world.mode === 'sitting' && standKeys.includes(k)) { e.preventDefault(); world.keys = {}; standUp(); }
        if (k === 'f') world.flashlightOn = !world.flashlightOn;
        if (k === 'm' && audio) { world.muted = !world.muted; audio.setMuted(world.muted); }
    });
    document.addEventListener('keyup', (e) => { world.keys[e.key.toLowerCase()] = false; });
    window.addEventListener('blur', () => { world.keys = {}; });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement !== canvas) return;
        look(e.movementX, e.movementY, 0.0022);
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('mousedown', (e) => {
        if (document.pointerLockElement === canvas) {
            if (e.button === 2) { if (world.mode === 'sitting') standUp(); return; }
            interact();
            return;
        }
        // e.g. back from the tape via Esc — Esc can't grant pointer lock, a click can
        if (!world.isTouch && body.classList.contains('is-playing')) {
            const pr = canvas.requestPointerLock();
            if (pr && pr.catch) pr.catch(() => {});
        }
    });

    function look(dx, dy, s) {
        if (world.mode !== 'explore' && world.mode !== 'sitting') return;
        world.yaw -= dx * s;
        world.pitch = Math.max(-1.35, Math.min(1.35, world.pitch - dy * s));
        if (world.mode === 'sitting') {
            const d = ((world.yaw - world.seatYaw + Math.PI) % (Math.PI * 2)) - Math.PI;
            world.yaw = world.seatYaw + Math.max(-1.1, Math.min(1.1, d));
            world.pitch = Math.max(-0.7, Math.min(0.6, world.pitch));
        }
    }

    // touch: left stick moves, drag anywhere else looks, button interacts
    if (world.isTouch) {
        const stick = document.getElementById('touch-stick');
        const knob = document.getElementById('touch-knob');
        const T = world.touch;
        stick.addEventListener('touchstart', (e) => { T.stickId = e.changedTouches[0].identifier; e.preventDefault(); }, { passive: false });
        canvas.addEventListener('touchstart', (e) => {
            const t = e.changedTouches[0];
            T.lookId = t.identifier; T.lookX = t.clientX; T.lookY = t.clientY;
        }, { passive: true });
        document.addEventListener('touchmove', (e) => {
            for (const t of e.changedTouches) {
                if (t.identifier === T.stickId) {
                    const r = stick.getBoundingClientRect();
                    let x = (t.clientX - r.left - r.width / 2) / (r.width / 2);
                    let y = (t.clientY - r.top - r.height / 2) / (r.height / 2);
                    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
                    T.move.set(x, y);
                    knob.style.transform = `translate(${x * 40}px, ${y * 40}px)`;
                } else if (t.identifier === T.lookId) {
                    look(t.clientX - T.lookX, t.clientY - T.lookY, 0.005);
                    T.lookX = t.clientX; T.lookY = t.clientY;
                }
            }
        }, { passive: true });
        document.addEventListener('touchend', (e) => {
            for (const t of e.changedTouches) {
                if (t.identifier === T.stickId) { T.stickId = null; T.move.set(0, 0); knob.style.transform = ''; }
                if (t.identifier === T.lookId) T.lookId = null;
            }
        });
        touchAct.addEventListener('click', interact);
        document.getElementById('touch-stand').addEventListener('click', () => { if (world.mode === 'sitting') standUp(); });
    }

    /* ----- loop ----- */

    const raycaster = new THREE.Raycaster();
    raycaster.far = 2.4;
    const interactMeshes = [];
    scene.traverse((o) => { if (o.isMesh && o.userData.interact) interactMeshes.push(o); });
    const clock = new THREE.Clock();
    const tmpQ = new THREE.Quaternion();
    let lastPrompt = '';

    function setPrompt(txt) {
        if (txt === lastPrompt) return;
        lastPrompt = txt;
        hudPrompt.textContent = txt;
        touchAct.classList.toggle('is-ready', !!txt);
    }

    function frame() {
        requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 0.05);
        const now = performance.now();
        const t = now / 1000;

        if (world.mode === 'watching') return;   // the tape is up — room sleeps

        tvScreen.update(now);

        // glitch envelope shared with the tape
        const wasGlitching = world.glitch > 0.5;
        world.glitch += ((state.isGlitching ? 1 : 0) - world.glitch) * (state.isGlitching ? 0.5 : 0.08);
        // the camera only catches the tape's interference sometimes — and harder the closer you are
        if (!wasGlitching && world.glitch > 0.5) {
            const dTV = Math.hypot(world.pos.x - TV_POS.x, world.pos.z - TV_POS.z);
            world.camGlitch = Math.random() < 0.18 ? 1 : 0.25 * Math.max(0, 1 - dTV / 6);
        }

        // movement
        if (world.mode === 'explore') {
            const k = world.keys;
            let fx = (k.w || k.arrowup ? 1 : 0) - (k.s || k.arrowdown ? 1 : 0);
            let sx = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0);
            if (world.isTouch) { fx -= world.touch.move.y; sx += world.touch.move.x; }
            const fwd = new THREE.Vector3(-Math.sin(world.yaw), 0, -Math.cos(world.yaw));
            const right = new THREE.Vector3(Math.cos(world.yaw), 0, -Math.sin(world.yaw));
            const wish = fwd.multiplyScalar(fx).add(right.multiplyScalar(sx));
            if (wish.lengthSq() > 1) wish.normalize();
            const speed = k.shift ? ROOM.RUN : ROOM.WALK;
            world.vel.lerp(wish.multiplyScalar(speed), Math.min(1, dt * 9));
            world.pos.addScaledVector(world.vel, dt);
            resolveCollisions(world.pos);
            const sp = Math.hypot(world.vel.x, world.vel.z);
            world.bob += sp * dt * 5.2;
            world.pos.y += (ROOM.EYE - world.pos.y) * Math.min(1, dt * 8);
        } else {
            world.vel.set(0, 0, 0);
        }

        // tweens (sit / stand / push into screen)
        if (world.mode === 'tween' && world.tween) {
            const tw = world.tween;
            tw.t = Math.min(1, tw.t + dt / tw.dur);
            const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
            world.pos.lerpVectors(tw.fromPos, tw.toPos, e);
            if (world.tweenEnd === 'sitting') world.pos.y -= Math.sin(tw.t * Math.PI) * 0.06;
            world.yaw = angleLerp(tw.fromYaw, tw.toYaw, e);
            world.pitch = tw.fromPitch + (tw.toPitch - tw.fromPitch) * e;
            if (tw.t >= 1) {
                world.tween = null;
                setMode(world.tweenEnd);
                if (tw.done) tw.done();
            }
        }

        // camera
        const sp = Math.hypot(world.vel.x, world.vel.z);
        const bobAmt = Math.min(1, sp / ROOM.WALK);
        const breathe = Math.sin(t * 1.3) * 0.006;
        camera.position.set(
            world.pos.x + Math.cos(world.bob) * 0.025 * bobAmt * Math.cos(world.yaw),
            world.pos.y + Math.abs(Math.sin(world.bob)) * 0.04 * bobAmt + breathe,
            world.pos.z - Math.cos(world.bob) * 0.025 * bobAmt * Math.sin(world.yaw),
        );
        camera.rotation.set(world.pitch + breathe * 0.3, world.yaw, Math.cos(world.bob) * 0.006 * bobAmt);

        // flashlight follows with lag; flickers when the tape glitches
        flashRig.position.copy(camera.position);
        tmpQ.setFromEuler(camera.rotation);
        flashRig.quaternion.slerp(tmpQ, Math.min(1, dt * 14));
        const flick = world.glitch * world.camGlitch > 0.3 && Math.random() < 0.5 ? rand(0, 0.4) : 1;
        flashlight.intensity = world.flashlightOn ? 15 * flick : 0;

        // TV light pulses with screen content
        const b = tvScreen.brightness;
        world.tvLight.intensity = 9 * b;
        world.tvFill.intensity = 0.6 * b;
        world.halo.material.opacity = 0.08 + 0.1 * b;
        world.doorLeak.intensity = 0.25 + (Math.random() < 0.01 ? -0.2 : 0);
        world.vcrLed.visible = Math.floor(t * 1.2) % 2 === 0;
        world.bulbPivot.rotation.z = Math.sin(t * 0.7) * 0.05 + world.glitch * Math.sin(t * 13) * 0.03;
        world.bulbPivot.rotation.x = Math.sin(t * 0.53 + 1) * 0.035;
        if (audio) audio.update(state.isGlitching);

        // interaction focus + prompt
        world.focus = null;
        if (world.mode === 'explore') {
            raycaster.setFromCamera({ x: 0, y: 0 }, camera);
            const hit = raycaster.intersectObjects(interactMeshes, false)[0];
            if (hit) world.focus = hit.object.userData.interact;
            const nearChair = Math.hypot(world.pos.x - CHAIR_POS.x, world.pos.z - CHAIR_POS.z) < 1.4;
            if (world.focus === 'chair' || (world.focus === 'tv' && nearChair)) { world.focus = 'chair'; setPrompt(world.isTouch ? 'SIT' : '[E] SIT'); }
            else if (world.focus === 'tv') setPrompt('...');
            else setPrompt('');
        } else if (world.mode === 'sitting') {
            if (world.isTouch) setPrompt('WATCH');
            else if (document.pointerLockElement !== canvas) setPrompt('[CLICK] TO LOOK AROUND\n[E] WATCH        [Q] STAND');
            else setPrompt('[E] WATCH        [Q] STAND');
        } else {
            setPrompt('');
        }

        // HUD timecode
        if (world.startTime) {
            const s = Math.floor((now - world.startTime) / 1000);
            const pad = (n) => String(n).padStart(2, '0');
            hudTime.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
        }

        post.mat.uniforms.uTime.value = t;
        post.mat.uniforms.uGlitch.value = world.glitch * world.camGlitch;
        post.render(scene, camera);
    }
    requestAnimationFrame(frame);

    window.__pdi = { world, camera, scene, sitDown, watch, standUp, leaveSite, play };  // debug handle
}

console.log('PDI v' + VERSION);
preloadAssets();
orchestrate();
initWorld();
