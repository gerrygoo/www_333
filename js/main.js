const CONFIG = {
    GLITCH_WAIT_MIN: 400,
    GLITCH_WAIT_MAX: 3500,
    GLITCH_PROBABILITY: 0.82,
    GLITCH_DURATION: 800,
    SWAP_INTERVAL: 100,
    ORIGINAL_LOGO: 'images/logos/pdi_logo_v2.6_black.png',
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
        if (state.filterRedBaseline) {
            state.filterRedBaseline.setAttribute('dx', (-offset).toFixed(1));
            state.filterRedBaseline.setAttribute('dy', (-dy).toFixed(1));
        }
        if (state.filterBlueBaseline) {
            state.filterBlueBaseline.setAttribute('dx', offset.toFixed(1));
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
    }
});
