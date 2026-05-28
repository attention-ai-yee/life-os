'use client'

import { useState, useTransition } from 'react'
import { addExpense } from '@/lib/actions'

interface Expense {
  id: string; amount: number; category: string; note: string | null; expense_date: string;
}

const CATEGORIES = [
  { label: '餐饮', value: '餐饮', emoji: '🍜' },
  { label: '交通', value: '交通', emoji: '🚌' },
  { label: '购物', value: '购物', emoji: '🛒' },
  { label: '娱乐', value: '娱乐', emoji: '🎮' },
  { label: '医疗', value: '医疗', emoji: '💊' },
  { label: '通讯', value: '通讯', emoji: '📱' },
  { label: '住房', value: '住房', emoji: '🏠' },
  { label: '教育', value: '教育', emoji: '📚' },
  { label: '其他', value: '其他', emoji: '☕' },
]

export default function Expenses({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [isPending, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('餐饮')
  const [note, setNote] = useState('')

  const monthExpenses = expenses.filter(e => {
    const m = new Date().toISOString().slice(0, 7)
    return e.expense_date.startsWith(m)
  })
  const total = monthExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const monthName = new Date().toLocaleDateString('zh-CN', { month: 'long' })

  // 最近7天
  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  const byDay = last7.map(date => ({
    date,
    label: new Date(date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
    amount: monthExpenses.filter(e => e.expense_date === date).reduce((s, e) => s + Number(e.amount), 0),
  }))
  const maxAmt = Math.max(...byDay.map(d => d.amount), 1)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return
    startTransition(async () => {
      const { data, error } = await addExpense(Number(amount), category, note || undefined)
      if (!error && data) {
        setExpenses(prev => [data, ...prev])
        setAmount('')
        setNote('')
        setShowAdd(false)
      }
    })
  }

  return (
    <div className="glass rounded-xl p-6 card-hover animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <span role="img" aria-label="expenses">💰</span>
          {monthName}支出
        </h2>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30">
          <span className="text-rose-400 font-semibold text-sm">¥{total.toFixed(2)}</span>
        </div>
      </div>

      {/* 柱状图 */}
      <div className="h-24 flex items-end justify-around gap-1 mb-5">
        {byDay.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
            {d.amount > 0 && (
              <span className="text-emerald-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                ¥{d.amount.toFixed(0)}
              </span>
            )}
            <div
              className="w-full rounded-t-md transition-all duration-300 group-hover:shadow-lg"
              style={{
                height: `${Math.max((d.amount / maxAmt) * 72, d.amount > 0 ? 8 : 0)}px`,
                background: d.amount > 0
                  ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
                  : 'rgba(30, 41, 59, 0.3)',
              }}
              title={`${d.label}: ¥${d.amount.toFixed(2)}`}
            />
            <span className="text-slate-500 text-xs font-medium">{d.label}</span>
          </div>
        ))}
      </div>

      {/* 本月分类 */}
      {monthExpenses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(
            monthExpenses.reduce((acc, e) => {
              acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount)
              return acc
            }, {} as Record<string, number>)
          ).map(([cat, amt]) => {
            const catInfo = CATEGORIES.find(c => c.value === cat)
            return (
              <span
                key={cat}
                className="text-xs bg-slate-800/60 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700/50 font-medium transition-all hover:bg-slate-700/50"
              >
                {catInfo?.emoji} {cat} <span className="text-emerald-400 ml-1">¥{amt.toFixed(0)}</span>
              </span>
            )
          })}
        </div>
      )}

      {/* 添加表单 */}
      {showAdd ? (
        <form onSubmit={handleAdd} className="mt-5 space-y-3 pt-4 border-t border-slate-700/30">
          <div className="flex gap-2">
            <input
              autoFocus
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="金额"
              className="flex-1 bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-32 bg-slate-800/60 border border-slate-600 rounded-lg px-3 py-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="备注（可选）"
            className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-all btn-transition"
            >
              {isPending ? '记录中...' : '记录支出'}
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
          + 记一笔
        </button>
      )}
    </div>
  )
}
