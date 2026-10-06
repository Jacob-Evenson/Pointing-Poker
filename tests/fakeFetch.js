import request from 'supertest'
import { createApiApp } from '../server.js'

// A fetch() replacement that sends requests straight to the real Express app.
export const createFakeFetch = () => {
  const app = createApiApp()

  return async (url, options = {}) => {
    const method = (options.method || 'GET').toLowerCase()
    let call = request(app)[method](url)
    if (options.body) {
      call = call.set('Content-Type', 'application/json').send(options.body)
    }
    const res = await call
    return { ok: res.status < 400, status: res.status, json: async () => res.body }
  }
}