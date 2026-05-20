import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reviewApi, type Review } from '@/api/review'
import { Plus, CheckCircle, Star, ClipboardList } from 'lucide-react'
import { formatDate } from '@/utils/date'
import { useTheme } from '@/utils/theme'

export function ReviewList() {
  const { pick } = useTheme()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    reviewApi.list(filter || undefined).then((res) => {
      setReviews(res.data)
    }).finally(() => setLoading(false))
  }, [filter])

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className={`h-8 w-8 animate-spin rounded-full border-2 ${pick('border-indigo-900', 'border-indigo-100')} ${pick('border-t-indigo-400', 'border-t-indigo-600')}`} />
    </div>
  )

  const typeLabels: Record<string, string> = { weekly: '周复盘', monthly: '月复盘', yearly: '年复盘' }
  const typeBadgeColors: Record<string, string> = {
    weekly: pick('bg-indigo-500/10 text-indigo-400', 'bg-indigo-50 text-indigo-600'),
    monthly: pick('bg-violet-500/10 text-violet-400', 'bg-violet-50 text-violet-600'),
    yearly: pick('bg-rose-500/10 text-rose-400', 'bg-rose-50 text-rose-600'),
  }
  const typeBtnColors: Record<string, string> = {
    weekly: pick('border-blue-500/20 text-blue-400 hover:bg-blue-500/10', 'border-blue-200 text-blue-600 hover:bg-blue-50'),
    monthly: pick('border-violet-500/20 text-violet-400 hover:bg-violet-500/10', 'border-violet-200 text-violet-600 hover:bg-violet-50'),
    yearly: pick('border-rose-500/20 text-rose-400 hover:bg-rose-500/10', 'border-rose-200 text-rose-600 hover:bg-rose-50'),
  }

  const filterBase = 'rounded-xl px-4 py-2 text-sm font-medium transition-all'
  const filterActive = 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
  const filterInactive = `${pick('border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]', 'border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100')}`

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${pick('text-white', 'text-slate-900')}`}>复盘</h2>
          <p className={`mt-1 text-sm ${pick('text-slate-400', 'text-slate-500')}`}>总结反思，持续成长</p>
        </div>
        <div className="flex gap-2">
          {(['weekly', 'monthly', 'yearly'] as const).map((t) => (
            <Link
              key={t}
              to={`/review/new?type=${t}`}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all hover:shadow-md ${typeBtnColors[t]}`}
            >
              <Plus className="h-3.5 w-3.5" />
              {typeLabels[t]}
            </Link>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button onClick={() => setFilter(null)} className={`${filterBase} ${!filter ? filterActive : filterInactive}`}>全部</button>
        {Object.entries(typeLabels).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)} className={`${filterBase} ${filter === k ? filterActive : filterInactive}`}>{v}</button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl glass-card py-16">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${pick('bg-white/[0.03]', 'bg-slate-50')}`}>
            <ClipboardList className={`h-8 w-8 ${pick('text-slate-600', 'text-slate-500')}`} />
          </div>
          <p className={`mt-4 text-sm ${pick('text-slate-500', 'text-slate-400')}`}>还没有复盘记录</p>
          <Link to="/review/new?type=weekly" className={`mt-3 text-sm font-medium ${pick('text-indigo-400 hover:text-indigo-300', 'text-indigo-600 hover:text-indigo-700')}`}>
            开始第一次复盘 →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <Link
              key={r.id}
              to={`/review/${r.id}`}
              className="group flex items-center justify-between rounded-2xl glass-card p-5 shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${typeBadgeColors[r.type]}`}>
                  {r.is_completed ? <CheckCircle className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${typeBadgeColors[r.type]}`}>
                      {typeLabels[r.type]}
                    </span>
                    <span className={`text-sm font-semibold ${pick('text-slate-200', 'text-slate-800')}`}>
                      {r.title || `${formatDate(r.period_start, 'M/d')} - ${formatDate(r.period_end, 'M/d')}`}
                    </span>
                  </div>
                  <p className={`mt-1 text-xs ${pick('text-slate-500', 'text-slate-400')}`}>{r.period_start} ~ {r.period_end}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {r.mood_score && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: Math.min(r.mood_score, 5) }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${pick('fill-indigo-400 text-indigo-400', 'fill-indigo-500 text-indigo-500')}`} />
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
