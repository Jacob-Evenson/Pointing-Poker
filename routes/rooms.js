import { Router } from 'express'

const rooms = new Map([
  ['JACOBS-26', { roomCode: 'JACOBS-26' }],
  ['TEAM-42', { roomCode: 'TEAM-42' }]
])

const roomsRouter = Router({ caseSensitive: true, strict: true })

roomsRouter.all('/:roomCode', (request, response, next) => {
  if (request.method !== 'GET') {
    return response.status(404).json({ error: 'Not found' })
  }

  return next()
})

roomsRouter.get('/:roomCode', (request, response) => {
  const room = rooms.get(request.params.roomCode)
  if (!room) {
    return response.status(404).json({ error: 'Room not found' })
  }

  return response.json(room)
})

export default roomsRouter