import React from 'react'

const ParticipantList = ({ participants, allVoted, anonymousReveal, onAnonymousReveal }) => {
  const revealedParticipants = participants.filter((participant) => participant.voted)

  return (
    <section className="participant-panel" aria-labelledby="participant-heading">
      <div className="participant-panel-header">
        <div>
          <h2 id="participant-heading">People in this session</h2>
          <p role="status">
            {allVoted ? 'All votes are revealed.' : 'Votes stay hidden until everyone has voted.'}
          </p>
        </div>
        <label className="anonymous-toggle">
          <input
            type="checkbox"
            checked={anonymousReveal}
            onChange={(event) => onAnonymousReveal(event.target.checked)}
          />
          Anonymous reveal
        </label>
      </div>

      <ul className="participant-list">
        {participants.map((participant) => (
          <li className="participant" key={participant.id}>
            <div>
              <strong>{participant.name}</strong>
              <span className={participant.voted ? 'participant-status voted' : 'participant-status'}>
                {participant.voted ? 'Voted' : 'Waiting'}
              </span>
            </div>
            <span className="participant-vote">
              {allVoted ? (anonymousReveal ? 'Revealed' : participant.bid) : 'Hidden'}
            </span>
          </li>
        ))}
      </ul>

      {allVoted && anonymousReveal && (
        <div className="anonymous-results">
          <h3>Revealed results</h3>
          <ul aria-label="Anonymous revealed votes">
            {revealedParticipants.map((participant) => (
              <li key={participant.id}>{participant.bid}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default ParticipantList