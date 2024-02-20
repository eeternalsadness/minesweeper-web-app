import pytest
import src.models.board as board

class Test_Board:
    def setup_method(self):
        self.board = board.Board(20, 10)

        pre_made_board = [
            2, -1, 2, 1, 2, 1, 1, 0, 1, -1, -1, 4, 4, -1, 3, -1, 2, 1, 2, 1, 3, -1, -1, 6, -1, 4, 3, -1, 2, 1, -1, 6, -1, -1, -1, 5, -1, 4, -1, 2, -1, -1, 4, 5, 4, -1, -1, 4, 4, -1, -1, 5, -1, 4, -1, 4, 3, 4, -1, -1, 1, 3, -1, -1, 2, 2, -1, 3, -1, -1, 2, 3, 3, 3, 2, 3, 2, 3, 2, 2, -1, -1, 3, 3, -1, 5, -1, 2, 0, 0, -1, -1, 3, -1, -1, -1, -1, 2, 0, 0
        ]
        self.pre_made_board = board.Board(10, 10, pre_made_board)

    def test_num_bombs(self):
        assert self.board.num_bombs == 80

    def test_make_new_board(self):
        count = self.board.board.count(-1)

        assert count == self.board.num_bombs
        assert count == len(self.board.bombs)

    def test_dig(self):
        r = 0
        c = 0
        for i in range(0, len(self.board.board)):
            if self.board.board[i] != -1:
                r = i // self.board.num_cols
                c = i % self.board.num_cols
                break

        r_bomb = self.board.bombs[0] // self.board.num_cols
        c_bomb = self.board.bombs[0] % self.board.num_cols

        assert self.board.dig(r, c) == True
        assert len(self.board.dug) > 0
        assert self.board.dig(r_bomb, c_bomb) == False

    def test_pre_made_board(self):
        assert self.pre_made_board.num_bombs == 40
        assert self.pre_made_board.dig(0, 1) == False
        assert self.pre_made_board.dig(0, 2) == True
        assert len(self.pre_made_board.dug) == 22