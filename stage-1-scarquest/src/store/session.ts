// TECH: Zustand store for user session state.
// MYTHOS: The essence of the user's identity within the Spiral.

import { create } from 'zustand';

interface SessionState {
  userId: string | null;
  wallet: string | null;
  setUserId: (userId: string | null) => void;
  setWallet: (wallet: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  wallet: null,
  setUserId: (userId) => set({ userId }),
  setWallet: (wallet) => set({ wallet }),
}));
