import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/utils/theme'
import { cn } from '@/utils/cn'
import { Search, X, FileText, BookOpen, Wallet, Package, ClipboardList, ArrowRight, Loader2 } from 'lucide-react'
import { searchApi, mapResults, type SearchResultItem } from '@/api/search'

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isDark, pick } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const resp = await searchApi.search(q)
      const mapped = mapResults(resp.data)
      setResults(mapped.slice(0, 20))
      setSelectedIndex(0)
    } catch (e) {
      console.error('[Search] failed:', e)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        navigate(results[selectedIndex].url)
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, selectedIndex, navigate, onClose])

  useEffect(() => {
    resultRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  const typeIcon = (type: string) => {
    switch (type) {
      case 'diary': return <BookOpen className="h-4 w-4" />
      case 'transaction': return <Wallet className="h-4 w-4" />
      case 'item': return <Package className="h-4 w-4" />
      case 'review': return <ClipboardList className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const typeLabel = (type: string) => {
    switch (type) {
      case 'diary': return '日记'
      case 'transaction': return '财务'
      case 'item': return '物品'
      case 'review': return '复盘'
      default: return ''
    }
  }

  const typeColor = (type: string) => {
    switch (type) {
      case 'diary': return pick('bg-indigo-500/15 text-indigo-400', 'bg-indigo-50 text-indigo-600')
      case 'transaction': return pick('bg-emerald-500/15 text-emerald-400', 'bg-emerald-50 text-emerald-600')
      case 'item': return pick('bg-violet-500/15 text-violet-400', 'bg-violet-50 text-violet-600')
      case 'review': return pick('bg-rose-500/15 text-rose-400', 'bg-rose-50 text-rose-600')
      default: return pick('bg-slate-500/15 text-slate-400', 'bg-slate-100 text-slate-600')
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-lg animate-scale-in rounded-2xl border shadow-2xl',
        isDark
          ? 'border-white/[0.08] bg-[#1e293b]'
          : 'border-slate-200 bg-white'
      )}>
        {/* Search input */}
        <div className={cn(
          'flex items-center gap-3 border-b px-5 py-4',
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        )}>
          {loading ? (
            <Loader2 className={cn('h-5 w-5 shrink-0 animate-spin', isDark ? 'text-indigo-400' : 'text-indigo-500')} />
          ) : (
            <Search className={cn('h-5 w-5 shrink-0', isDark ? 'text-slate-400' : 'text-slate-400')} />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索日记、财务、物品、复盘..."
            className={cn(
              'flex-1 bg-transparent text-sm outline-none',
              isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
            )}
          />
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

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {!query.trim() && (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className={cn('h-10 w-10 mb-3', isDark ? 'text-slate-600' : 'text-slate-300')} />
              <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
                输入关键词开始搜索
              </p>
              <p className={cn('mt-1 text-xs', isDark ? 'text-slate-600' : 'text-slate-300')}>
                支持搜索日记内容、财务记录、物品名称、复盘
              </p>
            </div>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className={cn('h-10 w-10 mb-3', isDark ? 'text-slate-600' : 'text-slate-300')} />
              <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
                没有找到相关结果
              </p>
            </div>
          )}

          {results.map((r, i) => (
            <a
              key={`${r.type}-${r.id}`}
              ref={(el) => { resultRefs.current[i] = el }}
              href={r.url}
              onClick={(e) => {
                e.preventDefault()
                navigate(r.url)
                onClose()
              }}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 transition-all',
                i === selectedIndex
                  ? isDark ? 'bg-white/[0.06]' : 'bg-slate-50'
                  : isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/50'
              )}
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', typeColor(r.type))}>
                {typeIcon(r.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn('truncate text-sm font-medium', isDark ? 'text-slate-200' : 'text-slate-800')}>
                    {r.title}
                  </span>
                  <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium', typeColor(r.type))}>
                    {typeLabel(r.type)}
                  </span>
                </div>
                <p className={cn('mt-0.5 truncate text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  {r.subtitle}
                </p>
              </div>
              <ArrowRight className={cn('h-4 w-4 shrink-0', isDark ? 'text-slate-600' : 'text-slate-300')} />
            </a>
          ))}
        </div>

        {/* Footer hint */}
        <div className={cn(
          'flex items-center gap-4 border-t px-5 py-2.5',
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        )}>
          <div className="flex items-center gap-1.5">
            <kbd className={cn('flex h-5 min-w-[20px] items-center justify-center rounded px-1 text-[10px] font-medium', isDark ? 'bg-white/[0.06] text-slate-400' : 'bg-slate-100 text-slate-500')}>↑</kbd>
            <kbd className={cn('flex h-5 min-w-[20px] items-center justify-center rounded px-1 text-[10px] font-medium', isDark ? 'bg-white/[0.06] text-slate-400' : 'bg-slate-100 text-slate-500')}>↓</kbd>
            <span className={cn('text-[10px]', isDark ? 'text-slate-600' : 'text-slate-400')}>导航</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className={cn('flex h-5 min-w-[20px] items-center justify-center rounded px-1 text-[10px] font-medium', isDark ? 'bg-white/[0.06] text-slate-400' : 'bg-slate-100 text-slate-500')}>↵</kbd>
            <span className={cn('text-[10px]', isDark ? 'text-slate-600' : 'text-slate-400')}>打开</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className={cn('flex h-5 min-w-[20px] items-center justify-center rounded px-1 text-[10px] font-medium', isDark ? 'bg-white/[0.06] text-slate-400' : 'bg-slate-100 text-slate-500')}>esc</kbd>
            <span className={cn('text-[10px]', isDark ? 'text-slate-600' : 'text-slate-400')}>关闭</span>
          </div>
        </div>
      </div>
    </div>
  )
}
