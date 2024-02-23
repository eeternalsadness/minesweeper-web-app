import random

class Board:
    def __init__(self, num_rows, num_cols, board = [], dug = [], flags = []):
        self.num_rows = num_rows
        self.num_cols = num_cols

        if len(board) == 0 and len(dug) == 0:
            self.num_bombs = num_rows * num_cols * 40 // 100

            self.bombs = []
            self.board = self.make_new_board()
            self.assign_values_to_board()
        elif len(board) > 0:
            self.board = board
            self.num_bombs = board.count(-1)
        else:
            raise ValueError("dug cannot have values when board is empty!")
        
        self.dug = dug
        self.flags = flags

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
                    index = self.row_col_to_index(new_row, new_col)
                    if 0 <= new_row < self.num_rows and 0 <= new_col < self.num_cols and self.board[index] != -1:
                        self.board[index] += 1

    def dig(self, row, col):
        index = self.row_col_to_index(row, col)
        print(row, col, self.board[index])
        
        if index not in self.dug:
            self.dug.append(index)
            if self.board[index] == -1:
                return False
            
            # TODO - rework so it only digs minimal number of cells
            for i, j in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                new_row, new_col = row + i, col + j
                new_index = self.row_col_to_index(new_row, new_col)
                if (
                    0 <= new_row < self.num_rows
                    and 0 <= new_col < self.num_cols
                    and new_index not in self.dug 
                    and new_index not in self.flags
                    and self.board[new_index] != -1
                ):
                    self.dig(new_row, new_col)

        else:
            if self.board[index] != 0 and self.board[index] == self.count_neighboring_flags(row, col):
                for i in range(-1, 2):
                    for j in range(-1, 2):
                        new_row, new_col = row + i, col + j
                        index = self.row_col_to_index(new_row, new_col)
                        if (
                            0 <= new_row < self.num_rows
                            and 0 <= new_col < self.num_cols
                            and index not in self.dug 
                            and index not in self.flags
                        ):
                            if not self.dig(new_row, new_col):
                                return False
                    
        return True
    
    def flag(self, row, col):
        index = self.row_col_to_index(row, col)
        if index in self.flags:
            self.flags.remove(index)
        else:
            self.flags.append(index)
    
    def count_neighboring_flags(self, row, col):
        flags = 0
        for i in range(-1, 2):
            for j in range(-1, 2):
                new_row, new_col = row + i, col + j
                index = self.row_col_to_index(new_row, new_col)
                if (
                    0 <= new_row < self.num_rows
                    and 0 <= new_col < self.num_cols
                    and index in self.flags
                ):
                    flags += 1
                    print(new_row, new_col)

        return flags

    def is_game_won(self):
        undugged = len(self.board) - len(self.dug)
        return undugged == self.num_bombs
    
    def row_col_to_index(self, row, col):
        return row * self.num_cols + col

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