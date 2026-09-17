import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PointingPokerHomePage from '../PointingPokerHomePage.jsx'

describe('PointingPokerHomePage voting', () => {
  it('renders all point cards and starts without a vote', () => {
    render(<PointingPokerHomePage />)

    expect(screen.getByRole('region', { name: 'Choose your estimate' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(8)
    expect(screen.getByText('Choose a card to submit your estimate.')).toBeInTheDocument()
  })

  it('stores the selected value and marks the user as voted', () => {
    render(<PointingPokerHomePage />)

    fireEvent.click(screen.getByRole('button', { name: /5 Moderate task 5 points/ }))

    expect(screen.getByText('You selected 5 points.')).toBeInTheDocument()
    expect(screen.queryByText('Choose a card to submit your estimate.')).not.toBeInTheDocument()
  })

  it('stores zero as a valid bid', () => {
    render(<PointingPokerHomePage />)

    fireEvent.click(screen.getByRole('button', { name: /0 No effort 0 points/ }))

    expect(screen.getByText('You selected 0 points.')).toBeInTheDocument()
  })

  it('replaces the previous bid while keeping all cards available', () => {
    render(<PointingPokerHomePage />)

    fireEvent.click(screen.getByRole('button', { name: /3 Small task 3 points/ }))
    fireEvent.click(screen.getByRole('button', { name: /8 Large task 8 points/ }))

    expect(screen.getByText('You selected 8 points.')).toBeInTheDocument()
    expect(screen.queryByText('You selected 3 points.')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(8)
  })

  it('supports the question-mark estimate', () => {
    render(<PointingPokerHomePage />)

    fireEvent.click(screen.getByRole('button', { name: /\? Need more information \? points/ }))

    expect(screen.getByText('You selected ? points.')).toBeInTheDocument()
  })
})
