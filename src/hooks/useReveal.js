import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Shared scroll-in reveal. Point `scope` (a ref) at a container; every
// descendant with the `.reveal` class fades + rises in, staggered, once, when
// the container enters the viewport. Snaps straight to visible under reduced
// motion. Keeps section entrances consistent instead of each rolling its own.
const useReveal = (scope, { y = 24, stagger = 0.08, start = 'top 82%' } = {}) => {
    useGSAP(
        () => {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const items = scope.current?.querySelectorAll('.reveal');
            if (!items?.length) return;

            if (reduce) {
                gsap.set(items, { opacity: 1, y: 0 });
                return;
            }

            gsap.set(items, { opacity: 0, y });
            gsap.to(items, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out',
                stagger,
                scrollTrigger: { trigger: scope.current, start, once: true },
            });
        },
        { scope }
    );
};

export default useReveal;
