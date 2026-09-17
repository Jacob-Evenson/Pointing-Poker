import React from 'react';

const PointCard = ({ point, onSelect }) => {
  const pointLabel = point.value === '?' ? 'Needs more information' : `${point.value} points`;

  return (
    <button
      type="button"
      className="point-card"
      onClick={() => onSelect(point)}
    >
      <h3>{point.title}</h3>
      <p>{point.description}</p>
      <span>{pointLabel}</span>
    </button>
  );
};

export default PointCard;
