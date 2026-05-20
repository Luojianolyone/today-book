/* today_book/frontend/src/api/finance.ts */
import apiClient from './client'

export interface FinanceAccount {
  id: number
  name: string
  account_type: string
  current_balance: number
  initial_balance: number
  currency: string
  is_active: boolean
}

export interface FinanceCategory {
  id: number
  name: string
  category_type: string
  parent_id?: number
  icon?: string
  color?: string
}

export interface FinanceTransaction {
  id: number
  account_id: number
  category_id?: number
  transaction_type: string
  amount: number
  description?: string
  transaction_date: string
  transaction_time?: string
  to_account_id?: number
  tags?: string[] | null
}

export interface FinanceBudget {
  id: number
  category_id?: number
  amount: number
  period_type: string
  period_start: string
  period_end: string
}

export const financeApi = {
  getAccounts: () => apiClient.get<FinanceAccount[]>('/finance/accounts'),
  createAccount: (data: Partial<FinanceAccount>) => apiClient.post('/finance/accounts', data),
  getCategories: (type?: string) => apiClient.get<FinanceCategory[]>('/finance/categories', { params: { cat_type: type } }),
  createCategory: (data: Partial<FinanceCategory>) => apiClient.post('/finance/categories', data),
  getTransactions: (params?: Record<string, unknown>) => apiClient.get<FinanceTransaction[]>('/finance/transactions', { params }),
  createTransaction: (data: Partial<FinanceTransaction>) => apiClient.post('/finance/transactions', data),
  updateTransaction: (id: number, data: Partial<FinanceTransaction>) => apiClient.put(`/finance/transactions/${id}`, data),
  deleteTransaction: (id: number) => apiClient.delete(`/finance/transactions/${id}`),
  getBudgets: () => apiClient.get<FinanceBudget[]>('/finance/budgets'),
  createBudget: (data: Partial<FinanceBudget>) => apiClient.post('/finance/budgets', data),
  getSummary: () => apiClient.get('/finance/reports/summary'),
  getMonthlyReport: (year: number, month: number) => apiClient.get(`/finance/reports/monthly?year=${year}&month=${month}`),
}
