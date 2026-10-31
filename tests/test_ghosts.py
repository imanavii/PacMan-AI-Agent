import unittest

from game.entities import ghost_target


class GhostTargetTests(unittest.TestCase):
    def target(self, ghost_id, pos=(1, 1), pacman=(10, 10), direction="RIGHT", blinky=(5, 6), mode="chase"):
        return ghost_target(ghost_id, pos, pacman, direction, blinky, (21, 23), mode)

    def test_blinky_targets_pacman(self):
        self.assertEqual(self.target("red"), (10, 10))

    def test_pinky_looks_four_tiles_ahead(self):
        for direction, expected in (("RIGHT", (10, 14)), ("LEFT", (10, 6)),
                                    ("DOWN", (14, 10)), ("UP", (6, 6))):
            with self.subTest(direction=direction):
                self.assertEqual(self.target("pink", direction=direction), expected)

    def test_inky_uses_blinky_and_two_tiles_ahead(self):
        self.assertEqual(self.target("cyan"), (15, 18))
        self.assertEqual(self.target("cyan", blinky=(7, 8)), (13, 16))
        self.assertEqual(self.target("cyan", direction="UP"), (11, 10))

    def test_clyde_switches_at_eight_tile_euclidean_distance(self):
        self.assertEqual(self.target("orange", pos=(10, 2)), (10, 10))
        self.assertEqual(self.target("orange", pos=(10, 3)), (21, 0))
        self.assertEqual(self.target("orange", pos=(5, 5)), (21, 0))

    def test_scatter_targets_are_four_distinct_corners(self):
        expected = {"red": (-1, 22), "pink": (-1, 0), "cyan": (21, 22), "orange": (21, 0)}
        for ghost_id, corner in expected.items():
            with self.subTest(ghost=ghost_id):
                self.assertEqual(self.target(ghost_id, mode="scatter"), corner)

    def test_rejects_unknown_mode(self):
        with self.assertRaises(ValueError):
            self.target("red", mode="invalid")
