import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { financeApi, type FinanceAccount, type FinanceTransaction } from '@/api/finance'
import { Plus, TrendingUp, TrendingDown, Wallet, CreditCard, ArrowUpRight } from 'lucide-react'
import { useTheme } from '@/utils/theme'
import { demoAccounts, demoTransactions, demoSummary } from '@/data/demo'

const IS_DEMO = window.location.hostname.includes('github.io')

export function FinanceHome() {
  const { pick } = useTheme()
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [recentTx, setRecentTx] = useState<FinanceTransaction[]>([])
  const [summary, setSummary] = useState<{ month_income: number; month_expense: number; total_balance: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_DEMO) {
      setAccounts(demoAccounts as unknown as FinanceAccount[])
      setRecentTx(demoTransactions as unknown as FinanceTransaction[])
      setSummary(demoSummary)
      setLoading(false)
      return
    }
    Promise.all([
      financeApi.getAccounts(),
      financeApi.getTransactions({ page_size: 5 }),
      financeApi.getSummary(),
    ]).then(([acc, tx, sum]) => {
      setAccounts(acc.data)
      setRecentTx(tx.data)
      setSummary(sum.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className={`h-8 w-8 animate-spin rounded-full border-2 ${pick('border-indigo-900', 'border-indigo-100')} ${pick('border-t-indigo-400', 'border-t-indigo-600')}`} />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${pick('text-white', 'text-slate-900')}`}>财务</h2>
          <p className={`mt-1 text-sm ${pick('text-slate-400', 'text-slate-500')}`}>管理你的收支与资产</p>
        </div>
        <Link
          to="/finance/transactions/new"
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          记一笔
          <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl glass-card p-5 shadow-lg">
            <div className={`flex items-center gap-2 ${pick('text-slate-400', 'text-slate-500')}`}>
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium">总资产</span>
            </div>
            <p className={`mt-3 text-2xl font-bold ${pick('text-white', 'text-slate-900')}`}>¥{summary.total_balance.toLocaleString()}</p>
          </div>
          <div className={`rounded-2xl p-5 shadow-lg ${pick('bg-emerald-500/[0.06] border-emerald-500/10', 'bg-emerald-50 border-emerald-200')}`}>
            <div className={`flex items-center gap-2 ${pick('text-emerald-400', 'text-emerald-600')}`}>
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">本月收入</span>
            </div>
            <p className={`mt-3 text-2xl font-bold ${pick('text-emerald-400', 'text-emerald-600')}`}>+¥{summary.month_income.toLocaleString()}</p>
          </div>
          <div className={`rounded-2xl p-5 shadow-lg ${pick('bg-rose-500/[0.06] border-rose-500/10', 'bg-rose-50 border-rose-200')}`}>
            <div className={`flex items-center gap-2 ${pick('text-rose-400', 'text-rose-600')}`}>
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium">本月支出</span>
            </div>
            <p className={`mt-3 text-2xl font-bold ${pick('text-rose-400', 'text-rose-600')}`}>-¥{summary.month_expense.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Accounts */}
      <div className="rounded-2xl glass-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`text-base font-semibold ${pick('text-slate-200', 'text-slate-800')}`}>账户</h3>
          <Link to="/finance/accounts" className={`text-xs font-medium ${pick('text-indigo-400 hover:text-indigo-300', 'text-indigo-600 hover:text-indigo-700')}`}>管理 →</Link>
        </div>
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${pick('bg-white/[0.03]', 'bg-slate-50')}`}>
              <CreditCard className={`h-7 w-7 ${pick('text-slate-600', 'text-slate-500')}`} />
            </div>
            <p className={`mt-3 text-sm ${pick('text-slate-500', 'text-slate-400')}`}>还没有账户，先创建一个</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((a) => (
              <div key={a.id} className={`rounded-xl ${pick('bg-white/[0.03]', 'bg-slate-50')} border ${pick('border-white/[0.04]', 'border-slate-200')} p-4 transition-all ${pick('hover:bg-white/[0.05]', 'hover:bg-slate-100')}`}>
                <p className={`text-sm font-medium ${pick('text-slate-300', 'text-slate-700')}`}>{a.name}</p>
                <p className={`mt-1 text-lg font-bold ${a.current_balance >= 0 ? pick('text-emerald-400', 'text-emerald-600') : pick('text-rose-400', 'text-rose-600')}`}>
                  ¥{a.current_balance.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl glass-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`text-base font-semibold ${pick('text-slate-200', 'text-slate-800')}`}>最近交易</h3>
          <Link to="/finance/transactions" className={`text-xs font-medium ${pick('text-indigo-400 hover:text-indigo-300', 'text-indigo-600 hover:text-indigo-700')}`}>查看全部 →</Link>
        </div>
        {recentTx.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${pick('bg-white/[0.03]', 'bg-slate-50')} text-2xl`}>💰</div>
            <p className={`mt-3 text-sm ${pick('text-slate-500', 'text-slate-400')}`}>还没有交易记录</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentTx.map((tx) => (
              <div key={tx.id} className={`group flex items-center justify-between rounded-xl p-3.5 transition-all ${pick('hover:bg-white/[0.03]', 'hover:bg-slate-50')}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    tx.transaction_type === 'income' ? pick('bg-emerald-500/10', 'bg-emerald-50') : pick('bg-rose-500/10', 'bg-rose-50')
                  }`}>
                    {tx.transaction_type === 'income' ? (
                      <TrendingUp className={`h-4 w-4 ${pick('text-emerald-400', 'text-emerald-600')}`} />
                    ) : (
                      <TrendingDown className={`h-4 w-4 ${pick('text-rose-400', 'text-rose-600')}`} />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${pick('text-slate-300', 'text-slate-700')}`}>{tx.description || '未备注'}</p>
                    <p className={`text-xs ${pick('text-slate-600', 'text-slate-500')}`}>{tx.transaction_date}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  tx.transaction_type === 'income' ? pick('text-emerald-400', 'text-emerald-600') : pick('text-rose-400', 'text-rose-600')
                }`}>
                  {tx.transaction_type === 'income' ? '+' : '-'}¥{tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
