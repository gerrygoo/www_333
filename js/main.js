const CONFIG = {
    GLITCH_WAIT_MIN: 400,
    GLITCH_WAIT_MAX: 3500,
    GLITCH_PROBABILITY: 0.82,
    GLITCH_DURATION: 800,
    SWAP_INTERVAL: 100,
    ORIGINAL_LOGO: 'images/logos/pdi_logo_v2.6_black.png',
    WARP_AMBIENT: 40,
    WARP_VELOCITY_FACTOR: 0.54,
    WARP_MAX_SCALE: 150,
    WARP_RADIUS_BASE: 420,
    WARP_RADIUS_VELOCITY_FACTOR: 0.24,
    WARP_SEED_SPEED: 0.08,
    WARP_SEED_VELOCITY_FACTOR: 0.11,
    WARP_RGB_BOOST_THRESHOLD: 3,
    WARP_RGB_BOOST_FACTOR: 0.05,
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
    state.warpDisplace = document.querySelector('#warp-displace');
    state.cursorGlow = document.querySelector('.cursor-glow');

    const dispCanvas = document.createElement('canvas');
    const dispCtx = dispCanvas.getContext('2d');
    const warpDispImg = document.querySelector('#warp-disp-img');
    let imageData = null;

    function drawDispMap(cx, cy, radius, phase) {
        const diam = Math.ceil(radius * 2) + 4;
        if (dispCanvas.width !== diam || dispCanvas.height !== diam) {
            dispCanvas.width = diam;
            dispCanvas.height = diam;
            imageData = null;
        }
        if (!imageData) imageData = dispCtx.createImageData(diam, diam);
        imageData.data.fill(0);

        const half = diam / 2;
        const wavelength = radius * 0.6;
        const radSq = radius * radius;

        for (let y = 0; y < diam; y++) {
            for (let x = 0; x < diam; x++) {
                const dx = x - half;
                const dy = y - half;
                const distSq = dx * dx + dy * dy;
                const idx = (y * diam + x) * 4;
                if (distSq > radSq) {
                    imageData.data[idx] = 128;
                    imageData.data[idx + 1] = 128;
                    continue;
                }
                const dist = Math.sqrt(distSq);
                const t = dist / radius;
                const mask = 0.5 * (1 + Math.cos(t * Math.PI));
                const ripple = Math.sin(dist / wavelength - phase);
                const dispMag = ripple * mask;
                let rVal = 128, gVal = 128;
                if (dist > 0.5) {
                    rVal = 128 + Math.round((dx / dist) * dispMag * 127);
                    gVal = 128 + Math.round((dy / dist) * dispMag * 127);
                    rVal = Math.max(0, Math.min(255, rVal));
                    gVal = Math.max(0, Math.min(255, gVal));
                }
                imageData.data[idx]     = rVal;
                imageData.data[idx + 1] = gVal;
                imageData.data[idx + 2] = 0;
                imageData.data[idx + 3] = Math.round(mask * 255);
            }
        }
        dispCtx.putImageData(imageData, 0, 0);

        const imgX = Math.round(cx - half);
        const imgY = Math.round(cy - half);
        if (warpDispImg) {
            warpDispImg.setAttribute('x', imgX);
            warpDispImg.setAttribute('y', imgY);
            warpDispImg.setAttribute('width', diam);
            warpDispImg.setAttribute('height', diam);
            warpDispImg.setAttribute('href', dispCanvas.toDataURL());
        }
        if (state.warpDisplace) {
            state.warpDisplace.setAttribute('scale', state.warpScale.toFixed(1));
        }
    }

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

        const radius = CONFIG.WARP_RADIUS_BASE + state.warpSpeed * CONFIG.WARP_RADIUS_VELOCITY_FACTOR;

        drawDispMap(state.cursorX, state.cursorY, radius, state.warpSeed);

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
