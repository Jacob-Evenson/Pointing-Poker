import express, { Router } from 'express'
import { randomUUID } from 'node:crypto'
import {
  createRoom, getRoom, roomExists, getAllRooms, addPlayer,
  updateCurrentStory, goToPreviousStory, goToNextStory,
  setVote, setVotesRevealed, setAnonymousReveal, resetVotes, getSessionTimer, updateSessionTimer, VALID_VOTES,
} from '../roomStore.js'
import { generateUniqueRoomCode } from '../src/components/roomCode.js'
import {
  SESSION_NOT_FOUND_MESSAGE, validateUsername, validateStoryTitle, validateStoryDescription,
} from '../src/validation.js'
import { publishRoomEvent } from '../roomEvents.js'
import { removePlayerFromRoom } from '../roomMembership.js'

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
  const { id, votes, savedVotes: _savedVotes, ...roomDetails } = room
  const visibleVotes = {}
  for (const playerId of Object.keys(votes)) {
    visibleVotes[playerId] = room.votesRevealed ? votes[playerId] : null
  }
  return {
    ...roomDetails,
    sessionTimer: getSessionTimer(id),
    votes: visibleVotes,
    roomCode: id,
  }
}

// Runs an action on the requested room and replies with the updated room.
const respondWithRoom = (response, room) => {
  if (!room) {
    return response.status(404).json({ error: SESSION_NOT_FOUND_MESSAGE })
  }
  return response.json(toRoomResponse(room))
}

const publishRoomUpdate = (roomCode, reason) => {
  // Events are invalidation notices; clients fetch the authoritative room via REST.
  publishRoomEvent(roomCode, {
    type: 'ROOM_UPDATED',
    reason,
  })
}

roomsRouter.get('/:roomCode', (request, response) => {
  respondWithRoom(response, getRoom(request.params.roomCode))
})

roomsRouter.post('/:roomCode/players', (request, response) => {
  const room = getRoom(request.params.roomCode)
  if (!room) {
    return response.status(404).json({ error: SESSION_NOT_FOUND_MESSAGE })
  }

  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
  const nameError = validateUsername(name, room.players.map((player) => player.name))
  if (nameError) {
    return response.status(400).json({ error: nameError })
  }
  const player = { id: randomUUID(), name }
  addPlayer(room.id, player)
  publishRoomEvent(room.id, {
    type: 'PLAYER_JOINED',
    player,
  })
  return response.status(201).json({ player })
})

roomsRouter.delete('/:roomCode/players/:playerId', (request, response) => {
  const { roomCode, playerId } = request.params
  const room = removePlayerFromRoom(roomCode, playerId)
  if (!room) {
    return response.status(404).json({ error: SESSION_NOT_FOUND_MESSAGE })
  }

  return response.json(toRoomResponse(room))
})

roomsRouter.post('/:roomCode/timer', (request, response) => {
  const { roomCode } = request.params
  const { playerId, action } = request.body ?? {}
  const room = getRoom(roomCode)
  if (!room) {
    return response.status(404).json({ error: SESSION_NOT_FOUND_MESSAGE })
  }
  if (!['start', 'pause', 'reset'].includes(action)) {
    return response.status(400).json({ error: 'Choose a valid timer action.' })
  }
  if (!room.hostPlayerId || playerId !== room.hostPlayerId) {
    return response.status(403).json({ error: 'Only the session host can control the timer.' })
  }

  // Timer authority stays on the API; WebSocket subscribers are only notified.
  updateSessionTimer(roomCode, action)
  publishRoomUpdate(roomCode, 'TIMER_UPDATED')
  return response.json(toRoomResponse(room))
})

roomsRouter.patch('/:roomCode/stories/current', (request, response) => {
  const changes = request.body ?? {}
  const storyError = validateStoryTitle(changes.title) || validateStoryDescription(changes.description)
  if (storyError) {
    return response.status(400).json({ error: storyError })
  }
  const roomCode = request.params.roomCode
  const room = updateCurrentStory(roomCode, request.body ?? {})
  if (room) {
    publishRoomUpdate(roomCode, 'STORY_UPDATED')
  }
  respondWithRoom(response, room)
})

roomsRouter.post('/:roomCode/stories/previous', (request, response) => {
  const roomCode = request.params.roomCode
  const room = goToPreviousStory(roomCode)
  if (room) {
    publishRoomUpdate(roomCode, 'STORY_CHANGED')
  }
  respondWithRoom(response, room)
})

roomsRouter.post('/:roomCode/stories/next', (request, response) => {
  const roomCode = request.params.roomCode
  const room = goToNextStory(roomCode)
  if (room) {
    publishRoomUpdate(roomCode, 'STORY_CHANGED')
  }
  respondWithRoom(response, room)
})

roomsRouter.post('/:roomCode/votes', (request, response) => {
  const { playerId, value } = request.body ?? {}
  if (!VALID_VOTES.includes(value)) {
    return response.status(400).json({ error: 'Please choose one of the point cards.' })
  }

  const room = setVote(request.params.roomCode, playerId, value)
  if (!room) {
    return response.status(404).json({ error: SESSION_NOT_FOUND_MESSAGE })
  }
  publishRoomUpdate(request.params.roomCode, 'VOTE_CAST')
  return response.json(toRoomResponse(room))
})

roomsRouter.post('/:roomCode/votes/reveal', (request, response) => {
  const roomCode = request.params.roomCode
  const room = setVotesRevealed(roomCode, true)
  if (room) {
    publishRoomUpdate(roomCode, 'VOTES_REVEALED')
  }
  respondWithRoom(response, room)
})

roomsRouter.post('/:roomCode/votes/hide', (request, response) => {
  const roomCode = request.params.roomCode
  const room = setVotesRevealed(roomCode, false)
  if (room) {
    publishRoomUpdate(roomCode, 'VOTES_HIDDEN')
  }
  respondWithRoom(response, room)
})

roomsRouter.post('/:roomCode/anonymous', (request, response) => {
  const roomCode = request.params.roomCode
  const enabled = request.body?.enabled
  if (typeof enabled !== 'boolean') {
    return response.status(400).json({ error: 'Choose a valid anonymous reveal setting.' })
  }

  const room = setAnonymousReveal(roomCode, enabled)
  if (room) {
    publishRoomUpdate(roomCode, 'ANONYMOUS_REVEAL_UPDATED')
  }
  respondWithRoom(response, room)
})

roomsRouter.post('/:roomCode/votes/reset', (request, response) => {
  const roomCode = request.params.roomCode
  const room = resetVotes(roomCode)
  if (room) {
    publishRoomUpdate(roomCode, 'VOTES_RESET')
  }
  respondWithRoom(response, room)
})

roomsRouter.post('/', (request, response) => {
  const existingIds = [...getAllRooms().keys()]
  const roomCode = generateUniqueRoomCode(existingIds)

  createRoom(roomCode)

  response.status(201).json({ roomCode })
})

export default roomsRouter