/* today_book/frontend/src/api/diary.ts */
import apiClient from './client'

export interface Diary {
  id: number
  user_id: number
  date: string
  title?: string | null
  content?: string | null
  mood?: string | null
  weather?: string | null
  tags?: string[] | null
  created_at: string
  updated_at: string
}

export interface CalendarDay {
  date: string
  has_entry: boolean
  mood?: string
}

export const diaryApi = {
  list: (params?: { year?: number; month?: number; page?: number; page_size?: number }) =>
    apiClient.get<Diary[]>('/diary/', { params }),

  getByDate: (date: string) =>
    apiClient.get<Diary>(`/diary/${date}`),

  upsert: (data: Partial<Diary>) =>
    apiClient.post<Diary>('/diary/', data),

  delete: (date: string) =>
    apiClient.delete(`/diary/${date}`),

  getCalendar: (year: number, month: number) =>
    apiClient.get<CalendarDay[]>(`/diary/calendar/${year}/${month}`),
}
