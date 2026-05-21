import { useEffect, useState } from 'react'
import { APIS } from '../config.js'

export function useGlobalMarket() {
  const [dominance, setDominance] = useState({ btc: 0, eth: 0, others: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadGlobalMarket() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(APIS.global, { signal: controller.signal })
        if (!response.ok) throw new Error(`CoinGecko global returned ${response.status}`)
        const json = await response.json()
        const btc = Number(json.data?.market_cap_percentage?.btc ?? 0)
        const eth = Number(json.data?.market_cap_percentage?.eth ?? 0)
        setDominance({ btc, eth, others: Math.max(0, 100 - btc - eth) })
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadGlobalMarket()
    return () => controller.abort()
  }, [])

  return { dominance, loading, error }
}
