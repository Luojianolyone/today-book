/* today_book/frontend/src/pages/diary/DiaryCalendarView.tsx */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { diaryApi, type CalendarDay } from '@/api/diary'
import { useTheme } from '@/utils/theme'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { demoCalendar } from '@/data/demo'

const IS_DEMO = window.location.hostname.includes('github.io')

export function DiaryCalendar() {
  const { pick } = useTheme()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [days, setDays] = useState<CalendarDay[]>([])

  useEffect(() => {
    if (IS_DEMO) {
      setDays(demoCalendar(year, month) as CalendarDay[])
      return
    }
    diaryApi.getCalendar(year, month).then((res) => {
      setDays(res.data)
    }).catch(() => {})
  }, [year, month])

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12) }
    else setMonth(month - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1) }
    else setMonth(month + 1)
  }

  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date().toISOString().slice(0, 10)

  const dayMap = Object.fromEntries(days.map((d) => [d.date, d]))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${pick('text-white', 'text-slate-900')}`}>日记日历</h2>
          <p className={`mt-1 text-sm ${pick('text-slate-400', 'text-slate-500')}`}>查看每天的日记记录</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className={`flex h-9 w-9 items-center justify-center rounded-xl border ${pick('border-white/[0.08]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} ${pick('text-slate-400', 'text-slate-500')} transition-all ${pick('hover:bg-white/[0.06]', 'hover:bg-slate-100')}`}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className={`min-w-[130px] text-center text-sm font-semibold ${pick('text-slate-200', 'text-slate-800')}`}>{year}年{month}月</span>
          <button onClick={nextMonth} className={`flex h-9 w-9 items-center justify-center rounded-xl border ${pick('border-white/[0.08]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} ${pick('text-slate-400', 'text-slate-500')} transition-all ${pick('hover:bg-white/[0.06]', 'hover:bg-slate-100')}`}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl glass-card p-5">
        <div className="mb-3 grid grid-cols-7 gap-1">
          {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
            <div key={d} className={`py-2 text-center text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const info = dayMap[dateStr]
            const isToday = dateStr === today

            return (
              <Link
                key={day}
                to={`/diary/${dateStr}`}
                className={`flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition-all ${
                  isToday && info?.has_entry
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                    : isToday
                    ? `${pick('ring-2 ring-indigo-500 ring-offset-1 ring-offset-[#0f172a]', 'ring-2 ring-indigo-500 ring-offset-1 ring-white')} text-indigo-400 font-bold`
                    : info?.has_entry
                    ? pick('bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 shadow-sm', 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-sm')
                    : `${pick('text-slate-400', 'text-slate-500')} ${pick('hover:bg-white/[0.04]', 'hover:bg-slate-100')}`
                }`}
              >
                {day}
              </Link>
            )
          })}
        </div>
      </div>

      <div className={`flex items-center gap-6 text-xs ${pick('text-slate-500', 'text-slate-400')}`}>
        <div className="flex items-center gap-2">
          <div className={pick('h-3.5 w-3.5 rounded-md bg-indigo-500/15', 'h-3.5 w-3.5 rounded-md bg-indigo-100')} />
          <span>有日记</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-3.5 w-3.5 rounded-md ring-2 ring-indigo-500 ring-offset-1 ${pick('ring-offset-[#0f172a]', 'ring-offset-white')}`} />
          <span>今天</span>
        </div>
      </div>
    </div>
  )
}
