# Pacman Agent

An autonomous Pac-Man game that combines **BFS, A*, and Minimax** to collect food and respond to nearby ghosts. A React dashboard displays the maze, agent decisions, and search information while a Python backend runs the simulation.

## Features

- Classic-style 28-column by 31-row maze with pixel-art characters.
- Fully autonomous movement with automatic algorithm selection.
- Four ghosts with distinct targeting strategies and timed Chase/Scatter modes.
- Score, three lives, pellets, and fruit collectibles.
- Play, pause, single-step, and reset controls.
- Live algorithm, explored-node count, path length, and decision-time display.
- Optional searched-cell, route, danger, and coordinate overlays.
- Browser-local high score.

## Technology

| Layer | Technologies |
| --- | --- |
| Frontend | React, JavaScript, Vite, CSS, PNG sprites |
| Backend | Python, FastAPI, Uvicorn |
| Agent | Breadth-first search, A* search, two-ply Minimax |
| Communication | HTTP REST API through Vite's development proxy |

## Run locally

### Prerequisites

- Python 3.11 or newer.
- Node.js 22.12 or newer, with npm.
- Git, if cloning the repository.

### 1. Get the project

```sh
git clone https://github.com/imanavii/PacMan-AI-Agent.git
cd PacMan-AI-Agent
```

If you already have the project, open a terminal in its root folder.

### 2. Start the backend

Install dependencies once, then start the server:

```sh
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Leave this terminal running. Interactive API documentation is available at <http://127.0.0.1:8000/docs>.

### 3. Start the frontend

Open a **second terminal** in the repository root:

```sh
cd ui
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution is blocked.

Open **<http://127.0.0.1:5173/>** and click **Play**. Both servers must stay running.

### Stop the game servers

Press **Ctrl+C** in each terminal. If Windows asks `Terminate batch job (Y/N)?`, enter `Y`.

## How to use

| Control | Behaviour |
| --- | --- |
| Play / Pause | Start or pause automatic moves |
| Step | Pause automatic play and advance one move |
| Reset | Start a new game with the original food, score, and lives |
| Searched / Route / Danger / Coords | Toggle visual overlays |

The joystick displays the agent's direction. Pac-Man chooses its own moves.

Pellets award **10 points** and fruit collectibles award **50 points**. Collecting all food wins the game. A ghost collision costs a life; losing all three lives ends the game. After a nonfatal collision, positions and the ghost mode clock reset while score and remaining food are preserved.

## AI decision making

The agent replans after each move. Selection uses Manhattan distance, which measures row and column separation rather than the actual route around walls.

| Priority | Condition | Algorithm |
| --- | --- | --- |
| 1 | Any ghost is within 3 tiles | Minimax |
| 2 | Nearest food is within 4 tiles | BFS |
| 3 | Otherwise | A* |

- **BFS** searches level by level for the nearest reachable food.
- **A*** prioritizes tiles by path cost plus Manhattan distance to the nearest remaining food.
- **Minimax** evaluates one Pac-Man move followed by the worst legal joint ghost response. Its score considers collisions, food rewards, ghost distance, and remaining food distance.

BFS and A* treat currently occupied ghost tiles as blocked. If either finds no path, the agent falls back to Minimax. Random tie breaking adds variety between equally good choices. The next plan is cached so the displayed route matches the action used by the next step.

Selection thresholds are defined in [`agents/agent.py`](agents/agent.py). Each algorithm has its own module.

## Ghost behaviour

| Ghost | Colour | Chase target |
| --- | --- | --- |
| Blinky | Red | Pac-Man's current tile |
| Pinky | Pink | Four tiles ahead of Pac-Man |
| Inky | Cyan | A point two tiles ahead of Pac-Man, reflected away from Blinky's position |
| Clyde | Orange | Pac-Man when at least 8 tiles away; its bottom-left corner when closer |

Pinky and Inky preserve the original upward-targeting quirk. Clyde's threshold uses squared Euclidean distance.

Ghosts leave the shared base sequentially in red, pink, cyan, orange order. Each ghost begins normal targeting after reaching the exit and cannot re-enter the base.

During **Scatter**, each ghost targets its own corner. During **Chase**, it uses the rule above. The schedule alternates Scatter/Chase for **7/20/7/20/5/20/5 seconds**, followed by continuous Chase. Each simulation step advances the clock by **350 ms**; pausing does not advance it.

Ghosts choose legal moves closest to their target, normally avoiding reversal. Equal choices prefer up, left, down, right. Mode changes trigger a reversal when legal. Targeting is adapted from [The Pac-Man Dossier](https://phil.rodgers.ai/pacmandossier/).

## Architecture and project structure

The frontend requests a step, the backend applies the cached agent action and moves the ghosts, then the agent prepares the next decision. The response contains the updated game state and next plan for rendering.

```text
PacMan-AI-Agent/
|-- agents/
|   |-- agent.py          # Algorithm selection and decision metadata
|   |-- bfs.py            # Breadth-first food search
|   |-- astar.py          # Heuristic food search
|   `-- minimax.py        # Short-lookahead safety search
|-- game/
|   |-- maze.py           # Board layout, validation, and legal movement
|   |-- game_state.py     # Scoring, lives, collisions, and snapshots
|   `-- entities.py       # Ghost targets, movement, and mode schedule
|-- ui/
|   |-- src/
|   |   |-- api/          # Backend HTTP client
|   |   |-- assets/       # Character and item sprites
|   |   |-- components/   # Maze, controls, and information panels
|   |   |-- game/         # State normalization and display calculations
|   |   |-- hooks/        # Game lifecycle and high score
|   |   `-- styles/       # Dashboard styling
|   |-- public/           # Public assets and favicon
|   |-- API_CONTRACT.md   # Request and response format
|   `-- vite.config.js    # Frontend development server and API proxy
|-- tests/                # Backend tests
|-- evaluation/           # Placeholder benchmark and metrics modules
|-- results/              # Intended evaluation output directory
|-- main.py               # FastAPI application
`-- requirements.txt      # Backend runtime dependencies
```

### API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/state` | Read the current state and cached plan |
| POST | `/api/step` | Advance one move and prepare the next plan |
| POST | `/api/reset` | Reset the game and prepare an initial plan |

See [`ui/API_CONTRACT.md`](ui/API_CONTRACT.md) for response fields. Agent metadata includes the algorithm, action, path, target, explored cells, explored-node count, and decision time.

The backend holds **one shared game in memory**. Browser tabs share that game, and loading the frontend requests a reset. Use a single server worker. There is no database or per-user session; restarting the backend clears the game.

## Configuration

By default, the browser calls `/api`, and Vite forwards those requests to `http://localhost:8000`.

To use another backend address, copy [`ui/.env.example`](ui/.env.example) to `ui/.env.local` and set:

```dotenv
BACKEND_ORIGIN=http://127.0.0.1:8000
```

Restart the frontend after changing configuration. `VITE_API_URL` overrides the URL the browser calls; using a separate origin requires backend CORS configuration. `VITE_` variables are public browser configuration.

## Troubleshooting

- **NO SIGNAL / Disconnected:** Make sure the backend is running on port 8000. Open `/docs` to check it, then use Retry in the UI.
- **API requests return 404 after switching branches:** Restart Vite and refresh the browser so the current proxy configuration is loaded.
- **Port already in use:** Stop the previous server in its terminal before starting another copy. If changing the backend port, update `BACKEND_ORIGIN` too.
- **Missing Python module:** Run the dependency installation with the same `python` command used to start Uvicorn.
- **Frontend dependencies missing:** Run `npm ci` inside `ui/`.

## Development commands

From `ui/`:

```sh
npm run lint
npm test
npm run build
```

The production bundle is written to `ui/dist/`. `npm run preview` serves that bundle, but does not supply the backend or Vite's development API proxy. Deployment needs a backend and routing for `/api`.

Backend tests live in `tests/` and use Python's `unittest`; API tests additionally require the HTTP client supported by the installed FastAPI/Starlette version. With test dependencies installed:

```sh
python -m unittest discover -s tests -v
```

## Current limitations and future work

- Minimax has a two-ply lookahead and does not guarantee survival or victory.
- The agent uses fixed rules and does not learn from previous games.
- Fruit collectibles are represented as `coins` in the backend; they do not activate power-ups.
- Frightened mode, power pellets, Cruise Elroy, arcade release timing, and tunnel speed rules are not implemented.
- Evaluation modules are placeholders; measured win rates and comparative benchmarks are future work.

Planned improvements include better escape planning, deeper threat evaluation, frightened ghost behaviour, and comparisons using score, survival time, win rate, and decision time.
