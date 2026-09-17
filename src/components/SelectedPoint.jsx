import React from 'react'

const SelectedPoint = ({ point, voted }) => {
  const selectedValue = point?.value

  return (
    <div className="selected-point" aria-live="polite">
      <h2>Your estimate</h2>
      <p>{voted && point ? `You selected ${selectedValue} points.` : 'Choose a card to submit your estimate.'}</p>
    </div>
  )
}

export default SelectedPoint
