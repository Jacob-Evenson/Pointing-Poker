import React, { useEffect, useState } from 'react'

const SessionTimer = ({ timer, isHost, onAction, isUpdating }) => {
  const [clock, setClock] = useState(() => {
    const now = Date.now()
    return { now, receivedAt: now }
  })
  const running = timer.running
  // The server snapshot anchors the local display between room refreshes.
  const seconds = timer.elapsedSeconds + (
    running ? Math.floor((clock.now - clock.receivedAt) / 1000) : 0
  )
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const remainingSeconds = String(seconds % 60).padStart(2, '0')

  useEffect(() => {
    if (!running) {
      return undefined
    }

    const interval = setInterval(() => {
      setClock((current) => ({ ...current, now: Date.now() }))
    }, 250)
    return () => clearInterval(interval)
  }, [running])

  return (
    <div className="timer-controls">
      <p
        className="timer-value"
        role="timer"
        aria-label="Session time"
        aria-valuetext={`${minutes} minutes, ${remainingSeconds} seconds`}
      >
        {minutes}:{remainingSeconds}
      </p>
      <span className="timer-host-note" role="status">
        {running ? 'Timer running' : 'Timer paused'}
      </span>
      {isHost ? (
        <>
          <button
            type="button"
            onClick={() => onAction(running ? 'pause' : 'start')}
            disabled={isUpdating}
          >
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            onClick={() => onAction('reset')}
            disabled={isUpdating}
          >
            Reset
          </button>
        </>
      ) : (
        <span className="timer-host-note">Timer controlled by the host</span>
      )}
    </div>
  )
}

export default SessionTimer
