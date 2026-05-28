'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Goal {
  id: string; title: string; target: number; current: number; unit: string;
}

export default function Goals({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState(initialGoals)
  const [isPending, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newUnit, setNewUnit] = useState('次')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newTarget) return
    startTransition(async () => {
      const supabase = createClient()
      const { data } = await supabase.from('goals').insert({
        title: newTitle.trim(),
        target: Number(newTarget),
        current: 0,
        unit: newUnit,
      }).select().single()
      if (data) setGoals(prev => [...prev, data])
      setNewTitle('')
      setNewTarget('')
      setNewUnit('次')
      setShowAdd(false)
    })
  }

  function handleUpdate(id: string, current: number) {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('goals').update({ current }).eq('id', id)
      setGoals(prev => prev.map(g => g.id === id ? { ...g, current } : g))
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('goals').delete().eq('id', id)
      setGoals(prev => prev.filter(g => g.id !== id))
    })
  }

  const UNITS = ['次', '本', '小时', '天', '个', '公里', '元', '斤']

  return (
    <div className="glass rounded-xl p-6 card-hover animate-fade-in" style={{ animationDelay: '800ms' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <span role="img" aria-label="goals">🏆</span>
          年度目标
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          {showAdd ? '取消' : '+ 添加'}
        </button>
      </div>

      <div className="space-y-4">
        {goals.length === 0 && !showAdd && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <span className="text-4xl mb-3" role="img" aria-label="empty">🏆</span>
            <p className="text-sm">还没有目标</p>
          </div>
        )}

        {goals.map((goal, index) => {
          const pct = Math.min((goal.current / goal.target) * 100, 100)
          const remaining = Math.max(goal.target - goal.current, 0)
          const isAchieved = pct >= 100

          return (
            <div
              key={goal.id}
              className="group p-4 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition-all duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-200 text-sm font-medium truncate flex-1 mr-3">{goal.title}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdate(goal.id, Math.max(0, goal.current - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all text-base font-semibold"
                    aria-label="减少"
                  >
                    -
                  </button>
                  <div className="flex flex-col items-center min-w-[80px]">
                    <span className="text-white text-sm font-semibold">
                      {goal.current} / {goal.target}
                    </span>
                    <span className="text-slate-500 text-xs">{goal.unit}</span>
                  </div>
                  <button
                    onClick={() => handleUpdate(goal.id, goal.current + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all text-base font-semibold"
                    aria-label="增加"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded text-slate-500 hover:text-rose-400 transition-all flex items-center justify-center"
                    aria-label="删除目标"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: isAchieved
                      ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                      : pct >= 50
                        ? 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
                        : 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-500 text-xs">
                  {isAchieved ? '🎉 已达成！' : `还差 ${remaining} ${goal.unit}`}
                </span>
                <span className={`text-xs font-medium ${
                  isAchieved ? 'text-emerald-400' : pct >= 50 ? 'text-blue-400' : 'text-amber-400'
                }`}>
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="mt-5 space-y-3 pt-4 border-t border-slate-700/30">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="目标名称（如：读完20本书）"
            className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newTarget}
              onChange={e => setNewTarget(e.target.value)}
              placeholder="目标值"
              className="w-28 bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <select
              value={newUnit}
              onChange={e => setNewUnit(e.target.value)}
              className="flex-1 bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-all btn-transition"
          >
            {isPending ? '添加中...' : '添加目标'}
          </button>
        </form>
      )}
    </div>
  )
}
