import unittest

from game.maze import Maze


class MazeTests(unittest.TestCase):
    def test_default_tiles_and_starts(self):
        maze = Maze()
        self.assertEqual(maze.start, (1, 1))
        self.assertEqual(maze.positions("G"), {(3, 3), (3, 4), (3, 5), (3, 6)})
        self.assertEqual(len(maze.positions("o")), 2)
        self.assertTrue(all(set(row) <= {"#", " "} for row in maze.grid))

    def test_moves_respect_walls_and_edges(self):
        maze = Maze(("P.#", "..o"))
        self.assertEqual(maze.move((0, 0), "UP"), (0, 0))
        self.assertEqual(maze.move((0, 0), "LEFT"), (0, 0))
        self.assertEqual(maze.move((0, 1), "RIGHT"), (0, 1))
        self.assertEqual(maze.move((0, 0), "DOWN"), (1, 0))
        self.assertFalse(maze.is_open((2, 0)))
        with self.assertRaises(ValueError):
            maze.move((0, 0), "DIAGONAL")

    def test_rejects_invalid_layouts(self):
        for layout in ((), ("",), ("P.", "."), ("..",), ("PP",), ("PX",), (None,), ("PGGGGG",)):
            with self.subTest(layout=layout), self.assertRaises(ValueError):
                Maze(layout)

    def test_layout_is_copied(self):
        rows = ["P."]
        maze = Maze(rows)
        rows[0] = "##"
        self.assertEqual(maze.layout, ("P.",))


if __name__ == "__main__":
    unittest.main()
