import express from 'express'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import roomsRouter from './routes/rooms.js'
import { SESSION_NOT_FOUND_MESSAGE } from './src/validation.js'

export const createApiApp = () => {
  const app = express()

  app.set('case sensitive routing', true)
  app.set('strict routing', true)
  app.use('/api/rooms', roomsRouter)
  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'Not found' })
  })
  app.use((error, _request, response, next) => {
    if (error instanceof URIError) {
      return response.status(404).json({ error: SESSION_NOT_FOUND_MESSAGE })
    }

    if (error.type === 'entity.parse.failed') {
      return response.status(400).json({ error: 'Something went wrong. Please try again.' })
    }

    if (response.headersSent) {
      return next(error)
    }

    return response.status(500).json({ error: 'Something went wrong. Please try again.' })
  })

  return app
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.API_PORT || 3001)
  createApiApp().listen(port, '127.0.0.1', () => {
    console.log(`Room API listening on http://127.0.0.1:${port}`)
  })
}