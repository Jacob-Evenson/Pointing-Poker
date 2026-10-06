// In-memory storage for all active Pointing Poker rooms.
// This Map is the single source of truth for room data while the server is running.
// If the server restarts, this Map is cleared and all rooms disappear.
const rooms = new Map()

// Creates a new room, stores it in the Map, and returns it.
export const createRoom = (roomId) => {
  const room = {
    id: roomId,
    players: [],
    stories: [{ title: '', description: '' }],
    votes: {},
    currentStoryIndex: 0,
    votesRevealed: false,
    savedVotes: {},
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

  const removed = room.players.filter((player) => player.name === playerName)
  room.players = room.players.filter((player) => player.name !== playerName)
  removed.forEach((player) => delete room.votes[player.id])
  return room
}

// Removes a room from the Map entirely.
export const deleteRoom = (roomId) => {
  rooms.delete(roomId)
}

// Returns the full Map of rooms, mainly for testing/debugging.
export const getAllRooms = () => rooms

// Card values a player is allowed to vote with.
export const VALID_VOTES = [0, 1, 2, 3, 5, 8, 13, '?']

// Changes the title and/or description of the story currently shown.
export const updateCurrentStory = (roomId, changes) => {
  const room = rooms.get(roomId)
  if (!room) {
    return null
  }

  const story = room.stories[room.currentStoryIndex]
  if (typeof changes.title === 'string') {
    story.title = changes.title
  }
  if (typeof changes.description === 'string') {
    story.description = changes.description
  }
  return room
}

// Clears every vote and hides them again.
export const resetVotes = (roomId) => {
  const room = rooms.get(roomId)
  if (!room) {
    return null
  }

  room.votes = {}
  room.votesRevealed = false
  return room
}

// Stores the votes of the story being left, then loads the votes saved for the
// story being opened (or empty ones if nobody has voted on it yet).
const switchStory = (room, newIndex) => {
  room.savedVotes[room.currentStoryIndex] = {
    votes: room.votes,
    votesRevealed: room.votesRevealed,
  }

  const saved = room.savedVotes[newIndex]
  room.currentStoryIndex = newIndex
  room.votes = saved ? saved.votes : {}
  room.votesRevealed = saved ? saved.votesRevealed : false
}

// Moves back one story (stays on story 1). Each story keeps its own votes.
export const goToPreviousStory = (roomId) => {
  const room = rooms.get(roomId)
  if (!room) {
    return null
  }

  if (room.currentStoryIndex > 0) {
    switchStory(room, room.currentStoryIndex - 1)
  }
  return room
}

// Moves forward one story. Going past the newest story creates a blank one.
export const goToNextStory = (roomId) => {
  const room = rooms.get(roomId)
  if (!room) {
    return null
  }

  if (room.currentStoryIndex === room.stories.length - 1) {
    room.stories.push({ title: '', description: '' })
  }
  switchStory(room, room.currentStoryIndex + 1)
  return room
}

// Records a player's vote. Returns null if the room or player does not exist.
export const setVote = (roomId, playerId, value) => {
  const room = rooms.get(roomId)
  if (!room || !room.players.some((player) => player.id === playerId)) {
    return null
  }

  room.votes[playerId] = value
  return room
}

export const setVotesRevealed = (roomId, revealed) => {
  const room = rooms.get(roomId)
  if (!room) {
    return null
  }

  room.votesRevealed = revealed
  return room
}
