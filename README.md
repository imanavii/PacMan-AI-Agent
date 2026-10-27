# PacMan-AI-Agent

Autonomous Pac-Man AI project with a React arcade interface for visualizing an agent, maze, search paths, and performance information.

## Current status

The React frontend is implemented. The Python entry point, game engine, AI algorithms, evaluation modules, and Python dependency manifest are placeholders. The original project description proposed a Pygame GUI; this interface uses React and Vite instead.

The frontend needs a game server to play. Without it, the interface shows **NO SIGNAL** and offers a retry. Test fixtures are used only by tests; they are not a production game engine.

## Project structure

- `agents/`: Python agent interfaces and BFS, A*, and Minimax implementations (placeholders).
- `game/`: Python entities, maze, state, and renderer (placeholders).
- `evaluation/`: Python benchmarks and metrics (placeholders).
- `results/`: destination for evaluation results.
- `main.py`: Python backend entry point (placeholder).
- `requirements.txt`: Python dependencies (currently empty).
- `ui/`: React frontend, its dependency manifest, and Vite configuration.
- `ui/src/components/`: arcade controls, screen, maze, sprites, and decorative components.
- `ui/src/api/`: HTTP client and tests.
- `ui/src/game/`: frontend state validation and display calculations, not the Python engine.
- `ui/src/hooks/`: game lifecycle and local high-score handling.
- `ui/src/styles/`: application styles and theme.
- `ui/src/test/`: test-only server fixture and setup.
- `ui/dashboard.py`: original empty placeholder, retained to preserve the canonical structure.

## Frontend setup

Use Node.js 22.12 or newer (a supported LTS release is recommended).

```sh
cd ui
npm ci
npm run dev
```

Open the local URL printed by Vite. Requests to `/api` are forwarded to `http://localhost:8000` by default. A backend implementing the endpoints in [the API contract](ui/API_CONTRACT.md) must run separately; no working backend launch command exists yet.

To change the server address, copy `ui/.env.example` to `ui/.env.local` and configure `BACKEND_ORIGIN`. `VITE_API_URL` overrides the URL the browser calls and requires appropriate backend CORS configuration when using another origin. Never put credentials in `VITE_` variables: they are public browser configuration.

## Validation

Run from `ui/`:

```sh
npm run lint
npm test
npm run build
```

The tests cover API errors, state normalization, display helpers, and application controls using a test-only fake client. They do not validate a Python backend. The production bundle is written to ignored `ui/dist/`; `npm run preview` previews that bundle but does not provide a game server or the development API proxy.

## Integration provenance

The frontend was selectively imported from `feat/game-engine-ui` at commit `af1dcdf56409917f5d79c66415606386a892713b` (PR #2). React components were placed in `ui/src/components/` instead of `ui/src/assets/`, and imports were updated. Existing Python files and the canonical top-level layout were preserved.
