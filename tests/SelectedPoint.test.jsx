import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SelectedPoint from '../src/components/SelectedPoint.jsx'

describe('SelectedPoint', () => {
  it('asks the user to choose a card before voting', () => {
    render(<SelectedPoint point={null} voted={false} />)

    expect(screen.getByText('Choose a card to submit your estimate.')).toBeInTheDocument()
  })

  it('displays a numeric selected point', () => {
    render(<SelectedPoint point={{ value: 5 }} voted />)

    expect(screen.getByText('You selected 5 points.')).toBeInTheDocument()
  })

  it('displays a question-mark selected point', () => {
    render(<SelectedPoint point={{ value: '?' }} voted />)

    expect(screen.getByText('You selected Needs more information.')).toBeInTheDocument()
  })

  it('does not crash when a vote has no selected point', () => {
    render(<SelectedPoint point={null} voted />)

    expect(screen.getByText('Choose a card to submit your estimate.')).toBeInTheDocument()
  })
})