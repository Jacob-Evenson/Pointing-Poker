import express from 'express'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import roomsRouter from './routes/rooms.js'
import { createSocketServer } from './socketServer.js'

import { SESSION_NOT_FOUND_MESSAGE } from './src/validation.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const createApiApp = () => {
  const app = express()

  app.set('case sensitive routing', true)
  app.set('strict routing', true)
  app.use('/api/rooms', roomsRouter)
  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'Not found' })
  })

  const distPath = resolve(__dirname, 'dist')
  const indexPath = resolve(distPath, 'index.html')

  if (existsSync(distPath)) {
    app.use(express.static(distPath))
  }

  app.use((req, res, next) => {
    if (req.method === 'GET' && existsSync(indexPath)) {
      return res.sendFile(indexPath)
    }
    return next()
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
  const port = process.env.PORT || process.env.API_PORT || 3001
  const app = createApiApp()
  const server = createServer(app)

  createSocketServer(server)

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}