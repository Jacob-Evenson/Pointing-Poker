import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PointingPokerRounds from '../src/components/PointingPokerRounds';

describe("PointingPokerRounds", () => {
  it("shows one story with editable title and description fields", () => {
    render(<PointingPokerRounds />);

    expect(screen.getByText("Story 1 of 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Story Title")).toHaveValue("");
    expect(screen.getByLabelText("Story Description")).toHaveValue("");
  });

  it("updates the current story while the user types", async () => {
    const user = userEvent.setup();
    render(<PointingPokerRounds />);

    const titleInput = screen.getByLabelText("Story Title");
    const descriptionInput = screen.getByLabelText("Story Description");

    await user.clear(titleInput);
    await user.type(titleInput, "Updated Login");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated story description.");

    expect(titleInput).toHaveValue("Updated Login");
    expect(descriptionInput).toHaveValue("Updated story description.");
  });

  it("moves between existing stories without losing edits", async () => {
    const user = userEvent.setup();
    render(<PointingPokerRounds />);

    const titleInput = screen.getByLabelText("Story Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Changed Login");
    await user.click(screen.getByRole("button", { name: "Next Story" }));

    expect(screen.getByText("Story 2 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Story Title")).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "Previous Story" }));

    expect(screen.getByText("Story 1 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Story Title")).toHaveValue("Changed Login");
  });

  it("creates a blank story when Next Story is pressed on the newest story", async () => {
    const user = userEvent.setup();
    render(<PointingPokerRounds />);

    await user.click(screen.getByRole("button", { name: "Next Story" }));
    await user.click(screen.getByRole("button", { name: "Next Story" }));
    await user.click(screen.getByRole("button", { name: "Next Story" }));

    expect(screen.getByText("Story 4 of 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Story Title")).toHaveValue("");
    expect(screen.getByLabelText("Story Description")).toHaveValue("");
  });

  it("disables Previous Story on the first story", () => {
    render(<PointingPokerRounds />);

    expect(screen.getByRole("button", { name: "Previous Story" })).toBeDisabled();
  });
});
