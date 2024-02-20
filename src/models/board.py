import random

class Board:
    def __init__(self, num_rows, num_cols, board = [], dug = []):
        self.num_rows = num_rows
        self.num_cols = num_cols

        if len(board) == 0 and len(dug) == 0:
            self.num_bombs = num_rows * num_cols * 40 // 100

            self.bombs = []
            self.dug = []
            self.board = self.make_new_board()
            self.assign_values_to_board()
        elif len(board) > 0:
            self.board = board
            self.num_bombs = board.count(-1)
            self.dug = dug
        else:
            raise ValueError("dug cannot have values when board is empty!")

    def make_new_board(self):
        board = [0] * self.num_cols * self.num_rows
        bombs = random.sample(range(0, len(board)), self.num_bombs)
        for bomb in bombs:
            board[bomb] = -1
            self.bombs.append(bomb)

        return board

    def assign_values_to_board(self):
        for bomb in self.bombs:
            row, col = divmod(bomb, self.num_cols)
            for i in range(-1, 2):
                for j in range(-1, 2):
                    new_row, new_col = row + i, col + j
                    index = new_row * self.num_cols + new_col
                    if 0 <= new_row < self.num_rows and 0 <= new_col < self.num_cols and self.board[index] != -1:
                        self.board[index] += 1

    def dig(self, row, col):
        index = row * self.num_cols + col
        self.dug.append(index)

        if self.board[index] == -1:
            return False
        
        for i, j in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            new_index = index + i * self.num_cols + j
            if new_index not in self.dug and 0 <= new_index < self.num_rows * self.num_cols and self.board[new_index] != -1:
                self.dig(new_index // self.num_cols, new_index % self.num_cols)

        return True

    def is_game_won(self):
        undugged = len(self.board) - len(self.dug)
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
                index = i * self.num_cols + j
                val = self.board[index] if self.board[index] != -1 else '*'
                output += f'{val:^3}|'
            output += '\n'

        return output