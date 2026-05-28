'use client'

import { useState, useTransition } from 'react'
import { addTodo, toggleTodo, deleteTodo } from '@/lib/actions'

interface Todo {
  id: string; title: string; completed: boolean; priority: string; due_date: string | null;
}

export default function Todos({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos)
  const [isPending, startTransition] = useTransition()
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [showAdd, setShowAdd] = useState(false)

  const completedCount = todos.filter(t => t.completed).length

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    startTransition(async () => {
      const { data, error } = await addTodo(newTitle.trim(), newPriority)
      if (!error && data) {
        setTodos(prev => [data, ...prev])
        setNewTitle('')
        setShowAdd(false)
      }
    })
  }

  function handleToggle(id: string, completed: boolean) {
    startTransition(async () => {
      await toggleTodo(id, !completed)
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTodo(id)
      setTodos(prev => prev.filter(t => t.id !== id))
    })
  }

  return (
    <div className="glass rounded-xl p-6 card-hover animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <span role="img" aria-label="todos">📋</span>
          待办事项
        </h2>
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800/80">
          <span className="text-emerald-400 font-semibold text-sm">{completedCount}</span>
          <span className="text-slate-500 text-xs">/</span>
          <span className="text-slate-300 text-xs">{todos.length}</span>
        </div>
      </div>

      {/* 列表 */}
      <div className="space-y-2 min-h-[120px] max-h-[300px] overflow-y-auto pr-2">
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <span className="text-4xl mb-3" role="img" aria-label="empty">📝</span>
            <p className="text-sm">还没有待办事项</p>
          </div>
        ) : (
          todos.map((todo, index) => (
            <div
              key={todo.id}
              className="group flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition-all duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => handleToggle(todo.id, todo.completed)}
                className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all duration-200 border-2 ${
                  todo.completed
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-500 hover:border-emerald-400 hover:bg-emerald-500/10'
                }`}
                aria-label={todo.completed ? '标记为未完成' : '标记为完成'}
              >
                {todo.completed && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </button>
              <span className={`text-sm flex-1 transition-all duration-200 ${
                todo.completed
                  ? 'line-through text-slate-500'
                  : 'text-slate-200'
              }`}>
                {todo.title}
              </span>
              <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                todo.priority === 'high'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : todo.priority === 'medium'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
              }`}>
                {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
              </span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all duration-200 p-1"
                aria-label="删除待办"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* 添加表单 */}
      {showAdd ? (
        <form onSubmit={handleAdd} className="mt-5 space-y-3 pt-4 border-t border-slate-700/30">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="今天要做什么？"
            className="w-full bg-slate-800/60 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-colors"
          />
          <div className="flex gap-2">
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
              className="flex-1 bg-slate-800/60 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="low">🟢 低优先级</option>
              <option value="medium">🟡 中优先级</option>
              <option value="high">🔴 高优先级</option>
            </select>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all btn-transition"
            >
              {isPending ? '添加中...' : '添加'}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-2 text-slate-400 hover:text-white transition-colors"
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
          + 添加待办
        </button>
      )}
    </div>
  )
}
