import json
import unittest

from game.game_state import GameState
from game.maze import Maze


class GameStateTests(unittest.TestCase):
    def test_collection_and_victory(self):
        game = GameState(Maze(("P.o",)))
        game.step("RIGHT")
        self.assertEqual((game.score, game.tick, game.status), (10, 1, "playing"))
        game.step("LEFT")
        game.step("RIGHT")
        self.assertEqual(game.score, 10)
        game.step("RIGHT")
        self.assertEqual((game.score, game.status), (60, "won"))
        self.assertFalse(game.pellets or game.coins)
        finished = game.to_dict()
        game.step("LEFT")
        self.assertEqual(game.to_dict(), finished)

    def test_wall_and_invalid_moves(self):
        game = GameState(Maze(("P#.",)))
        game.step("RIGHT")
        self.assertEqual((game.pacman, game.tick, game.score), ((0, 0), 1, 0))
        before = game.to_dict()
        with self.assertRaises(ValueError):
            game.step("INVALID")
        self.assertEqual(game.to_dict(), before)

    def test_collisions_respawn_then_end_game(self):
        game = GameState(Maze(("P.Go",)))
        game.step("RIGHT")
        for lives in (2, 1, 0):
            game.step("RIGHT")
            self.assertEqual(game.lives, lives)
            self.assertEqual(game.score, 10)
            if lives:
                self.assertEqual(game.pacman, game.maze.start)
                self.assertEqual(game.status, "playing")
                game.step("RIGHT")
        self.assertEqual(game.status, "lost")
        finished = game.to_dict()
        game.step("LEFT")
        self.assertEqual(game.to_dict(), finished)

    def test_reset_restores_complete_opening_state(self):
        game = GameState(Maze(("P.oG",)))
        opening = game.to_dict()
        game.step("RIGHT")
        game.reset()
        self.assertEqual(game.to_dict(), opening)

    def test_snapshots_are_json_ready_and_detached(self):
        game = GameState()
        snapshot = game.to_dict()
        self.assertEqual(json.loads(json.dumps(snapshot)), snapshot)
        self.assertEqual(snapshot["ghosts"][0]["id"], "red")
        snapshot["pacman"]["pos"][0] = 999
        snapshot["pellets"].clear()
        self.assertEqual(game.pacman, (1, 1))
        self.assertTrue(game.pellets)

    def test_games_do_not_share_state(self):
        first, second = GameState(), GameState()
        first.step("RIGHT")
        self.assertEqual(second.score, 0)
        self.assertEqual(second.tick, 0)
        self.assertNotEqual(first.pellets, second.pellets)

    def test_no_collectibles_is_already_won(self):
        self.assertEqual(GameState(Maze(("P ",))).status, "won")


if __name__ == "__main__":
    unittest.main()
