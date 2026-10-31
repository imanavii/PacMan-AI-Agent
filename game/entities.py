"""Classic ghost target tiles, adapted to the current maze dimensions."""

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
