import React, { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import './src/PointingPokerHomePage.css'
import './IntermediaryPage.css'
import pointingPokerLogoCrop from './src/assets/pointing-poker-logo-crop.png'
import { DEMO_SESSION_CODE, isValidDemoSessionCode } from './src/components/demoSession.js'

const IntermediaryPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { roomCode } = useParams()
  const [username, setUsername] = useState('')
  const requestedSessionCode = location.state?.roomCode || location.state?.sessionCode || roomCode || DEMO_SESSION_CODE
  const isValidSession = isValidDemoSessionCode(requestedSessionCode)
  const sessionCode = isValidSession ? DEMO_SESSION_CODE : requestedSessionCode

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/GamePage', {
      state: { username: username.trim(), roomCode: sessionCode },
    })
  }

  return (
    <div className="join-session-page">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="game-header">
        <div className="game-shell game-header-content">
          <a href="/" className="brand" aria-label="Pointing Poker home">
            <img src={pointingPokerLogoCrop} alt="" />
            <span>Pointing Poker</span>
          </a>
        </div>
      </header>

      <main id="main-content" className="join-session-main">
        <section className="join-session-card" aria-labelledby="join-session-heading">
          {isValidSession ? (
            <>
              <span className="join-session-icon" aria-hidden="true">👥</span>
              <p className="eyebrow">Join Session</p>
              <h1 id="join-session-heading">Enter your username</h1>
              <p className="join-session-description">
                Choose the name that will appear in the estimation session.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="visually-hidden" htmlFor="username">Your name</label>
                <div className="username-field">
                  <span aria-hidden="true">👤</span>
                  <input
                    id="username"
                    className="username-input"
                    type="text"
                    placeholder="Your name"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                <button className="btn btn-join join-session-button" type="submit">
                  Join Session <span aria-hidden="true">→</span>
                </button>
              </form>

              <p className="join-session-code">
                <span>Joining session</span>
                <strong>{sessionCode}</strong>
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow">Invalid Session</p>
              <h1 id="join-session-heading">Session not found</h1>
              <p role="alert">The code {sessionCode} is not available in this demo.</p>
              <a className="btn btn-join join-session-button" href="/">Return to home</a>
            </>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>Pointing Poker Built by Jacobs minions IT project management team</p>
        <p>© 2026 Jacobs Minions. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default IntermediaryPage