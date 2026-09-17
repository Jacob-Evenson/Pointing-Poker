import React from "react";
import "./PointingPokerRounds.css";

// Displays a single story card.
// Vote-related fields are placeholders until the real voting system is built.
const StoryCard = ({ story }) => {
  return (
    <div className="story-card">
      <h3 className="story-card-title">{story.title}</h3>
      <p className="story-card-description">{story.description}</p>

      <div className="story-card-meta">
        <span>Round: {story.roundNumber}</span>
        <span>Status: {story.status}</span>
      </div>

      {/* TODO: Vote results will come from the voting system later */}
      <div className="story-card-votes">
        <p>Vote Result: {story.voteResult ?? "Not voted yet"}</p>
        <p>Average Vote: {story.averageVote ?? "N/A"}</p>
        <p>Final Estimate: {story.finalEstimate ?? "N/A"}</p>
        <p>Voting Complete: {story.isVotingComplete ? "Yes" : "No"}</p>
      </div>

      {/* TODO: This is where vote controls (cards, buttons, etc.) will be added */}
      <div className="story-card-vote-placeholder">
        [ Voting controls will go here ]
      </div>
    </div>
  );
};

export default StoryCard;
