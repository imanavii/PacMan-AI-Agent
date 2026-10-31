"""Two-ply minimax: choose a move against the worst legal ghost response."""

from itertools import product
from random import choice

from game.entities import REVERSE, STEP_MS, ghost_mode
from game.maze import DIRECTIONS


def search(game):
    reverse = ghost_mode(game.ghost_elapsed_ms + STEP_MS) != ghost_mode(game.ghost_elapsed_ms)
    responses = []
    leader = next((i for i, route in enumerate(game.exit_routes) if route), None)
    for i, (pos, direction) in enumerate(zip(game.ghosts, game.ghost_directions)):
        if game.exit_routes[i]:
            responses.append([game.exit_routes[i][0] if i == leader else pos])
            continue
        legal = [(action, game.maze.move(pos, action)) for action in DIRECTIONS]
        legal = [(action, new) for action, new in legal if new != pos and new not in game.ghost_house]
        backwards = [(action, new) for action, new in legal if action == REVERSE[direction]]
        forward = [(action, new) for action, new in legal if action != REVERSE[direction]]
        allowed = (backwards or legal) if reverse else (forward or legal)
        responses.append([new for _, new in allowed] or [pos])

    food = game.pellets | game.coins
    moves = [game.maze.move(game.pacman, action) for action in DIRECTIONS]
    moves = list(dict.fromkeys(pos for pos in moves if pos != game.pacman)) or [game.pacman]
    explored = []
    best_value = float("-inf")
    best_moves = []
    for pos in moves:
        worst = float("inf")
        remaining = food - {pos}
        reward = (10 if pos in game.pellets else 0) + (50 if pos in game.coins else 0)
        for ghosts in product(*responses):
            explored.append(pos)
            collision = any(new == pos or (old == pos and new == game.pacman)
                            for old, new in zip(game.ghosts, ghosts))
            if collision:
                value = -10000
            elif not remaining:
                value = 10000 + reward
            else:
                danger_distance = min((abs(pos[0] - r) + abs(pos[1] - c)
                                       for r, c in ghosts), default=4)
                food_distance = min(abs(pos[0] - r) + abs(pos[1] - c) for r, c in remaining)
                value = reward + 5 * min(danger_distance, 4) - food_distance
            worst = min(worst, value)
        if worst > best_value:
            best_value, best_moves = worst, [pos]
        elif worst == best_value:
            best_moves.append(pos)
    selected = choice(best_moves)
    return ([selected] if selected != game.pacman else []), explored
