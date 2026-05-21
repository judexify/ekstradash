import { useEffect, useMemo, useState } from 'react'
import { APIS } from '../config.js'
import { useGesture } from '../context/GestureContext.jsx'

const FEAR_GREED_REFRESH_MS = 300000

const moodStyles = {
  fear: {
    accent: '#ff3a3a',
    glow: 'rgba(255, 58, 58, 0.24)',
    borderActive: 'rgba(255, 58, 58, 0.68)',
  },
  neutral: {
    accent: '#4a9eff',
    glow: 'rgba(74, 158, 255, 0.22)',
    borderActive: 'rgba(74, 158, 255, 0.68)',
  },
  greed: {
    accent: '#00d26a',
    glow: 'rgba(0, 210, 106, 0.22)',
    borderActive: 'rgba(0, 210, 106, 0.68)',
  },
}

function getMood(score) {
  if (score < 40) return 'fear'
  if (score > 60) return 'greed'
  return 'neutral'
}

export function useFearGreed() {
  const {
    gestureState: { refreshTrigger },
  } = useGesture()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadFearGreed() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(APIS.fearGreed, { signal: controller.signal })
        if (!response.ok) throw new Error(`Fear & Greed returned ${response.status}`)
        const json = await response.json()
        const latest = json.data?.[0]
        if (!latest) throw new Error('Fear & Greed response was empty')
        setData({
          score: Number(latest.value),
          label: latest.value_classification,
          updatedAt: Number(latest.timestamp) * 1000,
        })
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadFearGreed()
    const interval = setInterval(loadFearGreed, FEAR_GREED_REFRESH_MS)

    return () => {
      controller.abort()
      clearInterval(interval)
    }
  }, [refreshTrigger])

  const mood = useMemo(() => getMood(data?.score ?? 50), [data])

  useEffect(() => {
    const styles = moodStyles[mood]
    const root = document.documentElement
    root.style.setProperty('--accent', styles.accent)
    root.style.setProperty('--glow', styles.glow)
    root.style.setProperty('--border-active', styles.borderActive)
  }, [mood])

  return { data, mood, loading, error }
}
