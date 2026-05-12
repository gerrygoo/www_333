const CONFIG = {
    GLITCH_WAIT_MIN: 400,
    GLITCH_WAIT_MAX: 3500,
    GLITCH_PROBABILITY: 0.82,
    GLITCH_DURATION: 800,
    SWAP_INTERVAL: 100,
    ORIGINAL_LOGO: 'images/logos/pdi_logo_v2.6_black.png',
    WARP_AMBIENT: 20,
    WARP_VELOCITY_FACTOR: 0.9,
    WARP_MAX_SCALE: 65,
    WARP_RADIUS_BASE: 140,
    WARP_RADIUS_VELOCITY_FACTOR: 0.4,
    WARP_SEED_SPEED: 0.03,
    WARP_SEED_VELOCITY_FACTOR: 0.18,
    WARP_RGB_BOOST_THRESHOLD: 3,
    WARP_RGB_BOOST_FACTOR: 0.08,
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
    hasMouseMoved: false,
    warpTurbulence: null,
    warpDisplace: null,
    cursorGlow: null,
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
    state.warpTurbulence = document.querySelector('#warp-turbulence');
    state.warpDisplace = document.querySelector('#warp-displace');
    state.cursorGlow = document.querySelector('.cursor-glow');

    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d');
    const warpMaskImg = document.querySelector('#warp-mask-img');

    function updateMaskCanvas(cx, cy, r) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (maskCanvas.width !== w || maskCanvas.height !== h) {
            maskCanvas.width = w;
            maskCanvas.height = h;
        }
        maskCtx.clearRect(0, 0, w, h);
        const grad = maskCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.7, 'rgba(255,255,255,0.15)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        maskCtx.fillStyle = grad;
        maskCtx.fillRect(0, 0, w, h);
        if (warpMaskImg) warpMaskImg.setAttribute('href', maskCanvas.toDataURL());
    }

    // Set filter and feImage to explicit px dimensions so filterUnits="userSpaceOnUse"
    // resolves correctly (percentage attrs on feImage resolve against the hidden SVG's
    // 0×0 viewport otherwise, clipping the mask to nothing).
    const warpFilter = document.querySelector('#cursor-warp');
    function setWarpDimensions() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (warpFilter) { warpFilter.setAttribute('width', w); warpFilter.setAttribute('height', h); }
        if (warpMaskImg) { warpMaskImg.setAttribute('width', w); warpMaskImg.setAttribute('height', h); }
    }
    setWarpDimensions();
    window.addEventListener('resize', setWarpDimensions);

    let prevX = 0;
    let prevY = 0;

    document.addEventListener('mousemove', e => {
        if (!state.hasMouseMoved) {
            state.hasMouseMoved = true;
            document.body.classList.add('has-cursor');
        }
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
        const dx = state.cursorX - prevX;
        const dy = state.cursorY - prevY;
        prevX = state.cursorX;
        prevY = state.cursorY;

        const rawSpeed = Math.sqrt(dx * dx + dy * dy);
        state.warpSpeed = state.warpSpeed + (rawSpeed - state.warpSpeed) * 0.08;

        const targetScale = Math.min(
            CONFIG.WARP_AMBIENT + state.warpSpeed * CONFIG.WARP_VELOCITY_FACTOR,
            CONFIG.WARP_MAX_SCALE
        );
        state.warpScale = state.warpScale + (targetScale - state.warpScale) * 0.05;

        state.warpSeed += CONFIG.WARP_SEED_SPEED + state.warpSpeed * CONFIG.WARP_SEED_VELOCITY_FACTOR;
        const seed = Math.floor(state.warpSeed) % 999;
        const radius = CONFIG.WARP_RADIUS_BASE + state.warpSpeed * CONFIG.WARP_RADIUS_VELOCITY_FACTOR;

        if (state.warpTurbulence) state.warpTurbulence.setAttribute('seed', seed);
        if (state.warpDisplace) state.warpDisplace.setAttribute('scale', state.warpScale.toFixed(2));
        updateMaskCanvas(state.cursorX, state.cursorY, radius);
        if (state.cursorGlow) {
            state.cursorGlow.style.setProperty('--cx', state.cursorX + 'px');
            state.cursorGlow.style.setProperty('--cy', state.cursorY + 'px');
        }

        requestAnimationFrame(warpLoop);
    }

    requestAnimationFrame(warpLoop);
}

document.addEventListener('DOMContentLoaded', () => {
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
        preloadAssets();
        orchestrate();
        animateFilters();
        initCursorWarp();
    }
});
