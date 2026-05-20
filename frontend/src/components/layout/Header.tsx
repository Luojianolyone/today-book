import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { LogOut, Search, Bell, Sun, Moon } from 'lucide-react'

interface HeaderProps {
  onOpenSearch: () => void
  onOpenNotifications: () => void
  unreadCount: number
}

export function Header({ onOpenSearch, onOpenNotifications, unreadCount }: HeaderProps) {
  const { username, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const isDark = theme === 'dark'

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <header className={`flex h-[60px] shrink-0 items-center justify-between border-b px-6 transition-colors duration-150 ${
      isDark
        ? 'border-white/[0.06] bg-[#0f172a]'
        : 'border-slate-200 bg-white'
    }`}>
      {/* Left: Date */}
      <div className="flex flex-col">
        <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{today}</span>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <button
          onClick={onOpenSearch}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            isDark ? 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            isDark ? 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ${isDark ? 'ring-[#0f172a]' : 'ring-white'}`} />
          )}
        </button>

        {/* ── Theme Toggle ── */}
        <button
          onClick={toggle}
          className={`group relative flex h-9 w-16 items-center rounded-full p-1 transition-colors duration-150 ${
            isDark
              ? 'bg-slate-700/60 hover:bg-slate-600/60'
              : 'bg-slate-200/80 hover:bg-slate-300/80'
          }`}
          title={isDark ? '切换到浅色' : '切换到深色'}
        >
          {/* Sliding knob */}
          <span className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all duration-150 ease-out ${
            isDark
              ? 'translate-x-7 bg-gradient-to-br from-indigo-400 to-violet-500'
              : 'translate-x-0 bg-gradient-to-br from-sky-400 to-blue-500'
          }`}>
            {isDark ? <Moon className="h-3.5 w-3.5 text-white" /> : <Sun className="h-3.5 w-3.5 text-white" />}
          </span>
          {/* Background icons */}
          <Sun className={`absolute left-2 h-3.5 w-3.5 transition-opacity duration-150 ${isDark ? 'text-slate-500 opacity-100' : 'opacity-0'}`} />
          <Moon className={`absolute right-2 h-3.5 w-3.5 transition-opacity duration-150 ${isDark ? 'opacity-0' : 'text-slate-400 opacity-100'}`} />
        </button>

        {/* Divider */}
        <div className={`mx-1 h-6 w-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px] font-bold text-white shadow-md shadow-indigo-500/20">
            {username?.charAt(0).toUpperCase()}
          </div>
          <span className={`hidden text-sm font-medium sm:block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{username}</span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className={`flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm transition-all ${
            isDark
              ? 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
              : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'
          }`}
          title="退出登录"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">退出</span>
        </button>
      </div>

    </header>
  )
}
