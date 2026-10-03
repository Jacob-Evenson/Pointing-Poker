import request from 'supertest'
import { createApiApp } from '../server.js'

describe('GET /api/rooms/:roomCode', () => {
  const app = createApiApp()

  it.each(['JACOBS-26', 'TEAM-42'])('returns the requested room %s', async (roomCode) => {
    const response = await request(app).get(`/api/rooms/${roomCode}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ roomCode })
  })

  it('returns 404 for an unknown room code', async () => {
    const response = await request(app).get('/api/rooms/UNKNOWN-99')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Room not found' })
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
    expect(wrongCase.body).toEqual({ error: 'Room not found' })
  })

  it('returns a room not found response for malformed encoded room codes', async () => {
    const response = await request(app).get('/api/rooms/%E0%A4%A')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Room not found' })
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
    expect(getResponse.body).toEqual({ roomCode })
  })
})