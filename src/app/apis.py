from flask import request, jsonify, current_app as app
from models import board

game_board = None

@app.route('/start', methods=['POST'])
def create_board():
    if 'num_rows' not in request.json:
        return jsonify({'error': 'Number of rows is required'}), 400
    if 'num_cols' not in request.json:
        return jsonify({'error': 'Number of columns is required'}), 400
    
    game_board = board.Board(request.json['num_rows'], request.json['num_cols'])

    return jsonify({
        'board': game_board.board,
        'dug': list(game_board.dug)
    })

