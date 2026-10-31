"""Maze layout and legal moves. Positions use (row, column)."""

from dataclasses import dataclass

DIRECTIONS = {"UP": (-1, 0), "DOWN": (1, 0), "LEFT": (0, -1), "RIGHT": (0, 1)}
# Classic-style 28-column, 31-row board. The central doorway stays open
# so ghosts can leave without introducing a separate ghost-house rule.
DEFAULT_LAYOUT = (
    "############################",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#o####.#####.##.#####.####o#",
    "#.####.#####.##.#####.####.#",
    "#..........................#",
    "#.####.##.########.##.####.#",
    "#.####.##.########.##.####.#",
    "#......##....##....##......#",
    "######.##### ## #####.######",
    "######.##### ## #####.######",
    "######.##          ##.######",
    "######.## ###  ### ##.######",
    "######.## #      # ##.######",
    "......    # GGGG #    ......",
    "######.## #      # ##.######",
    "######.## ######## ##.######",
    "######.##          ##.######",
    "######.## ######## ##.######",
    "######.## ######## ##.######",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#.####.#####.##.#####.####.#",
    "#o..##.......P .......##..o#",
    "###.##.##.########.##.##.###",
    "###.##.##.########.##.##.###",
    "#......##....##....##......#",
    "#.##########.##.##########.#",
    "#.##########.##.##########.#",
    "#..........................#",
    "############################",
)


@dataclass(frozen=True)
class Maze:
    layout: tuple[str, ...] = DEFAULT_LAYOUT

    def __post_init__(self):
        object.__setattr__(self, "layout", tuple(self.layout))
        if not self.layout or not all(isinstance(row, str) for row in self.layout):
            raise ValueError("Maze must contain rows of text")
        width = len(self.layout[0])
        if not width or any(len(row) != width for row in self.layout):
            raise ValueError("Maze rows must have the same nonzero width")
        if any(cell not in "# .oPG" for row in self.layout for cell in row):
            raise ValueError("Maze contains an unknown tile")
        if len(self.positions("G")) > 4:
            raise ValueError("Maze supports at most four ghosts")
        if len(self.positions("P")) != 1:
            raise ValueError("Maze must have exactly one Pac-Man start (P)")

    def positions(self, tile):
        return frozenset(
            (r, c) for r, row in enumerate(self.layout)
            for c, cell in enumerate(row) if cell == tile
        )

    @property
    def start(self):
        return next(iter(self.positions("P")))

    @property
    def grid(self):
        return ["".join("#" if cell == "#" else " " for cell in row) for row in self.layout]

    def is_open(self, pos):
        r, c = pos
        return (0 <= r < len(self.layout) and 0 <= c < len(self.layout[0])
                and self.layout[r][c] != "#")

    def move(self, pos, action):
        if action not in DIRECTIONS:
            raise ValueError(f"Unknown direction: {action}")
        dr, dc = DIRECTIONS[action]
        destination = (pos[0] + dr, pos[1] + dc)
        return destination if self.is_open(destination) else pos
