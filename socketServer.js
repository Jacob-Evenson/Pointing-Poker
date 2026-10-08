import { WebSocketServer } from 'ws'

export const createSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (socket) => {
    console.log('WebSocket client connected')

    socket.on('message', (data) => {
      const message = JSON.parse(data.toString())
      console.log('Received', message)
    })

    socket.on('close', () => {
      console.log('WebSocket client disconnected')
    })
  })

  return wss
}