import React, { useEffect, useState } from 'react'
import './GamePage.css'
import PointCard from './components/PointCard.jsx'
import SelectedPoint from './components/SelectedPoint.jsx'
import ParticipantList from './components/ParticipantList.jsx'
import PointingPokerRounds from './components/PointingPokerRounds.jsx'
import SessionTimer from './components/SessionTimer.jsx'
import VoteStats from './components/VoteStats.jsx'
import { points } from './data/points.js'
import banner from '../../src/assets/banner.jpeg'

const GamePage = () => {
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [anonymousReveal, setAnonymousReveal] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Player', bid: null, voted: false },
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

  useEffect(() => {
    document.title = 'Pointing Poker, Team Collaboration simplified'
  }, [])

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="game-header">
        <div className="game-shell game-header-content">
          <a className="brand" href="#main-content" aria-label="Pointing Poker home">
            <img className="header-banner" src={banner} alt="Pointing Poker" />
          </a>
          <span className="header-status">Live estimation session</span>
        </div>
      </header>

      <main id="main-content" className="game-shell game-main">
        {/* TOP THIRD: story card on the left and session information on the right. */}
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
              <p className="session-code">Session code <strong>JACOBS-26</strong></p>
            </div>
            <dl className="session-details">
              <div>
                <dt>Players</dt>
                <dd>{participants.length}</dd>
              </div>
              <div>
                <dt>Round</dt>
                <dd>1 of 3</dd>
              </div>
            </dl>
            <div className="timer-panel">
              <span className="timer-label">Session timer</span>
              <SessionTimer />
            </div>
          </aside>
        </section>

        {/* MIDDLE THIRD: point cards used to submit the current estimate. */}
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

        {/* BOTTOM THIRD: participant status and aggregate vote statistics. */}
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
        <div className="game-shell">
          <p>Pointing Poker Built by Jacobs minions IT project management team</p>
          <p>© 2026 Jacobs Minions. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

export default GamePage