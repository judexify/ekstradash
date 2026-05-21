import { useEffect, useMemo, useRef } from 'react'
import CoinCard from './CoinCard.jsx'
import { useCryptoData } from '../hooks/useCryptoData.js'
import { useGesture } from '../context/GestureContext.jsx'

export default function CoinList() {
  const cardRefs = useRef([])
  const { coins, previousPrices, loading, error } = useCryptoData()
  const {
    gestureState: { coinOrder, selectedIndex },
  } = useGesture()

  const pinnedCoin = useMemo(() => coins.find((coin) => coin.pinned), [coins])

  const orderedCoins = useMemo(() => {
    const regular = coins.filter((coin) => !coin.pinned)
    if (!coinOrder.length) return regular

    const byId = new Map(coins.map((coin) => [coin.id, coin]))
    return coinOrder
      .map((id) => byId.get(id))
      .filter((coin) => coin && !coin.pinned)
  }, [coins, coinOrder])

  useEffect(() => {
    const selectedCard = cardRefs.current[selectedIndex]
    selectedCard?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [selectedIndex])

  return (
    <section className="coin-stage" aria-label="Crypto market list">
      <div className="list-header">
        <span>Asset</span>
        <span>Seven day trace</span>
        <span>Price / twenty four hour</span>
      </div>
      {loading && <div className="data-state">Loading live market feed</div>}
      {error && <div className="data-state error">Market feeds offline: {error}</div>}
      {!loading && !error && (
        <div className="coin-list-shell">
          {pinnedCoin && (
            <div className="pinned-coin">
              <CoinCard
                coin={pinnedCoin}
                rank={0}
                selected={false}
                priceDirection={
                  previousPrices[pinnedCoin.id] === undefined
                    ? 'steady'
                    : pinnedCoin.current_price > previousPrices[pinnedCoin.id]
                      ? 'flash-up'
                      : pinnedCoin.current_price < previousPrices[pinnedCoin.id]
                        ? 'flash-down'
                        : 'steady'
                }
              />
            </div>
          )}
          <div className="coin-list">
            {orderedCoins.map((coin, index) => {
            const previousPrice = previousPrices[coin.id]
            const priceDirection =
              previousPrice === undefined
                ? 'steady'
                : coin.current_price > previousPrice
                  ? 'flash-up'
                  : coin.current_price < previousPrice
                    ? 'flash-down'
                    : 'steady'

            return (
              <div
                key={coin.id}
                ref={(node) => {
                  cardRefs.current[index] = node
                }}
              >
                <CoinCard
                  coin={coin}
                  rank={index + 1}
                  selected={index === selectedIndex}
                  priceDirection={priceDirection}
                />
              </div>
            )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
