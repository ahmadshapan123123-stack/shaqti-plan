import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  message: string | null;
  type: ToastType;
  visible: boolean;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
};

let hideTimer: number | undefined;

const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  visible: false,
  showToast: (message, type = 'info') => {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
    }
    set({ message, type, visible: true });
    hideTimer = window.setTimeout(() => {
      set({ visible: false });
      window.setTimeout(() => set({ message: null }), 220);
    }, 2000);
  },
  hideToast: () => {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
    }
    set({ visible: false });
    window.setTimeout(() => set({ message: null }), 220);
  },
}));

export const useToast = useToastStore;
