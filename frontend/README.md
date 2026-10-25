# Pac-Agent frontend

React + Vite interface for the Pac-Agent project: a pixel arcade cabinet that shows the maze, a live HUD, overlays for the agent's route, searched cells and danger zones, and controls to start, pause, step and reset.

The frontend only draws what the FastAPI backend sends. All game rules and the agent run on the backend; the data it must return is described in [API_CONTRACT.md](API_CONTRACT.md).

## Run it (Windows PowerShell)

Requires Node.js 20 or newer.

1. Start the FastAPI backend on port 8000 (it must serve the endpoints in API_CONTRACT.md).
2. Start the frontend:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
3. Open the address it prints, usually http://localhost:5173.

During development, Vite forwards every `/api` request to `http://localhost:8000`, so the backend needs no CORS setup. If the backend is not running, the screen shows **NO SIGNAL** with a RETRY button.

To use a different backend address, copy `.env.example` to `.env.local` and set `BACKEND_ORIGIN` (and `VITE_API_URL` if the path isn't `/api`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm test` | Run the test suite once (no backend needed) |
| `npm run test:watch` | Re-run tests on every change |
| `npm run lint` | Lint with oxlint |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |

## Where things are

```
src/
  App.jsx                 page layout and screen messages
  api/client.js           calls the backend (/api/reset, /api/step, /api/state)
  game/contract.js        validates the state JSON from the backend
  game/derive.js          turns state into what each maze cell draws
  hooks/useGame.js        game loop: start, pause, step, reset
  hooks/useHighScore.js   best score, saved in the browser
  assets/                 UI components: cabinet, screen, maze, panels, controls, sprites, background
  styles/                 theme tokens and component styles
  config.js               team names shown in the footer
  test/                   test setup and a small fake server used only by the tests
```

Change `TEAM_NAMES` in `src/config.js` to put your names on the cabinet.
