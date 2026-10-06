import express, { Router } from 'express'
import { randomUUID } from 'node:crypto'
import {
  createRoom, getRoom, roomExists, getAllRooms, addPlayer,
  updateCurrentStory, goToPreviousStory, goToNextStory,
  setVote, setVotesRevealed, resetVotes, VALID_VOTES,
} from '../roomStore.js'
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

roomsRouter.use(express.json())

// Builds the JSON the frontend sees. Vote values stay hidden (null) until revealed.
const toRoomResponse = (room) => {
  const { id, votes, savedVotes, ...roomDetails } = room
  const visibleVotes = {}
  for (const playerId of Object.keys(votes)) {
    visibleVotes[playerId] = room.votesRevealed ? votes[playerId] : null
  }
  return { ...roomDetails, votes: visibleVotes, roomCode: id }
}

// Runs an action on the requested room and replies with the updated room.
const respondWithRoom = (response, room) => {
  if (!room) {
    return response.status(404).json({ error: 'Room not found' })
  }
  return response.json(toRoomResponse(room))
}

roomsRouter.get('/:roomCode', (request, response) => {
  respondWithRoom(response, getRoom(request.params.roomCode))
})

roomsRouter.post('/:roomCode/players', (request, response) => {
  const room = getRoom(request.params.roomCode)
  if (!room) {
    return response.status(404).json({ error: 'Room not found' })
  }

  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
  if (!name) {
    return response.status(400).json({ error: 'Username is required' })
  }
  if (room.players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
    return response.status(409).json({ error: 'That username is already taken in this room' })
  }

  const player = { id: randomUUID(), name }
  addPlayer(room.id, player)
  return response.status(201).json({ player })
})

roomsRouter.patch('/:roomCode/stories/current', (request, response) => {
  respondWithRoom(response, updateCurrentStory(request.params.roomCode, request.body ?? {}))
})

roomsRouter.post('/:roomCode/stories/previous', (request, response) => {
  respondWithRoom(response, goToPreviousStory(request.params.roomCode))
})

roomsRouter.post('/:roomCode/stories/next', (request, response) => {
  respondWithRoom(response, goToNextStory(request.params.roomCode))
})

roomsRouter.post('/:roomCode/votes', (request, response) => {
  const { playerId, value } = request.body ?? {}
  if (!VALID_VOTES.includes(value)) {
    return response.status(400).json({ error: 'Invalid vote value' })
  }

  const room = setVote(request.params.roomCode, playerId, value)
  if (!room) {
    return response.status(404).json({ error: 'Room or player not found' })
  }
  return response.json(toRoomResponse(room))
})

roomsRouter.post('/:roomCode/votes/reveal', (request, response) => {
  respondWithRoom(response, setVotesRevealed(request.params.roomCode, true))
})

roomsRouter.post('/:roomCode/votes/hide', (request, response) => {
  respondWithRoom(response, setVotesRevealed(request.params.roomCode, false))
})

roomsRouter.post('/:roomCode/votes/reset', (request, response) => {
  respondWithRoom(response, resetVotes(request.params.roomCode))
})

roomsRouter.post('/', (request, response) => {
  const existingIds = [...getAllRooms().keys()]
  const roomCode = generateUniqueRoomCode(existingIds)

  createRoom(roomCode)

  response.status(201).json({ roomCode })
})

export default roomsRouter