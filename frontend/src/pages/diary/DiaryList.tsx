import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { diaryApi, type Diary } from '@/api/diary'
import { formatDate } from '@/utils/date'
import { moodEmoji } from '@/utils/mood'
import { useTheme } from '@/utils/theme'
import { Plus, Calendar, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { demoDiaries } from '@/data/demo'

const PAGE_SIZE = 20
const IS_DEMO = window.location.hostname.includes('github.io')

export function DiaryList() {
  const { pick } = useTheme()
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  const loadDiaries = useCallback((p: number) => {
    if (IS_DEMO) {
      setDiaries(demoDiaries as Diary[])
      setHasMore(false)
      setPage(1)
      setLoading(false)
      return
    }
    setLoading(true)
    diaryApi.list({ page: p, page_size: PAGE_SIZE }).then((res) => {
      setDiaries(res.data)
      setHasMore(res.data.length === PAGE_SIZE)
      setPage(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadDiaries(1)
  }, [loadDiaries])

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className={`h-8 w-8 animate-spin rounded-full border-2 ${pick('border-indigo-900', 'border-indigo-100')} ${pick('border-t-indigo-400', 'border-t-indigo-600')}`} />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${pick('text-white', 'text-slate-900')}`}>日记</h2>
          <p className={`mt-1 text-sm ${pick('text-slate-400', 'text-slate-500')}`}>记录每一天的心情与感悟</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/diary/calendar"
            className={`flex items-center gap-2 rounded-xl border ${pick('border-white/[0.08]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} px-4 py-2.5 text-sm font-medium ${pick('text-slate-300', 'text-slate-700')} backdrop-blur-sm transition-all ${pick('hover:bg-white/[0.06]', 'hover:bg-slate-100')}`}
          >
            <Calendar className="h-4 w-4" />
            日历
          </Link>
          <Link
            to={`/diary/${today}`}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            写日记
          </Link>
        </div>
      </div>

      {diaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl glass-card py-16">
          <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', pick('bg-indigo-500/10', 'bg-indigo-50'))}>
            <BookOpen className={cn('h-8 w-8', pick('text-indigo-400', 'text-indigo-500'))} />
          </div>
          <p className={`mt-4 text-sm ${pick('text-slate-500', 'text-slate-400')}`}>还没有日记</p>
          <Link to={`/diary/${today}`} className={cn('mt-3 text-sm font-medium', pick('text-indigo-400 hover:text-indigo-300', 'text-indigo-600 hover:text-indigo-700'))}>
            写第一篇日记 →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {diaries.map((d) => (
            <Link
              key={d.id}
              to={`/diary/${d.date}`}
              className="group flex items-start gap-4 rounded-2xl glass-card p-5 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${pick('bg-white/[0.04]', 'bg-slate-100')} text-2xl transition-transform group-hover:scale-110`}>
                {moodEmoji(d.mood)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`truncate text-sm font-semibold ${pick('text-slate-200', 'text-slate-800')}`}>
                    {d.title || formatDate(d.date, 'M月d日')}
                  </h3>
                  <span className={`shrink-0 rounded-md ${pick('bg-white/[0.06]', 'bg-slate-200')} px-1.5 py-0.5 text-[10px] font-medium ${pick('text-slate-400', 'text-slate-500')}`}>
                    {formatDate(d.date, 'EEEE')}
                  </span>
                </div>
                {d.content && (
                  <p className={`mt-1.5 line-clamp-2 text-sm leading-relaxed ${pick('text-slate-500', 'text-slate-400')}`}>
                    {d.content.replace(/[#*`]/g, '').slice(0, 120)}
                  </p>
                )}
              </div>
              <span className={`shrink-0 text-xs ${pick('text-slate-600', 'text-slate-500')}`}>{d.date}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {diaries.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => loadDiaries(page - 1)}
            disabled={page <= 1 || loading}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${pick('border-white/[0.08]', 'border-slate-200')} ${pick('text-slate-400 hover:bg-white/[0.06]', 'text-slate-500 hover:bg-slate-100')} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className={`text-sm font-medium ${pick('text-slate-400', 'text-slate-500')}`}>第 {page} 页</span>
          <button
            onClick={() => loadDiaries(page + 1)}
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
