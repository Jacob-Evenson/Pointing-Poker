import React from "react";

// Buttons for controlling the round flow and resetting the story cards.
// All logic lives in the parent (PointingPokerRounds) and is passed down as props.
const RoundControls = ({
  currentRound,
  totalRounds,
  isCurrentRoundComplete,
  allRoundsComplete,
  onMarkRoundComplete,
  onNextRound,
  onReset,
}) => {
  return (
    <div className="round-controls">
      <h2>Round {currentRound} of {totalRounds}</h2>

      {allRoundsComplete ? (
        <p className="round-status">All rounds are complete!</p>
      ) : (
        <p className="round-status">
          {isCurrentRoundComplete
            ? "This round is complete. You can move to the next round."
            : "This round is still in progress."}
        </p>
      )}

      {/* TODO: Replace this with the real voting system */}
      {!allRoundsComplete && !isCurrentRoundComplete && (
        <button onClick={onMarkRoundComplete}>
          Mark Round as Complete (placeholder)
        </button>
      )}

      {!allRoundsComplete && (
        <button onClick={onNextRound} disabled={!isCurrentRoundComplete}>
          Next Round
        </button>
      )}

      <button onClick={onReset}>Reset Story Cards</button>
    </div>
  );
};

export default RoundControls;
