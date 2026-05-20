/* today_book/frontend/src/components/ErrorBoundary.tsx */
import { Component, type ReactNode } from 'react'
import { useThemeStore } from '@/stores/themeStore'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />
    }
    return this.props.children
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const isDark = useThemeStore((s) => s.theme === 'dark')

  return (
    <div className={`flex min-h-[400px] flex-col items-center justify-center rounded-2xl border p-8 ${isDark ? 'border-white/[0.08] bg-[#1e293b]' : 'border-slate-200 bg-white'}`}>
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${isDark ? 'bg-rose-500/10' : 'bg-rose-50'}`}>
        ⚠️
      </div>
      <h3 className={`mt-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>页面出错了</h3>
      <p className={`mt-2 max-w-sm text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {error?.message || '发生了意外错误，请刷新页面重试'}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onReset}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:brightness-110"
        >
          重试
        </button>
        <button
          onClick={() => window.location.reload()}
          className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all ${isDark ? 'border-white/[0.08] text-slate-300 hover:bg-white/[0.06]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          刷新页面
        </button>
      </div>
    </div>
  )
}
