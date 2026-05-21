import { dispatchGesture, useGesture } from '../context/GestureContext.jsx'

export default function CurrencyToggle() {
  const {
    gestureState: { currency },
  } = useGesture()

  return (
    <button
      className="currency-toggle"
      type="button"
      onClick={() => dispatchGesture('TOGGLE_CURRENCY')}
      aria-label="Toggle currency"
    >
      <span className={currency === 'USD' ? 'active' : ''}>USD</span>
      <span className={currency === 'NGN' ? 'active' : ''}>NGN ≈ ₦1,650</span>
    </button>
  )
}
