import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const navigate = useNavigate()
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [createRoomError, setCreateRoomError] = useState(null)

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

      <main id="main-content">
        <section className="hero">
          <div className="hero-logo" aria-hidden="true">PP</div>
          <h1>Pointing Poker</h1>
          <p className="tagline">Estimate the work together</p>
        </section>

        <section className="Session-section wrap">
          <div className="session-card">
            <span className="card-icon" aria-hidden="true">👥</span>
            <div className="card-text">
              <p className="eyebrow">Create a session</p>
              <h2>Create a Session</h2>
              <p>Start a new estimation session and share the code with your team.</p>
            </div>
            <button className="btn btn-create" onClick={handleCreateSession} disabled={isCreatingRoom}>
              {isCreatingRoom ? 'Creating...' : 'Create Session'} <span aria-hidden="true">→</span>
            </button>
            {createRoomError && <p role="alert">{createRoomError}</p>}
          </div>

          <div className="session-card">
            <span className="card-icon" aria-hidden="true">🔗</span>
            <div className="card-text">
              <p className="eyebrow">Join a session</p>
              <h2><label htmlFor="Session-Name">Join a Session</label></h2>
              <p>Enter a session code to join an existing estimation session.</p>
            </div>
            <input id="Session-Name" type="text" placeholder="Enter session code" />
            <button className="btn btn-join">Join Session <span aria-hidden="true">→</span></button>
          </div>
        </section>

        <section id="features" className="features wrap">
          <h2>Why use Pointing Poker?</h2>
          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon" aria-hidden="true">👥</span>
              <div><h3>Collaborative</h3><p>Get input from the whole team in real time.</p></div>
            </article>
            <article className="feature-card">
              <span className="feature-icon" aria-hidden="true"></span>
              <div><h3>Fast and Simple</h3><p>Start a session and begin estimating in seconds</p></div>
            </article>
            <article>
              <span></span>
              <div><h3>Distraction Free</h3><p>Private voting keeps estimates unbiased</p></div>
            </article>
            {/* Fast & Simple, Distraction Free follow the same shape */}
          </div>
        </section>
      </main>
    </>
  )
}

export default PointingPokerHomePage