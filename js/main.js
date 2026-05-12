const VERSION = '1.0.1';

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
    WARP_RADIUS_BASE: 900,
    WARP_RADIUS_VELOCITY_FACTOR: 0.24,
    WARP_SEED_SPEED: 0.08,
    WARP_SEED_VELOCITY_FACTOR: 0.11,
    WARP_MAX_SEED_INCREMENT: 0.10,
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
    warpPulse: 0,
    warpDirX: 0,
    warpDirY: 0,
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

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log('PDI warp: isSafari=' + isSafari + ' ua=' + navigator.userAgent.slice(0, 80));
    let warpTurbulence = null;
    let turbOffset = 0;

    if (isSafari) {
        // Safari's feImage ignores dynamic href changes inside filters — rebuild to feTurbulence
        const filter = document.querySelector('#cursor-warp');
        if (filter) {
            filter.setAttribute('x', '-5%');
            filter.setAttribute('y', '-5%');
            filter.setAttribute('width', '110%');
            filter.setAttribute('height', '110%');
            filter.removeAttribute('filterUnits');
            while (filter.firstChild) filter.removeChild(filter.firstChild);
            const ns = 'http://www.w3.org/2000/svg';
            const turb = document.createElementNS(ns, 'feTurbulence');
            turb.setAttribute('type', 'fractalNoise');
            turb.setAttribute('baseFrequency', '0.006 0.005');
            turb.setAttribute('numOctaves', '3');
            turb.setAttribute('seed', '42');
            turb.setAttribute('result', 'noise');
            filter.appendChild(turb);
            const disp = document.createElementNS(ns, 'feDisplacementMap');
            disp.setAttribute('in', 'SourceGraphic');
            disp.setAttribute('in2', 'noise');
            disp.setAttribute('scale', '0');
            disp.setAttribute('xChannelSelector', 'R');
            disp.setAttribute('yChannelSelector', 'G');
            filter.appendChild(disp);
            warpTurbulence = turb;
            state.warpDisplace = disp;
            console.log('PDI safari: rebuilt. children=' + filter.childElementCount + ' turb=' + turb.tagName + ' disp=' + disp.tagName + ' scale=' + disp.getAttribute('scale'));
        }
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
            uniform float u_r,u_phase,u_pulse;
            uniform vec2 u_lag;
            void main(){
                float diam=u_r*2.+4.;
                vec2 d=vec2(gl_FragCoord.x/${MAP_SIZE}.-0.5, 0.5-gl_FragCoord.y/${MAP_SIZE}.)*diam;
                float dist=length(d);
                if(dist>u_r){gl_FragColor=vec4(.502,.502,0.,0.);return;}
                float t=dist/u_r;
                float mask=.5*(1.+cos(t*3.14159265));
                vec2 ld=d-u_lag;
                float pd=length(ld);
                float wd=pd*pd/u_r;
                float ripple=sin(wd/(u_r*.35)-u_phase);
                float mag=ripple*mask*u_pulse;
                vec2 dir=dist>.5?d/dist:vec2(0.);
                gl_FragColor=vec4(
                    clamp(.502+dir.x*mag*.498,0.,1.),
                    clamp(.502+dir.y*mag*.498,0.,1.),
                    0.,mask);
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
            if (state.warpPulse > 0.01) {
                const lagStrength = state.warpPulse * Math.min(state.warpSpeed * 3, radius * 0.3);
                drawDispMap(
                    state.cursorX, state.cursorY, radius,
                    state.warpSeed, state.warpPulse,
                    -state.warpDirX * lagStrength,
                    -state.warpDirY * lagStrength
                );
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('PDI v' + VERSION);
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
