import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ParticipantList from '../src/components/ParticipantList.jsx'

describe('ParticipantList', () => {
  it('keeps participants beyond the first eight available in the roster', () => {
    const participants = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: `Player ${index + 1}`,
      bid: null,
      voted: false,
    }))

    const { container } = render(
      <ParticipantList
        participants={participants}
        allVoted={false}
        revealed={false}
        anonymousReveal={false}
        onAnonymousReveal={() => { }}
      />,
    )

    const roster = container.querySelector('.participant-list')

    expect(roster.children).toHaveLength(10)
    expect(screen.getByText('Player 9')).toBeInTheDocument()
    expect(screen.getByText('Player 10')).toBeInTheDocument()
  })
})