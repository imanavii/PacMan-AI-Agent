# Game server API contract

The React frontend talks to the FastAPI backend through three endpoints. All three return the same JSON game state.

| Method | Path          | What it does                                                        |
| ------ | ------------- | ------------------------------------------------------------------- |
| POST   | `/api/reset`  | Start a fresh game and return the opening state.                    |
| POST   | `/api/step`   | Advance one tick (agent decides and moves, ghosts move) and return the new state. |
| GET    | `/api/state`  | Return the current state without changing it.                       |

The frontend calls `/api/step` every 350 ms while the game is running, and once per press of STEP. Pausing stops the calls; the server needs no pause endpoint.

## Coordinates

Every position is `[row, col]`, counted from the top-left corner `(0, 0)`. `row` goes down, `col` goes right. This matches `grid[row][col]` in Python.

## State JSON

```json
{
  "tick": 17,
  "status": "playing",
  "grid": [
    "#####################",
    "#.........#.........#",
    "..."
  ],
  "pacman": { "pos": [3, 1], "dir": "UP" },
  "ghosts": [
    { "id": "red", "pos": [3, 2] },
    { "id": "pink", "pos": [1, 6] }
  ],
  "pellets": [[1, 2], [1, 3]],
  "coins": [[1, 1], [13, 19]],
  "score": 160,
  "lives": 3,
  "totals": { "pellets": 151, "coins": 6 },
  "agent": {
    "action": "UP",
    "path": [[2, 1], [1, 1]],
    "explored_cells": [[2, 1], [4, 1], [1, 1]],
    "target": [1, 1],
    "explored_nodes": 3,
    "decision_time_ms": 0.42
  }
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `tick` | yes | Number of steps taken since the last reset. Shown as MOVES. |
| `status` | yes | `"playing"`, `"won"` or `"lost"`. The frontend stops stepping when it isn't `"playing"`. |
| `grid` | yes | List of equal-length strings, one per row. `#` is a wall; any other character is open floor. |
| `pacman.pos` | yes | Agent position `[row, col]`. |
| `pacman.dir` | no | Direction the agent last moved: `UP`, `DOWN`, `LEFT` or `RIGHT` (default `LEFT`). Drives the joystick and the sprite's eyes. |
| `ghosts` | yes | List of `{ "id", "pos" }`. The ids `red`, `pink`, `cyan` and `orange` get their own colours; other ids reuse those colours in order. |
| `pellets` | yes | Positions of pellets still on the board. |
| `coins` | no | Positions of coins still on the board (default none). |
| `score` | yes | Current score. Pellet = 10, coin = 50. |
| `lives` | yes | Lives left. |
| `totals.pellets`, `totals.coins` | no | How many there were at the start, used for "coins collected" (defaults to the current counts). |
| `agent.action` | no | The move the agent will make next, or `null`. |
| `agent.path` | no | The planned route from the cell after the agent's position up to the target. Drawn as the ROUTE overlay. |
| `agent.explored_cells` | no | Cells the search looked at for this decision. Drawn as the SEARCHED overlay. |
| `agent.target` | no | The cell the agent is heading for, or `null`. |
| `agent.explored_nodes` | no | Count of expanded search nodes for this decision. |
| `agent.decision_time_ms` | no | Time the decision took, in milliseconds. |

`agent` should describe the plan from the agent's current position (what it is about to do), so the overlays line up with where the sprite is standing.

If a reply is missing a required field or has the wrong type, the screen shows **NO SIGNAL** with the exact field that was wrong. If the server can't be reached or returns an HTTP error, it shows the same screen with a RETRY button.

## Minimal FastAPI shape

```python
from fastapi import FastAPI

app = FastAPI()
game = Game()  # your engine + agent

@app.post("/api/reset")
def reset():
    game.reset()
    return game.to_dict()

@app.post("/api/step")
def step():
    game.step()
    return game.to_dict()

@app.get("/api/state")
def state():
    return game.to_dict()
```

Tuples serialise to JSON lists, so `(row, col)` tuples work as positions.
