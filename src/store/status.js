import { create } from 'zustand';

// Drives the Hero's status pill and the hidden easter eggs triggered from the
// ⌘K palette, the Terminal, and clicking the status dot itself — one shared
// store so all three can read/flip the same state.
const useStatusStore = create((set, get) => ({
    status: 'operational', // 'operational' | 'degraded'
    toast: null, // { title, message } | null
    matrixActive: false,

    triggerEasterEgg: () => {
        if (get().status === 'degraded') return; // already mid-incident, ignore repeats

        set({ status: 'degraded', toast: { title: 'incident detected', message: 'status flipped to degraded…' } });

        setTimeout(() => {
            set({ status: 'operational', toast: { title: 'incident resolved: hired', message: 'all systems operational again.' } });
            setTimeout(() => set((s) => (s.toast?.title === 'incident resolved: hired' ? { toast: null } : {})), 4000);
        }, 3000);
    },

    triggerMatrix: () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            set({ toast: { title: 'reduced motion is on', message: 'the matrix has you… but gently.' } });
            setTimeout(() => set((s) => (s.toast?.title === 'reduced motion is on' ? { toast: null } : {})), 3000);
            return;
        }
        if (get().matrixActive) return;
        set({ matrixActive: true });
        setTimeout(() => set({ matrixActive: false }), 3000);
    },

    dismissToast: () => set({ toast: null }),
}));

export default useStatusStore;
