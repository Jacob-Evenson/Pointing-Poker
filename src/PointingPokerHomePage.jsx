import React, { useEffect } from 'react'
import './PointingPokerHomePage.css'
import pointingPokerLogo from './assets/pointing-poker-logo.png'
import pointingPokerLogoCrop from './assets/pointing-poker-logo-crop.png'


const PointingPokerHomePage = () => {
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
              <p>Start a new estimation session and share the code with your team.</p>
            </div>
            <button className="btn btn-create" type="button">
              Create Session <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="session-card">
            <span className="card-icon link-icon" aria-hidden="true">🔗</span>
            <div className="card-text">
              <p className="eyebrow">Join a session</p>
              <h2>Join a Session</h2>
              <p>Enter a session code to join an existing estimation session.</p>
            </div>
            <label className="visually-hidden" htmlFor="session-code">Session code</label>
            <input id="session-code" type="text" placeholder="Enter session code" />
            <button className="btn btn-join" type="button">
              Join Session <span aria-hidden="true">→</span>
            </button>
          </div>
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