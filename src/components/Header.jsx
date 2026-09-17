import React from 'react'

const Header = () => {
  return (
    <header className="site-header">
      <div className="wrap">
        <span className="Pointing Poker">Pointing Poker</span>
        <nav aria-label="primary">
          <a href="#features">Features</a>
          <a href="#live">Live Activity</a>
        </nav>
      </div>
    </header>
  )
}

export default Header