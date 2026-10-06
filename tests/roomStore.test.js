import { createRoom, roomExists, getRoom, addPlayer, removePlayer, deleteRoom, getAllRooms } from '../roomStore.js'

describe('roomStore', () => {
  it('creates a room with the expected shape', () => {
    const room = createRoom('TEST-ROOM')

    expect(room).toEqual({
      id: 'TEST-ROOM',
      players: [],
      stories: [{ title: '', description: '' }],
      votes: {},
      currentStoryIndex: 0,
      votesRevealed: false,
      createdAt: expect.any(Date)
    })
    expect(roomExists('TEST-ROOM')).toBe(true)

    deleteRoom('TEST-ROOM')
  })

  it('adds and removes players from a room', () => {
    createRoom('PLAYER-TEST')

    const afterAdd = addPlayer('PLAYER-TEST', { name: 'Sam' })
    expect(afterAdd.players).toEqual([{ name: 'Sam' }])

    const afterRemove = removePlayer('PLAYER-TEST', 'Sam')
    expect(afterRemove.players).toEqual([])

    deleteRoom('PLAYER-TEST')
  })

  it('returns null from addPlayer/removePlayer when the room does not exist', () => {
    expect(addPlayer('MISSING-ROOM', { name: 'Sam' })).toBeNull()
    expect(removePlayer('MISSING-ROOM', 'Sam')).toBeNull()
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
