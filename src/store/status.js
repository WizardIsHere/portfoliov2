import { create } from 'zustand';

// Drives the Hero's status pill and the ⌘K palette's hidden `sudo` easter egg
// (see CommandPalette.jsx). One shared store so both can read/flip the same state.
const useStatusStore = create((set, get) => ({
    status: 'operational', // 'operational' | 'degraded'
    toast: null, // { title, message } | null

    triggerEasterEgg: () => {
        if (get().status === 'degraded') return; // already mid-incident, ignore repeats

        set({ status: 'degraded', toast: { title: 'incident detected', message: 'status flipped to degraded…' } });

        setTimeout(() => {
            set({ status: 'operational', toast: { title: 'incident resolved: hired', message: 'all systems operational again.' } });
            setTimeout(() => set((s) => (s.toast?.title === 'incident resolved: hired' ? { toast: null } : {})), 4000);
        }, 3000);
    },

    dismissToast: () => set({ toast: null }),
}));

export default useStatusStore;
