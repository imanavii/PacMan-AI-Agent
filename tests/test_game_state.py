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
        game = GameState(Maze(("P..Go",)))
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





class MovingGhostStateTests(unittest.TestCase):
    def test_default_four_ghosts_move_and_keep_color_identity(self):
        game = GameState()
        before = game.ghosts
        game.step("UP")  # Pac-Man is blocked; ghosts must still advance.
        self.assertNotEqual(game.ghosts, before)
        self.assertEqual([g["id"] for g in game.to_dict()["ghosts"]], ["red", "pink", "cyan", "orange"])
        for old, new in zip(before, game.ghosts):
            self.assertTrue(game.maze.is_open(new))
            self.assertEqual(abs(old[0] - new[0]) + abs(old[1] - new[1]), 1)

    def test_swap_collision_resets_positions_modes_but_keeps_score(self):
        game = GameState(Maze(("P..Go",)))
        opening = game.ghosts
        game.step("RIGHT")
        self.assertEqual(game.score, 10)
        game.step("RIGHT")
        self.assertEqual((game.lives, game.score, game.tick), (2, 10, 2))
        self.assertEqual(game.pacman, game.maze.start)
        self.assertEqual(game.ghosts, opening)
        self.assertEqual(game.ghost_elapsed_ms, 0)
        self.assertNotIn((0, 1), game.pellets)

    def test_same_destination_collision_takes_one_life(self):
        game = GameState(Maze(("P.Go",)))
        game.step("RIGHT")
        self.assertEqual(game.lives, 2)
        self.assertEqual(game.score, 0)

    def test_mode_change_reverses_a_ghost(self):
        game = GameState(Maze(("P######", "#######", "# G   #", "#######", "#.#####")))
        game.ghost_elapsed_ms = 6650
        game.step("LEFT")
        self.assertEqual(game.ghosts, ((2, 3),))
        self.assertEqual(game.ghost_directions, ("RIGHT",))

    def test_reset_restores_ghost_directions_and_clock(self):
        game = GameState()
        opening = game.to_dict()
        game.step("UP")
        game.reset()
        self.assertEqual(game.to_dict(), opening)
        self.assertEqual(game.ghost_directions, ("LEFT",) * 4)
        self.assertEqual(game.ghost_elapsed_ms, 0)

    def test_invalid_action_does_not_advance_ghosts_or_clock(self):
        game = GameState()
        opening = game.to_dict()
        with self.assertRaises(ValueError):
            game.step("INVALID")
        self.assertEqual(game.to_dict(), opening)
        self.assertEqual(game.ghost_elapsed_ms, 0)


if __name__ == "__main__":
    unittest.main()
