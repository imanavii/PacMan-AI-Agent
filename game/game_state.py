"""Game rules and snapshots, independent of agents and the HTTP server."""

from game.maze import Maze
from game.entities import GHOST_IDS, STEP_MS, ghost_mode, ghost_target, move_ghost


class GameState:
    def __init__(self, maze=None):
        self.maze = maze if maze is not None else Maze()
        self.reset()

    def reset(self):
        self._reset_positions()
        self.pellets = set(self.maze.positions("."))
        self.coins = set(self.maze.positions("o"))
        self.score = 0
        self.lives = 3
        self.tick = 0
        self.status = "playing" if self.pellets or self.coins else "won"

    def _reset_positions(self):
        self.pacman = self.maze.start
        self.direction = "LEFT"
        self.ghosts = tuple(sorted(self.maze.positions("G")))
        self.ghost_directions = ("LEFT",) * len(self.ghosts)
        self.ghost_elapsed_ms = 0

    def step(self, action):
        """Move Pac-Man and all ghosts one tile, then resolve collisions."""
        if self.status != "playing":
            return
        previous_pacman = self.pacman
        destination = self.maze.move(self.pacman, action)
        if destination != self.pacman:
            self.direction = action
        previous_ghosts = self.ghosts
        previous_mode = ghost_mode(self.ghost_elapsed_ms)
        self.ghost_elapsed_ms += STEP_MS
        mode = ghost_mode(self.ghost_elapsed_ms)
        blinky = previous_ghosts[0] if previous_ghosts else destination
        shape = (len(self.maze.layout), len(self.maze.layout[0]))
        moves = []
        for ghost_id, pos, direction in zip(GHOST_IDS, self.ghosts, self.ghost_directions):
            target = ghost_target(ghost_id, pos, destination, self.direction, blinky, shape, mode)
            moves.append(move_ghost(self.maze, pos, direction, target, mode != previous_mode))
        self.ghosts = tuple(pos for pos, _ in moves)
        self.ghost_directions = tuple(direction for _, direction in moves)
        self.pacman = destination
        self.tick += 1

        collision = any(
            new == destination or (old == destination and new == previous_pacman)
            for old, new in zip(previous_ghosts, self.ghosts)
        )
        if collision:
            self.lives -= 1
            if self.lives == 0:
                self.status = "lost"
            else:
                self._reset_positions()
            return

        if self.pacman in self.pellets:
            self.pellets.remove(self.pacman)
            self.score += 10
        if self.pacman in self.coins:
            self.coins.remove(self.pacman)
            self.score += 50
        if not self.pellets and not self.coins:
            self.status = "won"

    def to_dict(self):
        """Return a detached, JSON-ready state matching the frontend contract."""
        return {
            "tick": self.tick,
            "status": self.status,
            "grid": self.maze.grid,
            "pacman": {"pos": list(self.pacman), "dir": self.direction},
            "ghosts": [
                {"id": GHOST_IDS[i], "pos": list(pos)}
                for i, pos in enumerate(self.ghosts)
            ],
            "pellets": [list(pos) for pos in sorted(self.pellets)],
            "coins": [list(pos) for pos in sorted(self.coins)],
            "score": self.score,
            "lives": self.lives,
            "totals": {
                "pellets": len(self.maze.positions(".")),
                "coins": len(self.maze.positions("o")),
            },
            "agent": {},
        }
