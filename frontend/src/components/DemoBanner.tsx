/* today_book/frontend/src/components/DemoBanner.tsx */
import { useState } from 'react'
import { X, Info } from 'lucide-react'

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 border-b border-indigo-500/10 px-4 py-2 text-center">
      <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
      <span className="text-xs text-indigo-400">
        这是 Today Book 的在线演示版本，数据为模拟数据，仅用于展示功能。
      </span>
      <button onClick={() => setDismissed(true)} className="ml-2 text-indigo-400/60 hover:text-indigo-400 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
