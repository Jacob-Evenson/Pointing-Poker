import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PointCard from '../src/components/PointCard'

describe('PointCard', () => {
  const point = {
    value: 5,
    title: '5',
    description: 'Moderate task'
  }

  it('renders the point information', () => {
    render(<PointCard point={point} onSelect={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '5' })).toBeInTheDocument()
    expect(screen.getByText('Moderate task')).toBeInTheDocument()
    expect(screen.getByText('5 points')).toBeInTheDocument()
  })

  it('calls onSelect with the point when clicked', async () => {
    const onSelect = vi.fn()

    render(<PointCard point={point} onSelect={onSelect} />)

    await screen.getByRole('button').click()

    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith(point)
  })

  it('renders and selects a zero-point card', async () => {
    const zeroPoint = { value: 0, title: '0', description: 'No effort' }
    const onSelect = vi.fn()

    render(<PointCard point={zeroPoint} onSelect={onSelect} />)

    expect(screen.getByRole('heading', { name: '0' })).toBeInTheDocument()
    expect(screen.getByText('0 points')).toBeInTheDocument()

    await screen.getByRole('button').click()

    expect(onSelect).toHaveBeenCalledWith(zeroPoint)
  })

  it('uses a non-numeric label for question-mark cards', () => {
    const unknownPoint = { value: '?', title: '?', description: 'Need more information' }

    render(<PointCard point={unknownPoint} onSelect={vi.fn()} />)

    expect(screen.getByText('Needs more information')).toBeInTheDocument()
    expect(screen.queryByText('? points')).not.toBeInTheDocument()
  })
})