import React, { useMemo } from 'react'
import './Confetti.css'

const CONFETTI_COLORS = ['#3f5b44', '#6b8f71', '#d7e4d2', '#6b4a28', '#e6aa52', '#e97862']
const CONFETTI_COUNT = 100

const createConfettiPieces = () => Array.from({ length: CONFETTI_COUNT }, (_, index) => ({
  id: index,
  color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  x: `${(Math.random() - 0.5) * 120}vw`,
  y: `${(Math.random() - 0.5) * 120}vh`,
  spin: `${Math.random() * 1440 - 720}deg`,
  width: `${6 + Math.random() * 7}px`,
  height: `${8 + Math.random() * 10}px`,
  radius: Math.random() > 0.5 ? '50%' : '1px',
}))

const Confetti = ({ run, onComplete }) => {
  const pieces = useMemo(() => (
    run === 0 ? [] : createConfettiPieces()
  ), [run])

  if (pieces.length === 0) {
    return null
  }

  return (
    <div className="confetti-overlay" aria-hidden="true" data-testid="confetti-overlay">
      {pieces.map((piece) => (
        <span
          className="confetti-piece"
          key={`${run}-${piece.id}`}
          onAnimationEnd={piece.id === CONFETTI_COUNT - 1 ? onComplete : undefined}
          style={{
            '--confetti-color': piece.color,
            '--confetti-x': piece.x,
            '--confetti-y': piece.y,
            '--confetti-spin': piece.spin,
            '--confetti-width': piece.width,
            '--confetti-height': piece.height,
            '--confetti-radius': piece.radius,
          }}
        />
      ))}
    </div>
  )
}

export default Confetti
