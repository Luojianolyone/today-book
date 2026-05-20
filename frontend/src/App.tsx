/* today_book/frontend/src/App.tsx */
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { setNavigate } from '@/api/client'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/components/RequireAuth'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { DiaryList } from '@/pages/diary/DiaryList'
import { DiaryEditor } from '@/pages/diary/DiaryEditor'
import { DiaryCalendar } from '@/pages/diary/DiaryCalendarView'
import { FinanceHome } from '@/pages/finance/FinanceHome'
import { TransactionEditor } from '@/pages/finance/TransactionEditor'
import { ItemList } from '@/pages/items/ItemList'
import { ReviewList } from '@/pages/review/ReviewList'
import { ReviewEditor } from '@/pages/review/ReviewEditor'

function AppContent() {
  const navigate = useNavigate()
  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px' },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <ErrorBoundary>
                <AppShell />
              </ErrorBoundary>
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="diary" element={<DiaryList />} />
          <Route path="diary/calendar" element={<DiaryCalendar />} />
          <Route path="diary/:date" element={<DiaryEditor />} />
          <Route path="review" element={<ReviewList />} />
          <Route path="review/new" element={<ReviewEditor />} />
          <Route path="review/:id" element={<ReviewEditor />} />
          <Route path="items" element={<ItemList />} />
          <Route path="items/:id" element={<ItemList />} />
          <Route path="finance" element={<FinanceHome />} />
          <Route path="finance/transactions" element={<FinanceHome />} />
          <Route path="finance/transactions/new" element={<TransactionEditor />} />
          <Route path="finance/accounts" element={<FinanceHome />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
