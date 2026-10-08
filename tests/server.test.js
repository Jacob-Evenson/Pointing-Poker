import request from 'supertest'
import { createApiApp } from '../server.js'

describe('GET /api/rooms/:roomCode', () => {
  const app = createApiApp()

  it.each(['JACOBS-26', 'TEAM-42'])('returns the requested room %s', async (roomCode) => {
    const response = await request(app).get(`/api/rooms/${roomCode}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      players: [],
      stories: [{ title: '', description: '' }],
      votes: {},
      currentStoryIndex: 0,
      votesRevealed: false,
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

  it('accepts username as an alias for name', async () => {
    const { body: { roomCode } } = await request(app).post('/api/rooms')

    const response = await request(app)
      .post(`/api/rooms/${roomCode}/players`)
      .send({ username: 'chuddy' })

    expect(response.status).toBe(201)
    expect(response.body.player).toEqual({ id: expect.any(String), name: 'chuddy' })
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