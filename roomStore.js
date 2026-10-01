// In-memory storage for all active Pointing Poker rooms.
// This Map is the single source of truth for room data while the server is running.
// If the server restarts, this Map is cleared and all rooms disappear.
const rooms = new Map()

// Creates a new room, stores it in the Map, and returns it.
export const createRoom = (roomId) => {
  const room = {
    id: roomId,
    players: [],
    stories: [],
    votes: {},
    currentStoryIndex: 0,
    votesRevealed: false,
    createdAt: new Date()
  }

  rooms.set(roomId, room)
  return room
}

// Returns true if a room with this id exists.
export const roomExists = (roomId) => rooms.has(roomId)

// Returns the room object, or undefined if it does not exist.
export const getRoom = (roomId) => rooms.get(roomId)

// Adds a player to the room's players array.
export const addPlayer = (roomId, player) => {
  const room = rooms.get(roomId)
  if (!room) {
    return null
  }

  room.players.push(player)
  return room
}

// Removes a player from the room by name.
export const removePlayer = (roomId, playerName) => {
  const room = rooms.get(roomId)
  if (!room) {
    return null
  }

  room.players = room.players.filter((player) => player.name !== playerName)
  return room
}

// Removes a room from the Map entirely.
export const deleteRoom = (roomId) => {
  rooms.delete(roomId)
}

// Returns the full Map of rooms, mainly for testing/debugging.
export const getAllRooms = () => rooms
