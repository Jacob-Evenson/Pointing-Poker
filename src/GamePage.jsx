import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './GamePage.css'
import pointingPokerLogoCrop from './assets/pointing-poker-logo-crop.png'
import PointCard from './components/PointCard.jsx'
import SelectedPoint from './components/SelectedPoint.jsx'
import ParticipantList from './components/ParticipantList.jsx'
import PointingPokerRounds from './components/PointingPokerRounds.jsx'
import SessionTimer from './components/SessionTimer.jsx'
import VoteStats from './components/VoteStats.jsx'
import Confetti from './components/Confetti.jsx'
import { points } from './data/points.js'
import { validateStoryTitle, validateStoryDescription } from './validation.js'

const SAFE_ERROR = 'Something went wrong. Please try again.'

const GamePage = () => {
  const navigate = useNavigate()
  const { roomCode: sessionCode } = useParams()
  const roomUrl = `/api/rooms/${encodeURIComponent(sessionCode)}`
  const playerId = sessionStorage.getItem(`playerId:${sessionCode}`)
  const [room, setRoom] = useState(null)
  const [loadError, setLoadError] = useState(null)
  // The card this browser picked for each story, so it can be shown again when returning to that story.
  const [selectedPoints, setSelectedPoints] = useState({})
  const [sessionCodeCopied, setSessionCodeCopied] = useState(false)
  const [storyErrors, setStoryErrors] = useState({ title: null, description: null })
  const [isLeavingRoom, setIsLeavingRoom] = useState(false)
  const [isTimerUpdating, setIsTimerUpdating] = useState(false)
  const [confettiRun, setConfettiRun] = useState(0)
  const leavingRef = useRef(false)
  const roomRefreshId = useRef(0)
  const consensusTracker = useRef({ storyIndex: null, triggered: false })
  const playerIsInRoom = Boolean(room?.players.some((player) => player.id === playerId))

  useEffect(() => {
    if (!room) {
      return
    }

    const hasPlayers = room.players.length > 0
    const allPlayersVoted = hasPlayers
      && room.players.every((player) => Object.hasOwn(room.votes, player.id))
    const firstVote = room.players.length > 0 ? room.votes[room.players[0].id] : undefined
    const consensusReached = room.votesRevealed
      && allPlayersVoted
      && room.players.every((player) => room.votes[player.id] === firstVote)
    const tracker = consensusTracker.current

    if (tracker.storyIndex !== room.currentStoryIndex) {
      tracker.storyIndex = room.currentStoryIndex
      tracker.triggered = consensusReached
      return
    }

    if (!allPlayersVoted) {
      tracker.triggered = false
    } else if (room.votesRevealed) {
      if (consensusReached && !tracker.triggered) {
        tracker.triggered = true
        setConfettiRun((run) => run + 1)
      } else if (!consensusReached) {
        tracker.triggered = false
      }
    }
  }, [room])

  const refreshRoom = useCallback(async () => {
    const refreshId = ++roomRefreshId.current
    try {
      const response = await fetch(roomUrl)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || SAFE_ERROR)
      }
      if (refreshId !== roomRefreshId.current) {
        return
      }

      setRoom(data)
      setLoadError(null)
      if (!data.players.some((player) => player.id === playerId) && !leavingRef.current) {
        navigate(`/room/${encodeURIComponent(sessionCode)}/join`, { replace: true })
      }
    } catch (err) {
      console.error('Failed to refresh room:', err)
      if (refreshId === roomRefreshId.current) {
        setLoadError(err instanceof SyntaxError || err instanceof TypeError ? SAFE_ERROR : err.message)
      }
    }
  }, [navigate, playerId, roomUrl, sessionCode])

  // Sends a request to the server and shows the updated room it sends back.
  const sendToServer = async (path, method = 'POST', body) => {
    try {
      const response = await fetch(`${roomUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || SAFE_ERROR)
      }
      setRoom(data)
      setLoadError(null)
    } catch (err) {
      console.error(`Failed to send ${method} request for ${path}:`, err)
      setLoadError(err instanceof SyntaxError || err instanceof TypeError ? SAFE_ERROR : err.message)
    }
  }

  useEffect(() => {
    let active = true
    const loadRoom = async () => {
      try {
        const response = await fetch(roomUrl)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || SAFE_ERROR)
        }
        if (!active) {
          return
        }

        setRoom(data)
        setLoadError(null)
        if (!data.players.some((player) => player.id === playerId)) {
          navigate(`/room/${encodeURIComponent(sessionCode)}/join`, { replace: true })
        }
      } catch (error) {
        console.error('Failed to load room:', error)
        if (active) {
          setLoadError(error instanceof SyntaxError || error instanceof TypeError ? SAFE_ERROR : error.message)
        }
      }
    }

    loadRoom()
    return () => {
      active = false
    }
  }, [navigate, playerId, roomUrl, sessionCode])

  useEffect(() => {
    // Wait for the initial REST response to confirm this browser joined the room.
    if (!playerIsInRoom) {
      return undefined
    }

    let socket
    try {
      socket = new WebSocket('ws://127.0.0.1:3001')
    } catch (error) {
      console.error('Failed to connect to room WebSocket:', error)
      return undefined
    }

    const handleOpen = () => {
      socket.send(JSON.stringify({
        type: 'JOIN_ROOM',
        roomCode: sessionCode,
        playerId,
      }))
      console.log(`Connected to WebSocket room ${sessionCode}`)
    }
    const handleMessage = (event) => {
      let message
      try {
        message = JSON.parse(event.data)
      } catch (error) {
        console.error('Ignoring malformed room WebSocket message:', error)
        return
      }
      if (!message || typeof message !== 'object') {
        return
      }

      if (
        message.type === 'PLAYER_JOINED'
        || message.type === 'PLAYER_LEFT'
        || message.type === 'ROOM_UPDATED'
      ) {
        if (message.type === 'PLAYER_LEFT' && message.playerId === playerId && leavingRef.current) {
          return
        }
        // Read the latest authoritative state, including concurrent room changes.
        refreshRoom()
      }
    }
    const handleError = (error) => {
      console.error('WebSocket error:', error)
    }

    socket.addEventListener('open', handleOpen)
    socket.addEventListener('message', handleMessage)
    socket.addEventListener('error', handleError)

    return () => {
      roomRefreshId.current += 1
      socket.removeEventListener('open', handleOpen)
      socket.removeEventListener('message', handleMessage)
      socket.removeEventListener('error', handleError)
      // Close this room connection on unmount or when room membership changes.
      socket.close()
    }
  }, [playerId, playerIsInRoom, refreshRoom, sessionCode])

  useEffect(() => {
    document.title = 'Pointing Poker, Team Collaboration simplified'
  }, [])

  if (!room) {
    return (
      <div className="game-page">
        <main id="main-content" className="game-shell game-main">
          <p role={loadError ? 'alert' : 'status'}>{loadError || 'Loading room...'}</p>
        </main>
      </div>
    )
  }

  const participants = room.players.map((player) => ({
    id: player.id,
    name: player.name,
    voted: player.id in room.votes,
    bid: room.votes[player.id],
  }))
  const revealed = room.votesRevealed
  const anonymousReveal = Boolean(room.anonymousReveal)
  const setAnonymousReveal = (enabled) => sendToServer('/anonymous', 'POST', { enabled })
  const allVoted = participants.length > 0 && participants.every((participant) => participant.voted)
  const currentParticipant = participants.find((participant) => participant.id === playerId)
  const numericVotes = participants.map((participant) => participant.bid)
  const selectedPoint = selectedPoints[room.currentStoryIndex] ?? null

  const handlePointSelect = (point) => {
    setSelectedPoints((current) => ({ ...current, [room.currentStoryIndex]: point }))
    sendToServer('/votes', 'POST', { playerId, value: point.value })
  }

  const handleStoryEdit = (field, value) => {
    const error = field === 'title' ? validateStoryTitle(value) : validateStoryDescription(value)
    setStoryErrors((current) => ({ ...current, [field]: error }))

    // Update the screen right away so typing feels smooth.
    setRoom((currentRoom) => ({
      ...currentRoom,
      stories: currentRoom.stories.map((story, index) => (
        index === currentRoom.currentStoryIndex ? { ...story, [field]: value } : story
      )),
    }))

    // Text that is too long is not saved until the user shortens it.
    if (!error) {
      fetch(`${roomUrl}/stories/current`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      }).catch(() => setLoadError(SAFE_ERROR))
    }
  }

  // Stay on the current story until its title and description are within the limits.
  const handleStoryNavigation = (path) => {
    if (storyErrors.title || storyErrors.description) {
      return
    }
    sendToServer(path)
  }
  const handleTimerAction = async (action) => {
    setIsTimerUpdating(true)
    await sendToServer('/timer', 'POST', { playerId, action })
    setIsTimerUpdating(false)
  }
  const handleCopySessionCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode)
      setSessionCodeCopied(true)
    } catch {
      setSessionCodeCopied(false)
    }
  }
  const handleLeaveRoom = async () => {
    if (!playerId || leavingRef.current) {
      return
    }

    leavingRef.current = true
    setIsLeavingRoom(true)
    setLoadError(null)
    try {
      const response = await fetch(`${roomUrl}/players/${encodeURIComponent(playerId)}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || SAFE_ERROR)
      }

      sessionStorage.removeItem(`playerId:${sessionCode}`)
      navigate('/')
    } catch (error) {
      console.error('Failed to leave room:', error)
      leavingRef.current = false
      setIsLeavingRoom(false)
      setLoadError(error instanceof SyntaxError || error instanceof TypeError ? SAFE_ERROR : error.message)
      refreshRoom()
    }
  }

  return (
    <div className="game-page">
      <Confetti run={confettiRun} onComplete={() => setConfettiRun(0)} />
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="game-header">
        <div className="game-shell game-header-content">
          <a className="brand" href="/" aria-label="Pointing Poker home">
            <img src={pointingPokerLogoCrop} alt="" />
            <span>Pointing Poker</span>
          </a>
          <span className="header-status">Live estimation session</span>
        </div>
      </header>

      <main id="main-content" className="game-shell game-main">
        {loadError && <p className="game-error" role="alert">{loadError}</p>}
        <section className="game-section top-third" aria-label="Top third: story and session">
          <div className="story-panel">
            <p className="section-kicker">Current game</p>
            <h1 id="session-heading">Estimate the work together</h1>
            <PointingPokerRounds
              stories={room.stories}
              currentStoryIndex={room.currentStoryIndex}
              onTitleChange={(value) => handleStoryEdit('title', value)}
              onDescriptionChange={(value) => handleStoryEdit('description', value)}
              titleError={storyErrors.title}
              descriptionError={storyErrors.description}
              onPreviousStory={() => handleStoryNavigation('/stories/previous')}
              onNextStory={() => handleStoryNavigation('/stories/next')}
            />
          </div>
          <aside className="session-panel" aria-labelledby="session-info-heading">
            <div>
              <p className="section-kicker">Session information</p>
              <h2 id="session-info-heading">Team estimation room</h2>
              <p className="session-code">
                Session code <strong>{sessionCode}</strong>
                <button
                  className="copy-session-code"
                  type="button"
                  aria-label={sessionCodeCopied ? 'Session code copied' : 'Copy session code'}
                  onClick={handleCopySessionCode}
                >
                  {sessionCodeCopied ? 'Copied' : 'Copy'}
                </button>
              </p>
            </div>
            <div className="session-metrics">
              <dl className="players-card">
                <span className="players-icon" aria-hidden="true">👥</span>
                <div>
                  <dt>Players</dt>
                  <dd>{participants.length}</dd>
                </div>
              </dl>
              <div className="timer-card">
                <span className="timer-icon" aria-hidden="true">◷</span>
                <div className="timer-card-content">
                  <span className="timer-label">Session timer</span>
                  <SessionTimer
                    key={room.sessionTimer.syncedAt}
                    timer={room.sessionTimer}
                    isHost={room.hostPlayerId === playerId}
                    onAction={handleTimerAction}
                    isUpdating={isTimerUpdating}
                  />
                </div>
              </div>
            </div>
            {room.hostPlayerId === playerId && <span className="host-status">You are the session host</span>}
            <button
              className="leave-room-button"
              type="button"
              onClick={handleLeaveRoom}
              disabled={isLeavingRoom}
            >
              {isLeavingRoom ? 'Leaving...' : 'Leave Room'}
            </button>
          </aside>
        </section>

        <section className="game-section middle-third" aria-labelledby="point-cards-heading">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Make your estimate</p>
              <h2 id="point-cards-heading">Choose a point card</h2>
            </div>
            <span className="round-note">Show submitted votes whenever you are ready.</span>
          </div>
          <div className="point-card-grid">
            {points.map((point) => (
              <PointCard key={point.value} point={point} onSelect={handlePointSelect} />
            ))}
          </div>
          <SelectedPoint point={selectedPoint} voted={Boolean(currentParticipant?.voted)} />
        </section>

        <section className="game-section bottom-third" aria-labelledby="results-heading">
          <div className="results-heading">
            <p className="section-kicker">Live estimates</p>
            <h2 id="results-heading">Team results</h2>
            <label className="vote-visibility-toggle">
              <span>{revealed ? 'Hide votes' : 'Show votes'}</span>
              <input
                type="checkbox"
                role="switch"
                aria-label={revealed ? 'Hide votes and statistics' : 'Show votes and statistics'}
                checked={revealed}
                onChange={(event) => sendToServer(event.target.checked ? '/votes/reveal' : '/votes/hide')}
              />
            </label>
            <button type="button" onClick={() => sendToServer('/votes/reset')}>Reset Votes</button>
          </div>
          <div className={`results-grid${revealed ? ' results-with-stats' : ''}`}>
            <ParticipantList
              participants={participants}
              allVoted={allVoted}
              revealed={revealed}
              anonymousReveal={anonymousReveal}
              onAnonymousReveal={setAnonymousReveal}
            />
            {revealed && (
              <div className="stats-panel">
                <h3>Vote statistics</h3>
                <VoteStats votes={numericVotes} />
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Pointing Poker Built by Jacobs minions IT project management team</p>
        <p>© 2026 Jacobs Minions. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default GamePage