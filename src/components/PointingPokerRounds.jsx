import React, { useState } from "react";
import StoryCardList from "./StoryCardList";
import RoundControls from "./RoundControls";
import initialStories from "./mockStoryData";
import "./PointingPokerRounds.css";

const TOTAL_ROUNDS = 3;

// Main Story Card / Round Management feature.
// Import this component into the larger app with:
//   import PointingPokerRounds from "./components/PointingPokerRounds";
const PointingPokerRounds = () => {
  const [stories, setStories] = useState(initialStories);
  const [currentRound, setCurrentRound] = useState(1);

  // Tracks whether each round has been marked complete.
  const [roundCompletion, setRoundCompletion] = useState({
    1: false,
    2: false,
    3: false,
  });

  const isCurrentRoundComplete = roundCompletion[currentRound];
  const allRoundsComplete =
    roundCompletion[1] && roundCompletion[2] && roundCompletion[3];

  // TODO: Replace this with the real voting system.
  // For now this just flips a flag so the "Next Round" button can be tested.
  const handleMarkRoundComplete = () => {
    setRoundCompletion((prev) => ({
      ...prev,
      [currentRound]: true,
    }));

    setStories((prevStories) =>
      prevStories.map((story) =>
        story.roundNumber === currentRound
          ? { ...story, status: "Voting Complete", isVotingComplete: true }
          : story
      )
    );
  };

  const handleNextRound = () => {
    if (!isCurrentRoundComplete) return;
    if (currentRound >= TOTAL_ROUNDS) return;

    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    setStories((prevStories) =>
      prevStories.map((story) => ({
        ...story,
        roundNumber: nextRound,
        status: "Not Started",
      }))
    );
  };

  // Resets story cards and round state back to their initial values.
  const resetStoryCards = () => {
    setStories(initialStories);
    setCurrentRound(1);
    setRoundCompletion({ 1: false, 2: false, 3: false });
  };

  return (
    <div className="pointing-poker-rounds">
      <h1>Pointing Poker - Story Cards</h1>

      <RoundControls
        currentRound={currentRound}
        totalRounds={TOTAL_ROUNDS}
        isCurrentRoundComplete={isCurrentRoundComplete}
        allRoundsComplete={allRoundsComplete}
        onMarkRoundComplete={handleMarkRoundComplete}
        onNextRound={handleNextRound}
        onReset={resetStoryCards}
      />

      <StoryCardList stories={stories} />
    </div>
  );
};

export default PointingPokerRounds;
