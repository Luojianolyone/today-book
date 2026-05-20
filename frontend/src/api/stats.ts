/* today_book/frontend/src/api/stats.ts */
import apiClient from './client'

export const statsApi = {
  getDashboard: () => apiClient.get('/stats/dashboard'),
}
