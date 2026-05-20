/* today_book/frontend/src/stores/authStore.ts */
import { create } from 'zustand'

interface AuthState {
  token: string | null
  userId: number | null
  username: string | null
  isLoggedIn: boolean
  login: (token: string, userId: number, username: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('token')
  const savedUserId = localStorage.getItem('userId')
  const savedUsername = localStorage.getItem('username')

  return {
    token: savedToken,
    userId: savedUserId ? parseInt(savedUserId) : null,
    username: savedUsername,
    isLoggedIn: !!savedToken,
    login: (token, userId, username) => {
      localStorage.setItem('token', token)
      localStorage.setItem('userId', String(userId))
      localStorage.setItem('username', username)
      set({ token, userId, username, isLoggedIn: true })
    },
    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      set({ token: null, userId: null, username: null, isLoggedIn: false })
    },
  }
})
