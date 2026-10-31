"""A* food search with a Manhattan-distance heuristic."""

from heapq import heappop, heappush
from random import random

from game.maze import DIRECTIONS


def search(game):
    start = game.pacman
    food = game.pellets | game.coins
    if not food:
        return [], []
    blocked = set(game.ghosts)

    def heuristic(pos):
        return min(abs(pos[0] - r) + abs(pos[1] - c) for r, c in food)

    frontier = [(heuristic(start), random(), 0, start)]
    costs = {start: 0}
    parents = {start: None}
    explored = []
    while frontier:
        _, _, cost, pos = heappop(frontier)
        if cost != costs[pos]:
            continue
        explored.append(pos)
        if pos in food:
            path = []
            while pos != start:
                path.append(pos)
                pos = parents[pos]
            return path[::-1], explored
        for action in DIRECTIONS:
            neighbor = game.maze.move(pos, action)
            new_cost = cost + 1
            if neighbor == pos or neighbor in blocked or new_cost >= costs.get(neighbor, float("inf")):
                continue
            costs[neighbor] = new_cost
            parents[neighbor] = pos
            heappush(frontier, (new_cost + heuristic(neighbor), random(), new_cost, neighbor))
    return [], explored
