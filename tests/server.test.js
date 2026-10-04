import request from 'supertest'
import { createApiApp } from '../server.js'

describe('GET /api/rooms/:roomCode', () => {
  const app = createApiApp()

  it.each(['JACOBS-26', 'TEAM-42'])('returns the requested room %s', async (roomCode) => {
    const response = await request(app).get(`/api/rooms/${roomCode}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      players: [],
      stories: [],
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