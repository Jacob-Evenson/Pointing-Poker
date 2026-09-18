import React from 'react'

const IntermediaryPage = () => {
  return (
    <>
    <header className="site-header">
        <div className="wrap">
          <span className="Pointing-Poker">Pointing Poker</span>
          <nav aria-label="primary">
            <a href="#features">Features</a>
            <a href="#live">Live Activity</a>
          </nav>
        </div>
      </header>

        <label htmlFor="Session-Name">Name:</label>
        <input id='Session-Name' type='text'/>
        <button>Join Sessions</button>

       <footer className="site-footer wrap">
        <p>Pointing Poker Built by Jacobs minions IT project management team</p>
        <p>© 2026 Jacobs Minions. All rights reserved.</p>
      </footer>
      </>
  )
}

export default IntermediaryPage