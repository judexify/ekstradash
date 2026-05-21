import { memo } from 'react'
import Sparkline from './Sparkline.jsx'
import { NGN_RATE } from '../config.js'
import { useGesture } from '../context/GestureContext.jsx'

function formatMoney(value, currency) {
  if (currency === 'NGN') {
    return `₦${Math.round(value * NGN_RATE).toLocaleString()}`
  }

  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 6,
  })}`
}

function CoinCard({ coin, rank, selected, priceDirection }) {
  const {
    gestureState: { currency },
  } = useGesture()
  const change = coin.price_change_percentage_24h ?? 0

  return (
    <article className={`coin-card ${selected ? 'selected' : ''}`}>
      <div className="coin-rank">{String(rank).padStart(2, '0')}</div>
      <img src={coin.image} alt="" className="coin-logo" />
      <div className="coin-identity">
        <strong>{coin.symbol.toUpperCase()}</strong>
        <span>{coin.name}</span>
      </div>
      <Sparkline prices={coin.sparkline_in_7d?.price ?? []} positive={change >= 0} />
      <div className="coin-price">
        <span key={currency} className={`price-value ${priceDirection}`}>
          {formatMoney(coin.current_price, currency)}
        </span>
        <span className={change >= 0 ? 'change up' : 'change down'}>
          {change >= 0 ? '+' : ''}
          {change.toFixed(2)}%
        </span>
      </div>
    </article>
  )
}

export default memo(CoinCard)
