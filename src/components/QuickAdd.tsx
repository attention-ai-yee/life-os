'use client'

import { useState, useTransition } from 'react'
import { addTodo, addExpense } from '@/lib/actions'

type Tab = 'todo' | 'expense'

const CATEGORIES = ['餐饮', '交通', '购物', '娱乐', '医疗', '通讯', '住房', '教育', '其他']

export default function QuickAdd() {
  const [tab, setTab] = useState<Tab>('todo')
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('餐饮')
  const [note, setNote] = useState('')

  function handleAddTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      await addTodo(title.trim(), priority)
      setTitle('')
      setDone(true)
      setTimeout(() => setDone(false), 1500)
    })
  }

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || isNaN(Number(amount))) return
    startTransition(async () => {
      await addExpense(Number(amount), category, note || undefined)
      setAmount('')
      setNote('')
      setDone(true)
      setTimeout(() => setDone(false), 1500)
    })
  }

  return (
    <div className="glass rounded-xl p-6 card-hover animate-fade-in" style={{ animationDelay: '600ms' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <span role="img" aria-label="quick add">⚡</span>
          快速添加
        </h2>
        {done && (
          <span className="text-emerald-400 text-sm font-medium animate-pulse">✓ 已添加</span>
        )}
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-4">
        {(['todo', 'expense'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {t === 'todo' ? '📋 待办' : '💰 支出'}
          </button>
        ))}
      </div>

      {/* 待办表单 */}
      {tab === 'todo' && (
        <form onSubmit={handleAddTodo} className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="今天要做什么？"
            className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="flex gap-2">
            {[
              { value: 'low', emoji: '🟢', label: '低' },
              { value: 'medium', emoji: '🟡', label: '中' },
              { value: 'high', emoji: '🔴', label: '高' },
            ].map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  priority === p.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-all btn-transition"
          >
            {isPending ? '添加中...' : '添加'}
          </button>
        </form>
      )}

      {/* 支出表单 */}
      {tab === 'expense' && (
        <form onSubmit={handleAddExpense} className="space-y-3">
          <input
            autoFocus
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="金额"
            className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="备注（可选）"
            className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isPending || !amount}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-all btn-transition"
          >
            {isPending ? '记录中...' : '记一笔'}
          </button>
        </form>
      )}
    </div>
  )
}
