import { WebSocketServer } from 'ws'
import { getRoom } from './roomStore.js'


export const createSocketServer = (server) => {
  const wss = new WebSocketServer({ server })
  const rooms = new Map()

  wss.on('connection', (socket) => {
    console.log('WebSocket client connected')

    socket.on('message', (data) => {
      const message = JSON.parse(data.toString())

      if (message.type === 'JOIN_ROOM') {
        const room = getRoom(message.roomCode)

        if (!room) {
          console.log(`Room ${message.roomCode} does not exist`)
          return
        }

        socket.roomCode = message.roomCode

        if (!rooms.has(message.roomCode)) {
          rooms.set(message.roomCode, new Set())
        }
        rooms.get(message.roomCode).add(socket)

        console.log(`Socket joined room ${message.roomCode}`)
      }

      if (message.type === 'TEST_BROADCAST') {
        const roomSockets = rooms.get(socket.roomCode)

        if (!roomSockets) {
          return
        }


        for (const client of roomSockets) {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({
              type: 'TEST_BROADCAST',
              message: message.message,
            }))

          }
        }
      }
    })



    socket.on('close', () => {
      console.log('WebSocket client disconnected')
    })
  })

  return wss
}