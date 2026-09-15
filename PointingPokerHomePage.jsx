import React, { useEffect, useState } from 'react'
import "./PointingPokerHomePage.css";


const PointingPokerHomePage = () => {
  //Place holder for our live stats for showing sessions 
  //Hook up to API? If we have time
  const [liveStats, setLiveStats] = useState({sessions: 0, players: 0})

  useEffect(() =>{
    document.title = "Pointing Poker, Team Collaboration simplified"
    //TO DO LIST
    /*
    Set up our live stats here 
    Add an interval to update those live stats I was thinking 15-60 seconds per stats refresh? const interval = setInterval(()=> setLiveStats(newData), 27,000) 27 seconds is the place holder value can be adjusted
    return () => clearInterval(interval)
    */
  }, [])
  return (
    <>
    {/*Do we want the skip link? That will take you right to the main content? */}
    <a className="skip-link" href="#main-content">Skip to main content</a>

    <header className="site-header">
      <div className="wrap">
        <span className="Pointing Poker">Pointing Poker</span>
        <nav aria-label="primary">
          <a href="#features">Features</a>
          <a href="#live">Live Activity</a>
        </nav>y
      </div>
    </header>

    <main id="main-content">
      <section className="Pointing Poker wrap">
        <div className="Pointing-Poker">
          <h1>Plan team sprints without the guesswork of Collaboration</h1>
          <p>
            Pointing Poker is a free tool built by the Western Tech College IT Project Management.
            Teams can collaborate, vote on ideas and in real time with out the ads and no clutter.
            With a modern style
          </p>
          {/*className ap stands for Active Players also can be changed early on if we dont like the active players */ }
          <a className="ap" href="#live">Active Players</a>
        </div>
      </section>

      <section id="features" className="features wrap">
        <h2>Why Teams Choose to use Pointing Poker style tools for Collaboration</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Pointing Poker Built of easy real time Collaboration</h3>
            <p>
              Every team member votes during team meetings allowing for shy voices to carry as much wait as the loud voices.
              No ads allows for uninterrupted voting rounds or distractions.
            </p>
          </article>
          <article className="feature-card">
            <h3>Effortless to use</h3>
            <p>
              Start a session, share the link and start collaborating and voting.
            </p>
          </article>
        </div>
      </section>
      <section id="live">
        <h2>Teams collaborating live right now</h2>
        <dl className="stat-row" aria-live="polite">
          <div className="stat">
            <dt>Active Collaboration sessions</dt>
            <dd>{liveStats.sessions}</dd>
          </div>
          <div className="stat">
            <dt>Players online</dt>
            <dd>{liveStats.players}</dd>
          </div>
        </dl>
      </section>
    </main>
    <footer className="site-footer wrap">
      <p>Pointing Poker Built by Jacobs minions IT project management team</p>
      <p>© 2026 Jacobs Minions. All rights reserved.</p>
    </footer>
    </>
  )
}

export default PointingPokerHomePage