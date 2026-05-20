/* today_book/frontend/src/api/item.ts */
import apiClient from './client'

export interface ItemCategory {
  id: number
  name: string
  parent_id?: number
}

export interface ItemLocation {
  id: number
  name: string
  parent_id?: number
}

export interface Item {
  id: number
  name: string
  description?: string
  category_id?: number
  location_id?: number
  purchase_date?: string
  purchase_price?: number
  current_value?: number
  quantity: number
  is_consumable: boolean
  warranty_expire?: string
  notes?: string
  asset_tag?: string
  is_archived: boolean
  created_at: string
}

export const itemApi = {
  list: (params?: Record<string, unknown>) => apiClient.get<Item[]>('/items/', { params }),
  get: (id: number) => apiClient.get<Item>(`/items/${id}`),
  create: (data: Partial<Item>) => apiClient.post<Item>('/items/', data),
  update: (id: number, data: Partial<Item>) => apiClient.put<Item>(`/items/${id}`, data),
  delete: (id: number) => apiClient.delete(`/items/${id}`),
  getCategories: () => apiClient.get<ItemCategory[]>('/items/categories'),
  createCategory: (data: { name: string; parent_id?: number }) => apiClient.post('/items/categories', data),
  getLocations: () => apiClient.get<ItemLocation[]>('/items/locations'),
  createLocation: (data: { name: string; parent_id?: number }) => apiClient.post('/items/locations', data),
  getStats: () => apiClient.get('/items/stats/summary'),
}
