import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import apiClient from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { BookOpen, Eye, EyeOff, Loader2, ArrowRight, Sun, Moon } from 'lucide-react'

export function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const { theme, toggle } = useThemeStore()
  const isDark = theme === 'dark'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const res = await apiClient.post(endpoint, { username, password })
      login(res.data.access_token, res.data.user_id, res.data.username)
      navigate('/')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string | Array<{ msg: string }> } } }
      const detail = axiosError.response?.data?.detail
      if (Array.isArray(detail)) {
        const msg = detail.map((d) => d.msg).join('；')
        setError(msg)
        toast.error(msg)
      } else if (typeof detail === 'string') {
        setError(detail)
        toast.error(detail)
      } else {
        setError('操作失败，请重试')
        toast.error('操作失败，请重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden p-4 transition-colors duration-150 ${
      isDark ? 'bg-[#0f172a]' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
    }`}>
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[80px]" />
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-100 opacity-50 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-100 opacity-50 blur-3xl" />
          </>
        )}
      </div>

      {/* Theme toggle — top right */}
      <button
        onClick={toggle}
        className={`absolute top-5 right-5 z-50 group flex h-9 w-16 items-center rounded-full p-1 transition-all duration-300 ${
          isDark ? 'bg-slate-700/60 hover:bg-slate-600/60' : 'bg-slate-200/80 hover:bg-slate-300/80'
        }`}
        title={isDark ? '切换到浅色' : '切换到深色'}
      >
        <span className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
          isDark
            ? 'translate-x-7 bg-gradient-to-br from-indigo-400 to-violet-500'
            : 'translate-x-0 bg-gradient-to-br from-sky-400 to-blue-500'
        }`}>
          {isDark ? <Moon className="h-3.5 w-3.5 text-white" /> : <Sun className="h-3.5 w-3.5 text-white" />}
        </span>
      </button>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo & Title */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Today Book</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>个人综合管理系统</p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl border p-8 shadow-2xl backdrop-blur-xl ${
          isDark
            ? 'border-white/[0.08] bg-white/[0.03]'
            : 'border-slate-200/60 bg-white/70'
        }`}>
          <h2 className={`mb-6 text-center text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {isRegister ? '创建新账号' : '欢迎回来'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'border-white/[0.08] bg-white/[0.05] text-white placeholder-slate-500 focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-indigo-100'
                }`}
                placeholder="请输入用户名"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'border-white/[0.08] bg-white/[0.05] text-white placeholder-slate-500 focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-indigo-100'
                  }`}
                  placeholder="请输入密码"
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${
                isDark ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-red-200 bg-red-50 text-red-600'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isRegister ? '注册' : '登录'}
                  <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              className={`text-sm transition-colors ${isDark ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className={`mt-8 text-center text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          Today Book v0.1.0 · 个人综合管理系统
        </p>
      </div>
    </div>
  )
}
