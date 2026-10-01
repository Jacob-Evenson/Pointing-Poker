import React, { useState } from "react";
import StoryCard from "./StoryCard";
import "./PointingPokerRounds.css";

const initialStories = [
  {
    title: "",
    description: "",
  },
];

const PointingPokerRounds = ({ onStoryChange }) => {
  const [stories, setStories] = useState(initialStories);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const updateCurrentStory = (field, value) => {
    setStories((previousStories) =>
      previousStories.map((story, index) =>
        index === currentStoryIndex ? { ...story, [field]: value } : story
      )
    );
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      onStoryChange?.(currentStoryIndex, currentStoryIndex - 1);
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      onStoryChange?.(currentStoryIndex, currentStoryIndex + 1);
      setCurrentStoryIndex(currentStoryIndex + 1);
      return;
    }

    onStoryChange?.(currentStoryIndex, currentStoryIndex + 1);
    setStories((previousStories) => [
      ...previousStories,
      { title: "", description: "" },
    ]);
    setCurrentStoryIndex(currentStoryIndex + 1);
  };

  const currentStory = stories[currentStoryIndex];

  return (
    <div className="pointing-poker-rounds">
      <div className="story-navigation">
        <button onClick={handlePreviousStory} disabled={currentStoryIndex === 0}>
          Previous Story
        </button>
        <span>Story {currentStoryIndex + 1} of {stories.length}</span>
        <button onClick={handleNextStory}>Next Story</button>
      </div>

      <StoryCard
        story={currentStory}
        onTitleChange={(value) => updateCurrentStory("title", value)}
        onDescriptionChange={(value) => updateCurrentStory("description", value)}
      />
    </div>
  );
};

export default PointingPokerRounds;
