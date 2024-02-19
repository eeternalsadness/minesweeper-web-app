import pytest
import src.board as board

class Test_Board:
    def setup_method(self):
        self.board = board.Board(10, 10)

    def test_num_bombs(self):
        assert self.board.num_bombs == 20

    def test_make_new_board(self):
        count = 0
        for row in self.board.board:
            count += row.count(-1)

        assert count == self.board.num_bombs
        assert count == len(self.board.bombs)

    def test_dig(self):
        r = 0
        c = 0
        for i in range(0, self.board.num_rows):
            for j in range(0, self.board.num_cols):
                if self.board.board[i][j] != -1:
                    r = i
                    c = j
                    break

        r_bomb = 0
        c_bomb = 0
        for bomb in self.board.bombs:
            r_bomb, c_bomb = bomb
            break

        assert self.board.dig(r, c) == True
        assert len(self.board.dug) > 0
        assert self.board.dig(r_bomb, c_bomb) == False