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
        initialEntries={[{ pathname: '/IntermediaryPage', state: { roomCode: 'JACOBS-26' } }]}
      >
        <Routes>
          <Route path="/IntermediaryPage" element={<IntermediaryPage />} />
          <Route path="/GamePage" element={<SessionDestination />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('JACOBS-26')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Sam')
    await user.click(screen.getByRole('button', { name: /join session/i }))

    expect(screen.getByText('Joined with Sam in JACOBS-26')).toBeInTheDocument()
  })

  it('rejects a room URL with a code outside the demo session', () => {
    render(
      <MemoryRouter initialEntries={['/room/TEAM-42/join']}>
        <Routes>
          <Route path="/room/:roomCode/join" element={<IntermediaryPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Session not found' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('TEAM-42')
  })
})
