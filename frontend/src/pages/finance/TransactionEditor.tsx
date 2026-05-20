import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { financeApi, type FinanceAccount, type FinanceCategory } from '@/api/finance'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTodayStr } from '@/utils/date'
import { useTheme } from '@/utils/theme'

export function TransactionEditor() {
  const { pick } = useTheme()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [transactionType, setTransactionType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState<number | ''>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(getTodayStr())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    financeApi.getAccounts().then((res) => setAccounts(res.data))
    financeApi.getCategories().then((res) => setCategories(res.data))
  }, [])

  const filteredCategories = categories.filter((c) => c.category_type === transactionType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !accountId) return
    setSaving(true)
    try {
      await financeApi.createTransaction({
        amount: parseFloat(amount),
        account_id: accountId as number,
        category_id: categoryId || undefined,
        transaction_type: transactionType,
        description: description || undefined,
        transaction_date: date,
      })
      toast.success('交易已记录')
      navigate('/finance')
    } catch (e) {
      console.error('[Transaction] save failed:', e)
    } finally {
      setSaving(false)
    }
  }

  const typeConfig = {
    expense: { label: '支出', gradient: pick('from-rose-500 to-red-600', 'from-rose-500 to-red-600') },
    income: { label: '收入', gradient: pick('from-indigo-500 to-violet-600', 'from-indigo-500 to-violet-600') },
    transfer: { label: '转账', gradient: 'from-blue-500 to-indigo-600' },
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/finance')} className={`flex h-9 w-9 items-center justify-center rounded-xl ${pick('text-slate-400', 'text-slate-500')} transition-all ${pick('hover:bg-white/[0.06]', 'hover:bg-slate-100')} ${pick('hover:text-slate-200', 'hover:text-slate-800')}`}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className={`text-xl font-bold ${pick('text-white', 'text-slate-900')}`}>记一笔</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl glass-card p-6 shadow-lg">
        {/* Type Toggle */}
        <div className={`flex rounded-xl ${pick('bg-white/[0.04]', 'bg-slate-100')} p-1`}>
          {(['expense', 'income', 'transfer'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTransactionType(t); setCategoryId('') }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                transactionType === t
                  ? `bg-gradient-to-r ${typeConfig[t].gradient} text-white shadow-md`
                  : pick('text-slate-400 hover:text-slate-200', 'text-slate-500 hover:text-slate-800')
              }`}
            >
              {typeConfig[t].label}
            </button>
          ))}
        </div>

        <div>
          <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>金额 *</label>
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold ${pick('text-slate-600', 'text-slate-500')}`}>¥</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full rounded-xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} py-3 pl-10 pr-4 text-xl font-bold ${pick('text-white', 'text-slate-900')} focus:border-indigo-500/30 ${pick('focus:bg-white/[0.05]', 'focus:bg-slate-100')} focus:outline-none focus:ring-2 focus:ring-indigo-500/10`}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>账户 *</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value ? parseInt(e.target.value) : '')}
            className={`w-full rounded-xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} px-4 py-3 text-sm ${pick('text-slate-200', 'text-slate-800')} focus:border-indigo-500/30 ${pick('focus:bg-white/[0.05]', 'focus:bg-slate-100')} focus:outline-none focus:ring-2 focus:ring-indigo-500/10`}
            required
          >
            <option value="" className="bg-slate-800">选择账户</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id} className="bg-slate-800">{a.name} (¥{a.current_balance})</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>分类</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
            className={`w-full rounded-xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} px-4 py-3 text-sm ${pick('text-slate-200', 'text-slate-800')} focus:border-indigo-500/30 ${pick('focus:bg-white/[0.05]', 'focus:bg-slate-100')} focus:outline-none focus:ring-2 focus:ring-indigo-500/10`}
          >
            <option value="" className="bg-slate-800">选择分类</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>备注</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full rounded-xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} px-4 py-3 text-sm ${pick('text-white', 'text-slate-900')} placeholder:text-slate-600 focus:border-indigo-500/30 ${pick('focus:bg-white/[0.05]', 'focus:bg-slate-100')} focus:outline-none focus:ring-2 focus:ring-indigo-500/10`}
            placeholder="这笔钱花在哪了？"
          />
        </div>

        <div>
          <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${pick('text-slate-500', 'text-slate-400')}`}>日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full rounded-xl border ${pick('border-white/[0.06]', 'border-slate-200')} ${pick('bg-white/[0.03]', 'bg-slate-50')} px-4 py-3 text-sm ${pick('text-slate-200', 'text-slate-800')} focus:border-indigo-500/30 ${pick('focus:bg-white/[0.05]', 'focus:bg-slate-100')} focus:outline-none focus:ring-2 focus:ring-indigo-500/10`}
          />
        </div>

        <button
          type="submit"
          disabled={saving || !amount || !accountId}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}
