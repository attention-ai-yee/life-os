'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const PRESETS = [
  { label: '25min', minutes: 25 },
  { label: '15min', minutes: 15 },
  { label: '5min', minutes: 5 },
  { label: '45min', minutes: 45 },
]

export default function FocusTimer() {
  const [mode, setMode] = useState<'idle' | 'focus' | 'break'>('idle')
  const [preset, setPreset] = useState(25)
  const [remaining, setRemaining] = useState(25 * 60)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const playBeep = useCallback(() => {
    try {
      const a = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3')
      a.volume = 0.5
      a.play().catch(() => {})
    } catch {}
  }, [])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const startTimer = useCallback((minutes: number, type: 'focus' | 'break') => {
    stopTimer()
    setRemaining(minutes * 60)
    setMode(type)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          playBeep()
          stopTimer()
          if (type === 'focus') {
            setSessions(s => s + 1)
            setMode('idle')
          } else {
            setMode('idle')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer, playBeep])

  const cancel = () => {
    stopTimer()
    setMode('idle')
    setRemaining(preset * 60)
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const progress = mode === 'idle' ? 0 : (1 - remaining / (preset * 60)) * 100

  return (
    <div className="glass rounded-xl p-6 card-hover animate-fade-in" style={{ animationDelay: '700ms' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <span role="img" aria-label="timer">⏱️</span>
          专注计时
        </h2>
        <div className="px-3 py-1.5 rounded-lg bg-slate-800/80">
          <span className="text-slate-400 text-xs">已专注 </span>
          <span className="text-emerald-400 text-sm font-semibold">{sessions}</span>
          <span className="text-slate-400 text-xs"> 次</span>
        </div>
      </div>

      {/* 显示 */}
      <div className="flex flex-col items-center py-6">
        {mode !== 'idle' && (
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium mb-3 ${
              mode === 'focus'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {mode === 'focus' ? '🔴 专注中' : '🟢 休息中'}
          </div>
        )}
        <div className="relative">
          <span className="text-6xl font-mono font-bold text-white tracking-widest">
            {mm}:{ss}
          </span>
          {mode !== 'idle' && (
            <div
              className="absolute -bottom-2 left-0 w-full h-1 bg-slate-700 rounded-full overflow-hidden"
            >
              <div
                className={`h-full rounded-full transition-all ${
                  mode === 'focus'
                    ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="space-y-3">
        {mode === 'idle' ? (
          <>
            <div className="flex gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setPreset(p.minutes); setRemaining(p.minutes * 60) }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    preset === p.minutes
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => startTimer(preset, 'focus')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-3 rounded-lg transition-all btn-transition"
            >
              开始专注 🔴
            </button>
          </>
        ) : (
          <button
            onClick={cancel}
            className="w-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-medium py-3 rounded-lg transition-colors"
          >
            停止
          </button>
        )}
      </div>
    </div>
  )
}
