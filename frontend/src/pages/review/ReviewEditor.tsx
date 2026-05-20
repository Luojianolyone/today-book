import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { reviewApi } from '@/api/review'
import { useTheme } from '@/utils/theme'
import { ArrowLeft, Save, Star, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getWeekRange, getMonthRange, getYearRange } from '@/utils/date'

const IS_DEMO = window.location.hostname.includes('github.io')

export function ReviewEditor() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { pick } = useTheme()
  const isEdit = !!id

  const [type, setType] = useState(searchParams.get('type') || 'weekly')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [accomplishments, setAccomplishments] = useState('')
  const [challenges, setChallenges] = useState('')
  const [nextPlans, setNextPlans] = useState('')
  const [moodScore, setMoodScore] = useState(0)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (isEdit) {
      reviewApi.get(Number(id)).then((res) => {
        const r = res.data
        setType(r.type)
        setTitle(r.title || '')
        setContent(r.content || '')
        setAccomplishments(Array.isArray(r.accomplishments) ? r.accomplishments.join('\n') : (r.accomplishments || ''))
        setChallenges(Array.isArray(r.challenges) ? r.challenges.join('\n') : (r.challenges || ''))
        setNextPlans(Array.isArray(r.next_plans) ? r.next_plans.join('\n') : (r.next_plans || ''))
        setMoodScore(r.mood_score || 0)
        setPeriodStart(r.period_start)
        setPeriodEnd(r.period_end)
      }).finally(() => setLoading(false))
    } else {
      // Set default period range based on type
      const now = new Date()
      let range: { start: string; end: string }
      if (type === 'monthly') range = getMonthRange(now)
      else if (type === 'yearly') range = getYearRange(now)
      else range = getWeekRange(now)
      setPeriodStart(range.start)
      setPeriodEnd(range.end)

      // Load template
      reviewApi.getTemplate(type).then((res) => {
        if (res.data.content) setContent(res.data.content)
        if (res.data.title) setTitle(res.data.title)
      })
    }
  }, [id, isEdit, type])

  const handleTypeChange = useCallback((newType: string) => {
    setType(newType)
    const now = new Date()
    let range: { start: string; end: string }
    if (newType === 'monthly') range = getMonthRange(now)
    else if (newType === 'yearly') range = getYearRange(now)
    else range = getWeekRange(now)
    setPeriodStart(range.start)
    setPeriodEnd(range.end)
    reviewApi.getTemplate(newType).then((res) => {
      if (res.data.content) setContent(res.data.content)
      if (res.data.title) setTitle(res.data.title)
    })
  }, [])

  const handleSave = useCallback(async () => {
    if (!periodStart || !periodEnd) return
    if (IS_DEMO) {
      toast.success('演示模式：复盘已保存（仅预览）')
      navigate('/review')
      return
    }
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        type,
        period_start: periodStart,
        period_end: periodEnd,
        title: title || undefined,
        content: content || undefined,
        accomplishments: accomplishments ? accomplishments.split('\n').filter(Boolean) : undefined,
        challenges: challenges ? challenges.split('\n').filter(Boolean) : undefined,
        next_plans: nextPlans ? nextPlans.split('\n').filter(Boolean) : undefined,
        mood_score: moodScore || undefined,
      }
      if (isEdit) {
        await reviewApi.update(Number(id), data)
        toast.success('复盘已更新')
      } else {
        await reviewApi.create(data)
        toast.success('复盘已创建')
      }
      navigate('/review')
    } catch (e) {
      console.error('[Review] save failed:', e)
    } finally {
      setSaving(false)
    }
  }, [type, periodStart, periodEnd, title, content, accomplishments, challenges, nextPlans, moodScore, isEdit, id, navigate])

  const typeLabels: Record<string, string> = { weekly: '周复盘', monthly: '月复盘', yearly: '年复盘' }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className={`h-8 w-8 animate-spin rounded-full border-2 ${pick('border-indigo-900', 'border-indigo-100')} ${pick('border-t-indigo-400', 'border-t-indigo-600')}`} />
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/review" className={`flex h-9 w-9 items-center justify-center rounded-xl ${pick('text-slate-400', 'text-slate-500')} transition-all ${pick('hover:bg-white/[0.06]', 'hover:bg-slate-100')} ${pick('hover:text-slate-200', 'hover:text-slate-800')}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className={`text-lg font-bold ${pick('text-white', 'text-slate-900')}`}>{isEdit ? '编辑复盘' : '新建复盘'}</h2>
            <p className={`text-xs ${pick('text-slate-500', 'text-slate-400')}`}>{typeLabels[type]} · {periodStart} ~ {periodEnd}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      {/* Type & Period */}
      <div className="rounded-2xl glass-card p-5 space-y-4">
        <div>
          <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>复盘类型</label>
          <div className={`flex rounded-xl ${pick('bg-white/[0.04]', 'bg-slate-100')} p-1`}>
            {(['weekly', 'monthly', 'yearly'] as const).map((t) => (
              <button key={t} type="button" onClick={() => handleTypeChange(t)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${type === t ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md' : pick('text-slate-400 hover:text-slate-200', 'text-slate-500 hover:text-slate-800')}`}
              >{typeLabels[t]}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>开始日期</label>
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}
              className={`w-full rounded-xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} px-4 py-3 text-sm ${pick('text-white', 'text-slate-900')} focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/10`} />
          </div>
          <div>
            <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>结束日期</label>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)}
              className={`w-full rounded-xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} px-4 py-3 text-sm ${pick('text-white', 'text-slate-900')} focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/10`} />
          </div>
        </div>
      </div>

      {/* Title */}
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题（可选）"
        className={`w-full rounded-2xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} px-5 py-4 text-lg font-medium ${pick('text-white', 'text-slate-900')} backdrop-blur-sm ${pick('placeholder:text-slate-600', 'placeholder:text-slate-400')} focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/10`} />

      {/* Content (Markdown) */}
      <div>
        <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>内容（支持 Markdown）</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="写下你的复盘..."
          className={`w-full rounded-2xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} p-5 font-mono text-sm leading-relaxed ${pick('text-slate-300', 'text-slate-700')} backdrop-blur-sm ${pick('placeholder:text-slate-600', 'placeholder:text-slate-400')} focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 min-h-[200px] resize-y`} />
      </div>

      {/* Structured fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>完成事项（每行一项）</label>
          <textarea value={accomplishments} onChange={(e) => setAccomplishments(e.target.value)} placeholder="本周完成了什么？"
            className={`w-full rounded-2xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} p-4 text-sm ${pick('text-slate-300', 'text-slate-700')} backdrop-blur-sm ${pick('placeholder:text-slate-600', 'placeholder:text-slate-400')} focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 min-h-[120px] resize-y`} />
        </div>
        <div>
          <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>遇到的挑战（每行一项）</label>
          <textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} placeholder="遇到了什么困难？"
            className={`w-full rounded-2xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} p-4 text-sm ${pick('text-slate-300', 'text-slate-700')} backdrop-blur-sm ${pick('placeholder:text-slate-600', 'placeholder:text-slate-400')} focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 min-h-[120px] resize-y`} />
        </div>
      </div>

      <div>
        <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>下一步计划（每行一项）</label>
        <textarea value={nextPlans} onChange={(e) => setNextPlans(e.target.value)} placeholder="接下来要做什么？"
          className={`w-full rounded-2xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} p-4 text-sm ${pick('text-slate-300', 'text-slate-700')} backdrop-blur-sm ${pick('placeholder:text-slate-600', 'placeholder:text-slate-400')} focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 min-h-[100px] resize-y`} />
      </div>

      {/* Mood Score */}
      <div className="rounded-2xl glass-card p-5">
        <label className={`mb-3 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>心情评分</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button key={score} type="button" onClick={() => setMoodScore(moodScore === score ? 0 : score)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${moodScore >= score ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25' : pick('bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]', 'bg-slate-100 text-slate-500 hover:bg-slate-200')}`}
            >
              <Star className={`h-4 w-4 ${moodScore >= score ? 'fill-white' : ''}`} />
            </button>
          ))}
          {moodScore > 0 && <span className={`ml-2 text-sm ${pick('text-slate-400', 'text-slate-500')}`}>{moodScore}/5</span>}
        </div>
      </div>
    </div>
  )
}
