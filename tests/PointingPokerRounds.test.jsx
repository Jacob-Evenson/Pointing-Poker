import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PointingPokerRounds from '../src/components/PointingPokerRounds';

// Small stand-in for GamePage/server: owns the stories and passes them down.
const Harness = () => {
  const [stories, setStories] = useState([{ title: "", description: "" }]);
  const [index, setIndex] = useState(0);

  const edit = (field, value) => setStories((all) => all.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  const next = () => {
    if (index === stories.length - 1) {
      setStories((all) => [...all, { title: "", description: "" }]);
    }
    setIndex(index + 1);
  };

  return (
    <PointingPokerRounds
      stories={stories}
      currentStoryIndex={index}
      onTitleChange={(value) => edit("title", value)}
      onDescriptionChange={(value) => edit("description", value)}
      onPreviousStory={() => setIndex(index - 1)}
      onNextStory={next}
    />
  );
};

describe("PointingPokerRounds", () => {
  it("shows one story with editable title and description fields", () => {
    render(<Harness />);

    expect(screen.getByText("Story 1 of 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Story Title")).toHaveValue("");
    expect(screen.getByLabelText("Story Description")).toHaveValue("");
  });

  it("updates the current story while the user types", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Story Title"), "Updated Login");
    await user.type(screen.getByLabelText("Story Description"), "Updated story description.");

    expect(screen.getByLabelText("Story Title")).toHaveValue("Updated Login");
    expect(screen.getByLabelText("Story Description")).toHaveValue("Updated story description.");
  });

  it("moves between existing stories without losing edits", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Story Title"), "Changed Login");
    await user.click(screen.getByRole("button", { name: "Next Story" }));

    expect(screen.getByText("Story 2 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Story Title")).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "Previous Story" }));

    expect(screen.getByText("Story 1 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Story Title")).toHaveValue("Changed Login");
  });

  it("disables Previous Story on the first story", () => {
    render(<Harness />);

    expect(screen.getByRole("button", { name: "Previous Story" })).toBeDisabled();
  });
});