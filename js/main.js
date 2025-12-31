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
        
        // 2. Hardware Concurrency
        const lowCoreCount = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

        if (prefersReducedMotion) {
            console.log('PDI: Reduced motion preference detected.');
        }
        if (lowCoreCount) {
            console.log(`PDI: Low core count detected (${navigator.hardwareConcurrency}).`);
        }

        return prefersReducedMotion || lowCoreCount;
    }

    if (checkPerformanceSignals()) {
        body.classList.add('low-fi');
        console.log('PDI: Low-fidelity mode enabled based on device signals.');
    }
});
