import random

class Board:
    def __init__(self, num_rows, num_cols):
        self.num_rows = num_rows
        self.num_cols = num_cols
        self.num_bombs = num_rows * num_cols * 20 // 100

        self.bombs = set()
        self.dug = set()
        self.board = self.make_new_board()
        self.assign_values_to_board()       

    def make_new_board(self):
        board = [[0] * self.num_cols for _ in range(0, self.num_rows)]
        bombs = random.sample(range(0, self.num_rows * self.num_cols), self.num_bombs)
        for bomb in bombs:
            r = bomb // self.num_rows
            c = bomb % self.num_cols
            board[r][c] = -1
            self.bombs.add((r, c))

        return board

    def assign_values_to_board(self):
        for row, col in self.bombs:
            for r in [-1, 0, 1]:
                for c in [-1, 0, 1]:
                    new_row = row + r
                    new_col = col + c
                    if new_row >= 0 and new_row < self.num_rows and new_col >= 0 and new_col < self.num_cols and self.board[new_row][new_col] != -1:
                        self.board[new_row][new_col] += 1

    def dig(self, row, col):
        self.dug.add((row, col))

        if self.board[row][col] == -1:
            return False
        
        for i, j in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            r = row + i
            c = col + j
            if (r, c) not in self.dug and r >= 0 and r < self.num_rows and c >= 0 and c < self.num_cols and self.board[r][c] != -1:
                self.dig(r, c)

        return True

    def is_game_won(self):
        undugged = self.num_rows * self.num_cols - len(self.dug)
        return undugged == self.num_bombs

    def __str__(self):
        output = ' ' * 4
        # first row
        for i in range(0, self.num_cols):
            output += f'{i:^4}'
        output += '\n'

        for i in range(0, self.num_rows):
            output += f'{i:>2} |'
            for j in range(0, self.num_cols):
                val = self.board[i][j] if self.board[i][j] != -1 else '*'
                output += f'{val:^3}|'
            output += '\n'

        return output