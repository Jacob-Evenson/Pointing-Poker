import React from 'react'
import './IntermediaryPage.css'

const IntermediaryPage = () => {
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
          <label htmlFor="Session-Name">Name:</label>
          <input id="Session-Name" type="text" />
          <button>Join Session</button>
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