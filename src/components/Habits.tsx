'use client'

import { useState, useTransition } from 'react'
import { addHabit, logHabit, deleteHabit } from '@/lib/actions'

interface Habit {
  id: string; name: string; icon: string; color: string;
}
interface HabitLog {
  habit_id: string; logged_date: string;
}

const HABIT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function Habits({ initialHabits, initialLogs }: { initialHabits: Habit[]; initialLogs: HabitLog[] }) {
  const [habits, setHabits] = useState(initialHabits)
  const [habitLogs, setHabitLogs] = useState(initialLogs)
  const [isPending, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('✅')
  const [newColor, setNewColor] = useState(HABIT_COLORS[0])

  const today = new Date().toISOString().split('T')[0]

  function handleLog(habitId: string) {
    startTransition(async () => {
      await logHabit(habitId)
      setHabitLogs(prev => {
        const exists = prev.some(l => l.habit_id === habitId && l.logged_date === today)
        if (exists) return prev.filter(l => !(l.habit_id === habitId && l.logged_date === today))
        return [...prev, { habit_id: habitId, logged_date: today }]
      })
    })
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    startTransition(async () => {
      const { data, error } = await addHabit(newName.trim(), newIcon, newColor)
      if (!error && data) {
        setHabits(prev => [...prev, data])
        setNewName('')
        setShowAdd(false)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteHabit(id)
      setHabits(prev => prev.filter(h => h.id !== id))
      setHabitLogs(prev => prev.filter(l => l.habit_id !== id))
    })
  }

  // 28天格子
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (27 - i))
    return d.toISOString().split('T')[0]
  })

  return (
    <div className="glass rounded-xl p-6 card-hover animate-fade-in" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <span role="img" aria-label="habits">🎯</span>
          习惯打卡
        </h2>
        <div className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
          <span className="text-emerald-400 text-sm font-medium">{habits.length} 个习惯</span>
        </div>
      </div>

      {/* 习惯列表 */}
      <div className="space-y-2 mb-4">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500">
            <span className="text-4xl mb-3" role="img" aria-label="empty">🎯</span>
            <p className="text-sm">还没有习惯</p>
          </div>
        ) : (
          habits.map(habit => {
            const logged = habitLogs.some(l => l.habit_id === habit.id && l.logged_date === today)
            const streak = habitLogs.filter(l => l.habit_id === habit.id).length
            return (
              <div
                key={habit.id}
                className="group flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition-all duration-200"
              >
                <button
                  onClick={() => handleLog(habit.id)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0 transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: logged ? habit.color : 'rgba(30, 41, 59, 0.5)',
                    border: `2px solid ${logged ? habit.color : 'rgba(100, 116, 139, 0.3)'}`,
                    boxShadow: logged ? `0 4px 12px ${habit.color}40` : 'none'
                  }}
                  aria-label={logged ? '取消打卡' : '打卡'}
                >
                  <span className={logged ? 'text-white font-bold' : ''}>
                    {logged ? '✓' : habit.icon}
                  </span>
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-slate-200 text-sm font-medium block truncate">{habit.name}</span>
                  <span className="text-slate-500 text-xs">{streak} 次打卡</span>
                </div>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all duration-200 p-1"
                  aria-label="删除习惯"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* 28天热力格子 */}
      {habits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/30">
          <p className="text-slate-400 text-xs mb-3 font-medium">最近28天记录</p>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(28, 1fr)` }}>
            {days.map((day, di) =>
              habits.map(habit => {
                const logged = habitLogs.some(l => l.habit_id === habit.id && l.logged_date === day)
                return (
                  <div
                    key={`${habit.id}-${di}`}
                    className="aspect-square rounded-sm transition-all duration-200 hover:scale-125"
                    style={{
                      backgroundColor: logged ? habit.color : 'rgba(30, 41, 59, 0.3)',
                      opacity: logged ? 1 : 0.3,
                    }}
                    title={`${habit.name} · ${day}${logged ? ' ✅' : ''}`}
                  />
                )
              })
            )}
          </div>
        </div>
      )}

      {/* 添加习惯 */}
      {showAdd ? (
        <form onSubmit={handleAdd} className="mt-5 space-y-3 pt-4 border-t border-slate-700/30">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="习惯名称..."
            className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div>
            <label className="text-xs text-slate-400 mb-2 block font-medium">选择图标</label>
            <div className="flex flex-wrap gap-2">
              {['✅', '🏃', '📚', '💧', '🧘', '🎨', '💪', '🌙'].map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewIcon(icon)}
                  className={`w-10 h-10 rounded-lg text-lg transition-all ${
                    newIcon === icon
                      ? 'bg-blue-600 ring-2 ring-blue-400 scale-110'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block font-medium">选择颜色</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    newColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-all btn-transition"
            >
              {isPending ? '添加中...' : '添加习惯'}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-5 w-full rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm py-3 font-medium transition-all duration-200 border border-slate-700 hover:border-slate-600"
        >
          + 添加习惯
        </button>
      )}
    </div>
  )
}
