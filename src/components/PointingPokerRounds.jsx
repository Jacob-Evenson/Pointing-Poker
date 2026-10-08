import React from "react";
import StoryCard from "./StoryCard";
import "./PointingPokerRounds.css";

// Shows one story at a time. The stories themselves are owned by the server room.
const PointingPokerRounds = ({
  stories,
  currentStoryIndex,
  titleError,
  descriptionError,
  onTitleChange,
  onDescriptionChange,
  onPreviousStory,
  onNextStory,
}) => {
  const currentStory = stories[currentStoryIndex];

  return (
    <div className="pointing-poker-rounds">
      <div className="story-navigation">
        <button onClick={onPreviousStory} disabled={currentStoryIndex === 0}>
          Previous Story
        </button>
        <span>Story {currentStoryIndex + 1} of {stories.length}</span>
        <button onClick={onNextStory}>Next Story</button>
      </div>

      <StoryCard
        story={currentStory}
        titleError={titleError}
        descriptionError={descriptionError}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
      />
    </div>
  );
};

export default PointingPokerRounds;