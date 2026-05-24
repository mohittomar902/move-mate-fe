import { create } from 'zustand'

interface AppState {
  isLoading: boolean
  toasts: Toast[]
  setLoading: (loading: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  toasts: [],

  setLoading: (isLoading) => set({ isLoading }),

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
