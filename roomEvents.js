
// In-process event bus keeps REST mutations independent from the WebSocket server.
const listeners = new Set()

export const subscribeToRoomEvents = (listener) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const publishRoomEvent = (roomCode, event) => {
  for (const listener of listeners) {
    listener(roomCode, event)
  }
}
