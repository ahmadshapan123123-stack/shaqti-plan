import { create } from 'zustand';

const STORAGE_KEY = 'removebg_api_key';
const LEGACY_STORAGE_KEY = 'shaqti_removebg_key';
const THEME_KEY = 'shaqti_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

type SettingsState = {
  removeBgKey: string;
  theme: ThemeMode;
  setRemoveBgKey: (value: string) => void;
  setTheme: (value: ThemeMode) => void;
};

const loadKey = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

const loadTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    return 'light';
  } catch {
    return 'light';
  }
};

export const useSettingsStore = create<SettingsState>((set) => ({
  removeBgKey: loadKey(),
  theme: loadTheme(),
  setRemoveBgKey: (value) => set({ removeBgKey: value }),
  setTheme: (value) => set({ theme: value }),
}));

if (typeof window !== 'undefined') {
  useSettingsStore.subscribe((state) => {
    window.localStorage.setItem(STORAGE_KEY, state.removeBgKey);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.localStorage.setItem(THEME_KEY, state.theme);
  });
}

