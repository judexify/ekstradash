import { useGlobalMarket } from '../hooks/useGlobalMarket.js'

export default function DominanceBar() {
  const { dominance, loading, error } = useGlobalMarket()

  return (
    <header className="dominance" aria-label="Market dominance">
      <span className="dominance-segment btc" style={{ flexGrow: dominance.btc }} />
      <span className="dominance-segment eth" style={{ flexGrow: dominance.eth }} />
      <span className="dominance-segment others" style={{ flexGrow: dominance.others }} />
      <div className="dominance-readout">
        {loading && 'DOMINANCE SYNC'}
        {error && 'DOMINANCE OFFLINE'}
        {!loading && !error && (
          <>
            BTC {dominance.btc.toFixed(1)}% / ETH {dominance.eth.toFixed(1)}% / OTHER{' '}
            {dominance.others.toFixed(1)}%
          </>
        )}
      </div>
    </header>
  )
}
