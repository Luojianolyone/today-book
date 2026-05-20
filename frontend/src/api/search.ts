/* today_book/frontend/src/api/search.ts */
import apiClient from './client'

export interface SearchResultItem {
  type: 'diary' | 'transaction' | 'item' | 'review'
  id: number
  title: string
  subtitle: string
  date: string
  url: string
  mood?: string
  asset_tag?: string
  current_value?: number
  amount?: number
  tx_type?: string
  review_type?: string
  period?: string
}

export interface SearchResponse {
  diaries: Array<{ id: number; date: string; title?: string | null; mood?: string | null; type: string }>
  items: Array<{ id: number; name: string; asset_tag?: string | null; current_value?: number | null; type: string }>
  transactions: Array<{ id: number; description?: string | null; amount: number; date: string; tx_type: string; type: string }>
  reviews: Array<{ id: number; title?: string | null; review_type: string; period: string; type: string }>
}

export const searchApi = {
  search: (q: string, limit = 5) =>
    apiClient.get<SearchResponse>('/search/', { params: { q, limit } }),
}

export function mapResults(resp: SearchResponse): SearchResultItem[] {
  const results: SearchResultItem[] = []

  resp.diaries.forEach((d) => {
    results.push({ type: 'diary', id: d.id, title: d.title || d.date, subtitle: d.date, date: d.date, url: `/diary/${d.date}`, mood: d.mood || undefined })
  })
  resp.items.forEach((i) => {
    results.push({ type: 'item', id: i.id, title: i.name, subtitle: i.asset_tag || '无标签', date: '', url: `/items/${i.id}`, asset_tag: i.asset_tag || undefined, current_value: i.current_value || undefined })
  })
  resp.transactions.forEach((t) => {
    results.push({ type: 'transaction', id: t.id, title: t.description || `${t.tx_type === 'income' ? '收入' : '支出'} ¥${t.amount}`, subtitle: `${t.date} · ¥${t.amount}`, date: t.date, url: '/finance', amount: t.amount, tx_type: t.tx_type })
  })
  resp.reviews.forEach((r) => {
    results.push({ type: 'review', id: r.id, title: r.title || `${r.review_type === 'weekly' ? '周' : r.review_type === 'monthly' ? '月' : '年'}复盘`, subtitle: r.period, date: r.period, url: `/review/${r.id}`, review_type: r.review_type, period: r.period })
  })

  return results
}
