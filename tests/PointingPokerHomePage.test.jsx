import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PointingPokerHomePage from '../src/PointingPokerHomePage.jsx'

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

  it('shows session participants and hides votes while someone is waiting', () => {
    render(<PointingPokerHomePage />)

    expect(screen.getByRole('heading', { name: 'People in this session' })).toBeInTheDocument()
    expect(screen.getByText('Player')).toBeInTheDocument()
    expect(screen.getByText('Alex')).toBeInTheDocument()
    expect(screen.getByText('Jordan')).toBeInTheDocument()
    expect(screen.getByText('Votes stay hidden until everyone has voted.')).toBeInTheDocument()
    expect(screen.getAllByText('Hidden')).toHaveLength(3)
    expect(screen.getByText('Waiting')).toBeInTheDocument()
  })

  it('reveals linked votes after every participant has voted', () => {
    render(<PointingPokerHomePage />)

    fireEvent.click(screen.getByRole('button', { name: /5 Moderate task 5 points/ }))

    expect(screen.getByText('All votes are revealed.')).toBeInTheDocument()
    expect(screen.getByText('Alex').closest('li')).toHaveTextContent('5')
    expect(screen.getByText('Jordan').closest('li')).toHaveTextContent('8')
    expect(screen.getByText('Player').closest('li')).toHaveTextContent('5')
    expect(screen.queryByText('Votes stay hidden until everyone has voted.')).not.toBeInTheDocument()
  })

  it('supports anonymous results after all participants have voted', () => {
    render(<PointingPokerHomePage />)

    fireEvent.click(screen.getByRole('button', { name: /5 Moderate task 5 points/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Anonymous reveal' }))

    expect(screen.getByRole('heading', { name: 'Revealed results' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Anonymous revealed votes' })).toHaveTextContent('5')
    expect(screen.getByRole('list', { name: 'Anonymous revealed votes' })).toHaveTextContent('8')
    expect(screen.getByText('Alex').closest('li')).toHaveTextContent('Revealed')
    expect(screen.getByText('Jordan').closest('li')).toHaveTextContent('Revealed')
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

    fireEvent.click(screen.getByRole('button', { name: /\? Need more information Needs more information/ }))

    expect(screen.getByText('You selected Needs more information.')).toBeInTheDocument()
  })
})
