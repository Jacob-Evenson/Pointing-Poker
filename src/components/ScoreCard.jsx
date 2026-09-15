import React from 'react'

const ScoreCard = (users) => {
  return (
    <>{users.map(user => (
      <div className="score-card" key={user.id}>
        <h3>{user.name}</h3>
        <p>Score: {user.score}</p>
      </div>
    ))}
    </>
  )
}

export default ScoreCard