import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const sessionUsername = location.state?.username || 'Player'
  const sessionCode = location.state?.roomCode || 'JACOBS-26'
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [sessionCodeCopied, setSessionCodeCopied] = useState(false)
  const [anonymousReveal, setAnonymousReveal] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [participants, setParticipants] = useState([
    { id: 1, name: sessionUsername, bid: null, voted: false },
    { id: 2, name: 'Alex', bid: 5, voted: true },
    { id: 3, name: 'Jordan', bid: 8, voted: true },
  ])

  const allVoted = participants.length > 0 && participants.every((participant) => participant.voted)
  const currentParticipant = participants.find((participant) => participant.id === 1)
  const numericVotes = participants.map((participant) => participant.bid)

  const handlePointSelect = (point) => {
    setSelectedPoint(point)
    setParticipants((currentParticipants) => currentParticipants.map((participant) => (
      participant.id === 1
        ? { ...participant, bid: point.value, voted: true }
        : participant
    )))
  }

  const handleCopySessionCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode)
      setSessionCodeCopied(true)
    } catch {
      setSessionCodeCopied(false)
    }
  }

  useEffect(() => {
    document.title = 'Pointing Poker, Team Collaboration simplified'
  }, [])

  return (
    <div className="game-page">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="game-header">
        <div className="game-shell game-header-content">
          <a className="brand" href="#main-content" aria-label="Pointing Poker home">
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
            <PointingPokerRounds />
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
                onChange={(event) => setRevealed(event.target.checked)}
              />
            </label>
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