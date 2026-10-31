"""Small game API used by the React frontend."""

from fastapi import FastAPI

from agents.agent import decide
from game.game_state import GameState

app = FastAPI()
game = GameState()
current_plan = decide(game)


def snapshot():
    state = game.to_dict()
    state["agent"] = current_plan
    return state


@app.get("/api/state")
async def state():
    return snapshot()


@app.post("/api/reset")
async def reset():
    global current_plan
    game.reset()
    current_plan = decide(game)
    return snapshot()


@app.post("/api/step")
async def step():
    global current_plan
    if game.status == "playing":
        action = current_plan["action"]
        game.step(action if action is not None else game.direction)
        current_plan = decide(game)
    return snapshot()
