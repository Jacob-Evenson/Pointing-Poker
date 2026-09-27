import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PointingPokerHomePage from '../src/PointingPokerHomePage.jsx'

describe('PointingPokerHomePage', () => {
  it('renders the current session join and create controls', () => {
    render(<PointingPokerHomePage />)

    expect(screen.getByRole('textbox', { name: 'Join Session' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Join Session' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Session' })).toBeInTheDocument()
  })
})