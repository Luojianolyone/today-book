/* today_book/frontend/src/api/client.ts */
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Store navigate function for use in interceptors
let navigateFn: ((path: string) => void) | null = null
export const setNavigate = (navigate: (path: string) => void) => {
  navigateFn = navigate
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      // Use React Router navigate if available, fallback to window.location
      if (navigateFn) {
        navigateFn('/login')
      } else {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
    // Show user-friendly error message
    const detail = error.response?.data?.detail
    if (Array.isArray(detail)) {
      detail.forEach((d: { msg: string }) => toast.error(d.msg))
    } else if (typeof detail === 'string') {
      toast.error(detail)
    } else if (!error.response) {
      toast.error('网络连接失败，请检查服务是否运行')
    }
    return Promise.reject(error)
  },
)

export default apiClient
