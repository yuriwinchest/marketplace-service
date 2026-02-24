
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '../types'

interface AuthStore {
  auth: AuthState
  setAuth: (auth: AuthState) => void
  updateUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      auth: { state: 'anonymous' },
      setAuth: (auth) => set({ auth }),
      updateUser: (user) =>
        set((state) => {
          if (state.auth.state === 'authenticated') {
            return {
              auth: { ...state.auth, user }
            }
          }
          return state
        }),
      logout: () => set({ auth: { state: 'anonymous' } })
    }),
    {
      name: 'marketplace-auth'
    }
  )
)
