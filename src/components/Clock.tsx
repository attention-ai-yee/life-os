'use client'

import { useState, useEffect } from 'react'

export default function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const hour = time.getHours()
  const greeting = hour < 6 ? '夜深了，早点休息' :
                   hour < 9 ? '早上好，开启新一天' :
                   hour < 12 ? '上午好，保持专注' :
                   hour < 14 ? '午饭时间到了' :
                   hour < 18 ? '下午好，继续加油' :
                   hour < 22 ? '晚上好，充实的一天' :
                   '夜深了，早点睡'

  const timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const dateStr = time.toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="glass rounded-xl p-6 card-hover animate-fade-in" style={{ animationDelay: '100ms' }}>
      <div className="flex flex-col items-center text-center">
        <p className="text-slate-400 text-xs font-medium tracking-wider uppercase mb-3">{dateStr}</p>
        <p className="text-5xl md:text-6xl font-mono font-bold text-white tracking-widest mb-3">
          {timeStr}
        </p>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <p className="text-blue-300 text-xs font-medium">{greeting}</p>
        </div>
      </div>
    </div>
  )
}
