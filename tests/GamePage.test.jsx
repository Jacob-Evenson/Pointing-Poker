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

  it('keeps point voting and vote statistics connected', () => {
    render(<GamePage />)

    expect(screen.getByText('Low: 5')).toBeInTheDocument()
    expect(screen.getByText('Average: 6.5')).toBeInTheDocument()
    expect(screen.getByText('High: 8')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /5 Moderate task 5 points/ }))

    expect(screen.getByText('You selected 5 points.')).toBeInTheDocument()
    expect(screen.getByText('All votes are revealed.')).toBeInTheDocument()
  })

  it('preserves the branded header and footer content', () => {
    render(<GamePage />)

    expect(screen.getByRole('banner')).toHaveTextContent('Pointing Poker')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Pointing Poker Built by Jacobs minions IT project management team')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Jacobs Minions. All rights reserved.')
  })
})
