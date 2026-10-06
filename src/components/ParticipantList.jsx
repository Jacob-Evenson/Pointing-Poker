import React from 'react'

const ParticipantList = ({ participants, allVoted, revealed, anonymousReveal, onAnonymousReveal }) => {
  const revealedParticipants = participants.filter((participant) => participant.voted)

  return (
    <section className="participant-panel" aria-labelledby="participant-heading">
      <div className="participant-panel-header">
        <div>
          <h2 id="participant-heading">People in this session</h2>
          <p role="status">
            {revealed
              ? allVoted
                ? 'All votes are revealed.'
                : 'Votes are revealed for players who have voted.'
              : allVoted
                ? 'Everyone has voted. Votes are ready to reveal.'
                : 'Votes stay private until you reveal them.'}
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
            </div>
            <span className={`participant-vote${participant.voted ? ' voted' : ''}`}>
              {!participant.voted
                ? 'Not yet Voted'
                : revealed
                  ? (anonymousReveal ? 'Revealed' : participant.bid)
                  : 'Voted'}
            </span>
          </li>
        ))}
      </ul>

      {revealed && anonymousReveal && (
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