'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  read: boolean
  createdAt: string
  link?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (message: string, type?: Notification['type'], link?: string) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markRead: () => {},
  markAllRead: () => {},
  clearAll: () => {},
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const storageKey = session?.user?.email
    ? `baytino_notifications_${session.user.email}`
    : 'baytino_notifications_guest'

  // Load from localStorage on mount / user change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) setNotifications(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [storageKey])

  // Fetch server-side notifications (from approve/reject/delete actions) and merge
  const fetchServerNotifications = useCallback(async () => {
    if (!session?.user?.email) return
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      const serverNotifs: Notification[] = data.notifications || []
      if (serverNotifs.length === 0) return
      setNotifications(prev => {
        const existingMap = new Map(prev.map(n => [n.id, n]))
        const newOnes = serverNotifs.filter(n => !existingMap.has(n.id))
        if (newOnes.length === 0) return prev
        // Preserve local read state for existing notifications
        return [...newOnes, ...prev].slice(0, 50)
      })
    } catch { /* ignore */ }
  }, [session?.user?.email])

  // Fetch on login + poll every 60s
  useEffect(() => {
    fetchServerNotifications()
    const interval = setInterval(fetchServerNotifications, 60_000)
    return () => clearInterval(interval)
  }, [fetchServerNotifications])

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications))
    } catch { /* ignore */ }
  }, [notifications, storageKey])

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info', link?: string) => {
    const n: Notification = {
      id: Date.now().toString(),
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      link,
    }
    setNotifications(prev => [n, ...prev].slice(0, 50)) // keep latest 50
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    // Also mark as read on server
    fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: 'all' }) }).catch(() => {})
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markRead, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
