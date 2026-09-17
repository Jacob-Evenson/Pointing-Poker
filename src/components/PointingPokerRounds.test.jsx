import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PointingPokerRounds from './PointingPokerRounds';

describe('PointingPokerRounds', () => {
  it('starts on round 1 and allows the user to mark a round complete', async () => {
    const user = userEvent.setup();
    render(<PointingPokerRounds />);

    expect(screen.getByText('Round 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('This round is still in progress.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mark round as complete/i }));

    expect(screen.getByText('This round is complete. You can move to the next round.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next round/i })).not.toBeDisabled();
  });

  it('moves from round 1 to round 2 and then to round 3', async () => {
    const user = userEvent.setup();
    render(<PointingPokerRounds />);

    await user.click(screen.getByRole('button', { name: /mark round as complete/i }));
    await user.click(screen.getByRole('button', { name: /next round/i }));

    expect(screen.getByText('Round 2 of 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mark round as complete/i }));
    await user.click(screen.getByRole('button', { name: /next round/i }));

    expect(screen.getByText('Round 3 of 3')).toBeInTheDocument();
  });

  it('does not move past round 3 and shows the all-complete message after final round', async () => {
    const user = userEvent.setup();
    render(<PointingPokerRounds />);

    for (let i = 0; i < 3; i += 1) {
      await user.click(screen.getByRole('button', { name: /mark round as complete/i }));
      if (i < 2) {
        await user.click(screen.getByRole('button', { name: /next round/i }));
      }
    }

    expect(screen.getByText('All rounds are complete!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next round/i })).not.toBeInTheDocument();
  });

  it('resets the stories and round state back to the initial values', async () => {
    const user = userEvent.setup();
    render(<PointingPokerRounds />);

    await user.click(screen.getByRole('button', { name: /mark round as complete/i }));
    await user.click(screen.getByRole('button', { name: /next round/i }));
    await user.click(screen.getByRole('button', { name: /reset story cards/i }));

    expect(screen.getByText('Round 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('This round is still in progress.')).toBeInTheDocument();
    expect(screen.getByText('User Login')).toBeInTheDocument();
    expect(screen.getByText('Password Reset')).toBeInTheDocument();
  });
});
