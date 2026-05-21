import WebSocket from 'ws'
import { EKSTRA_CLOUD_WS_ENABLED, EKSTRA_CLOUD_WS_URL } from './config.js'

export function createEkstraCloudProbe() {
  // EKSTRA_INTEGRATION_POINT
  if (!EKSTRA_CLOUD_WS_ENABLED) return { close() {} }

  let samplesSeen = 0
  const socket = new WebSocket(EKSTRA_CLOUD_WS_URL)

  socket.on('open', () => {
    console.log(`[ekstra-ws] connected ${EKSTRA_CLOUD_WS_URL}`)
    socket.send(JSON.stringify({ type: 'ping' }))
  })

  socket.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())

      if (message.type === 'ready') {
        console.log(`[ekstra-ws] ready topic=${message.subscribed_topic ?? 'unknown'}`)
        return
      }

      if (message.type === 'event' && message.topic === 'motion.samples') {
        samplesSeen += 1
        const event = message.event ?? {}
        const metadata = event.metadata ?? {}
        console.log(
          `[ekstra-ws] motion.samples #${samplesSeen} provider=${metadata.provider ?? 'unknown'} confidence=${event.confidence ?? 'n/a'}`,
        )
        return
      }

      if (message.type === 'error') {
        console.log(`[ekstra-ws] error ${message.message ?? 'unknown'}`)
      }
    } catch {
      console.log('[ekstra-ws] non-json message received')
    }
  })

  socket.on('close', () => {
    console.log('[ekstra-ws] disconnected')
  })

  socket.on('error', (error) => {
    console.log(`[ekstra-ws] error ${error.message}`)
  })

  return {
    close() {
      socket.close()
    },
  }
}
