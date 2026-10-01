import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './src/PointingPokerHomePage.css'
import './IntermediaryPage.css'
import pointingPokerLogoCrop from './src/assets/pointing-poker-logo-crop.png'

const IntermediaryPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const sessionCode = location.state?.roomCode || location.state?.sessionCode || 'JACOBS-26'

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