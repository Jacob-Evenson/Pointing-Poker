import { WebSocket, WebSocketServer } from 'ws'
import { getRoom } from './roomStore.js'
import { subscribeToRoomEvents } from './roomEvents.js'
import { removePlayerFromRoom } from './roomMembership.js'

const removeSocketFromRoom = (socket, rooms) => {
  if (!socket.roomCode) {
    return null
  }

  const roomCode = socket.roomCode
  const playerId = socket.playerId
  const roomSockets = rooms.get(roomCode)
  socket.roomCode = undefined
  socket.playerId = undefined

  if (!roomSockets) {
    return { roomCode, playerId }
  }

  roomSockets.delete(socket)
  if (roomSockets.size === 0) {
    rooms.delete(roomCode)
  }
  return { roomCode, playerId }
}

export const createSocketServer = (server) => {
  const wss = new WebSocketServer({ server })
  const rooms = new Map()

  const unsubscribe = subscribeToRoomEvents((roomCode, event) => {
    // Each connection is registered in one room set; never broadcast across rooms.
    const roomSockets = rooms.get(roomCode)
    if (!roomSockets) {
      return
    }

    let message
    try {
      message = JSON.stringify(event)
    } catch (error) {
      console.error('Failed to serialize room event:', error)
      return
    }
    if (typeof message !== 'string') {
      return
    }

    for (const client of roomSockets) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    }
  })

  wss.on('connection', (socket) => {
    console.log('WebSocket client connected')

    socket.on('message', (data) => {
      let message
      try {
        message = JSON.parse(data.toString())
      } catch (error) {
        console.warn('Ignoring malformed WebSocket message:', error.message)
        return
      }
      if (!message || typeof message !== 'object' || Array.isArray(message)) {
        return
      }

      if (message.type === 'JOIN_ROOM') {
        if (typeof message.roomCode !== 'string') {
          return
        }
        const room = getRoom(message.roomCode)

        if (!room) {
          console.log(`Room ${message.roomCode} does not exist`)
          return
        }

        if (
          message.playerId !== undefined
          && (
            typeof message.playerId !== 'string'
            || !room.players.some((player) => player.id === message.playerId)
          )
        ) {
          return
        }

        removeSocketFromRoom(socket, rooms)
        socket.roomCode = message.roomCode
        socket.playerId = message.playerId

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
          if (client.readyState === WebSocket.OPEN) {
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
      const disconnectedPlayer = removeSocketFromRoom(socket, rooms)
      if (!disconnectedPlayer?.playerId) {
        return
      }

      const remainingSockets = rooms.get(disconnectedPlayer.roomCode)
      const playerStillConnected = remainingSockets
        && [...remainingSockets].some((client) => client.playerId === disconnectedPlayer.playerId)
      if (!playerStillConnected) {
        removePlayerFromRoom(disconnectedPlayer.roomCode, disconnectedPlayer.playerId)
      }
    })
  })
  // Release the event-bus subscription when this server instance shuts down.
  wss.once('close', unsubscribe)
  return wss
}