import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PointingPokerHomePage.css'
import pointingPokerLogo from './assets/pointing-poker-logo.png'
import pointingPokerLogoCrop from './assets/pointing-poker-logo-crop.png'


const PointingPokerHomePage = () => {
  const navigate = useNavigate()
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [createRoomError, setCreateRoomError] = useState(null)
  const [sessionCode, setSessionCode] = useState('')
  const [isJoiningRoom, setIsJoiningRoom] = useState(false)
  const [joinRoomError, setJoinRoomError] = useState(null)

  const handleCreateSession = async () => {
    setIsCreatingRoom(true)
    setCreateRoomError(null)

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to create room')
      }

      const data = await response.json()
      const roomCode = data.roomCode

      if (!roomCode) {
        throw new Error('No room code returned from server')
      }

      navigate(`/room/${roomCode}/join`)
    } catch (err) {
      setCreateRoomError(err.message)
    } finally {
      setIsCreatingRoom(false)
    }
  }

  const handleJoinSession = async (event) => {
    event.preventDefault()
    const roomCode = sessionCode.trim()
    if (!roomCode) {
      setJoinRoomError('Enter a session code')
      return
    }

    setIsJoiningRoom(true)
    setJoinRoomError(null)

    try {
      const response = await fetch(`/api/rooms/${encodeURIComponent(roomCode)}`, {
        method: 'GET',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find session')
      }

      if (!data.roomCode) {
        throw new Error('Session details did not include a room code')
      }

      navigate(`/room/${encodeURIComponent(roomCode)}/join`)
    } catch (err) {
      setJoinRoomError(err.message)
    } finally {
      setIsJoiningRoom(false)
    }
  }

  useEffect(() => {
    document.title = 'Pointing Poker, Team Collaboration simplified'
  }, [])

  return (
    <div className="home-page">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="game-header">
        <div className="game-shell game-header-content">
          <a className="brand" href="#main-content" aria-label="Pointing Poker home">
            <img src={pointingPokerLogoCrop} alt="" />
            <span>Pointing Poker</span>
          </a>
        </div>
      </header>

      <main id="main-content" className="home-main">
        <section className="hero">
          <img className="hero-logo" src={pointingPokerLogo} alt="" />
          <h1 className="visually-hidden">Pointing Poker</h1>
          <p className="tagline">Estimate the work together</p>
        </section>

        <section className="Session-section" aria-label="Create or join a session">
          <div className="session-card">
            <span className="card-icon" aria-hidden="true">👥</span>
            <div className="card-text">
              <p className="eyebrow">Create a session</p>
              <h2>Create a Session</h2>
              <p>Start a new estimation session and share the code with your team. Sessions are valid for 24 hours.</p>
            </div>
            <button className="btn btn-create" type="button" onClick={handleCreateSession} disabled={isCreatingRoom}>
              {isCreatingRoom ? 'Creating...' : 'Create Session'} <span aria-hidden="true">→</span>
            </button>
            {createRoomError && <p role="alert">{createRoomError}</p>}
          </div>

          <form className="session-card" onSubmit={handleJoinSession}>
            <span className="card-icon link-icon" aria-hidden="true">🔗</span>
            <div className="card-text">
              <p className="eyebrow">Join a session</p>
              <h2>Join a Session</h2>
              <p>Enter a session code to join an existing estimation session.</p>
            </div>
            <label className="visually-hidden" htmlFor="session-code">Session code</label>
            <input
              id="session-code"
              type="text"
              placeholder="Enter session code"
              value={sessionCode}
              onChange={(event) => {
                setSessionCode(event.target.value)
                setJoinRoomError(null)
              }}
              required
              disabled={isJoiningRoom}
            />
            <button className="btn btn-join" type="submit" disabled={isJoiningRoom}>
              {isJoiningRoom ? 'Checking...' : 'Join Session'} <span aria-hidden="true">→</span>
            </button>
            {joinRoomError && <p role="alert">{joinRoomError}</p>}
          </form>
        </section>

        <section id="features" className="features wrap">
          <h2>Why Use Pointing Poker?</h2>
          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon" aria-hidden="true">👥</span>
              <div>
                <h3>Collaborative</h3>
                <p>Get input from the whole team in real time.</p>
              </div>
            </article>
            <article className="feature-card">
              <span className="feature-icon feature-lightning" aria-hidden="true">⚡</span>
              <div>
                <h3>Fast &amp; Simple</h3>
                <p>Start a session and begin estimating in seconds.</p>
              </div>
            </article>
            <article className="feature-card">
              <span className="feature-icon feature-shield" aria-hidden="true">🛡️</span>
              <div>
                <h3>Distraction Free</h3>
                <p>Private voting keeps estimates unbiased.</p>
              </div>
            </article>
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

export default PointingPokerHomePage