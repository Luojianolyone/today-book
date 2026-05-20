/* today_book/frontend/src/data/demo.ts — Demo data for GitHub Pages */

import { useAuthStore } from '@/stores/authStore'

const IS_DEMO = window.location.hostname.includes('github.io')

// Seed demo auth if needed
export function ensureDemoAuth() {
  if (IS_DEMO && !useAuthStore.getState().isLoggedIn) {
    useAuthStore.getState().login('demo-token', 1, 'Demo User')
  }
}

// Demo dashboard data
export const demoDashboard = {
  today: new Date().toISOString().slice(0, 10),
  diary: { today_written: true, month_count: 12 },
  review: { total: 8, completed: 6 },
  items: { total: 45, total_value: 28500 },
  finance: { month_income: 15000, month_expense: 8200, month_net: 6800, total_balance: 52000 },
  recent_diaries: [
    { date: '2026-05-20', title: '今天学习了 React 新特性', mood: 'happy' },
    { date: '2026-05-19', title: '完成了一个小项目', mood: 'excited' },
    { date: '2026-05-18', title: '读了一本好书', mood: 'neutral' },
    { date: '2026-05-17', title: '和朋友聚餐', mood: 'happy' },
    { date: '2026-05-16', title: '运动打卡第 30 天', mood: 'tired' },
  ],
}

// Demo diaries
export const demoDiaries = [
  { id: 1, user_id: 1, date: '2026-05-20', title: '今天学习了 React 新特性', content: '今天深入学习了 React 18 的并发特性，包括 Suspense、useTransition 等。感觉收获很大！\n\n## 学习笔记\n\n- Concurrent Rendering\n- Automatic Batching\n- Suspense SSR', mood: 'happy', weather: 'sunny', tags: ['学习', 'React'], created_at: '2026-05-20T10:00:00', updated_at: '2026-05-20T10:00:00' },
  { id: 2, user_id: 1, date: '2026-05-19', title: '完成了一个小项目', content: '终于把 Today Book 项目的基础功能完成了！虽然还有很多需要优化的地方，但已经可以正常使用了。', mood: 'excited', weather: 'cloudy', tags: ['项目', '成就'], created_at: '2026-05-19T10:00:00', updated_at: '2026-05-19T10:00:00' },
  { id: 3, user_id: 1, date: '2026-05-18', title: '读了一本好书', content: '今天读完了《原子习惯》，书中提到的「1% 法则」很有启发。每天进步一点点，长期积累就是巨大的改变。', mood: 'neutral', weather: 'rainy', tags: ['阅读', '成长'], created_at: '2026-05-18T10:00:00', updated_at: '2026-05-18T10:00:00' },
  { id: 4, user_id: 1, date: '2026-05-17', title: '和朋友聚餐', content: '和老朋友们聚了一顿，聊了很多近况。友谊需要维护，以后要多联系。', mood: 'happy', weather: 'sunny', tags: ['社交', '美食'], created_at: '2026-05-17T10:00:00', updated_at: '2026-05-17T10:00:00' },
  { id: 5, user_id: 1, date: '2026-05-16', title: '运动打卡第 30 天', content: '坚持跑步 30 天了！从最初的气喘吁吁到现在能轻松跑 5 公里，身体状态明显变好。', mood: 'tired', weather: 'sunny', tags: ['运动', '健康'], created_at: '2026-05-16T10:00:00', updated_at: '2026-05-16T10:00:00' },
]

// Demo calendar data
export function demoCalendar(year: number, month: number) {
  const days: { date: string; has_entry: boolean; mood: string | null }[] = []
  const entries: Record<string, string> = {
    '2026-05-16': 'tired',
    '2026-05-17': 'happy',
    '2026-05-18': 'neutral',
    '2026-05-19': 'excited',
    '2026-05-20': 'happy',
  }
  const daysInMonth = new Date(year, month, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ date: dateStr, has_entry: !!entries[dateStr], mood: entries[dateStr] || null })
  }
  return days
}

// Demo reviews
export const demoReviews = [
  { id: 1, user_id: 1, type: 'weekly', period_start: '2026-05-13', period_end: '2026-05-19', title: '第 20 周复盘', content: '本周完成了项目的基础开发，学习了新的技术栈。', accomplishments: ['完成 Today Book 项目', '阅读 3 篇文章', '运动 4 次'], challenges: ['时间管理有待提高'], next_plans: ['继续优化项目', '开始写技术博客'], mood_score: 4, is_completed: true, created_at: '2026-05-19T10:00:00', updated_at: '2026-05-19T10:00:00' },
  { id: 2, user_id: 1, type: 'monthly', period_start: '2026-05-01', period_end: '2026-05-31', title: '5 月复盘', content: '5 月是充实的一个月，在技术和生活上都有进步。', accomplishments: ['项目上线', '坚持运动', '读完 2 本书'], challenges: ['作息不够规律'], next_plans: ['早睡早起', '学习 Rust'], mood_score: 4, is_completed: false, created_at: '2026-05-20T10:00:00', updated_at: '2026-05-20T10:00:00' },
]

// Demo items
export const demoItems = [
  { id: 1, name: 'MacBook Pro 14"', description: '主力开发设备', category_id: 1, location_id: 1, purchase_date: '2024-03-15', purchase_price: 14999, current_value: 12000, quantity: 1, is_consumable: false, asset_tag: 'TB-0001', is_archived: false, created_at: '2026-05-01T10:00:00' },
  { id: 2, name: 'Keychron K8 键盘', description: '机械键盘，茶轴', category_id: 1, location_id: 1, purchase_date: '2024-06-20', purchase_price: 498, current_value: 400, quantity: 1, is_consumable: false, asset_tag: 'TB-0002', is_archived: false, created_at: '2026-05-01T10:00:00' },
  { id: 3, name: '《原子习惯》', description: '詹姆斯·克利尔著', category_id: 2, location_id: 2, purchase_date: '2025-01-10', purchase_price: 45, current_value: 30, quantity: 1, is_consumable: false, asset_tag: 'TB-0003', is_archived: false, created_at: '2026-05-01T10:00:00' },
  { id: 4, name: 'Sony WH-1000XM5', description: '降噪耳机', category_id: 1, location_id: 1, purchase_date: '2024-09-01', purchase_price: 2299, current_value: 1800, quantity: 1, is_consumable: false, asset_tag: 'TB-0004', is_archived: false, created_at: '2026-05-01T10:00:00' },
  { id: 5, name: '小米台灯 Pro', description: '护眼台灯', category_id: 3, location_id: 2, purchase_date: '2023-11-11', purchase_price: 199, current_value: 150, quantity: 1, is_consumable: false, asset_tag: 'TB-0005', is_archived: false, created_at: '2026-05-01T10:00:00' },
]

// Demo finance
export const demoAccounts = [
  { id: 1, name: '招商银行', account_type: 'bank', current_balance: 35000, initial_balance: 30000, currency: 'CNY', is_active: true },
  { id: 2, name: '支付宝', account_type: 'cash', current_balance: 8500, initial_balance: 5000, currency: 'CNY', is_active: true },
  { id: 3, name: '微信钱包', account_type: 'cash', current_balance: 3500, initial_balance: 2000, currency: 'CNY', is_active: true },
]

export const demoTransactions = [
  { id: 1, account_id: 1, category_id: 1, transaction_type: 'income', amount: 15000, description: '工资', transaction_date: '2026-05-10', tags: ['工资'] },
  { id: 2, account_id: 2, category_id: 2, transaction_type: 'expense', amount: 3500, description: '房租', transaction_date: '2026-05-05', tags: ['房租'] },
  { id: 3, account_id: 2, category_id: 3, transaction_type: 'expense', amount: 280, description: '超市购物', transaction_date: '2026-05-12', tags: ['生活'] },
  { id: 4, account_id: 3, category_id: 4, transaction_type: 'expense', amount: 45, description: '午餐', transaction_date: '2026-05-15', tags: ['餐饮'] },
  { id: 5, account_id: 2, category_id: 5, transaction_type: 'expense', amount: 120, description: '打车', transaction_date: '2026-05-18', tags: ['交通'] },
]

export const demoSummary = {
  month_income: 15000,
  month_expense: 8200,
  month_net: 6800,
  total_balance: 52000,
}

export const demoCategories = [
  { id: 1, name: '工资', category_type: 'income' },
  { id: 2, name: '房租', category_type: 'expense' },
  { id: 3, name: '生活', category_type: 'expense' },
  { id: 4, name: '餐饮', category_type: 'expense' },
  { id: 5, name: '交通', category_type: 'expense' },
]
