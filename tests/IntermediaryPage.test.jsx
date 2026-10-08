import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import IntermediaryPage from '../IntermediaryPage.jsx'
import { createFakeFetch } from './fakeFetch.js'

const GameDestination = () => {
  const { roomCode } = useParams()
  return <p>Game for {roomCode}</p>
}

const renderJoinPage = (roomCode) => render(
  <MemoryRouter initialEntries={[`/room/${roomCode}/join`]}>
    <Routes>
      <Route path="/room/:roomCode/join" element={<IntermediaryPage />} />
      <Route path="/room/:roomCode" element={<GameDestination />} />
    </Routes>
  </MemoryRouter>
)

describe('IntermediaryPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    global.fetch = createFakeFetch()
  })

  it('adds the player to the room, remembers their id, and opens the game route', async () => {
    const user = userEvent.setup()
    renderJoinPage('TEAM-42')

    expect(screen.getByText('TEAM-42')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Sam')
    await user.click(screen.getByRole('button', { name: /join session/i }))

    expect(await screen.findByText('Game for TEAM-42')).toBeInTheDocument()
    expect(sessionStorage.getItem('playerId:TEAM-42')).toBeTruthy()

    const room = await (await global.fetch('/api/rooms/TEAM-42')).json()
    expect(room.players.map((player) => player.name)).toContain('Sam')
  })

  it('shows the server error when the room does not exist', async () => {
    const user = userEvent.setup()
    renderJoinPage('999999')

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Sam')
    await user.click(screen.getByRole('button', { name: /join session/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't find a session with that code.")
  })

  it('validates the username before sending anything to the server', async () => {
    const user = userEvent.setup()
    renderJoinPage('TEAM-42')
    const input = screen.getByRole('textbox', { name: 'Your name' })
    const submit = screen.getByRole('button', { name: /join session/i })

    await user.type(input, '   ')
    await user.click(submit)
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a username.')

    await user.type(input, 'b')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a message when the username is already used in the room', async () => {
    const user = userEvent.setup()
    await global.fetch('/api/rooms/TEAM-42/players', { method: 'POST', body: JSON.stringify({ name: 'Taken' }) })
    renderJoinPage('TEAM-42')

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'taken')
    await user.click(screen.getByRole('button', { name: /join session/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('That username is already being used in this session.')
  })

  it('does not let the user type more than 20 characters in the username', async () => {
    const user = userEvent.setup()
    renderJoinPage('TEAM-42')
    const input = screen.getByRole('textbox', { name: 'Your name' })

    await user.type(input, 'a'.repeat(25))

    expect(input).toHaveValue('a'.repeat(20))
  })
})