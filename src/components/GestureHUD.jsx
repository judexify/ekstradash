import { useGesture } from '../context/GestureContext.jsx'

export default function GestureHUD() {
  const {
    gestureState: { lastGesture, lastGestureAt },
  } = useGesture()

  if (!lastGesture) return null

  return (
    <div className="gesture-hud" key={lastGestureAt}>
      <span>Gesture</span>
      <strong>{lastGesture.replaceAll('_', ' ')}</strong>
    </div>
  )
}
