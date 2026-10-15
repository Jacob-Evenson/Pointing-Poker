import {
  createRoom, roomExists, getRoom, addPlayer, removePlayer, deleteRoom, getAllRooms,
  getSessionTimer, updateSessionTimer,
} from '../roomStore.js'

describe('roomStore', () => {
  it('creates a room with the expected shape', () => {
    const room = createRoom('TEST-ROOM')

    expect(room).toEqual({
      id: 'TEST-ROOM',
      players: [],
      hostPlayerId: null,
      sessionTimer: { elapsedSeconds: 0, runningSince: null },
      stories: [{ title: '', description: '' }],
      votes: {},
      currentStoryIndex: 0,
      votesRevealed: false,
      anonymousReveal: false,
      savedVotes: {},
      createdAt: expect.any(Date)
    })
    expect(roomExists('TEST-ROOM')).toBe(true)

    deleteRoom('TEST-ROOM')
  })

  it('assigns timer control to the first player and transfers it if the host leaves', () => {
    const room = createRoom('HOST-TEST')
    const host = { id: 'host-id', name: 'Host' }
    const nextHost = { id: 'next-host-id', name: 'Next host' }

    addPlayer('HOST-TEST', host)
    const initialStart = room.sessionTimer.runningSince
    addPlayer('HOST-TEST', nextHost)

    expect(room.hostPlayerId).toBe(host.id)
    expect(initialStart).toEqual(expect.any(Number))

    removePlayer('HOST-TEST', host.id)
    expect(room.hostPlayerId).toBe(nextHost.id)
    expect(room.sessionTimer.runningSince).toBe(initialStart)

    deleteRoom('HOST-TEST')
  })

  it('calculates, pauses, resumes, and resets the server timer', () => {
    const room = createRoom('TIMER-TEST')
    addPlayer('TIMER-TEST', { id: 'host-id', name: 'Host' })
    room.sessionTimer = { elapsedSeconds: 7, runningSince: 1000 }

    expect(getSessionTimer('TIMER-TEST', 6500)).toEqual({
      elapsedSeconds: 12,
      running: true,
      syncedAt: 6500,
    })
    expect(updateSessionTimer('TIMER-TEST', 'pause', 6500).sessionTimer).toEqual({
      elapsedSeconds: 12,
      runningSince: null,
    })
    updateSessionTimer('TIMER-TEST', 'start', 9000)
    expect(getSessionTimer('TIMER-TEST', 12000)).toEqual({
      elapsedSeconds: 15,
      running: true,
      syncedAt: 12000,
    })
    updateSessionTimer('TIMER-TEST', 'reset', 12000)
    expect(room.sessionTimer).toEqual({ elapsedSeconds: 0, runningSince: null })
    expect(updateSessionTimer('TIMER-TEST', 'invalid')).toBeNull()
    expect(getSessionTimer('MISSING-ROOM')).toBeNull()
    expect(updateSessionTimer('MISSING-ROOM', 'start')).toBeNull()

    deleteRoom('TIMER-TEST')
  })

  it('removes the intended player and their current and saved votes', () => {
    const room = createRoom('PLAYER-TEST')
    const player = { id: 'sam-id', name: 'Sam' }
    const sameNamePlayer = { id: 'another-sam-id', name: 'Sam' }
    const otherPlayer = { id: 'alex-id', name: 'Alex' }

    addPlayer('PLAYER-TEST', player)
    addPlayer('PLAYER-TEST', sameNamePlayer)
    addPlayer('PLAYER-TEST', otherPlayer)
    room.votes = { [player.id]: 5, [sameNamePlayer.id]: 3, [otherPlayer.id]: 8 }
    room.savedVotes[0] = {
      votes: { [player.id]: 1, [sameNamePlayer.id]: 2, [otherPlayer.id]: 13 },
      votesRevealed: true,
    }

    const afterRemove = removePlayer('PLAYER-TEST', player.id)
    expect(afterRemove.players).toEqual([sameNamePlayer, otherPlayer])
    expect(afterRemove.votes).toEqual({ [sameNamePlayer.id]: 3, [otherPlayer.id]: 8 })
    expect(afterRemove.savedVotes[0].votes).toEqual({ [sameNamePlayer.id]: 2, [otherPlayer.id]: 13 })
    expect(removePlayer('PLAYER-TEST', player.id)).toBeNull()

    deleteRoom('PLAYER-TEST')
  })

  it('returns null when removing a player from an unknown room or an unknown player', () => {
    expect(addPlayer('MISSING-ROOM', { name: 'Sam' })).toBeNull()
    expect(removePlayer('MISSING-ROOM', 'sam-id')).toBeNull()
    createRoom('UNKNOWN-PLAYER-TEST')
    expect(removePlayer('UNKNOWN-PLAYER-TEST', 'missing-id')).toBeNull()
    deleteRoom('UNKNOWN-PLAYER-TEST')
  })

  it('getRoom returns undefined for an unknown room', () => {
    expect(getRoom('MISSING-ROOM')).toBeUndefined()
  })

  it('getAllRooms returns the underlying rooms map', () => {
    createRoom('ALL-ROOMS-TEST')

    expect(getAllRooms().has('ALL-ROOMS-TEST')).toBe(true)

    deleteRoom('ALL-ROOMS-TEST')
  })
})
