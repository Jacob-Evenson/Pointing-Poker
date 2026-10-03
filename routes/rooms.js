import { Router } from 'express'
import { createRoom, getRoom, roomExists, getAllRooms } from '../roomStore.js'
import { generateUniqueRoomCode } from '../src/components/roomCode.js'

// Seed the demo rooms in the shared room store if they don't exist yet.
if (!roomExists('JACOBS-26')) {
  createRoom('JACOBS-26')
}
if (!roomExists('TEAM-42')) {
  createRoom('TEAM-42')
}

const roomsRouter = Router({ caseSensitive: true, strict: true })

roomsRouter.all('/:roomCode', (request, response, next) => {
  if (request.method !== 'GET') {
    return response.status(404).json({ error: 'Not found' })
  }

  return next()
})

roomsRouter.get('/:roomCode', (request, response) => {
  const room = getRoom(request.params.roomCode)
  if (!room) {
    return response.status(404).json({ error: 'Room not found' })
  }

  return response.json({ roomCode: room.id })
})

roomsRouter.post('/', (request, response) => {
  const existingIds = [...getAllRooms().keys()]
  const roomCode = generateUniqueRoomCode(existingIds)

  createRoom(roomCode)

  response.status(201).json({ roomCode })
})

export default roomsRouter