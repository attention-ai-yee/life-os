import { createClient } from '@/lib/supabase/server'
import Todos from '@/components/Todos'
import Habits from '@/components/Habits'
import Expenses from '@/components/Expenses'
import Notes from '@/components/Notes'
import Weather from '@/components/Weather'
import FocusTimer from '@/components/FocusTimer'
import ThemeToggle from '@/components/ThemeToggle'
import Clock from '@/components/Clock'
import QuickAdd from '@/components/QuickAdd'
import Quote from '@/components/Quote'
import Bookmarks from '@/components/Bookmarks'
import Goals from '@/components/Goals'

export default async function Home() {
  const supabase = await createClient()

  const [
    { data: todos }, { data: habits }, { data: habitLogs }, { data: expenses },
    { data: bookmarks }, { data: notes }, { data: goals },
  ] = await Promise.all([
    supabase.from('todos').select('*').order('created_at', { ascending: false }),
    supabase.from('habits').select('*').limit(20),
    supabase.from('habit_logs').select('habit_id, logged_date'),
    supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
    supabase.from('bookmarks').select('*').order('sort_order'),
    supabase.from('notes').select('*').order('updated_at', { ascending: false }).limit(1),
    supabase.from('goals').select('*'),
  ])

  const t = (todos ?? []) as any[]
  const h = (habits ?? []) as any[]
  const hl = (habitLogs ?? []) as any[]
  const e = (expenses ?? []) as any[]
  const b = (bookmarks ?? []) as any[]
  const n = (notes ?? []) as any[]
  const g = (goals ?? []) as any[]

  const completedCount = t.filter(x => x.completed).length
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const weekStart = new Date(now.getTime() - 6 * 86400000).toISOString().split('T')[0]
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]

  const monthExpenses = e.filter(x => x.expense_date >= monthStart)
  const monthTotal = monthExpenses.reduce((s: number, x: any) => s + Number(x.amount), 0)
  const monthLogCount = hl.filter(l => new Date(l.logged_date) >= new Date(now.getTime() - 30 * 86400000)).length
  const weekLogs = hl.filter(l => l.logged_date >= weekStart)
  const weekTotal = e.filter(x => x.expense_date >= weekStart).reduce((s: number, x: any) => s + Number(x.amount), 0)

  const catMap: Record<string, number> = {}
  monthExpenses.forEach((x: any) => { catMap[x.category] = (catMap[x.category] ?? 0) + Number(x.amount) })

  const weeklyData = Array.from({ length: 5 }, (_, i) => {
    const weekEnd = new Date(now.getTime() - i * 7 * 86400000)
    const weekStartD = new Date(weekEnd.getTime() - 6 * 86400000)
    const total = e.filter((x: any) => {
      const d = new Date(x.expense_date)
      return d >= weekStartD && d <= weekEnd
    }).reduce((s: number, x: any) => s + Number(x.amount), 0)
    return { label: `第${6 - i}周`, total }
  }).reverse()
  const maxWeekly = Math.max(...weeklyData.map(w => w.total), 1)

  const achievedGoals = g.filter((goal: any) => goal.current >= goal.target).length

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 font-sans">
      {/* 顶部日期栏 */}
      <header className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {now.toLocaleDateString('zh-CN', { weekday: 'long' })} · {now.getFullYear()}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm">
            <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-slate-400">📋</span>
              <span className="text-white font-medium">{completedCount}/{t.length}</span>
              <span className="text-slate-400 text-xs">待办</span>
            </div>
            <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-slate-400">💰</span>
              <span className="text-emerald-400 font-medium">¥{monthTotal.toFixed(0)}</span>
              <span className="text-slate-400 text-xs">本月</span>
            </div>
            <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-slate-400">🎯</span>
              <span className="text-white font-medium">{achievedGoals}/{g.length}</span>
              <span className="text-slate-400 text-xs">目标</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主网格 3列 */}
      <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">

        {/* 🕐 时钟 */}
        <Clock />

        {/* 🌤️ 天气 */}
        <Weather />

        {/* ⏱️ 专注 */}
        <FocusTimer />

        {/* 🎯 目标 */}
        <Goals initialGoals={g} />

        {/* ⚡ 快速添加 */}
        <QuickAdd />

        {/* 📋 待办 */}
        <Todos initialTodos={t} />

        {/* 🎯 习惯 */}
        <Habits initialHabits={h} initialLogs={hl} />

        {/* 💰 支出 */}
        <Expenses initialExpenses={e} />

        {/* ⚡ 书签 */}
        <Bookmarks initialBookmarks={b} />

        {/* 📝 随手记 */}
        <Notes initialNote={n[0] ?? null} />

        {/* 🎨 主题 */}
        <ThemeToggle />

      </main>

      {/* 底部统计 + 语录 */}
      <footer className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <span role="img" aria-label="chart">📊</span>
              本月支出分类
            </h3>
            <span className="text-emerald-400 text-xs font-medium">¥{monthTotal.toFixed(0)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(catMap).slice(0, 8).map(([cat, amt]) => (
              <span
                key={cat}
                className="bg-slate-800/80 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-700 cursor-default"
              >
                {cat}
                <span className="text-emerald-400 ml-1">¥{amt.toFixed(0)}</span>
              </span>
            ))}
            {Object.keys(catMap).length === 0 && (
              <span className="text-slate-500 text-sm italic">暂无数据</span>
            )}
          </div>
        </div>
        <Quote />
      </footer>

      {/* 近5周趋势 */}
      {weeklyData.length > 0 && (
        <section className="mt-5 glass rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <span role="img" aria-label="trend">📈</span>
              近5周支出趋势
            </h3>
            <span className="text-rose-400 text-xs font-medium">
              总计 ¥{weeklyData.reduce((sum, w) => sum + w.total, 0).toFixed(0)}
            </span>
          </div>
          <div className="flex items-end gap-3 md:gap-4 h-20 md:h-24">
            {weeklyData.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-emerald-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  ¥{w.total.toFixed(0)}
                </span>
                <div
                  className="w-full rounded-t-md transition-all duration-300 group-hover:shadow-lg"
                  style={{
                    height: `${Math.max((w.total / maxWeekly) * 60, w.total > 0 ? 8 : 0)}px`,
                    background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                  }}
                />
                <span className="text-slate-400 text-xs font-medium">{w.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
