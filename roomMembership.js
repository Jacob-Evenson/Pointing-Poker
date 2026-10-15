import { removePlayer } from './roomStore.js'
import { publishRoomEvent } from './roomEvents.js'

export const removePlayerFromRoom = (roomCode, playerId) => {
  const room = removePlayer(roomCode, playerId)
  if (room) {
    publishRoomEvent(roomCode, {
      type: 'PLAYER_LEFT',
      playerId,
    })
  }
  return room
}
