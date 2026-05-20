import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/utils/theme'
import { cn } from '@/utils/cn'
import { X, Bell, BookOpen, Wallet, ClipboardList, Calendar, CheckCircle } from 'lucide-react'
import { diaryApi } from '@/api/diary'
import { getTodayStr } from '@/utils/date'

interface Notification {
  id: string
  type: 'warning' | 'info' | 'success'
  icon: 'diary' | 'finance' | 'review' | 'system'
  title: string
  message: string
  date: string
  read: boolean
  actionUrl?: string
}

interface CachedNotifications {
  date: string
  items: Notification[]
}

let notifCache: CachedNotifications | null = null

export function NotificationPanel({ open, onClose, onUnreadCount }: { open: boolean; onClose: () => void; onUnreadCount: (count: number) => void }) {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!open) return

    const today = getTodayStr()

    // Use cache if still valid (same day)
    if (notifCache && notifCache.date === today) {
      setNotifications(notifCache.items)
      onUnreadCount(notifCache.items.filter((n) => !n.read).length)
      return
    }

    const loadNotifications = async () => {
      const items: Notification[] = []

      try {
        await diaryApi.getByDate(today)
        items.push({
          id: 'diary-today',
          type: 'success',
          icon: 'diary',
          title: '今日日记已记录',
          message: '今天已经写过日记了，继续保持！',
          date: today,
          read: true,
        })
      } catch (e) {
        console.error('[Notifications] failed:', e)
        items.push({
          id: 'diary-today',
          type: 'warning',
          icon: 'diary',
          title: '今日还未写日记',
          message: '今天还没有记录日记，花几分钟记录一下吧',
          date: today,
          read: false,
          actionUrl: `/diary/${today}`,
        })
      }

      try {
        const res = await diaryApi.list({ page: 1, page_size: 30 })
        const diaries = res.data
        if (diaries.length > 0) {
          const sorted = [...diaries].sort((a, b) => b.date.localeCompare(a.date))
          const latestDate = sorted[0].date
          const latest = new Date(latestDate)
          const now = new Date()
          const diffDays = Math.floor((now.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            items.push({
              id: 'diary-streak',
              type: 'warning',
              icon: 'diary',
              title: '昨天没有写日记',
              message: '昨天漏掉了日记，今天补上吧',
              date: today,
              read: false,
              actionUrl: `/diary/${today}`,
            })
          } else if (diffDays >= 2) {
            items.push({
              id: 'diary-streak',
              type: 'warning',
              icon: 'diary',
              title: `已经 ${diffDays} 天没写日记了`,
              message: '坚持记录，养成好习惯',
              date: today,
              read: false,
              actionUrl: `/diary/${today}`,
            })
          }

          if (diaries.length >= 7) {
            items.push({
              id: 'diary-count',
              type: 'info',
              icon: 'diary',
              title: `已记录 ${diaries.length} 篇日记`,
              message: '坚持记录生活中的点滴',
              date: today,
              read: true,
            })
          }
        }
      } catch (e) {
        console.error('[Notifications] failed:', e)
        // ignore
      }

      items.push({
        id: 'system-welcome',
        type: 'info',
        icon: 'system',
        title: '欢迎使用 Today Book',
        message: '个人综合管理系统，记录生活的每一天',
        date: today,
        read: true,
      })

      notifCache = { date: today, items }
      setNotifications(items)
      onUnreadCount(items.filter((n) => !n.read).length)
    }

    loadNotifications()
  }, [open])

  if (!open) return null

  const unreadCount = notifications.filter((n) => !n.read).length

  const iconMap = {
    diary: BookOpen,
    finance: Wallet,
    review: ClipboardList,
    system: Calendar,
  }

  const typeStyles = {
    warning: {
      icon: isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600',
      border: isDark ? 'border-amber-500/20' : 'border-amber-200',
    },
    info: {
      icon: isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-500',
      border: isDark ? 'border-indigo-500/20' : 'border-indigo-200',
    },
    success: {
      icon: isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500',
      border: isDark ? 'border-emerald-500/20' : 'border-emerald-200',
    },
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleClick = (n: Notification) => {
    if (n.actionUrl) {
      navigate(n.actionUrl)
      onClose()
    }
    setNotifications((prev) => prev.map((p) => p.id === n.id ? { ...p, read: true } : p))
  }

  return (
    <div
      className="fixed inset-0 z-[100]"
      onClick={handleBackdropClick}
    >
      {/* Panel */}
      <div className={cn(
        'absolute right-4 top-[60px] w-[380px] animate-scale-in rounded-2xl border shadow-2xl',
        isDark
          ? 'border-white/[0.08] bg-[#1e293b]'
          : 'border-slate-200 bg-white'
      )}>
        {/* Header */}
        <div className={cn(
          'flex items-center justify-between border-b px-5 py-4',
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        )}>
          <div className="flex items-center gap-2.5">
            <Bell className={cn('h-4.5 w-4.5', isDark ? 'text-slate-300' : 'text-slate-700')} />
            <h3 className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
              通知
            </h3>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
              isDark ? 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className={cn('h-10 w-10 mb-3', isDark ? 'text-slate-600' : 'text-slate-300')} />
              <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>暂无通知</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((n) => {
                const Icon = iconMap[n.icon]
                const style = typeStyles[n.type]
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all',
                      isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50',
                      !n.read && (isDark ? 'bg-white/[0.02]' : 'bg-slate-50/50')
                    )}
                  >
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', style.icon)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-medium', isDark ? 'text-slate-200' : 'text-slate-800')}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <p className={cn('mt-0.5 text-xs leading-relaxed', isDark ? 'text-slate-500' : 'text-slate-400')}>
                        {n.message}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className={cn(
            'border-t px-5 py-3',
            isDark ? 'border-white/[0.06]' : 'border-slate-100'
          )}>
            <button
              onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
              className={cn(
                'flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-colors',
                isDark
                  ? 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              )}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              全部标为已读
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
