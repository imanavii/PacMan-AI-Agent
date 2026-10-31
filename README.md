# PacMan-AI-Agent

Autonomous Pac-Man AI project with a React arcade interface for visualizing an agent, maze, search paths, and performance information.

## Current status

The React frontend and basic Python maze/game state are implemented. Four ghosts now move with classic chase targets and scatter/chase modes. FastAPI now exposes the game state, reset, and step endpoints. Pac-Man is autonomous: agent.py chooses Minimax near ghosts, BFS for nearby food, and A* for distant food. It replans each step and supplies route and search overlays, with random tie breaking between equal choices. Evaluation modules remain placeholders. The original project description proposed a Pygame GUI; this interface uses React and Vite instead.

The frontend needs a game server to play. Without it, the interface shows **NO SIGNAL** and offers a retry. Test fixtures are used only by tests; they are not a production game engine.

## Project structure

- `agents/`: separate BFS, A*, and Minimax implementations, selected automatically by `agent.py`.
- `game/`: maze layout, legal movement, ghost behavior, and game state; renderer remains a placeholder.
- `evaluation/`: Python benchmarks and metrics (placeholders).
- `results/`: destination for evaluation results.
- `main.py`: FastAPI endpoints connecting the game and autonomous agent.
- `requirements.txt`: backend runtime dependencies.
- `ui/`: React frontend, its dependency manifest, and Vite configuration.
- `ui/src/components/`: arcade controls, screen, maze, sprites, and decorative components.
- `ui/src/api/`: HTTP client and tests.
- `ui/src/game/`: frontend state validation and display calculations, not the Python engine.
- `ui/src/hooks/`: game lifecycle and local high-score handling.
- `ui/src/styles/`: application styles and theme.
- `ui/src/test/`: test-only server fixture and setup.
- `ui/dashboard.py`: original empty placeholder, retained to preserve the canonical structure.

## Ghost behavior

`game/entities.py` implements Blinky (red), Pinky (pink), Inky (cyan), and Clyde (orange). The default maze has four `G` starts, assigned those identities in row/column order. Custom mazes can have zero to four ghosts. The default board marks a shared doorway with `E`: ghosts exit one at a time in red, pink, cyan, orange order before their targeting rules activate. Exited ghosts cannot re-enter the base. Reset and life loss restart the queue; maps without `E` use normal movement immediately.

Ghosts move one tile per step using squared distance to their target. Ties prefer up, left, down, right; normal movement avoids reversing unless at a dead end. Mode switches force a reversal when legal. The level-one schedule is scatter/chase for 7/20/7/20/5/20/5 seconds, then continuous chase. Each simulation step represents 350 ms; pausing the UI does not advance the clock. Losing a life resets positions, headings, and the mode clock, preserving score and remaining collectibles.

The target rules follow [The Pac-Man Dossier](https://phil.rodgers.ai/pacmandossier/), including Pinky and Inky's upward-targeting quirk. This is a tile-based adaptation to our small maze, not a full arcade emulator: there is no ghost house/release timing, frightened mode, tunnel speed adjustment, Cruise Elroy, or original-map turn restrictions. Coins remain collectibles, not power pellets. Ghost moves use the same pre-move Blinky position and the updated Pac-Man position; collisions include shared destinations and tile swaps.

## Pac-Man decisions

`agents/agent.py` uses simple Manhattan-distance thresholds: Minimax when a ghost is within 3 tiles, BFS when food is within 4 tiles, and A* otherwise. These thresholds are constants in that file. If food search finds no route, it falls back to Minimax. No human algorithm or direction selection is required.

BFS finds the nearest reachable food; A* uses distance to the nearest remaining food as its heuristic. Both treat occupied ghost tiles as blocked. Minimax is a short two-ply safety search: one Pac-Man move followed by the worst legal joint ghost response. It respects walls, ghost headings, and mode reversals, but pessimistically considers possible ghost turns rather than assuming their exact targets. This shallow lookahead does not guarantee survival or victory.

Equally good routes and moves use random tie breaking, so repeated resets can produce different runs. A plan is cached until a step or reset so the displayed route matches the action that will actually be taken. Minimax displays only its selected next tile rather than pretending to have a long planned route.

## Backend setup

From the repository root, using Python 3.11 or newer:

```sh
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Leave this terminal running and start the frontend in a second terminal. The server exposes `GET /api/state`, `POST /api/reset`, and `POST /api/step`, as described in [the API contract](ui/API_CONTRACT.md). Each step advances Pac-Man and all four ghosts; finished games remain unchanged until reset.

This is one in-memory game shared by all connected browser tabs. Use one server worker. Reset or a server restart starts a fresh game; there is no database or separate user session. Requests through Vite's `/api` proxy need no CORS configuration. Route, target, and searched-cell overlays show the current plan. The raw API response includes the selected algorithm in `agent.algorithm`.

## Frontend setup

Use Node.js 22.12 or newer (a supported LTS release is recommended).

```sh
cd ui
npm ci
npm run dev
```

Open the local URL printed by Vite. Requests to `/api` are forwarded to `http://localhost:8000` by default. Keep the backend running separately with the command above.

To change the server address, copy `ui/.env.example` to `ui/.env.local` and configure `BACKEND_ORIGIN`. `VITE_API_URL` overrides the URL the browser calls and requires appropriate backend CORS configuration when using another origin. Never put credentials in `VITE_` variables: they are public browser configuration.

## Validation

Run backend tests from the repository root (HTTPX2 is only needed for API tests):

```sh
python -m pip install httpx2
python -m unittest discover -s tests -v
```

Run frontend checks from `ui/`:

```sh
npm run lint
npm test
npm run build
```

The tests cover API errors, state normalization, display helpers, and application controls using a test-only fake client. They do not validate a Python backend. The production bundle is written to ignored `ui/dist/`; `npm run preview` previews that bundle but does not provide a game server or the development API proxy.

## Integration provenance

The frontend was selectively imported from `feat/game-engine-ui` at commit `af1dcdf56409917f5d79c66415606386a892713b` (PR #2). React components were placed in `ui/src/components/` instead of `ui/src/assets/`, and imports were updated. Existing Python files and the canonical top-level layout were preserved.
