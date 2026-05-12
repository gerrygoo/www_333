/**
 * Paranormal Dynamics, Inc. - Glitch Orchestrator
 * Controls the frequency and intensity of visual "corruption" events.
 */

const CONFIG = {
    // How often to check if a glitch should start (in ms)
    GLITCH_CHECK_INTERVAL: 3000,
    // Probability of a glitch burst starting (0.0 to 1.0)
    GLITCH_PROBABILITY: 0.66,
    // How long a glitch burst lasts (in ms)
    GLITCH_DURATION: 800,
    // Interval between asset swaps during a burst (in ms)
    SWAP_INTERVAL: 100,
    // The original logo path
    ORIGINAL_LOGO: 'images/logos/pdi_logo_v2.6_black.png',
    // All available cryptic assets
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
        'images/symbols/texturelabs_vector_310_1.svg',
        'images/textures/texturelabs_vector_136.svg',
        'images/textures/texturelabs_vector_140.svg',
        'images/textures/texturelabs_vector_168.svg',
        'images/textures/texturelabs_vector_199.svg',
        'images/textures/texturelabs_vector_201.svg',
        'images/textures/texturelabs_vector_204.svg',
        'images/textures/texturelabs_vector_207.svg',
        'images/textures/texturelabs_vector_231.svg',
        'images/textures/texturelabs_vector_232.svg',
        'images/textures/texturelabs_vector_267.svg',
        'images/textures/texturelabs_vector_290.svg',
        'images/textures/texturelabs_vector_291.svg',
        'images/textures/texturelabs_vector_304.svg',
        'images/textures/texturelabs_vector_304_1.svg',
        'images/textures/texturelabs_vector_310.svg',
        'images/textures/texturelabs_vector_310_1.svg'
    ]
};

const state = {
    isGlitching: false,
    logoElement: null
};

/**
 * Preload assets to prevent white flashes during glitches
 */
function preloadAssets() {
    CONFIG.ASSETS.forEach(path => {
        const img = new Image();
        img.src = path;
    });
}

/**
 * Select a random asset from the pool
 */
function getRandomAsset() {
    return CONFIG.ASSETS[Math.floor(Math.random() * CONFIG.ASSETS.length)];
}

/**
 * Triggers a rapid-fire swap of assets
 */
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

/**
 * The main orchestrator loop
 */
function orchestrate() {
    // Check if we should start a glitch
    if (!state.isGlitching && Math.random() < CONFIG.GLITCH_PROBABILITY) {
        state.isGlitching = true;
        document.body.classList.add('is-glitching');
        
        startAssetGlitch();

        // End the glitch after the duration
        setTimeout(() => {
            state.isGlitching = false;
            document.body.classList.remove('is-glitching');
        }, CONFIG.GLITCH_DURATION);
    }

    // Schedule next check
    setTimeout(orchestrate, CONFIG.GLITCH_CHECK_INTERVAL);
}

/**
 * Initialize on load
 */
document.addEventListener('DOMContentLoaded', () => {
    state.logoElement = document.querySelector('.hero__logo');
    
    // Check for performance mode
    const isLowFi = document.body.classList.contains('low-fi');
    
    if (!isLowFi) {
        preloadAssets();
        orchestrate();
    }
});
