import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { diaryApi } from '@/api/diary'
import { getTodayStr } from '@/utils/date'
import { useTheme } from '@/utils/theme'
import { ArrowLeft, Save, Trash2, Eye, Edit3 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'

const MOODS = [
  { value: 'happy', label: '😊 开心' },
  { value: 'neutral', label: '😐 平静' },
  { value: 'sad', label: '😢 难过' },
  { value: 'excited', label: '🤩 兴奋' },
  { value: 'tired', label: '😴 疲惫' },
]

const WEATHERS = [
  { value: 'sunny', label: '☀️ 晴' },
  { value: 'cloudy', label: '☁️ 多云' },
  { value: 'rainy', label: '🌧️ 雨' },
  { value: 'snowy', label: '❄️ 雪' },
]

export function DiaryEditor() {
  const { pick } = useTheme()
  const { date: dateParam } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const date = dateParam || getTodayStr()

  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState('')
  const [weather, setWeather] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    diaryApi.getByDate(date).then((res) => {
      setTitle(res.data.title || '')
      setContent(res.data.content || '')
      setMood(res.data.mood || '')
      setWeather(res.data.weather || '')
    }).catch(() => {
      // Not found = new entry
    }).finally(() => setLoading(false))
  }, [date])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await diaryApi.upsert({ date, title: title || null, content: content || null, mood: mood || null, weather: weather || null })
      toast.success('日记已保存')
      navigate('/diary')
    } catch (e) {
      console.error('[Diary] save failed:', e)
    } finally {
      setSaving(false)
    }
  }, [date, title, content, mood, weather, navigate])

  const handleDelete = useCallback(async () => {
    if (!confirm('确定要删除这篇日记吗？')) return
    try {
      await diaryApi.delete(date)
      toast.success('日记已删除')
      navigate('/diary')
    } catch (e) {
      console.error('[Diary] delete failed:', e)
    }
  }, [date, navigate])

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className={`h-8 w-8 animate-spin rounded-full border-2 ${pick('border-indigo-900', 'border-indigo-100')} ${pick('border-t-indigo-400', 'border-t-indigo-600')}`} />
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/diary" className={`flex h-9 w-9 items-center justify-center rounded-xl ${pick('text-slate-400', 'text-slate-500')} transition-all ${pick('hover:bg-white/[0.06]', 'hover:bg-slate-100')} ${pick('hover:text-slate-200', 'hover:text-slate-800')}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className={`text-lg font-bold ${pick('text-white', 'text-slate-900')}`}>{date}</h2>
            <p className={`text-xs ${pick('text-slate-500', 'text-slate-400')}`}>{isPreview ? '预览模式' : '编辑模式'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-2 rounded-xl border ${pick('border-white/[0.08]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} px-3.5 py-2 text-sm font-medium ${pick('text-slate-300', 'text-slate-700')} transition-all ${pick('hover:bg-white/[0.06]', 'hover:bg-slate-100')}`}
          >
            {isPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreview ? '编辑' : '预览'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? '保存中...' : '保存'}
          </button>
          <button
            onClick={handleDelete}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${pick('border-red-500/20 text-rose-400 hover:bg-red-500/10 hover:text-red-400', 'border-red-200 text-rose-500 hover:bg-red-50 hover:text-rose-600')}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mood & Weather */}
      <div className="rounded-2xl glass-card p-5">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>心情</label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? '' : m.value)}
                  className={`rounded-xl px-3 py-1.5 text-sm transition-all ${
                    mood === m.value
                      ? pick('bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30 shadow-sm', 'bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/40 shadow-sm')
                      : `${pick('bg-white/[0.03]', 'bg-slate-50')} ${pick('text-slate-400', 'text-slate-500')} ${pick('hover:bg-white/[0.06]', 'hover:bg-slate-100')}`
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>天气</label>
            <div className="flex flex-wrap gap-1.5">
              {WEATHERS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setWeather(weather === w.value ? '' : w.value)}
                  className={`rounded-xl px-3 py-1.5 text-sm transition-all ${
                    weather === w.value
                      ? pick('bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30 shadow-sm', 'bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/40 shadow-sm')
                      : `${pick('bg-white/[0.03]', 'bg-slate-50')} ${pick('text-slate-400', 'text-slate-500')} ${pick('hover:bg-white/[0.06]', 'hover:bg-slate-100')}`
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题（可选）"
        className={`w-full rounded-2xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} px-5 py-4 text-lg font-medium ${pick('text-white', 'text-slate-900')} backdrop-blur-sm ${pick('placeholder:text-slate-600', 'placeholder:text-slate-400')} focus:border-indigo-500/30 ${pick('focus:bg-white/[0.05]', 'focus:bg-slate-100')} focus:outline-none focus:ring-2 focus:ring-indigo-500/10`}
      />

      {/* Content */}
      {isPreview ? (
        <div className={cn('prose prose-sm max-w-none rounded-2xl glass-card p-6 min-h-[400px]', pick('prose-invert', ''))}>
          <ReactMarkdown>{content || '*暂无内容*'}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="开始写点什么吧...（支持 Markdown）"
          className={`w-full rounded-2xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} p-5 font-mono text-sm leading-relaxed ${pick('text-slate-300', 'text-slate-700')} backdrop-blur-sm ${pick('placeholder:text-slate-600', 'placeholder:text-slate-400')} focus:border-indigo-500/30 ${pick('focus:bg-white/[0.05]', 'focus:bg-slate-100')} focus:outline-none focus:ring-2 focus:ring-indigo-500/10 min-h-[400px] resize-y`}
        />
      )}
    </div>
  )
}
