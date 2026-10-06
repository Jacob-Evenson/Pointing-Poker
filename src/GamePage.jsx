import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './GamePage.css'
import pointingPokerLogoCrop from './assets/pointing-poker-logo-crop.png'
import PointCard from './components/PointCard.jsx'
import SelectedPoint from './components/SelectedPoint.jsx'
import ParticipantList from './components/ParticipantList.jsx'
import PointingPokerRounds from './components/PointingPokerRounds.jsx'
import SessionTimer from './components/SessionTimer.jsx'
import VoteStats from './components/VoteStats.jsx'
import { points } from './data/points.js'

const GamePage = () => {
  const navigate = useNavigate()
  const { roomCode: sessionCode } = useParams()
  const roomUrl = `/api/rooms/${encodeURIComponent(sessionCode)}`
  const playerId = sessionStorage.getItem(`playerId:${sessionCode}`)
  const [room, setRoom] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [sessionCodeCopied, setSessionCodeCopied] = useState(false)
  const [anonymousReveal, setAnonymousReveal] = useState(false)

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
        throw new Error(data.error || 'Request failed')
      }
      setRoom(data)
    } catch (err) {
      setLoadError(err.message)
    }
  }

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const response = await fetch(roomUrl)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load room')
        }
        if (!data.players.some((player) => player.id === playerId)) {
          navigate(`/room/${encodeURIComponent(sessionCode)}/join`, { replace: true })
          return
        }
        setRoom(data)
      } catch (err) {
        setLoadError(err.message)
      }
    }

    loadRoom()
  }, [roomUrl, playerId, sessionCode, navigate])

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
  const allVoted = participants.length > 0 && participants.every((participant) => participant.voted)
  const currentParticipant = participants.find((participant) => participant.id === playerId)
  const numericVotes = participants.map((participant) => participant.bid)

  const handlePointSelect = (point) => {
    setSelectedPoint(point)
    sendToServer('/votes', 'POST', { playerId, value: point.value })
  }

  const handleStoryEdit = (field, value) => {
    // Update the screen right away so typing feels smooth, then tell the server.
    setRoom((currentRoom) => ({
      ...currentRoom,
      stories: currentRoom.stories.map((story, index) => (
        index === currentRoom.currentStoryIndex ? { ...story, [field]: value } : story
      )),
    }))
    fetch(`${roomUrl}/stories/current`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    }).catch((err) => setLoadError(err.message))
  }

  const handleCopySessionCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode)
      setSessionCodeCopied(true)
    } catch {
      setSessionCodeCopied(false)
    }
  }

  return (
    <div className="game-page">
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
        <section className="game-section top-third" aria-label="Top third: story and session">
          <div className="story-panel">
            <p className="section-kicker">Current game</p>
            <h1 id="session-heading">Estimate the work together</h1>
            <PointingPokerRounds
              stories={room.stories}
              currentStoryIndex={room.currentStoryIndex}
              onTitleChange={(value) => handleStoryEdit('title', value)}
              onDescriptionChange={(value) => handleStoryEdit('description', value)}
              onPreviousStory={() => sendToServer('/stories/previous')}
              onNextStory={() => sendToServer('/stories/next')}
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
                  <SessionTimer />
                </div>
              </div>
            </div>
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