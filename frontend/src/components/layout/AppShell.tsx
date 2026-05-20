import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { SearchModal } from '@/components/SearchModal'
import { NotificationPanel } from '@/components/NotificationPanel'
import { useThemeStore } from '@/stores/themeStore'

export function AppShell() {
  const theme = useThemeStore((s) => s.theme)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const handleNotifClose = useCallback(() => {
    setNotifOpen(false)
    setUnreadCount(0)
  }, [])

  return (
    <div className={`flex h-screen overflow-hidden ${theme}`}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotifOpen(true)}
          unreadCount={unreadCount}
        />
        <main className="flex-1 overflow-y-auto app-bg">
          <div className="mx-auto max-w-6xl p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationPanel
        open={notifOpen}
        onClose={handleNotifClose}
        onUnreadCount={setUnreadCount}
      />
    </div>
  )
}
