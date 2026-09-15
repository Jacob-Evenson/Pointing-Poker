import React from "react";
import StoryCard from "./StoryCard";

// Renders the full list of story cards passed down from the parent component.
const StoryCardList = ({ stories }) => {
  return (
    <div className="story-card-list">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
};

export default StoryCardList;
