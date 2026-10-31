"""Select a Pac-Man algorithm from the current board, with no human input."""

from random import choice
from time import perf_counter

from agents import astar, bfs, minimax
from game.maze import DIRECTIONS

DANGER_DISTANCE = 3
NEAR_FOOD_DISTANCE = 4


def decide(game):
    started = perf_counter()
    result = {"algorithm": None, "action": None, "path": [], "target": None,
              "explored_cells": [], "explored_nodes": 0, "decision_time_ms": 0}
    if game.status != "playing":
        return result

    r, c = game.pacman
    ghost_distance = min((abs(r - gr) + abs(c - gc) for gr, gc in game.ghosts), default=float("inf"))
    food_distance = min((abs(r - fr) + abs(c - fc) for fr, fc in game.pellets | game.coins),
                        default=float("inf"))
    if ghost_distance <= DANGER_DISTANCE:
        algorithm = "minimax"
        path, explored = minimax.search(game)
    elif food_distance <= NEAR_FOOD_DISTANCE:
        algorithm = "bfs"
        path, explored = bfs.search(game)
    else:
        algorithm = "astar"
        path, explored = astar.search(game)

    if not path and algorithm != "minimax":
        algorithm = "minimax"
        path, safety_explored = minimax.search(game)
        explored += safety_explored
    if path:
        delta = (path[0][0] - r, path[0][1] - c)
        result["action"] = next(action for action, offset in DIRECTIONS.items() if offset == delta)
        result["path"] = [list(pos) for pos in path]
        result["target"] = list(path[-1])
    else:
        # An isolated Pac-Man waits by attempting a blocked direction.
        result["action"] = choice(list(DIRECTIONS))
    result["algorithm"] = algorithm
    result["explored_cells"] = [list(pos) for pos in dict.fromkeys(explored)]
    result["explored_nodes"] = len(explored)
    result["decision_time_ms"] = round((perf_counter() - started) * 1000, 3)
    return result
