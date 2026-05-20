import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, RotateCcw, Package, DollarSign, PenLine,
  TrendingUp, TrendingDown, Wallet, ChevronRight, ArrowUpRight,
} from 'lucide-react'
import { statsApi } from '@/api/stats'
import { formatDate } from '@/utils/date'
import { moodEmoji } from '@/utils/mood'
import { cn } from '@/utils/cn'
import { useTheme } from '@/utils/theme'
import toast from 'react-hot-toast'
import { demoDashboard } from '@/data/demo'

const IS_DEMO = window.location.hostname.includes('github.io')

interface DashboardData {
  today: string
  diary: { today_written: boolean; month_count: number }
  review: { total: number; completed: number }
  items: { total: number; total_value: number }
  finance: { month_income: number; month_expense: number; month_net: number; total_balance: number }
  recent_diaries: { date: string; title: string; mood?: string }[]
}

export function Dashboard() {
  const { isDark, pick } = useTheme()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_DEMO) {
      setData(demoDashboard as DashboardData)
      setLoading(false)
      return
    }
    statsApi.getDashboard().then((res) => {
      setData(res.data)
      setLoading(false)
    }).catch(() => {
      toast.error('仪表盘数据加载失败')
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className={cn('h-10 w-10 animate-spin rounded-full border-[3px]', isDark ? 'border-indigo-900 border-t-indigo-400' : 'border-indigo-100 border-t-indigo-600')} />
      </div>
    )
  }
  if (!data) return (
    <div className={cn('flex h-72 items-center justify-center rounded-2xl glass-card p-8')}>
      <p className={pick('text-slate-400', 'text-slate-500')}>加载失败，请刷新重试</p>
    </div>
  )

  const statsCards = [
    {
      title: '今日日记', value: data.diary.today_written ? '已写 ✓' : '未写',
      desc: `本月已写 ${data.diary.month_count} 篇`, icon: BookOpen,
      gradient: data.diary.today_written ? 'from-indigo-500 to-violet-600' : 'from-rose-400 to-pink-500',
      glow: data.diary.today_written ? 'shadow-indigo-500/10' : 'shadow-rose-500/10',
      to: `/diary/${data.today}`,
    },
    {
      title: '复盘统计', value: `${data.review.completed}/${data.review.total}`,
      desc: '已完成 / 总计', icon: RotateCcw,
      gradient: 'from-indigo-500 to-violet-600', glow: 'shadow-indigo-500/10', to: '/review',
    },
    {
      title: '物品总数', value: String(data.items.total),
      desc: `总价值 ¥${data.items.total_value.toLocaleString()}`, icon: Package,
      gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/10', to: '/items',
    },
    {
      title: '本月收支', value: `¥${data.finance.month_net.toLocaleString()}`,
      desc: `收 ¥${data.finance.month_income.toLocaleString()} / 支 ¥${data.finance.month_expense.toLocaleString()}`,
      icon: DollarSign,
      gradient: data.finance.month_net >= 0 ? 'from-indigo-500 to-violet-600' : 'from-rose-500 to-red-600',
      glow: data.finance.month_net >= 0 ? 'shadow-indigo-500/10' : 'shadow-rose-500/10',
      to: '/finance',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>欢迎回来 👋</p>
          <h2 className={cn('mt-1 text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-slate-900')}>仪表盘</h2>
        </div>
        {!data.diary.today_written && (
          <Link to={`/diary/${data.today}`}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:brightness-110 active:scale-[0.98]"
          >
            <PenLine className="h-4 w-4" />写今日日记
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Link key={card.title} to={card.to}
            className={cn('group relative overflow-hidden rounded-2xl glass-card p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1', card.glow)}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-[0.06]', card.gradient)} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', card.gradient)}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <ChevronRight className={cn('h-4 w-4 transition-all duration-200 group-hover:translate-x-0.5', isDark ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-300 group-hover:text-slate-500')} />
              </div>
              <p className={cn('mt-4 text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-slate-900')}>{card.value}</p>
              <p className={cn('mt-1 text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>{card.desc}</p>
              <p className={cn('mt-2 text-[10px] font-semibold uppercase tracking-widest', isDark ? 'text-slate-500' : 'text-slate-400')}>{card.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Finance Overview */}
        <div className="rounded-2xl glass-card p-6 shadow-lg lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className={cn('text-base font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>财务概览</h3>
            <Link to="/finance" className={cn('text-xs font-medium transition-colors', pick('text-indigo-400 hover:text-indigo-300', 'text-indigo-600 hover:text-indigo-700'))}>查看全部 →</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className={cn('rounded-xl border p-4 backdrop-blur-sm', isDark ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-white/40 border-white/60')}>
              <div className={cn('flex items-center gap-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
                <Wallet className="h-4 w-4" /><span className="text-xs font-medium">总资产</span>
              </div>
              <p className={cn('mt-3 text-xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>¥{data.finance.total_balance.toLocaleString()}</p>
            </div>
            <div className={`rounded-xl p-4 ${pick('bg-emerald-500/[0.06] border-emerald-500/10', 'bg-emerald-50 border-emerald-200')}`}>
              <div className={`flex items-center gap-2 ${pick('text-emerald-400', 'text-emerald-600')}`}>
                <TrendingUp className="h-4 w-4" /><span className="text-xs font-medium">本月收入</span>
              </div>
              <p className={`mt-3 text-xl font-bold ${pick('text-emerald-400', 'text-emerald-600')}`}>+¥{data.finance.month_income.toLocaleString()}</p>
            </div>
            <div className={`rounded-xl p-4 ${pick('bg-rose-500/[0.06] border-rose-500/10', 'bg-rose-50 border-rose-200')}`}>
              <div className={`flex items-center gap-2 ${pick('text-rose-400', 'text-rose-600')}`}>
                <TrendingDown className="h-4 w-4" /><span className="text-xs font-medium">本月支出</span>
              </div>
              <p className={`mt-3 text-xl font-bold ${pick('text-rose-400', 'text-rose-600')}`}>-¥{data.finance.month_expense.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl glass-card p-6 shadow-lg">
          <h3 className={cn('mb-5 text-base font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>快捷入口</h3>
          <div className="space-y-1">
            {[
              { label: '写日记', to: `/diary/${data.today}`, icon: '📝', color: isDark ? 'hover:bg-indigo-500/10 hover:text-indigo-300' : 'hover:bg-indigo-50 hover:text-indigo-600' },
              { label: '记一笔', to: '/finance/transactions/new', icon: '💰', color: isDark ? 'hover:bg-indigo-500/10 hover:text-indigo-300' : 'hover:bg-indigo-50 hover:text-indigo-600' },
              { label: '物品管理', to: '/items', icon: '📦', color: isDark ? 'hover:bg-violet-500/10 hover:text-violet-300' : 'hover:bg-violet-50 hover:text-violet-600' },
              { label: '开始复盘', to: '/review', icon: '🔄', color: isDark ? 'hover:bg-indigo-500/10 hover:text-indigo-300' : 'hover:bg-indigo-50 hover:text-indigo-600' },
            ].map((action) => (
              <Link key={action.label} to={action.to}
                className={cn('flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200', isDark ? 'text-slate-400' : 'text-slate-600', action.color)}
              >
                <span className="text-lg">{action.icon}</span>
                <span className="font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Diaries */}
      <div className="rounded-2xl glass-card p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <h3 className={cn('text-base font-semibold', isDark ? 'text-slate-200' : 'text-slate-800')}>最近日记</h3>
          <Link to="/diary" className={cn('text-xs font-medium transition-colors', pick('text-indigo-400 hover:text-indigo-300', 'text-indigo-600 hover:text-indigo-700'))}>查看全部 →</Link>
        </div>
        {data.recent_diaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl text-3xl', isDark ? 'bg-white/[0.03]' : 'bg-slate-50')}>📖</div>
            <p className={cn('mt-4 text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>还没有日记</p>
            <Link to={`/diary/${data.today}`} className={cn('mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors', pick('text-indigo-400 hover:text-indigo-300', 'text-indigo-600 hover:text-indigo-700'))}>
              写第一篇日记 <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {data.recent_diaries.map((d) => (
              <Link key={d.date} to={`/diary/${d.date}`}
                className={cn('group flex items-center gap-4 rounded-xl p-3.5 transition-all duration-200', isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/80')}
              >
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110', isDark ? 'bg-white/[0.04]' : 'bg-slate-50')}>
                  {moodEmoji(d.mood)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm font-medium', isDark ? 'text-slate-200' : 'text-slate-800')}>{d.title || '无标题'}</p>
                  <p className={cn('mt-0.5 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>{formatDate(d.date, 'M月d日 EEEE')}</p>
                </div>
                <ChevronRight className={cn('h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5', isDark ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-300 group-hover:text-slate-500')} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
