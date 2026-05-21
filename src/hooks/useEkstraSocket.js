import { useEffect } from 'react'
import { getEkstraWsUrl } from '../config.js'
import { dispatchGesture, useGesture } from '../context/GestureContext.jsx'

export function useEkstraSocket() {
  const { gestureState, dispatchGesture: dispatchLocal } = useGesture()

  useEffect(() => {
    let socket

    try {
      // EKSTRA_INTEGRATION_POINT
      socket = new WebSocket(getEkstraWsUrl())
      dispatchLocal({ type: 'SET_CONNECTION_STATUS', status: 'connecting' })

      socket.onopen = () => {
        dispatchLocal({ type: 'SET_CONNECTION_STATUS', status: 'connected' })
      }

      socket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data)
          if (packet.gesture) dispatchGesture(packet.gesture)
        } catch {
          dispatchLocal({ type: 'SET_CONNECTION_STATUS', status: 'connected' })
        }
      }

      socket.onclose = () => {
        dispatchLocal({ type: 'SET_CONNECTION_STATUS', status: 'offline' })
      }

      socket.onerror = () => {
        dispatchLocal({ type: 'SET_CONNECTION_STATUS', status: 'offline' })
      }
    } catch {
      dispatchLocal({ type: 'SET_CONNECTION_STATUS', status: 'offline' })
    }

    return () => {
      if (socket && socket.readyState <= WebSocket.OPEN) socket.close()
    }
  }, [dispatchLocal])

  return gestureState.connectionStatus
}
