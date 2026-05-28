'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const MENU = [
  { id: 'home', label: '首页', icon: '🏠', href: '/' },
  { id: 'news', label: '资讯', icon: '📡', href: '/news' },
  { id: 'todos', label: '待办', icon: '📋', href: '/todos' },
  { id: 'habits', label: '习惯', icon: '🎯', href: '/habits' },
  { id: 'expenses', label: '支出', icon: '💰', href: '/expenses' },
  { id: 'notes', label: '笔记', icon: '📝', href: '/notes' },
  { id: 'goals', label: '目标', icon: '🏆', href: '/goals' },
  { id: 'bookmarks', label: '书签', icon: '⚡', href: '/bookmarks' },
  { id: 'settings', label: '设置', icon: '⚙️', href: '/settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <aside className="w-48 flex-shrink-0 bg-slate-900/80" />
  }

  return (
    <aside
      className={`flex flex-col glass h-screen sticky top-0 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-52'
      } flex-shrink-0`}
      style={{
        background: collapsed ? 'rgba(15, 23, 42, 0.95)' : 'rgba(30, 41, 59, 0.6)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-slate-700/30">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          }}
        >
          <span role="img" aria-label="logo">🐱</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden animate-fade-in">
            <h1 className="text-white font-semibold text-base whitespace-nowrap tracking-tight">Life-OS</h1>
            <p className="text-slate-400 text-xs mt-0.5">个人控制台</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {MENU.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: 0,
                animation: mounted ? `slideIn 0.4s ease-out ${index * 50}ms forwards` : 'none',
              }}
            >
              <span className="text-lg flex-shrink-0" role="img" aria-label={item.label}>{item.icon}</span>
              {!collapsed && (
                <span className="whitespace-nowrap truncate tracking-wide">{item.label}</span>
              )}
            </a>
          )
        })}
      </nav>

      {/* Version info */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-700/30">
          <p className="text-slate-500 text-xs text-center">v1.0.0</p>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-3 py-4 border-t border-slate-700/30">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 text-sm font-medium"
          aria-label={collapsed ? '展开菜单' : '收起菜单'}
        >
          <span className="text-base flex-shrink-0 transition-transform duration-200" style={{
            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ←
          </span>
          {!collapsed && <span className="whitespace-nowrap">收起菜单</span>}
        </button>
      </div>
    </aside>
  )
}
