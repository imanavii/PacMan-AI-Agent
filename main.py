"""Small game API used by the React frontend."""

from collections import Counter

from fastapi import FastAPI

from game.game_state import GameState
from game.maze import DIRECTIONS

app = FastAPI()
game = GameState()
visits = Counter({game.pacman: 1})


def choose_move():
    """Basic demo controller until the real agent is connected."""
    moves = [(action, game.maze.move(game.pacman, action)) for action in DIRECTIONS]
    moves = [(action, pos) for action, pos in moves if pos != game.pacman]
    food = game.pellets | game.coins

    def priority(move):
        _, pos = move
        distance = min((abs(pos[0] - r) + abs(pos[1] - c) for r, c in food), default=0)
        return pos in game.ghosts, visits[pos], distance

    return min(moves, key=priority)[0] if moves else game.direction


@app.get("/api/state")
async def state():
    return game.to_dict()


@app.post("/api/reset")
async def reset():
    game.reset()
    visits.clear()
    visits[game.pacman] = 1
    return game.to_dict()


@app.post("/api/step")
async def step():
    if game.status == "playing":
        lives = game.lives
        game.step(choose_move())
        if game.lives != lives:
            visits.clear()
        visits[game.pacman] += 1
    return game.to_dict()
