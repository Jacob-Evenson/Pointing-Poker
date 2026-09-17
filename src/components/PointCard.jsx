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

/*
.point-card {
  display: block;
  width: 100%;
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  border: 1px solid #ccc;
  background: white;
}

.point-card:hover,
.point-card:focus-visible {
  border-color: #333;
}

const points = [
  { value: 0, title: '0', description: 'No effort' },
  { value: 1, title: '1', description: 'Tiny task' },
  { value: 2, title: '2', description: 'Very small task' },
  { value: 3, title: '3', description: 'Small task' },
  { value: 5, title: '5', description: 'Moderate task' },
  { value: 8, title: '8', description: 'Large task' },
  { value: 13, title: '13', description: 'Very large task' },
  { value: '?', title: '?', description: 'Need more information' }
];

<section className="point-card-grid" aria-label="Choose an estimate">
  {points.map((point) => (
    <PointCard
            key={point.value}
            point={point}
            onSelect={setSelectedPoint}
    />
    ))}
</section>
*/
