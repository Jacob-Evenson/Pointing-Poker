import React, { useEffect, useState } from 'react'
import "./PointingPokerHomePage.css";


const PointingPokerHomePage = () => {
  //Place holder for our live stats for showing sessions 
  //Hook up to API? If we have time
  // const [liveStats] = useState({ sessions: 0, players: 0 })
  // const [selectedPoint, setSelectedPoint] = useState(null)
  // const [anonymousReveal, setAnonymousReveal] = useState(false)
  // const [participants, setParticipants] = useState([
  //   { id: 1, name: 'Player', bid: null, voted: false },
  //   { id: 2, name: 'Alex', bid: 5, voted: true },
  //   { id: 3, name: 'Jordan', bid: 8, voted: true },
  // ])

  // const allVoted = participants.length > 0 && participants.every((participant) => participant.voted)
  // const currentParticipant = participants.find((participant) => participant.id === 1)

  // // handles the selection of a point card and updates the user state accordingly
  // const handlePointSelect = (point) => {
  //   setSelectedPoint(point)
  //   setParticipants((currentParticipants) => currentParticipants.map((participant) => (
  //     participant.id === 1
  //       ? { ...participant, bid: point.value, voted: true }
  //       : participant
  //   )))
  // }



  useEffect(() => {
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
      <header className="game-header">
        <div className="game-shell game-header-content">
          <a className="brand" href="#main-content" aria-label="Pointing Poker home">
            <span className="brand-mark" aria-hidden="true">PP</span>
            <span>Pointing Poker</span>
          </a>
          <span className="header-status">
            <nav>
              <a href="">Features</a>
              {/* <a href="">Live Activity</a> */}
            </nav>
          </span>
        </div>
      </header>
      
      <main>
        <section className='Session-section'>
          <div className="Session-actions">
            <label htmlFor="Session-Name">Join Session</label>
            <input id='Session-Name' type='text' />
            <button>Join Session</button>
          </div>

          <div className="session-join">
            <button>Create Session</button>
          </div>
          {/* <p>
            Pointing Poker is a simple yet effective tool used by teams to collaborate and vote on tasks based on the relative effort, complexity,
            and uncertainty to complete a product item. Teams assign story points the lower the points the easier and higher the more effort it will take,
            based on the average of all votes cast. Can Adjust info if needed I put in a basic description of pointing poker
          </p> */}
        </section>
      </main>

      <main id="main-content">
        <section className="Pointing-Poker-wrap">
          <div className="Pointing-Poker">
            {/* <h1>Plan team sprints without the guesswork of Collaboration</h1>
            <p>
              Pointing Poker is a free tool built by the Western Tech College IT Project Management.
              Teams can collaborate, vote on ideas and in real time with out the ads and no clutter.
              With a modern style
            </p> */}
            {/*className ap stands for Active Players also can be changed early on if we don't like the active players */}
            {/* <a className="ap" href="#live">Active Players</a> */}
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
      </main>
      <footer className="site-footer wrap">
        <p>Pointing Poker Built by Jacobs minions IT project management team</p>
        <p>© 2026 Jacobs Minions. All rights reserved.</p>
      </footer>
    </>
  )
}

export default PointingPokerHomePage