import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GamePage from '../src/GamePage.jsx'

describe('GamePage layout', () => {
  it('renders the three game regions in order', () => {
    render(<GamePage />)

    const main = screen.getByRole('main')
    const sections = main.querySelectorAll(':scope > section')

    expect(sections).toHaveLength(3)
    expect(sections[0]).toHaveAccessibleName('Top third: story and session')
    expect(sections[1]).toHaveAccessibleName('Choose a point card')
    expect(sections[2]).toHaveAccessibleName('Team results')
  })

  it('can reveal partial votes and statistics before everyone has voted', () => {
    render(<GamePage />)

    const voteSwitch = screen.getByRole('switch', { name: 'Show votes and statistics' })
    expect(voteSwitch).toBeEnabled()
    expect(screen.queryByText('Low: 5')).not.toBeInTheDocument()
    expect(screen.getAllByText('Voted', { selector: '.participant-vote' })).toHaveLength(2)
    expect(screen.getByText('Not yet Voted')).toBeInTheDocument()
    expect(screen.getByText('Votes stay private until you reveal them.')).toBeInTheDocument()

    fireEvent.click(voteSwitch)

    expect(screen.getByText('Votes are revealed for players who have voted.')).toBeInTheDocument()
    expect(screen.getByText('Low: 5')).toBeInTheDocument()
    expect(screen.getByText('Average: 6.5')).toBeInTheDocument()
    expect(screen.getByText('High: 8')).toBeInTheDocument()
    expect(screen.getByText('5', { selector: '.participant-vote' })).toBeInTheDocument()
    expect(screen.getByText('8', { selector: '.participant-vote' })).toBeInTheDocument()
    expect(screen.getByText('Not yet Voted')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('switch', { name: 'Hide votes and statistics' }))

    expect(screen.queryByText('Low: 5')).not.toBeInTheDocument()
    expect(screen.getAllByText('Voted', { selector: '.participant-vote' })).toHaveLength(2)
    expect(screen.getByText('Not yet Voted')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /5 Moderate task 5 points/ }))

    expect(screen.getByText('You selected 5 points.')).toBeInTheDocument()
    expect(screen.getByText('Everyone has voted. Votes are ready to reveal.')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Show votes and statistics' })).toBeEnabled()
    expect(screen.getAllByText('Voted', { selector: '.participant-vote' })).toHaveLength(3)
  })

  it('preserves the branded header and footer content', () => {
    render(<GamePage />)

    expect(screen.getByRole('banner')).toHaveTextContent('Pointing Poker')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Pointing Poker Built by Jacobs minions IT project management team')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Jacobs Minions. All rights reserved.')
  })
})
