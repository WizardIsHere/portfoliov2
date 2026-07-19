import { create } from 'zustand';

// Holds the live Lenis instance (see components/SmoothScroll.jsx) so any
// component can route a scroll through it — e.g. Nav/CommandPalette section
// jumps — instead of triggering a native scroll that fights Lenis's own.
const useLenisStore = create((set) => ({
    lenis: null,
    setLenis: (lenis) => set({ lenis }),
}));

export default useLenisStore;
