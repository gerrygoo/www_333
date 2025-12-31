/**
 * Adaptive Performance Logic for Paranormal Dynamics, Inc.
 * Detects device capabilities and user preferences to toggle high-intensity effects.
 */

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    /**
     * Checks if the device should use low-fidelity effects.
     * @returns {boolean}
     */
    function checkPerformanceSignals() {
        // 1. Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // 2. Simple device proxy: Screen width (mobile devices often have less GPU power for complex CSS filters)
        const isSmallScreen = window.innerWidth <= 768;

        // 3. Hardware Concurrency (optional, but a good signal if available)
        const lowCoreCount = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

        return prefersReducedMotion || isSmallScreen || lowCoreCount;
    }

    if (checkPerformanceSignals()) {
        body.classList.add('low-fi');
        console.log('PDI: Low-fidelity mode enabled based on device signals.');
    }
});
