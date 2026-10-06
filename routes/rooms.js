import express, { Router } from 'express'
import { createRoom, getRoom, roomExists, addPlayer } from '../roomStore.js'

if (!roomExists('JACOBS-26')) {
  createRoom('JACOBS-26')
}
if (!roomExists('TEAM-42')) {
  createRoom('TEAM-42')
}

const roomsRouter = Router({ caseSensitive: true, strict: true })

roomsRouter.use(express.json())

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
  console.log(room.players)
  return response.json({ roomCode: room.id, players: room.players })
})

roomsRouter.post('/:roomCode/players', (request, response) => {
  console.log(request.params.roomCode)
  console.log(request.body)


  const rawName = request.body?.username
  const username = typeof rawName === 'string' ? rawName.trim() : ''
  if (!username) {
    return response.status(400).json({ error: 'Username is required' })
  }

  const room = getRoom(request.params.roomCode)
  if (!room) {
    return response.status(404).json({ error: 'Room not found' })
  }

  const taken = room.players.some(
    (player) => player.name.toLowerCase() === username.toLowerCase()
  )
  if (taken) {
    return response.status(409).json({ error: 'Username is already in use.' })
  }

  addPlayer(request.params.roomCode, { name: username })

  return response.status(201).json({
    roomCode: request.params.roomCode,
    username: username,
  })
})



export default roomsRouter