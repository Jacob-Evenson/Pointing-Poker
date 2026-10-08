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

    it('checks the entered session code and navigates to the room join page', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ roomCode: '042731', players: [] }),
        })

        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.type(screen.getByLabelText('Session code'), '042731')
        await userEvent.click(screen.getByRole('button', { name: /join session/i }))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/rooms/042731', { method: 'GET' })
            expect(mockNavigate).toHaveBeenCalledWith('/room/042731/join')
        })
    })

    it('shows the server error and stays on the homepage when the session does not exist', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Room not found' }),
        })

        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.type(screen.getByLabelText('Session code'), '999999')
        await userEvent.click(screen.getByRole('button', { name: /join session/i }))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent("We couldn't find a session with that code.")
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
        await userEvent.type(screen.getByLabelText('Session code'), '042731')
        await userEvent.click(screen.getByRole('button', { name: /join session/i }))

        expect(screen.getByRole('button', { name: /checking/i })).toBeDisabled()

        resolveFetch({ ok: true, json: async () => ({ roomCode: '042731' }) })
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/room/042731/join')
        })
    })

    it.each([
        ['', 'Please enter a session code.'],
        ['   ', 'Please enter a session code.'],
        ['123', 'Session codes must be exactly 6 digits.'],
        ['12345a', 'Session codes can only contain numbers.'],
        ['JACOBS-26', 'Session codes can only contain numbers.'],
    ])('rejects the session code "%s" without contacting the server', async (code, message) => {
        renderWithRouter(<PointingPokerHomePage />)
        if (code) {
            await userEvent.type(screen.getByLabelText('Session code'), code)
        }
        await userEvent.click(screen.getByRole('button', { name: /join session/i }))

        expect(screen.getByRole('alert')).toHaveTextContent(message)
        expect(global.fetch).not.toHaveBeenCalled()
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('clears the session code error when the user edits the code', async () => {
        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.click(screen.getByRole('button', { name: /join session/i }))
        expect(screen.getByRole('alert')).toBeInTheDocument()

        await userEvent.type(screen.getByLabelText('Session code'), '1')

        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not let the user type more than 6 characters in the session code', async () => {
        renderWithRouter(<PointingPokerHomePage />)
        const input = screen.getByLabelText('Session code')

        await userEvent.type(input, '12345678')

        expect(input).toHaveValue('123456')
    })
})