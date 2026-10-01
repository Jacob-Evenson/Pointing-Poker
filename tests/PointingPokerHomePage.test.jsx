import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
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
        mockNavigate.mockClear()
    })

    it('renders the hero section and both session cards', () => {
        renderWithRouter(<PointingPokerHomePage />)

        expect(screen.getByRole('heading', { name: 'Pointing Poker' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Create a Session' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Join a Session' })).toBeInTheDocument()
    })

    it('opens username entry in the hardcoded demo session when Create Session is clicked', async () => {
        renderWithRouter(<PointingPokerHomePage />)
        await userEvent.click(screen.getByRole('button', { name: /create session/i }))

        expect(mockNavigate).toHaveBeenCalledWith('/IntermediaryPage', {
            state: { roomCode: 'JACOBS-26' },
        })
    })

    it('opens username entry when the valid demo code is submitted', async () => {
        const user = userEvent.setup()
        renderWithRouter(<PointingPokerHomePage />)
        await user.type(screen.getByRole('textbox', { name: 'Session code' }), ' jacobs-26 ')
        await user.click(screen.getByRole('button', { name: /join session/i }))

        expect(mockNavigate).toHaveBeenCalledWith('/IntermediaryPage', {
            state: { roomCode: 'JACOBS-26' },
        })
    })

    it('rejects codes other than the demo session code', async () => {
        const user = userEvent.setup()
        renderWithRouter(<PointingPokerHomePage />)
        await user.type(screen.getByRole('textbox', { name: 'Session code' }), 'TEAM-42')
        await user.click(screen.getByRole('button', { name: /join session/i }))

        expect(screen.getByRole('alert')).toHaveTextContent('Session not found')
        expect(mockNavigate).not.toHaveBeenCalled()
    })
})