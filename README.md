# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Pointing Poker application

Pointing Poker is a React application for estimating work together. Players join
a room using its session code, vote on the current story, and see room changes
without refreshing the page.

### Run locally

Install dependencies:

```sh
npm install
```

Start the API and WebSocket server in one terminal:

```sh
npm run api
```

Start the Vite development server in another terminal:

```sh
npm run dev
```

Open the local URL printed by Vite. Its `/api` requests are proxied to the
Express server at `http://127.0.0.1:3001`, which also hosts the WebSocket server.

### Room and synchronization model

The Express API is authoritative for room state. The in-memory room store holds
players, stories, votes, reveal state, host identity, and timer state. Rooms are
not persisted: restarting the API clears rooms created since startup. The
`JACOBS-26` and `TEAM-42` demo rooms are initialized when the API starts.

Clients fetch room state through the REST API. After a successful mutation, the
API publishes a room-scoped event. The WebSocket server forwards that event only
to clients that joined the matching room code. Events notify clients that state
changed; clients fetch the latest room from REST rather than applying a second,
potentially stale copy of game state.

### Session host and timer

The first player added to a room becomes its host. This is normally the person
who created the room and then joined it, but the application does not separately
record or verify who created the room. Only the current host can start, pause,
or reset the shared timer; timer changes are checked by the API. If the host
leaves, the next player in the room becomes the host. If no players remain, the
timer pauses and a future first player becomes the new host.

Timer elapsed time is tracked by the server and returned as room state. Browser
clients display a local ticking view based on the latest server response.

### Project checks

```sh
npm run test:run
npm run lint
npm run build
```

`npm run test` starts Vitest in watch mode; `npm run test:run` runs the tests
once.
