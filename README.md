# Pointing Poker

Pointing Poker is a real-time collaborative estimation web application for software development teams. Players create or join rooms, edit user stories, submit Planning Poker estimates, and review team results without refreshing the page.

Built by the **Jacobs Minions IT Project Management Team** as an educational class project.

## Features

* Create and join rooms using unique session codes.
* Enter a display name and view connected players.
* Edit story titles and descriptions, with automatic saving while navigating between stories.
* Navigate between previous and next stories, creating new stories as needed.
* Submit private Planning Poker votes: `0`, `1`, `2`, `3`, `5`, `8`, `13`, or `?`.
* Reveal, hide, and reset votes, with an anonymous reveal option.
* Celebrate unanimous estimates with a full-screen confetti effect when votes are revealed.
* View voting status and estimate statistics, including low, average, and high values.
* Control a shared session timer.
* Synchronize player, story, vote, and timer updates in real time.
* Use a responsive, consistent interface.

## Technology Stack

* **Frontend:** React, JavaScript, HTML, CSS, Vite
* **Backend:** Node.js, Express
* **Real-time communication:** WebSockets (`ws`)
* **Storage:** Server-side in-memory JavaScript `Map`

## Getting Started

### Requirements

Install [Node.js](https://nodejs.org/) and npm.

### Installation

Clone the repository, navigate to the project directory, and install dependencies:

```sh
npm install
```

### Run the Application

Start the API and WebSocket server in one terminal:

```sh
npm run api
```

Start the Vite development server in a second terminal:

```sh
npm run dev
```

Open the local URL printed by Vite. API requests under `/api` are proxied to the Express server at `http://127.0.0.1:3001`, which also hosts the WebSocket server.

### Run Project Checks

Run the automated tests once:

```sh
npm run test:run
```

Run the linter:

```sh
npm run lint
```

Build the production frontend:

```sh
npm run build
```

Use `npm run test` to run Vitest in watch mode.

## How It Works

### Room and Session Flow

1. A user creates a session or enters an existing room code.
2. The API creates a unique room or validates the requested code.
3. The user enters a display name and joins the room.
4. Players collaborate on stories, vote, reveal results, and manage the session timer.

The demo rooms `JACOBS-26` and `TEAM-42` are initialized when the API starts.

### Room State and Synchronization

The Express API is authoritative for room state, including players, stories, votes, vote visibility, host identity, and timer state.

Clients retrieve the latest room state through the REST API. After a successful mutation, the server publishes a room-scoped WebSocket event. Only clients connected to the matching room receive the event. Clients then fetch the latest room state through REST, avoiding a separate, potentially stale copy of game state.

Key event types include:

* `PLAYER_JOINED` — a player joins the room.
* `PLAYER_LEFT` — a player leaves the room.
* `ROOM_UPDATED` — a story, vote, reveal state, navigation, or timer changes. The event's `reason` identifies the update type.

Closing a player's browser or losing its WebSocket connection removes that player from the room just like using the **Leave Room** button. If the player has another active connection to the same room, they remain in the room until their last connection closes.

### API Endpoints

All endpoints are prefixed with `/api/rooms/:roomCode`.

| Method   | Endpoint                                 | Purpose                        |
| -------- | ---------------------------------------- | ------------------------------ |
| `GET`    | `/api/rooms/:roomCode`                   | Retrieve room state            |
| `POST`   | `/api/rooms/:roomCode/players`           | Add a player                   |
| `DELETE` | `/api/rooms/:roomCode/players/:playerId` | Remove a player                |
| `POST`   | `/api/rooms/:roomCode/votes`             | Submit a vote                  |
| `POST`   | `/api/rooms/:roomCode/votes/reveal`      | Reveal votes                   |
| `POST`   | `/api/rooms/:roomCode/votes/hide`        | Hide votes                     |
| `POST`   | `/api/rooms/:roomCode/votes/reset`       | Reset votes                    |
| `PATCH`  | `/api/rooms/:roomCode/stories/current`   | Update the current story       |
| `POST`   | `/api/rooms/:roomCode/stories/previous`  | Navigate to the previous story |
| `POST`   | `/api/rooms/:roomCode/stories/next`      | Navigate to the next story     |
| `POST`   | `/api/rooms/:roomCode/timer`             | Control the shared timer       |

Invalid room codes return a `404 Not Found` response.

### Host and Timer Behavior

The first player to join a room becomes its host. Only the current host can start, pause, or reset the shared timer, and the API validates these actions.

If the host leaves, the next player becomes the host. If no players remain, the timer pauses, and the next player to join becomes the host.

The server tracks elapsed time. Clients display a locally ticking timer based on the latest server response.

## Storage and Limitations

Room data is stored in memory and is not persisted to a database. Restarting the API clears rooms created since startup; the two demo rooms are initialized again.

The application does not yet include persistent session history or a separate record verifying who originally created a room.

## Future Improvements

Potential enhancements include:

* Database-backed persistent storage and session history.
* User accounts and authentication.
* Importing stories from project-management tools.
* Additional Planning Poker card sets.
* Improved mobile support.
* Expanded host permissions and room settings.
* Exportable estimation results.

## License

Created for educational purposes.

© 2026 Jacobs Minions. All rights reserved.
