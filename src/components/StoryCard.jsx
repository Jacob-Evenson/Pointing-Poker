import React from "react";
import "./PointingPokerRounds.css";

const StoryCard = ({ story, onTitleChange, onDescriptionChange }) => {
  return (
    <div className="story-card">
      <label htmlFor="story-title">Story Title</label>
      <input
        id="story-title"
        type="text"
        value={story.title}
        onChange={(event) => onTitleChange(event.target.value)}
      />

      <label htmlFor="story-description">Story Description</label>
      <textarea
        id="story-description"
        value={story.description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        rows="6"
      />
    </div>
  );
};

export default StoryCard;
