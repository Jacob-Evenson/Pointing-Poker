import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import IntermediaryPage from '../IntermediaryPage.jsx'

const SessionDestination = () => {
  const location = useLocation()
  return (
    <p>
      Joined with {location.state.username} in {location.state.roomCode}
    </p>
  )
}

describe('IntermediaryPage', () => {
  it('submits the username and session code to the game route', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/IntermediaryPage', state: { roomCode: 'TEAM-42' } }]}
      >
        <Routes>
          <Route path="/IntermediaryPage" element={<IntermediaryPage />} />
          <Route path="/GamePage" element={<SessionDestination />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('TEAM-42')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Sam')
    await user.click(screen.getByRole('button', { name: /join session/i }))

    expect(screen.getByText('Joined with Sam in TEAM-42')).toBeInTheDocument()
  })
})
