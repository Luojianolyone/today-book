/* today_book/frontend/src/api/review.ts */
import apiClient from './client'

export interface Review {
  id: number
  type: string
  period_start: string
  period_end: string
  title?: string
  content?: string
  accomplishments?: string[] | string
  challenges?: string[] | string
  next_plans?: string[] | string
  mood_score?: number
  is_completed: boolean
  created_at: string
  updated_at: string
}

export const reviewApi = {
  list: (type?: string) => apiClient.get<Review[]>('/review/', type ? { params: { review_type: type } } : {}),
  get: (id: number) => apiClient.get<Review>(`/review/${id}`),
  create: (data: Partial<Review>) => apiClient.post<Review>('/review/', data),
  update: (id: number, data: Partial<Review>) => apiClient.put<Review>(`/review/${id}`, data),
  delete: (id: number) => apiClient.delete(`/review/${id}`),
  getTemplate: (type: string) => apiClient.get(`/review/template/${type}`),
  getStats: () => apiClient.get('/review/stats/summary'),
}
