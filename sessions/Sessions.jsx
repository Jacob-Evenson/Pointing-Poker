import React, { useEffect, useState } from 'react'
import SessionsTimer from './SessionsTimer';
import '../src/'

const Sessions = () => {

  //stores session ID to be able to to show it during the session
  const [sessionID, setSessionID] = useState('');

  //array for the players so that they can show up on screen
  const [players, setPlayers] = useState([]);

  //uses a single string to show a display name for a user it should there username IE displayName
  const [displayName, setDisplayName] = useState('');

  //Stores a votes value ie 1, 4, 13 but starts off as null instead of 0 
  const [userVote, setUserVote] = useState(null);





  return (
    <>
      <section>Session ID: {sessionID}</section>
      <div>{displayName}</div>

      {/* TO DO List for session page
      1st clear votes button and show votes button
       1. Add voting buttons 0, 1/2, 1, 2, 3, 5, 8, 13, 20, 40, 100, and ?
       2. Add time counter  */}

      <div className='sessions-container'>
        <div>Player</div> 
        <div>Points</div>

        <SessionsTimer/> {/* Will need to be adjusted to stop when that last player votes */}

       <label htmlFor='storyDescription'>Story Description</label>
       <textarea
       id="storyDescription"
       placeholder='Enter Story Description'
       rows="10"
       />

        <button>Clear Votes</button>
        <button>Reveal Votes</button> {/*Can be changed to show votes. */}
        <ol>
          {players.map(player => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ol>
      </div>

    </>
  )
}



export default Sessions