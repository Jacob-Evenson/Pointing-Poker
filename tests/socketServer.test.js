// @vitest-environment node
import { createServer } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WebSocket } from 'ws'
import { createSocketServer } from '../socketServer.js'
import { addPlayer, createRoom, deleteRoom, getRoom } from '../roomStore.js'
import { publishRoomEvent } from '../roomEvents.js'

const clients = []
let httpServer
let socketServer

const waitForMessage = (socket) => new Promise((resolve, reject) => {
  const onMessage = (data) => {
    socket.off('error', onError)
    resolve(JSON.parse(data.toString()))
  }
  const onError = (error) => {
    socket.off('message', onMessage)
    reject(error)
  }
  socket.once('message', onMessage)
  socket.once('error', onError)
})

const openSocketServer = async () => {
  httpServer = createServer()
  socketServer = createSocketServer(httpServer)
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve))
  const { port } = httpServer.address()
  return `ws://127.0.0.1:${port}`
}

const joinRoom = async (url, roomCode, playerId) => {
  const socket = new WebSocket(url)
  clients.push(socket)
  await new Promise((resolve, reject) => {
    socket.once('open', resolve)
    socket.once('error', reject)
  })

  socket.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode, playerId }))
  const joined = waitForMessage(socket)
  socket.send(JSON.stringify({ type: 'TEST_BROADCAST', message: 'joined' }))
  expect(await joined).toEqual({ type: 'TEST_BROADCAST', message: 'joined' })
  return socket
}

afterEach(async () => {
  for (const socket of clients) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.close()
    }
  }
  await Promise.all(clients.map((socket) => (
    socket.readyState === WebSocket.CLOSED
      ? Promise.resolve()
      : new Promise((resolve) => socket.once('close', resolve))
  )))
  clients.length = 0

  if (socketServer) {
    await new Promise((resolve) => socketServer.close(resolve))
    socketServer = undefined
  }
  if (httpServer?.listening) {
    await new Promise((resolve) => httpServer.close(resolve))
  }
  httpServer = undefined
  deleteRoom('SOCKET-ROOM-A')
  deleteRoom('SOCKET-ROOM-B')
})

describe('socketServer room events', () => {
  it('forwards events only to clients joined to the matching room', async () => {
    createRoom('SOCKET-ROOM-A')
    createRoom('SOCKET-ROOM-B')
    const url = await openSocketServer()
    const roomAClient = await joinRoom(url, 'SOCKET-ROOM-A')
    const roomBClient = await joinRoom(url, 'SOCKET-ROOM-B')

    const roomAEvent = waitForMessage(roomAClient)
    publishRoomEvent('SOCKET-ROOM-A', { type: 'PLAYER_LEFT', playerId: 'player-a' })
    expect(await roomAEvent).toEqual({ type: 'PLAYER_LEFT', playerId: 'player-a' })

    const roomBEvent = waitForMessage(roomBClient)
    publishRoomEvent('SOCKET-ROOM-B', { type: 'ROOM_UPDATED', reason: 'VOTE_CAST' })
    expect(await roomBEvent).toEqual({ type: 'ROOM_UPDATED', reason: 'VOTE_CAST' })

    const nextRoomAEvent = waitForMessage(roomAClient)
    publishRoomEvent('SOCKET-ROOM-A', { type: 'ROOM_UPDATED', reason: 'VOTES_RESET' })
    expect(await nextRoomAEvent).toEqual({ type: 'ROOM_UPDATED', reason: 'VOTES_RESET' })
  })

  it('does not send room events to sockets that are not open', async () => {
    createRoom('SOCKET-ROOM-A')
    const url = await openSocketServer()
    await joinRoom(url, 'SOCKET-ROOM-A')
    const serverSocket = [...socketServer.clients][0]
    const send = vi.spyOn(serverSocket, 'send')
    const originalDescriptor = Object.getOwnPropertyDescriptor(serverSocket, 'readyState')

    Object.defineProperty(serverSocket, 'readyState', {
      configurable: true,
      value: WebSocket.CLOSED,
    })
    publishRoomEvent('SOCKET-ROOM-A', { type: 'PLAYER_LEFT', playerId: 'player-a' })
    expect(send).not.toHaveBeenCalled()

    if (originalDescriptor) {
      Object.defineProperty(serverSocket, 'readyState', originalDescriptor)
    } else {
      delete serverSocket.readyState
    }
  })

  it('ignores malformed JSON without breaking later messages', async () => {
    createRoom('SOCKET-ROOM-A')
    const url = await openSocketServer()
    const client = await joinRoom(url, 'SOCKET-ROOM-A')
    const nextMessage = waitForMessage(client)

    client.send('{malformed')
    client.send(JSON.stringify({ type: 'TEST_BROADCAST', message: 'still connected' }))

    expect(await nextMessage).toEqual({
      type: 'TEST_BROADCAST',
      message: 'still connected',
    })
  })

  it('unsubscribes from room events when the WebSocket server closes', async () => {
    createRoom('SOCKET-ROOM-A')
    const url = await openSocketServer()
    await joinRoom(url, 'SOCKET-ROOM-A')
    const serverSocket = [...socketServer.clients][0]
    const send = vi.spyOn(serverSocket, 'send')
    send.mockClear()

    socketServer.emit('close')
    publishRoomEvent('SOCKET-ROOM-A', { type: 'PLAYER_LEFT', playerId: 'player-a' })

    expect(send).not.toHaveBeenCalled()
  })

  it('removes a player and publishes PLAYER_LEFT when their last socket disconnects', async () => {
    createRoom('SOCKET-ROOM-A')
    const player = { id: 'player-a', name: 'Sam' }
    const observer = { id: 'player-b', name: 'Riley' }
    addPlayer('SOCKET-ROOM-A', player)
    addPlayer('SOCKET-ROOM-A', observer)
    const url = await openSocketServer()
    const playerSocket = await joinRoom(url, 'SOCKET-ROOM-A', player.id)
    const observerSocket = await joinRoom(url, 'SOCKET-ROOM-A', observer.id)
    const playerLeft = waitForMessage(observerSocket)

    playerSocket.close()

    expect(await playerLeft).toEqual({ type: 'PLAYER_LEFT', playerId: player.id })
    expect(getRoom('SOCKET-ROOM-A').players).toEqual([observer])
  })

  it('keeps the player in the room while another socket for them is connected', async () => {
    createRoom('SOCKET-ROOM-A')
    const player = { id: 'player-a', name: 'Sam' }
    addPlayer('SOCKET-ROOM-A', player)
    const url = await openSocketServer()
    const firstSocket = await joinRoom(url, 'SOCKET-ROOM-A', player.id)
    const secondSocket = await joinRoom(url, 'SOCKET-ROOM-A', player.id)
    const firstSocketClosed = new Promise((resolve) => firstSocket.once('close', resolve))

    firstSocket.close()
    await firstSocketClosed

    expect(getRoom('SOCKET-ROOM-A').players).toEqual([player])
    expect(secondSocket.readyState).toBe(WebSocket.OPEN)
  })
})
