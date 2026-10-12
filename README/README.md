# Pointing Poker

Pointing Poker is a real-time collaborative estimation web application designed for software development teams. It allows team members to create or join private estimation sessions, review and edit story cards, submit point estimates, and reveal team results in a shared room.

The project was built as a class team project with a focus on simple collaboration, clear session flow, and an easy-to-use interface.

## Features

- Create a new estimation session
- Join an existing session using a unique session code
- Enter a display name before joining a room
- Real-time multiplayer room support
- Editable story cards with a title and description
- Navigate between previous and next stories
- Automatically preserve story changes while navigating
- Planning Poker point values:
  - 0
  - 1
  - 2
  - 3
  - 5
  - 8
  - 13
  - ?
- Private voting until results are revealed
- View player voting status
- Reveal submitted votes to the team
- Anonymous reveal option
- Vote statistics including low, average, and high estimates
- Session timer with start/pause/reset controls
- Live player count
- Copyable session code
- Responsive, consistent Pointing Poker interface

## How It Works

### 1. Create a Session

From the home page, a user can create a new Pointing Poker session.

The server:

1. Generates a unique session ID.
2. Verifies that the ID is not already in use.
3. Creates a new room.
4. Stores the room in the server-side room store.
5. Returns the session ID to the client.

The user is then taken to the username page before entering the room.

### 2. Join a Session

A user can enter an existing session code from the home page.

The server checks whether the room exists.

If the session is valid, the user is taken to the username page. After entering a name, the player is added to the room and enters the game session.

If the session does not exist, the user receives an error message.

### 3. Story Cards

Each room contains a sequence of editable story cards.

A story contains:

- Title
- Description

Only one story is displayed at a time.

Users can move between stories using **Previous Story** and **Next Story**. If the user is viewing the newest story and advances again, a new blank story is created.

Story changes are preserved automatically while navigating.

### 4. Voting

Voting is handled separately from story navigation.

Each participant can select one of the available Planning Poker values.

Votes remain hidden until they are revealed.

The interface displays whether each participant has voted without exposing the value of their vote.

Once votes are revealed, the team can view the submitted estimates and summary statistics.

### 5. Session Results

The results section displays:

- Players currently in the session
- Whether each player has voted
- Revealed vote values
- Lowest estimate
- Average estimate
- Highest estimate

The session can then continue with another vote or move to another story.

## Session Storage

Active rooms are stored on the server using an in-memory `Map`.

Each session ID acts as the key for its room data.

A room stores information such as:

```js
{
  id: "JACOBS-26",
  players: [],
  stories: [],
  currentStoryIndex: 0,
  votes: {},
  votesRevealed: false,
  createdAt: new Date()
}
```

This allows the server to quickly create, retrieve, update, and remove active rooms.

## Real-Time Communication

Pointing Poker uses real-time communication so that users in the same room immediately receive updates when:

- A player joins or leaves
- A story is changed
- A vote is submitted
- Votes are revealed
- Session state changes

Each live connection is associated with the user's session ID so updates are sent only to the correct room.

## Application Flow

```text
Home Page
   |
   |-- Create Session
   |       |
   |       -> Generate Session ID
   |
   |-- Join Session
           |
           -> Validate Session ID

              |
              v

        Username Page
              |
              v

         Game Session
              |
     ----------------------
     |        |           |
   Stories   Voting    Results
```

## Technology Stack

### Frontend

- React
- JavaScript
- HTML
- CSS

### Backend

- Node.js
- Express
- JavaScript
- WebSockets / Socket.IO

### Data

- Server-side in-memory room storage
- JavaScript objects and Maps for active session data

## Main Interface

The game page is divided into several sections.

### Current Story

Displays the currently selected story and allows the title and description to be edited.

### Session Information

Displays:

- Session code
- Number of connected players
- Session timer
- Session controls

### Point Cards

Allows each participant to submit an estimate.

### Team Results

Displays player voting status and revealed estimates.

## Running the Project

### Requirements

Before running the project, install:

- Node.js
- npm

### Install Dependencies

Install the project dependencies:

```bash
npm install
```

If the client and server are stored in separate folders, install dependencies in both:

```bash
cd client
npm install

cd ../server
npm install
```

### Start the Application

Start the backend server:

```bash
npm run dev
```

Start the React frontend in a second terminal if needed:

```bash
npm run dev
```

Open the local address shown in the terminal to use the application.

## Example Session

A session may use a code such as:

```text
JACOBS-26
```

Users enter the session code, choose a username, and are connected to the same estimation room.

## Design Goals

The project was designed around four main goals:

- **Simple** — users can create or join a session with minimal setup.
- **Collaborative** — team members can estimate together in real time.
- **Focused** — the interface keeps stories, voting, and results easy to understand.
- **Flexible** — story cards and voting are separate systems that can be extended independently.

## Future Improvements

Possible future improvements include:

- Persistent database storage
- User accounts
- Saved session history
- Importing stories from external project-management tools
- Additional Planning Poker card sets
- Improved mobile support
- Host permissions and room settings
- Exportable estimation results

## Team

Built by the **Jacobs Minions IT Project Management Team**.

## License

This project was created for educational purposes.

© 2026 Jacobs Minions. All rights reserved.
