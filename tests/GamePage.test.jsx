import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GamePage from '../src/GamePage.jsx'
import { createFakeFetch } from './fakeFetch.js'

let roomCode
let myId
let otherId

// Creates a real room on the API with two players and renders the game page as "Sam".
const renderGamePage = async () => {
  const fakeFetch = createFakeFetch()
  global.fetch = fakeFetch

  roomCode = (await (await fakeFetch('/api/rooms', { method: 'POST' })).json()).roomCode
  const addPlayer = async (name) => (await (await fakeFetch(`/api/rooms/${roomCode}/players`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })).json()).player.id
  myId = await addPlayer('Sam')
  otherId = await addPlayer('Riley')
  sessionStorage.setItem(`playerId:${roomCode}`, myId)

  render(
    <MemoryRouter initialEntries={[`/room/${roomCode}`]}>
      <Routes>
        <Route path="/room/:roomCode" element={<GamePage />} />
        <Route path="/room/:roomCode/join" element={<p>Join page</p>} />
      </Routes>
    </MemoryRouter>
  )
  await screen.findByText('Estimate the work together')
}

const vote = async (value) => {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${value} `) }))
  await screen.findByText(/You selected/)
}

describe('GamePage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('renders the three game regions in order', async () => {
    await renderGamePage()

    const sections = screen.getByRole('main').querySelectorAll(':scope > section')

    expect(sections).toHaveLength(3)
    expect(sections[0]).toHaveAccessibleName('Top third: story and session')
    expect(sections[1]).toHaveAccessibleName('Choose a point card')
    expect(sections[2]).toHaveAccessibleName('Team results')
  })

  it('shows the room code from the URL and the real players from the server', async () => {
    await renderGamePage()

    expect(screen.getByText(roomCode)).toBeInTheDocument()
    expect(screen.getByText('Sam')).toBeInTheDocument()
    expect(screen.getByText('Riley')).toBeInTheDocument()
    expect(screen.queryByText('Alex')).not.toBeInTheDocument()
    expect(screen.getByText('Players').closest('div')).toHaveTextContent('2')
    expect(screen.getAllByText('Not yet Voted')).toHaveLength(2)
  })

  it('sends users without a player in the room to the join page', async () => {
    const fakeFetch = createFakeFetch()
    global.fetch = fakeFetch
    const { roomCode: code } = await (await fakeFetch('/api/rooms', { method: 'POST' })).json()

    render(
      <MemoryRouter initialEntries={[`/room/${code}`]}>
        <Routes>
          <Route path="/room/:roomCode" element={<GamePage />} />
          <Route path="/room/:roomCode/join" element={<p>Join page</p>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Join page')).toBeInTheDocument()
  })

  it('shows an error for a room that does not exist', async () => {
    global.fetch = createFakeFetch()

    render(
      <MemoryRouter initialEntries={['/room/NOPE-1']}>
        <Routes>
          <Route path="/room/:roomCode" element={<GamePage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't find a session with that code.")
  })

  it('keeps votes hidden until revealed, then shows statistics', async () => {
    await renderGamePage()

    await vote(5)
    expect(screen.getByText('You selected 5 points.')).toBeInTheDocument()
    expect(screen.getByText('Voted', { selector: '.participant-vote' })).toBeInTheDocument()
    expect(screen.queryByText('Low: 5')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('switch', { name: 'Show votes and statistics' }))

    expect(await screen.findByText('Low: 5')).toBeInTheDocument()
    expect(screen.getByText('5', { selector: '.participant-vote' })).toBeInTheDocument()
    expect(screen.getByText('Not yet Voted')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('switch', { name: 'Hide votes and statistics' }))

    await screen.findByText('Votes stay private until you reveal them.')
    expect(screen.queryByText('Low: 5')).not.toBeInTheDocument()
  })

  it('supports the ? card', async () => {
    await renderGamePage()

    fireEvent.click(screen.getByRole('button', { name: /^\? / }))

    expect(await screen.findByText('You selected Needs more information.')).toBeInTheDocument()
  })

  it('resets votes and hides them again', async () => {
    await renderGamePage()

    await vote(8)
    fireEvent.click(screen.getByRole('switch', { name: 'Show votes and statistics' }))
    await screen.findByText('Low: 8')

    fireEvent.click(screen.getByRole('button', { name: 'Reset Votes' }))

    expect(await screen.findByRole('switch', { name: 'Show votes and statistics' })).not.toBeChecked()
    expect(screen.getAllByText('Not yet Voted')).toHaveLength(2)
    expect(screen.queryByText('You selected 8 points.')).not.toBeInTheDocument()
  })

  it('saves story edits on the server and keeps them when moving between stories', async () => {
    await renderGamePage()

    fireEvent.change(screen.getByLabelText('Story Title'), { target: { value: 'Login' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next Story' }))

    expect(await screen.findByText('Story 2 of 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Story Title')).toHaveValue('')

    fireEvent.click(screen.getByRole('button', { name: 'Previous Story' }))

    expect(await screen.findByText('Story 1 of 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Story Title')).toHaveValue('Login')
  })

  it('preserves the branded header and footer content', async () => {
    await renderGamePage()

    expect(screen.getByRole('banner')).toHaveTextContent('Pointing Poker')
    expect(screen.getByRole('link', { name: 'Pointing Poker home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Pointing Poker Built by Jacobs minions IT project management team')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Jacobs Minions. All rights reserved.')
  })

  it('shows player and timer information without a round counter', async () => {
    await renderGamePage()

    expect(screen.getByText('Players')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.queryByText('Round', { exact: true })).not.toBeInTheDocument()
  })

  it('copies the session code when the copy button is pressed', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    await renderGamePage()

    fireEvent.click(screen.getByRole('button', { name: 'Copy session code' }))

    expect(writeText).toHaveBeenCalledWith(roomCode)
    expect(await screen.findByRole('button', { name: 'Session code copied' })).toHaveTextContent('Copied')
  })

  it('restores votes, reveal state and the selected card when returning to a story', async () => {
    await renderGamePage()

    await vote(5)
    fireEvent.click(screen.getByRole('switch', { name: 'Show votes and statistics' }))
    await screen.findByText('Low: 5')

    fireEvent.click(screen.getByRole('button', { name: 'Next Story' }))
    await screen.findByText('Story 2 of 2')
    expect(screen.getAllByText('Not yet Voted')).toHaveLength(2)
    expect(screen.queryByText('You selected 5 points.')).not.toBeInTheDocument()
    expect(screen.queryByText('Low: 5')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Previous Story' }))

    expect(await screen.findByText('Low: 5')).toBeInTheDocument()
    expect(screen.getByText('You selected 5 points.')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Hide votes and statistics' })).toBeChecked()
  })

  it('shows story title and description errors, keeps them off the server, and blocks navigation', async () => {
    await renderGamePage()

    fireEvent.change(screen.getByLabelText('Story Title'), { target: { value: 'a'.repeat(101) } })
    fireEvent.change(screen.getByLabelText('Story Description'), { target: { value: 'b'.repeat(2001) } })

    expect(screen.getByText('Story title must be 100 characters or fewer.')).toBeInTheDocument()
    expect(screen.getByText('Story description must be 2000 characters or fewer.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next Story' }))
    expect(screen.getByText('Story 1 of 1')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Story Title'), { target: { value: 'Short title' } })
    fireEvent.change(screen.getByLabelText('Story Description'), { target: { value: '' } })

    expect(screen.queryByText('Story title must be 100 characters or fewer.')).not.toBeInTheDocument()
    expect(screen.queryByText('Story description must be 2000 characters or fewer.')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next Story' }))
    expect(await screen.findByText('Story 2 of 2')).toBeInTheDocument()
  })

  it('allows blank story titles and descriptions', async () => {
    await renderGamePage()

    fireEvent.change(screen.getByLabelText('Story Title'), { target: { value: '' } })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('limits the story title to 100 characters and the description to 2000', async () => {
    await renderGamePage()

    expect(screen.getByLabelText('Story Title')).toHaveAttribute('maxlength', '100')
    expect(screen.getByLabelText('Story Description')).toHaveAttribute('maxlength', '2000')
  })
})