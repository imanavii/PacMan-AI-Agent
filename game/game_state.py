"""Game rules and snapshots, independent of agents and the HTTP server."""

from game.maze import Maze


class GameState:
    def __init__(self, maze=None):
        self.maze = maze if maze is not None else Maze()
        self.reset()

    def reset(self):
        self.pacman = self.maze.start
        self.direction = "LEFT"
        self.ghosts = tuple(sorted(self.maze.positions("G")))
        self.pellets = set(self.maze.positions("."))
        self.coins = set(self.maze.positions("o"))
        self.score = 0
        self.lives = 3
        self.tick = 0
        self.status = "playing" if self.pellets or self.coins else "won"

    def step(self, action):
        """Apply one supplied move. Ghosts remain stationary in this version."""
        if self.status != "playing":
            return
        destination = self.maze.move(self.pacman, action)
        if destination != self.pacman:
            self.direction = action
        self.pacman = destination
        self.tick += 1

        if self.pacman in self.ghosts:
            self.lives -= 1
            if self.lives == 0:
                self.status = "lost"
            else:
                self.pacman = self.maze.start
                self.direction = "LEFT"
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
        colors = ("red", "pink", "cyan", "orange")
        return {
            "tick": self.tick,
            "status": self.status,
            "grid": self.maze.grid,
            "pacman": {"pos": list(self.pacman), "dir": self.direction},
            "ghosts": [
                {"id": colors[i] if i < len(colors) else f"ghost-{i}", "pos": list(pos)}
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
