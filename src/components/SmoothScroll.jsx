import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useLenisStore from '#store/lenis.js';

// Headless: drives the site's smooth/weighty scroll feel. Skipped entirely
// under prefers-reduced-motion — inertia scrolling is a known nausea trigger
// for motion-sensitive users (not just a nicety to gate), so there's no
// "reduced" version of this, only on or off.
const SmoothScroll = () => {
    const setLenis = useLenisStore((s) => s.setLenis);

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;

        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cubic, matches the rest of the site's motion
        });
        setLenis(lenis);

        // Keep GSAP's ScrollTrigger positions in sync with Lenis's virtual
        // scroll position — without this, the Services stagger reveal
        // (Services.jsx) fires at the wrong scroll offset.
        lenis.on('scroll', ScrollTrigger.update);

        // Drive Lenis's raf loop from GSAP's own ticker (one rAF loop instead
        // of two competing ones), and turn off GSAP's lag smoothing since
        // Lenis already handles its own frame timing.
        const tick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(tick);
            lenis.destroy();
            setLenis(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};

export default SmoothScroll;
