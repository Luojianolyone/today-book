import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { itemApi, type Item } from '@/api/item'
import { Plus, Package, Search, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '@/utils/theme'
import { demoItems } from '@/data/demo'

const PAGE_SIZE = 30
const IS_DEMO = window.location.hostname.includes('github.io')

export function ItemList() {
  const { pick } = useTheme()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<{ total_items: number; total_value: number } | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const loadItems = useCallback((p: number) => {
    if (IS_DEMO) {
      setItems(demoItems as Item[])
      setStats({ total_items: demoItems.length, total_value: demoItems.reduce((s, i) => s + (i.current_value || 0), 0) })
      setHasMore(false)
      setPage(1)
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      itemApi.list({ page: p, page_size: PAGE_SIZE }),
      itemApi.getStats(),
    ]).then(([itemsRes, statsRes]) => {
      setItems(itemsRes.data)
      setHasMore(itemsRes.data.length === PAGE_SIZE)
      setStats(statsRes.data)
      setPage(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadItems(1)
  }, [loadItems])

  const filtered = search
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || (i.asset_tag?.toLowerCase().includes(search.toLowerCase()) ?? false))
    : items

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className={`h-8 w-8 animate-spin rounded-full border-2 ${pick('border-indigo-900', 'border-indigo-100')} ${pick('border-t-indigo-400', 'border-t-indigo-600')}`} />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${pick('text-white', 'text-slate-900')}`}>物品</h2>
          <p className={`mt-1 text-sm ${pick('text-slate-400', 'text-slate-500')}`}>管理你的个人资产</p>
        </div>
        <Link
          to="/items/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          添加物品
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl glass-card p-5 shadow-lg">
            <div className={`flex items-center gap-2 ${pick('text-slate-400', 'text-slate-500')}`}>
              <Package className="h-4 w-4" />
              <span className="text-xs font-medium">物品总数</span>
            </div>
            <p className={`mt-3 text-2xl font-bold ${pick('text-white', 'text-slate-900')}`}>{stats.total_items}</p>
          </div>
          <div className={`rounded-2xl p-5 shadow-lg ${pick('bg-violet-500/[0.06] border-violet-500/10', 'bg-violet-50 border-violet-200')}`}>
            <div className={`flex items-center gap-2 ${pick('text-violet-400', 'text-violet-600')}`}>
              <Tag className="h-4 w-4" />
              <span className="text-xs font-medium">总价值</span>
            </div>
            <p className={`mt-3 text-2xl font-bold ${pick('text-violet-400', 'text-violet-600')}`}>¥{stats.total_value.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${pick('text-slate-500', 'text-slate-400')}`} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索物品..."
          className={`w-full rounded-xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} pl-11 pr-4 py-3 text-sm ${pick('text-white', 'text-slate-900')} backdrop-blur-sm ${pick('placeholder:text-slate-600', 'placeholder:text-slate-500')} focus:border-indigo-500/30 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500/10`}
        />
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl glass-card py-16">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${pick('bg-white/[0.03]', 'bg-slate-50')} text-3xl`}>📦</div>
          <p className={`mt-4 text-sm ${pick('text-slate-500', 'text-slate-400')}`}>{search ? '没有匹配的物品' : '还没有物品记录'}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              to={`/items/${item.id}`}
              className="group rounded-2xl glass-card p-5 shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm font-semibold ${pick('text-slate-200', 'text-slate-800')}`}>{item.name}</p>
                  {item.asset_tag && (
                    <p className={`mt-0.5 text-xs ${pick('text-slate-500', 'text-slate-400')}`}>{item.asset_tag}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`rounded-lg ${pick('bg-white/[0.04]', 'bg-slate-100')} px-2.5 py-1 text-xs font-medium ${pick('text-slate-400', 'text-slate-500')}`}>
                  数量: {item.quantity}
                </span>
                {item.current_value != null && (
                  <span className={`text-sm font-bold ${pick('text-indigo-400', 'text-indigo-600')}`}>¥{item.current_value.toLocaleString()}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {items.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => loadItems(page - 1)}
            disabled={page <= 1 || loading}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${pick('border-white/[0.08]', 'border-slate-200')} ${pick('text-slate-400 hover:bg-white/[0.06]', 'text-slate-500 hover:bg-slate-100')} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className={`text-sm font-medium ${pick('text-slate-400', 'text-slate-500')}`}>第 {page} 页</span>
          <button
            onClick={() => loadItems(page + 1)}
            disabled={!hasMore || loading}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${pick('border-white/[0.08]', 'border-slate-200')} ${pick('text-slate-400 hover:bg-white/[0.06]', 'text-slate-500 hover:bg-slate-100')} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
