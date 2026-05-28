'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
  temp: number
  condition: string
  icon: string
  humidity: number
  wind: number
  location: string
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://wttr.in/Shanghai?format=j1')
      .then(r => r.json())
      .then(data => {
        const curr = data.current_condition[0]
        const desc = curr.weatherDesc[0].value
        const iconMap: Record<string, string> = {
          'Sunny': '☀️', 'Clear': '🌙', 'Partly cloudy': '⛅', 'Cloudy': '☁️',
          'Overcast': '☁️', 'Mist': '🌫️', 'Fog': '🌫️', 'Light rain': '🌦️',
          'Heavy Rain': '🌧️', 'Thunder': '⛈️', 'Snow': '❄️', 'Sleet': '🌨️',
          'Light drizzle': '🌧️', 'Blowing snow': '🌨️',
        }
        setWeather({
          temp: Math.round(parseInt(curr.temp_C)),
          condition: desc,
          icon: iconMap[desc] ?? '🌡️',
          humidity: parseInt(curr.humidity),
          wind: parseInt(curr.windspeedKmph),
          location: '上海',
        })
        setLoading(false)
      })
      .catch(() => {
        setWeather({ temp: 22, condition: '未知', icon: '🌡️', humidity: 50, wind: 10, location: '上海' })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 card-hover">
        <div className="space-y-4">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-10 w-20 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="glass rounded-xl p-6 card-hover animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(30, 41, 59, 0.6) 100%)',
        animationDelay: '200ms',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{weather?.location}</p>
          <p className="text-5xl font-light text-white mb-2">{weather?.temp}°</p>
          <p className="text-slate-300 text-sm font-medium">{weather?.condition}</p>
        </div>
        <div className="text-6xl" role="img" aria-label={weather?.condition}>{weather?.icon}</div>
      </div>
      <div className="flex gap-4 mt-5 pt-4 border-t border-slate-700/30">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-sky-400" role="img" aria-label="湿度">💧</span>
          <span className="text-slate-300 font-medium">{weather?.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-sky-400" role="img" aria-label="风速">🌬️</span>
          <span className="text-slate-300 font-medium">{weather?.wind} km/h</span>
        </div>
      </div>
    </div>
  )
}
