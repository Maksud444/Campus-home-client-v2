'use client'
import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'success', onClose, duration = 3500 }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const enter = setTimeout(() => setVisible(true), 10)
    // Start exit animation before removing
    const exit = setTimeout(() => setVisible(false), duration - 400)
    const remove = setTimeout(() => onClose(), duration)
    return () => { clearTimeout(enter); clearTimeout(exit); clearTimeout(remove) }
  }, [duration, onClose])

  const bg =
    type === 'success' ? 'bg-green-600' :
    type === 'error'   ? 'bg-red-600'   : 'bg-primary'

  const icon =
    type === 'success' ? '✓' :
    type === 'error'   ? '✕' : 'ℹ'

  return (
    <div
      className={`
        fixed z-[9999] bottom-5 left-1/2 -translate-x-1/2
        sm:left-auto sm:translate-x-0 sm:right-5 sm:bottom-6
        flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl
        text-white text-sm font-semibold max-w-xs sm:max-w-sm w-[90vw] sm:w-auto
        transition-all duration-400
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${bg}
      `}
    >
      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs font-black">
        {icon}
      </span>
      <span className="flex-1">{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors flex-shrink-0 text-xs"
      >
        ✕
      </button>
    </div>
  )
}
