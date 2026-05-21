import { useEkstraSocket } from '../hooks/useEkstraSocket.js'
import { useGesture } from '../context/GestureContext.jsx'

export default function StatusBar() {
  const status = useEkstraSocket()
  const {
    gestureState: { lastUpdated },
  } = useGesture()

  return (
    <footer className="status-bar">
      <span className={`status-light ${status}`} />
      <span>Ekstra socket {status}</span>
      <span>
        Last updated{' '}
        {lastUpdated
          ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '--:--'}
      </span>
    </footer>
  )
}
