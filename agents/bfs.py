"""Shortest route to the nearest food on an equal-cost grid."""

from collections import deque
from random import shuffle

from game.maze import DIRECTIONS


def search(game):
    start = game.pacman
    food = game.pellets | game.coins
    blocked = set(game.ghosts)
    queue = deque([start])
    parents = {start: None}
    explored = []
    while queue:
        pos = queue.popleft()
        explored.append(pos)
        if pos in food:
            path = []
            while pos != start:
                path.append(pos)
                pos = parents[pos]
            return path[::-1], explored
        actions = list(DIRECTIONS)
        shuffle(actions)  # Equal-length routes get random tie breaking.
        for action in actions:
            neighbor = game.maze.move(pos, action)
            if neighbor not in parents and neighbor not in blocked:
                parents[neighbor] = pos
                queue.append(neighbor)
    return [], explored
