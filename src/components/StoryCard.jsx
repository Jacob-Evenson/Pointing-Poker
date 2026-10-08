import React from "react";
import "./PointingPokerRounds.css";
import { STORY_TITLE_MAX_LENGTH, STORY_DESCRIPTION_MAX_LENGTH } from "../validation.js";

const StoryCard = ({ story, titleError, descriptionError, onTitleChange, onDescriptionChange }) => {
  return (
    <div className="story-card">
      <label htmlFor="story-title">Story Title</label>
      <input
        id="story-title"
        type="text"
        maxLength={STORY_TITLE_MAX_LENGTH}
        value={story.title}
        onChange={(event) => onTitleChange(event.target.value)}
        aria-invalid={Boolean(titleError)}
        aria-describedby={titleError ? "story-title-error" : undefined}
      />
      {titleError && <p id="story-title-error" className="field-error" role="alert">{titleError}</p>}

      <label htmlFor="story-description">Story Description</label>
      <textarea
        id="story-description"
        value={story.description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        rows="2"
        maxLength={STORY_DESCRIPTION_MAX_LENGTH}
        aria-invalid={Boolean(descriptionError)}
        aria-describedby={descriptionError ? "story-description-error" : undefined}
      />
      {descriptionError && <p id="story-description-error" className="field-error" role="alert">{descriptionError}</p>}
    </div>
  );
};

export default StoryCard;