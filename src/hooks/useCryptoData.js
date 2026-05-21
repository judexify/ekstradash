import { useEffect, useState } from 'react'
import { APIS } from '../config.js'
import { useGesture } from '../context/GestureContext.jsx'

function normalizeCoinCap(asset) {
  const symbol = asset.symbol?.toLowerCase() ?? 'coin'
  const price = Number(asset.priceUsd ?? 0)

  return {
    id: asset.id,
    symbol,
    name: asset.name,
    image: `https://assets.coincap.io/assets/icons/${symbol}@2x.png`,
    current_price: price,
    price_change_percentage_24h: Number(asset.changePercent24Hr ?? 0),
    sparkline_in_7d: { price: [] },
  }
}

async function fetchCoins(signal) {
  let primaryStatus = 'network_error'

  try {
    const primary = await fetch(APIS.coins, { signal })
    primaryStatus = primary.status

    if (primary.ok) {
      return primary.json()
    }
  } catch (error) {
    if (error.name === 'AbortError') throw error
  }

  const fallback = await fetch(APIS.coinsFallback, { signal })
  if (!fallback.ok) {
    throw new Error(`Coin feeds returned ${primaryStatus} and ${fallback.status}`)
  }

  const json = await fallback.json()
  return (json.data ?? []).map(normalizeCoinCap)
}

export function useCryptoData() {
  const { gestureState, dispatchGesture } = useGesture()
  const [coins, setCoins] = useState([])
  const [previousPrices, setPreviousPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCoins() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchCoins(controller.signal)
        setCoins((current) => {
          setPreviousPrices(
            Object.fromEntries(current.map((coin) => [coin.id, coin.current_price])),
          )
          return data
        })
        dispatchGesture({ type: 'SET_COIN_IDS', coinIds: data.map((coin) => coin.id) })
        dispatchGesture({ type: 'DATA_UPDATED', at: Date.now() })
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadCoins()
    return () => controller.abort()
  }, [gestureState.refreshTrigger, dispatchGesture])

  return { coins, previousPrices, loading, error }
}
