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
