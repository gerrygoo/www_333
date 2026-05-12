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
    logoElement: null
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

    const interval = setInterval(() => {
        if (!state.isGlitching) {
            clearInterval(interval);
            state.logoElement.src = CONFIG.ORIGINAL_LOGO;
            return;
        }
        state.logoElement.src = getRandomAsset();
    }, CONFIG.SWAP_INTERVAL);
}

function orchestrate() {
    if (!state.isGlitching && Math.random() < CONFIG.GLITCH_PROBABILITY) {
        state.isGlitching = true;
        document.body.classList.add('is-glitching');

        startAssetGlitch();

        setTimeout(() => {
            state.isGlitching = false;
            document.body.classList.remove('is-glitching');
        }, CONFIG.GLITCH_DURATION);
    }

    const wait = CONFIG.GLITCH_WAIT_MIN + Math.random() * (CONFIG.GLITCH_WAIT_MAX - CONFIG.GLITCH_WAIT_MIN);
    setTimeout(orchestrate, wait);
}

document.addEventListener('DOMContentLoaded', () => {
    state.logoElement = document.querySelector('.hero__logo');

    if (!document.body.classList.contains('low-fi')) {
        preloadAssets();
        orchestrate();
    }
});
