import request from 'supertest'
import { createApiApp } from '../server.js'
import { getRoom } from '../roomStore.js'
import { subscribeToRoomEvents } from '../roomEvents.js'

describe('GET /api/rooms/:roomCode', () => {
  const app = createApiApp()

  it.each(['JACOBS-26', 'TEAM-42'])('returns the requested room %s', async (roomCode) => {
    const response = await request(app).get(`/api/rooms/${roomCode}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      players: [],
      hostPlayerId: null,
      sessionTimer: { elapsedSeconds: 0, running: false, syncedAt: expect.any(Number) },
      stories: [{ title: '', description: '' }],
      votes: {},
      currentStoryIndex: 0,
      votesRevealed: false,
      anonymousReveal: false,
      createdAt: expect.any(String),
      roomCode,
    })
  })

  it('returns 404 for an unknown room code', async () => {
    const response = await request(app).get('/api/rooms/UNKNOWN-99')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: "We couldn't find a session with that code." })
  })

  it('does not treat other paths or methods as room lookups', async () => {
    const wrongPath = await request(app).get('/api/unknown/JACOBS-26')
    const wrongMethod = await request(app).post('/api/rooms/JACOBS-26')

    expect(wrongPath.status).toBe(404)
    expect(wrongPath.body).toEqual({ error: 'Not found' })
    expect(wrongMethod.status).toBe(404)
    expect(wrongMethod.body).toEqual({ error: 'Not found' })
  })

  it('preserves exact route matching and room-code casing', async () => {
    const trailingSlash = await request(app).get('/api/rooms/JACOBS-26/')
    const wrongCase = await request(app).get('/api/rooms/jacobs-26')

    expect(trailingSlash.status).toBe(404)
    expect(trailingSlash.body).toEqual({ error: 'Not found' })
    expect(wrongCase.status).toBe(404)
    expect(wrongCase.body).toEqual({ error: "We couldn't find a session with that code." })
  })

  it('returns a room not found response for malformed encoded room codes', async () => {
    const response = await request(app).get('/api/rooms/%E0%A4%A')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: "We couldn't find a session with that code." })
  })
})

describe('POST /api/rooms', () => {
  const app = createApiApp()

  it('creates a new room and returns a 6-digit room code', async () => {
    const response = await request(app).post('/api/rooms')

    expect(response.status).toBe(201)
    expect(response.body.roomCode).toMatch(/^\d{6}$/)
  })

  it('generates different codes across multiple requests', async () => {
    const first = await request(app).post('/api/rooms')
    const second = await request(app).post('/api/rooms')

    expect(first.body.roomCode).not.toBe(second.body.roomCode)
  })

  it('stores the new room so it can immediately be found via GET', async () => {
    const createResponse = await request(app).post('/api/rooms')
    const roomCode = createResponse.body.roomCode

    const getResponse = await request(app).get(`/api/rooms/${roomCode}`)

    expect(getResponse.status).toBe(200)
    expect(getResponse.body.roomCode).toBe(roomCode)
  })
})
describe('room players, stories and votes', () => {
  const app = createApiApp()

  const createRoomWithPlayer = async (name = 'Sam') => {
    const { body: { roomCode } } = await request(app).post('/api/rooms')
    const { body: { player } } = await request(app).post(`/api/rooms/${roomCode}/players`).send({ name })
    return { roomCode, player }
  }

  it('adds players and rejects empty or duplicate names', async () => {
    const { roomCode, player } = await createRoomWithPlayer('Sam')

    expect(player).toEqual({ id: expect.any(String), name: 'Sam' })
    const blank = await request(app).post(`/api/rooms/${roomCode}/players`).send({ name: '  ' })
    expect(blank.status).toBe(400)
    expect(blank.body.error).toBe('Please enter a username.')
    const long = await request(app).post(`/api/rooms/${roomCode}/players`).send({ name: 'a'.repeat(21) })
    expect(long.body.error).toBe('Username must be 20 characters or fewer.')
    expect((await request(app).post(`/api/rooms/${roomCode}/players`).send({ name: 'a'.repeat(20) })).status).toBe(201)
    const duplicate = await request(app).post(`/api/rooms/${roomCode}/players`).send({ name: ' sam ' })
    expect(duplicate.status).toBe(400)
    expect(duplicate.body.error).toBe('That username is already being used in this session.')
    expect((await request(app).post('/api/rooms/NOPE-1/players').send({ name: 'Al' })).status).toBe(404)

    const room = await request(app).get(`/api/rooms/${roomCode}`)
    expect(room.body.players).toHaveLength(2)
    expect(room.body.players[0]).toEqual(player)
  })

  it('edits the current story and moves between stories', async () => {
    const { roomCode } = await createRoomWithPlayer()

    await request(app).patch(`/api/rooms/${roomCode}/stories/current`).send({ title: 'Login', description: 'Add login' })
    let room = (await request(app).post(`/api/rooms/${roomCode}/stories/next`)).body
    expect(room.stories).toHaveLength(2)
    expect(room.currentStoryIndex).toBe(1)
    expect(room.stories[1]).toEqual({ title: '', description: '' })

    room = (await request(app).post(`/api/rooms/${roomCode}/stories/previous`)).body
    expect(room.currentStoryIndex).toBe(0)
    expect(room.stories[0]).toEqual({ title: 'Login', description: 'Add login' })

    room = (await request(app).post(`/api/rooms/${roomCode}/stories/previous`)).body
    expect(room.currentStoryIndex).toBe(0)
  })

  it('hides vote values until revealed and clears them on reset', async () => {
    const { roomCode, player } = await createRoomWithPlayer()

    let room = (await request(app).post(`/api/rooms/${roomCode}/votes`).send({ playerId: player.id, value: 8 })).body
    expect(room.votes).toEqual({ [player.id]: null })

    room = (await request(app).post(`/api/rooms/${roomCode}/votes/reveal`)).body
    expect(room.votesRevealed).toBe(true)
    expect(room.votes).toEqual({ [player.id]: 8 })

    room = (await request(app).post(`/api/rooms/${roomCode}/votes/reset`)).body
    expect(room.votesRevealed).toBe(false)
    expect(room.votes).toEqual({})
  })

  it('accepts the ? card and rejects invalid votes or unknown players', async () => {
    const { roomCode, player } = await createRoomWithPlayer()

    expect((await request(app).post(`/api/rooms/${roomCode}/votes`).send({ playerId: player.id, value: '?' })).status).toBe(200)
    expect((await request(app).post(`/api/rooms/${roomCode}/votes`).send({ playerId: player.id, value: 4 })).status).toBe(400)
    expect((await request(app).post(`/api/rooms/${roomCode}/votes`).send({ playerId: 'nobody', value: 5 })).status).toBe(404)
  })

  it('remembers each story\'s votes and reveal state when moving between stories', async () => {
    const { roomCode, player } = await createRoomWithPlayer()
    const base = `/api/rooms/${roomCode}`

    await request(app).post(`${base}/votes`).send({ playerId: player.id, value: 5 })
    await request(app).post(`${base}/votes/reveal`)

    let room = (await request(app).post(`${base}/stories/next`)).body
    expect(room.votes).toEqual({})
    expect(room.votesRevealed).toBe(false)
    expect(room).not.toHaveProperty('savedVotes')

    await request(app).post(`${base}/votes`).send({ playerId: player.id, value: 13 })

    room = (await request(app).post(`${base}/stories/previous`)).body
    expect(room.votes).toEqual({ [player.id]: 5 })
    expect(room.votesRevealed).toBe(true)

    room = (await request(app).post(`${base}/stories/next`)).body
    expect(room.votes).toEqual({ [player.id]: null })
    expect(room.votesRevealed).toBe(false)
  })

  it('rejects story titles and descriptions that are too long, but allows blanks', async () => {
    const { roomCode } = await createRoomWithPlayer()
    const url = `/api/rooms/${roomCode}/stories/current`

    const title = await request(app).patch(url).send({ title: 'a'.repeat(101) })
    expect(title.status).toBe(400)
    expect(title.body.error).toBe('Story title must be 100 characters or fewer.')

    const description = await request(app).patch(url).send({ description: 'a'.repeat(2001) })
    expect(description.status).toBe(400)
    expect(description.body.error).toBe('Story description must be 2000 characters or fewer.')

    expect((await request(app).patch(url).send({ title: 'a'.repeat(100), description: 'a'.repeat(2000) })).status).toBe(200)
    expect((await request(app).patch(url).send({ title: '', description: '' })).status).toBe(200)

    const room = await request(app).get(`/api/rooms/${roomCode}`)
    expect(room.body.stories[0].title).toBe('')
  })
})

describe('DELETE /api/rooms/:roomCode/players/:playerId', () => {
  const app = createApiApp()

  const createRoomWithPlayer = async () => {
    const { body: { roomCode } } = await request(app).post('/api/rooms')
    const { body: { player } } = await request(app)
      .post(`/api/rooms/${roomCode}/players`)
      .send({ name: 'Sam' })
    return { roomCode, player }
  }

  it('removes the player, clears their current and saved votes, and publishes one room event', async () => {
    const { roomCode, player } = await createRoomWithPlayer()
    await request(app).post(`/api/rooms/${roomCode}/votes`).send({ playerId: player.id, value: 5 })
    await request(app).post(`/api/rooms/${roomCode}/votes/reveal`)
    await request(app).post(`/api/rooms/${roomCode}/stories/next`)
    await request(app).post(`/api/rooms/${roomCode}/votes`).send({ playerId: player.id, value: 8 })

    const events = []
    const unsubscribe = subscribeToRoomEvents((eventRoomCode, event) => {
      events.push({ roomCode: eventRoomCode, event })
    })
    try {
      const response = await request(app).delete(`/api/rooms/${roomCode}/players/${player.id}`)

      expect(response.status).toBe(200)
      expect(response.body.players).toEqual([])
      expect(response.body.votes).toEqual({})
      expect(response.body).not.toHaveProperty('savedVotes')
      expect(getRoom(roomCode).savedVotes[0].votes).not.toHaveProperty(player.id)
      expect(events).toEqual([{
        roomCode,
        event: { type: 'PLAYER_LEFT', playerId: player.id },
      }])
    } finally {
      unsubscribe()
    }
  })

  it('returns 404 for an unknown room or player and does not publish an event', async () => {
    const { roomCode, player } = await createRoomWithPlayer()
    const events = []
    const unsubscribe = subscribeToRoomEvents((eventRoomCode, event) => {
      events.push({ roomCode: eventRoomCode, event })
    })
    try {
      const unknownRoom = await request(app).delete(`/api/rooms/UNKNOWN-ROOM/players/${player.id}`)
      const unknownPlayer = await request(app).delete(`/api/rooms/${roomCode}/players/missing-id`)

      expect(unknownRoom.status).toBe(404)
      expect(unknownPlayer.status).toBe(404)
      expect(events).toEqual([])
    } finally {
      unsubscribe()
    }
  })

  it('publishes PLAYER_JOINED only after a player is successfully added', async () => {
    const { roomCode } = await createRoomWithPlayer()
    const events = []
    const unsubscribe = subscribeToRoomEvents((eventRoomCode, event) => {
      events.push({ roomCode: eventRoomCode, event })
    })
    try {
      const successfulJoin = await request(app)
        .post(`/api/rooms/${roomCode}/players`)
        .send({ name: 'Riley' })
      const failedJoin = await request(app)
        .post(`/api/rooms/${roomCode}/players`)
        .send({ name: 'Riley' })

      expect(successfulJoin.status).toBe(201)
      expect(failedJoin.status).toBe(400)
      expect(events).toEqual([{
        roomCode,
        event: { type: 'PLAYER_JOINED', player: successfulJoin.body.player },
      }])
    } finally {
      unsubscribe()
    }
  })
})

describe('room update events', () => {
  const app = createApiApp()

  it('publishes room updates for votes, vote visibility, resets, and story changes', async () => {
    const { body: { roomCode } } = await request(app).post('/api/rooms')
    const { body: { player } } = await request(app)
      .post(`/api/rooms/${roomCode}/players`)
      .send({ name: 'Sam' })

    const events = []
    const unsubscribe = subscribeToRoomEvents((eventRoomCode, event) => {
      events.push({ roomCode: eventRoomCode, event })
    })
    try {
      const base = `/api/rooms/${roomCode}`
      expect((await request(app).post(`${base}/votes`).send({ playerId: player.id, value: 5 })).status).toBe(200)
      expect((await request(app).post(`${base}/votes/reveal`)).status).toBe(200)
      expect((await request(app).post(`${base}/votes/hide`)).status).toBe(200)
      expect((await request(app).post(`${base}/votes/reset`)).status).toBe(200)
      expect((await request(app).patch(`${base}/stories/current`).send({ title: 'Login' })).status).toBe(200)
      expect((await request(app).patch(`${base}/stories/current`).send({ description: 'Add login' })).status).toBe(200)
      expect((await request(app).post(`${base}/stories/next`)).status).toBe(200)
      expect((await request(app).post(`${base}/stories/previous`)).status).toBe(200)
      expect((await request(app).post(`${base}/votes`).send({ playerId: player.id, value: 4 })).status).toBe(400)
      expect((await request(app).patch(`${base}/stories/current`).send({ title: 'x'.repeat(101) })).status).toBe(400)

      expect(events).toEqual([
        { roomCode, event: { type: 'ROOM_UPDATED', reason: 'VOTE_CAST' } },
        { roomCode, event: { type: 'ROOM_UPDATED', reason: 'VOTES_REVEALED' } },
        { roomCode, event: { type: 'ROOM_UPDATED', reason: 'VOTES_HIDDEN' } },
        { roomCode, event: { type: 'ROOM_UPDATED', reason: 'VOTES_RESET' } },
        { roomCode, event: { type: 'ROOM_UPDATED', reason: 'STORY_UPDATED' } },
        { roomCode, event: { type: 'ROOM_UPDATED', reason: 'STORY_UPDATED' } },
        { roomCode, event: { type: 'ROOM_UPDATED', reason: 'STORY_CHANGED' } },
        { roomCode, event: { type: 'ROOM_UPDATED', reason: 'STORY_CHANGED' } },
      ])
    } finally {
      unsubscribe()
    }
  })
})

describe('POST /api/rooms/:roomCode/anonymous', () => {
  const app = createApiApp()

  it('stores the shared setting, publishes an update, and validates input', async () => {
    const { body: { roomCode } } = await request(app).post('/api/rooms')
    const base = `/api/rooms/${roomCode}`
    const events = []
    const unsubscribe = subscribeToRoomEvents((eventRoomCode, event) => {
      events.push({ roomCode: eventRoomCode, event })
    })
    try {
      const on = await request(app).post(`${base}/anonymous`).send({ enabled: true })
      expect(on.status).toBe(200)
      expect(on.body.anonymousReveal).toBe(true)
      expect((await request(app).get(base)).body.anonymousReveal).toBe(true)
      expect((await request(app).post(`${base}/anonymous`).send({ enabled: 'yes' })).status).toBe(400)
      expect((await request(app).post('/api/rooms/NOPE-00/anonymous').send({ enabled: true })).status).toBe(404)
      expect(events).toEqual([
        { roomCode, event: { type: 'ROOM_UPDATED', reason: 'ANONYMOUS_REVEAL_UPDATED' } },
      ])
    } finally {
      unsubscribe()
    }
  })
})

describe('POST /api/rooms/:roomCode/timer', () => {
  const app = createApiApp()

  it('allows the host to control the shared timer and rejects other players', async () => {
    const { body: { roomCode } } = await request(app).post('/api/rooms')
    const host = (await request(app).post(`/api/rooms/${roomCode}/players`).send({ name: 'Host' })).body.player
    const guest = (await request(app).post(`/api/rooms/${roomCode}/players`).send({ name: 'Guest' })).body.player
    const events = []
    const unsubscribe = subscribeToRoomEvents((eventRoomCode, event) => {
      events.push({ roomCode: eventRoomCode, event })
    })
    try {
      const unauthorized = await request(app)
        .post(`/api/rooms/${roomCode}/timer`)
        .send({ playerId: guest.id, action: 'pause' })
      expect(unauthorized.status).toBe(403)

      const paused = await request(app)
        .post(`/api/rooms/${roomCode}/timer`)
        .send({ playerId: host.id, action: 'pause' })
      expect(paused.status).toBe(200)
      expect(paused.body.hostPlayerId).toBe(host.id)
      expect(paused.body.sessionTimer).toEqual({
        elapsedSeconds: expect.any(Number),
        running: false,
        syncedAt: expect.any(Number),
      })

      const invalidAction = await request(app)
        .post(`/api/rooms/${roomCode}/timer`)
        .send({ playerId: host.id, action: 'delete' })
      const unknownRoom = await request(app)
        .post('/api/rooms/UNKNOWN-ROOM/timer')
        .send({ playerId: host.id, action: 'pause' })
      expect(invalidAction.status).toBe(400)
      expect(unknownRoom.status).toBe(404)
      expect(events).toEqual([{
        roomCode,
        event: { type: 'ROOM_UPDATED', reason: 'TIMER_UPDATED' },
      }])
    } finally {
      unsubscribe()
    }
  })
})