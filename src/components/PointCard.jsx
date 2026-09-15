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
