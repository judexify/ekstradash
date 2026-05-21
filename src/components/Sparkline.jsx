import { memo, useMemo } from 'react'

function Sparkline({ prices, positive }) {
  const path = useMemo(() => {
    if (!prices.length) return ''
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min || 1
    return prices
      .map((price, index) => {
        const x = (index / Math.max(prices.length - 1, 1)) * 100
        const y = 36 - ((price - min) / range) * 32
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(' ')
  }, [prices])

  return (
    <svg className="sparkline" viewBox="0 0 100 40" role="img" aria-label="Seven day sparkline">
      <path className={positive ? 'positive' : 'negative'} d={path} pathLength="100" />
    </svg>
  )
}

export default memo(Sparkline)
