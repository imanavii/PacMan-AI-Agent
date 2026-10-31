"""Classic ghost target tiles, adapted to the current maze dimensions."""

from collections import deque

from game.maze import DIRECTIONS

GHOST_IDS = ("red", "pink", "cyan", "orange")


def distance_squared(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2


def ahead(pos, direction, tiles):
    dr, dc = DIRECTIONS[direction]
    # Preserve the original arcade's upward-targeting quirk for Pinky and Inky.
    return pos[0] + dr * tiles, pos[1] + (dc - (direction == "UP")) * tiles


def ghost_target(ghost_id, pos, pacman, direction, blinky, shape, mode="chase"):
    rows, cols = shape
    corners = {
        "red": (-1, cols - 1), "pink": (-1, 0),
        "cyan": (rows, cols - 1), "orange": (rows, 0),
    }
    corner = corners[ghost_id]
    if mode == "scatter":
        return corner
    if mode != "chase":
        raise ValueError(f"Unknown ghost mode: {mode}")
    if ghost_id == "red":
        return pacman
    if ghost_id == "pink":
        return ahead(pacman, direction, 4)
    if ghost_id == "cyan":
        pivot = ahead(pacman, direction, 2)
        return 2 * pivot[0] - blinky[0], 2 * pivot[1] - blinky[1]
    return pacman if distance_squared(pos, pacman) >= 64 else corner

# Original level-one schedule, measured in simulation time (350 ms per UI step).
MODE_PERIODS_MS = (7000, 20000, 7000, 20000, 5000, 20000, 5000)
STEP_MS = 350
TURN_ORDER = ("UP", "LEFT", "DOWN", "RIGHT")
REVERSE = {"UP": "DOWN", "DOWN": "UP", "LEFT": "RIGHT", "RIGHT": "LEFT"}


def ghost_mode(elapsed_ms):
    for index, duration in enumerate(MODE_PERIODS_MS):
        if elapsed_ms < duration:
            return "scatter" if index % 2 == 0 else "chase"
        elapsed_ms -= duration
    return "chase"


def move_ghost(maze, pos, direction, target, reverse=False, blocked=()):
    legal = [(action, maze.move(pos, action)) for action in TURN_ORDER]
    legal = [(action, destination) for action, destination in legal if destination != pos and destination not in blocked]
    backwards = REVERSE[direction]
    if reverse:
        for action, destination in legal:
            if action == backwards:
                return destination, action
    forward = [(action, destination) for action, destination in legal if action != backwards]
    choices = forward or legal  # Reversing is allowed when trapped in a dead end.
    if not choices:
        return pos, direction
    action, destination = min(choices, key=lambda choice: distance_squared(choice[1], target))
    return destination, action


def exit_path(maze, start, exit_pos, occupied):
    """Route a ghost to the shared exit, around the waiting ghosts."""
    queue = deque([start])
    parents = {start: None}
    while queue:
        pos = queue.popleft()
        if pos == exit_pos:
            route = []
            while pos != start:
                route.append(pos)
                pos = parents[pos]
            return deque(reversed(route))
        for action in DIRECTIONS:
            new = maze.move(pos, action)
            if new not in parents and new not in occupied:
                parents[new] = pos
                queue.append(new)
    raise ValueError("Ghost start cannot reach the shared exit")
