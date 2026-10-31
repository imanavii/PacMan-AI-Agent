import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

import main
from game.game_state import GameState
from game.maze import Maze


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)
        self.addCleanup(self.client.close)
        self.client.post("/api/reset")

    def test_state_is_read_only_and_has_four_ghosts(self):
        first = self.client.get("/api/state")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.json(), self.client.get("/api/state").json())
        self.assertEqual(first.json()["tick"], 0)
        self.assertEqual(len(first.json()["ghosts"]), 4)

    def test_step_advances_real_game(self):
        opening = self.client.get("/api/state").json()
        response = self.client.post("/api/step")
        self.assertEqual(response.status_code, 200)
        state = response.json()
        self.assertEqual(state["tick"], 1)
        self.assertNotEqual(state["pacman"], opening["pacman"])
        self.assertNotEqual(state["ghosts"], opening["ghosts"])
        self.assertEqual(state["score"], 10)

    def test_reset_restores_game_and_demo_controller(self):
        opening = self.client.get("/api/state").json()
        first_step = self.client.post("/api/step").json()
        self.client.post("/api/step")
        self.assertEqual(self.client.post("/api/reset").json(), opening)
        self.assertEqual(self.client.post("/api/step").json(), first_step)

    def test_terminal_game_stops_stepping(self):
        with patch.object(main, "game", GameState(Maze(("P.",)))):
            self.client.post("/api/reset")
            won = self.client.post("/api/step").json()
            self.assertEqual(won["status"], "won")
            self.assertEqual(self.client.post("/api/step").json(), won)

    def test_lost_game_and_controller_reset_after_collision(self):
        with patch.object(main, "game", GameState(Maze(("PG.",)))):
            self.client.post("/api/reset")
            for _ in range(3):
                result = self.client.post("/api/step").json()
            self.assertEqual(result["status"], "lost")
            self.assertEqual(result["lives"], 0)
            self.assertEqual(self.client.post("/api/step").json(), result)
            self.assertEqual(self.client.post("/api/reset").json()["lives"], 3)

    def test_wrong_http_methods_do_not_change_game(self):
        opening = self.client.get("/api/state").json()
        self.assertEqual(self.client.get("/api/step").status_code, 405)
        self.assertEqual(self.client.get("/api/reset").status_code, 405)
        self.assertEqual(self.client.get("/api/state").json(), opening)


if __name__ == "__main__":
    unittest.main()
