import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BookOpen, RotateCcw, Package, DollarSign, LayoutDashboard,
  ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useThemeStore } from '@/stores/themeStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘', desc: '数据概览' },
  { to: '/diary', icon: BookOpen, label: '日记', desc: '记录生活' },
  { to: '/review', icon: RotateCcw, label: '复盘', desc: '总结反思' },
  { to: '/items', icon: Package, label: '物品', desc: '资产管理' },
  { to: '/finance', icon: DollarSign, label: '财务', desc: '收支记账' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const isDark = useThemeStore((s) => s.theme) === 'dark'

  return (
    <aside
      className={cn(
        'relative hidden flex-col border-r transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] md:flex',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        isDark
          ? 'border-white/[0.06] bg-[#0f172a]'
          : 'border-slate-200/80 bg-white'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-[68px] items-center gap-3 border-b transition-all duration-200',
        collapsed ? 'justify-center px-0' : 'px-5',
        isDark ? 'border-white/[0.06]' : 'border-slate-100'
      )}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className={cn('text-[15px] font-bold tracking-tight', isDark ? 'text-white' : 'text-slate-900')}>Today Book</h1>
            <p className={cn('text-[10px]', isDark ? 'text-slate-400' : 'text-slate-400')}>个人综合管理系统</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        {!collapsed && (
          <p className={cn('mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest animate-fade-in', isDark ? 'text-slate-500' : 'text-slate-400')}>
            导航
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl text-sm transition-all duration-200',
                collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5',
                isActive
                  ? isDark
                    ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-500" />
                )}
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                      : isDark
                        ? 'bg-white/[0.04] text-slate-400 group-hover:bg-white/[0.08] group-hover:text-slate-200'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                </div>
                {!collapsed && (
                  <div className="flex flex-col animate-fade-in">
                    <span className="text-[13px] font-medium">{item.label}</span>
                    <span className={cn('text-[10px] transition-colors', isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-500') : (isDark ? 'text-slate-500' : 'text-slate-400'))}>
                      {item.desc}
                    </span>
                  </div>
                )}
                {collapsed && (
                  <div className={cn(
                    'pointer-events-none absolute left-full ml-3 rounded-lg px-3 py-1.5 text-xs font-medium opacity-0 shadow-xl transition-opacity group-hover:opacity-100 whitespace-nowrap z-50',
                    isDark ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'
                  )}>
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className={cn(
        'border-t transition-all duration-200',
        collapsed ? 'p-3' : 'p-4',
        isDark ? 'border-white/[0.06]' : 'border-slate-100'
      )}>
        {!collapsed ? (
          <div className={cn(
            'animate-fade-in rounded-xl p-3.5 border',
            isDark
              ? 'bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-purple-500/10 border-indigo-500/10'
              : 'bg-gradient-to-br from-indigo-50 via-violet-50/50 to-purple-50/50 border-indigo-100'
          )}>
            <div className="flex items-center gap-2">
              <Sparkles className={cn('h-4 w-4', isDark ? 'text-indigo-400' : 'text-indigo-500')} />
              <p className={cn('text-xs font-semibold', isDark ? 'text-indigo-300' : 'text-indigo-600')}>小贴士</p>
            </div>
            <p className={cn('mt-1.5 text-[11px] leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-500')}>
              每天写一篇日记，养成记录好习惯 ✨
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-500'
            )}>
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3.5 top-[80px] z-50 flex h-7 w-7 items-center justify-center rounded-full border shadow-lg transition-all duration-200',
          isDark
            ? 'border-slate-700 bg-[#0f172a] text-slate-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-400'
            : 'border-slate-200 bg-white text-slate-400 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-500'
        )}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
  )
}
