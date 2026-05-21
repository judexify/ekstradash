export const NGN_RATE = 1650
export const COIN_COUNT = 15
export const WS_PORT = 8080

export function getEkstraWsUrl() {
  if (import.meta.env.VITE_EKSTRA_WS_URL) return import.meta.env.VITE_EKSTRA_WS_URL
  if (typeof window === 'undefined') return `ws://localhost:${WS_PORT}`

  return `ws://${window.location.hostname}:${WS_PORT}`
}

export const APIS = {
  coins: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${COIN_COUNT}&page=1&sparkline=true`,
  coinsFallback: `https://api.coincap.io/v2/assets?limit=${COIN_COUNT}`,
  fearGreed: `https://api.alternative.me/fng/`,
  global: `https://api.coingecko.com/api/v3/global`,
}
