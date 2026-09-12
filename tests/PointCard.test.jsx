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
})