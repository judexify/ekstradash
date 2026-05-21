import { WebSocketServer } from 'ws'
import { WS_PORT } from './config.js'

export function createGestureSocket() {
  const server = new WebSocketServer({ port: WS_PORT })
  const clients = new Set()

  server.on('connection', (socket) => {
    clients.add(socket)
    console.log(`[ws] client connected (${clients.size})`)
    socket.on('close', () => clients.delete(socket))
  })

  server.on('listening', () => {
    console.log(`[ws] listening on ${WS_PORT}`)
  })

  function broadcast(gesture) {
    const message = JSON.stringify({ gesture })
    console.log(`[ws] broadcast ${gesture} to ${clients.size} client(s)`)
    for (const client of clients) {
      if (client.readyState === 1) client.send(message)
    }
  }

  return { broadcast }
}
