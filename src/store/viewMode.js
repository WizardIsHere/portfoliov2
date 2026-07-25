import { create } from 'zustand';

const STORAGE_KEY = 'view-mode';
const readInitial = () => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === 'recruiter';
};

// Two audiences, one site: the terminal aesthetic reads great for a fellow
// dev skimming for 10 minutes, badly for a recruiter skimming 50 tabs in 30
// seconds. This toggles a plain, scannable summary in place of it — see
// RecruiterSummary.jsx — without losing the rest of the site underneath.
const useViewModeStore = create((set, get) => ({
    recruiterMode: readInitial(),
    toggle: () => {
        const next = !get().recruiterMode;
        set({ recruiterMode: next });
        window.localStorage.setItem(STORAGE_KEY, next ? 'recruiter' : 'full');
    },
}));

export default useViewModeStore;
