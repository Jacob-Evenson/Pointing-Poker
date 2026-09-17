import React from 'react';

const PointCard = ({ point, onSelect }) => {
  return (
    <button
      type="button"
      className="point-card"
      onClick={() => onSelect(point)}
    >
      <h3>{point.title}</h3>
      <p>{point.description}</p>
      <span>{point.value} points</span>
    </button>
  );
};

export default PointCard;

