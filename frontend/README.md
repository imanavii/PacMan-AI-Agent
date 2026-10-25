# Pac-Agent frontend

React + Vite interface for the Pac-Agent project: a pixel arcade cabinet that shows the maze, a live HUD, overlays for the agent's route, searched cells and danger zones, and controls to start, pause, step and reset.

It runs on its own with a built-in **mock engine** (labelled MOCK DATA on the cabinet), and switches to the FastAPI backend with one setting. The mock's agent is a simple placeholder search, not the project's hybrid BFS + A* + Minimax agent.

## Run it (Windows PowerShell)

Requires Node.js 20 or newer.

```powershell
cd frontend
npm install
npm run dev
```

Open the address it prints, usually http://localhost:5173.

## Connect the FastAPI backend

1. Start the backend on port 8000 with the endpoints in [API_CONTRACT.md](API_CONTRACT.md).
2. In the `frontend` folder, create `.env.local` with this line:
   ```
   VITE_API_URL=/api
   ```
3. Restart `npm run dev`. The sticker on the cabinet changes from MOCK DATA to LIVE.

During development, Vite forwards `/api` to `http://localhost:8000`, so the backend needs no CORS setup. For a different backend address, also add `BACKEND_ORIGIN=http://host:port` to `.env.local`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Re-run tests on every change |
| `npm run lint` | Lint with oxlint |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |

## Where things are

```
src/
  App.jsx                 page layout and screen messages
  api/client.js           mock engine or HTTP backend, same interface
  game/contract.js        validates the state JSON from the server
  game/mockEngine.js      in-browser stand-in for the backend
  game/levels.js          the mock maze layout
  game/derive.js          turns state into what each maze cell draws
  hooks/useGame.js        game loop: start, pause, step, reset
  hooks/useHighScore.js   best score, saved in the browser
  components/             cabinet, screen, maze, panels, controls, sprites, background
  styles/                 theme tokens and component styles
  config.js               team names shown in the footer
```

Change `TEAM_NAMES` in `src/config.js` to put your names on the cabinet.
