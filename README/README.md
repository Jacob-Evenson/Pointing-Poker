# Pointing-Poker
pointing the poker

TEAM NAME	Jacob and his minions  
TEAM MEMBERS	Amelia, Jacob, Eliy, Nathaniel  
SCRUM MASTER	Everyone  
COMMUNICATION METHOD	Teams  
CONFLICT RESOLUTION PROCESS	discussion, vote, Niall to break ties  
TEAM RULES	 
1.	everyone talks  
2.	everyone contributes  

TECHNOLOGY DECISIONS  
SECTION	TEAM RESPONSE  
FRONTEND	React  
BACKEND	node  
DATABASE	mySQL  

## User Flow:
1. lands on home page
2. selects join or create
  - intermediary: enter name and join; guest/host: if host- enter story cards
3. game page
  - show votes; host sets a final value that brings up the next card


## Implementation Documentation

### PointCard

`PointCard` renders one estimation card as an accessible button. It accepts two props:

- `point`: an object containing `value`, `title`, and `description`.
- `onSelect`: a callback that receives the complete `point` object when the card is selected.

The card displays the point title, description, and value. The available point data is exported from `src/data/points.js` and includes `0`, `1`, `2`, `3`, `5`, `8`, `13`, and `?`. The `?` value represents an estimate that needs more information and is stored as a string.

### SelectedPoint

`SelectedPoint` displays the current estimation state. It accepts:

- `point`: the selected point object, or `null` before a selection is made.
- `voted`: a boolean indicating whether the user has submitted a vote.

Before a vote, it prompts the user to choose a card. After a valid selection, it displays the selected point value. It safely handles an empty point so the initial page can render without a selection.

### PointingPokerHomePage additions

`PointingPokerHomePage` imports the shared `points` array, renders one `PointCard` for each option, and owns the local voting state:

```js
selectedPoint = null
user = { name: 'Player', bid: null, voted: false }
```

When a card is selected, the page:

1. Stores the complete point object in `selectedPoint`.
2. Stores `point.value` in `user.bid`.
3. Changes `user.voted` from `false` to `true`.
4. Preserves the user's existing name and other user fields.

Selecting another card replaces the previous bid while keeping all point cards available. Vote reset, rooms, multiple participants, real-time synchronization, vote hiding and revealing, vote history, and backend persistence are not implemented yet.
