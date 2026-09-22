import React from 'react'

const SelectedPoint = ({ point, voted }) => {
  const selectedValue = point?.value
  const selectedMessage = selectedValue === '?'
    ? 'You selected Needs more information.'
    : `You selected ${selectedValue} points.`

  return (
    <div className="selected-point" aria-live="polite">
      <h2>Your estimate</h2>
      <p>{voted && point ? selectedMessage : 'Choose a card to submit your estimate.'}</p>
    </div>
  )
}

export default SelectedPoint
