import React from 'react'
import { useLocation } from 'react-router-dom'
import './IntermediaryPage.css'

const IntermediaryPage = () => {
  const location = useLocation()
  const mode = location.state?.mode || 'join'

  return (
    <div className="page-wrapper">
      <header className="game-header">
        <div className="game-shell game-header-content">
          <a href="/" className="brand">
            <span className="brand-mark">PP</span>
            Pointing Poker
          </a>

          <div className="header-status">
            <nav>
              <a href="/">Home</a>
              <a href="/sessions">Sessions</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="game-main">
        <div className="game-shell">
          <h1>
            {mode === 'create' ? 'Create a Session' : 'Join a Session'}
          </h1>

          <label htmlFor="Session-Name">
            {mode === 'create' ? 'Your name:' : 'Session code:'}
          </label>

          <input id="Session-Name" type="text" />

          <button type="button">
            {mode === 'create' ? 'Create Session' : 'Join Session'}
          </button>
        </div>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <p>Pointing Poker Built by Jacobs minions IT project management team</p>
          <p>© 2026 Jacobs Minions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default IntermediaryPage