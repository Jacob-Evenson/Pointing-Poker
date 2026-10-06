import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import PointingPokerHomePage from '../src/PointingPokerHomePage.jsx'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

function renderWithRouter(ui) {
    return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('PointingPokerHomePage', () => {
    beforeEach(() => {
        global.fetch = vi.fn()
        mockNavigate.mockClear()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders the hero section and both session cards', () => {
        renderWithRouter(<PointingPokerHomePage />)

        expect(screen.getByRole('heading', { name: 'Pointing Poker' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Create a Session' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Join a Session' })).toBeInTheDocument()
    })

    it('sends a POST request to /api/rooms when Create Session is clicked', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ roomCode: '123456' }),
        })

        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.click(screen.getByRole('button', { name: /create session/i }))

        expect(global.fetch).toHaveBeenCalledWith('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
    })

    it('redirects to /room/:roomCode/join using the code from the server', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ roomCode: '384920' }),
        })

        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.click(screen.getByRole('button', { name: /create session/i }))

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/room/384920/join')
        })
    })

    it('shows a loading state while the request is in progress', async () => {
        let resolveFetch
        global.fetch.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveFetch = resolve
            })
        )

        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.click(screen.getByRole('button', { name: /create session/i }))

        expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()

        resolveFetch({ ok: true, json: async () => ({ roomCode: '111111' }) })
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /create session/i })).toBeEnabled()
        })
    })

    it('shows an error message if the server responds with a failure', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
        })

        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.click(screen.getByRole('button', { name: /create session/i }))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to create room')
        })
    })

    it('shows an error if the server response has no room code', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        })

        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.click(screen.getByRole('button', { name: /create session/i }))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('No room code returned from server')
        })
    })

    it('checks the entered session code and navigates to the intermediary page', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ roomCode: 'TEAM-42', players: [] }),
        })

        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.type(screen.getByLabelText('Session code'), ' TEAM-42 ')
        await userEvent.click(screen.getByRole('button', { name: /join session/i }))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/rooms/TEAM-42', { method: 'GET' })
            expect(mockNavigate).toHaveBeenCalledWith('/IntermediaryPage', {
                state: { roomCode: 'TEAM-42' },
            })
        })
    })

    it('shows the server error and stays on the homepage when the session does not exist', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Room not found' }),
        })

        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.type(screen.getByLabelText('Session code'), 'UNKNOWN-99')
        await userEvent.click(screen.getByRole('button', { name: /join session/i }))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Room not found')
        })
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('shows a pending state while checking whether a session exists', async () => {
        let resolveFetch
        global.fetch.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveFetch = resolve
            })
        )

        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.type(screen.getByLabelText('Session code'), 'TEAM-42')
        await userEvent.click(screen.getByRole('button', { name: /join session/i }))

        expect(screen.getByRole('button', { name: /checking/i })).toBeDisabled()

        resolveFetch({ ok: true, json: async () => ({ roomCode: 'TEAM-42' }) })
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/IntermediaryPage', {
                state: { roomCode: 'TEAM-42' },
            })
        })
    })
})