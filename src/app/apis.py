from flask import request, jsonify, current_app as app
from pymongo import MongoClient
from bson.objectid import ObjectId
from models import board

client = MongoClient('mongodb://localhost:27017')
db = client['minesweeper']
collection = db['board']

@app.route('/start', methods=['POST'])
def create_board():
    if 'num_rows' not in request.json:
        return jsonify({'error': 'Number of rows is required'}), 400
    if 'num_cols' not in request.json:
        return jsonify({'error': 'Number of columns is required'}), 400
    
    game_board = board.Board(request.json['num_rows'], request.json['num_cols'])
    
    data = {
        'board': game_board.board,
        'num_rows': game_board.num_rows,
        'num_cols': game_board.num_cols,
        'dug': game_board.dug,
        'result': 0
    }
    result = collection.insert_one(data)
    data['id'] = str(result.inserted_id)
    del data['_id']
    # print(data)
    
    return jsonify(data)

@app.route('/board', methods=['GET'])
def get_board():
    if 'id' not in request.json:
        return jsonify({'error': 'ID is required'}), 400
    
    try:
        object_id = ObjectId(request.json['id'])
        curr_board = collection.find_one({'_id': object_id})

        if curr_board:
            # Convert ObjectId to string for JSON serialization
            curr_board['_id'] = str(curr_board['_id'])
            return jsonify(curr_board)
        else:
            return jsonify({'message': 'Board not found'}), 404

    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@app.route('/board', methods=['POST'])
def dig():
    if 'id' not in request.json:
        return jsonify({'error': 'ID is required'}), 400
    if 'row' not in request.json:
        return jsonify({'error': 'Row is required'}), 400
    if 'col' not in request.json:
        return jsonify({'error': 'Column is required'}), 400

    try:
        object_id = ObjectId(request.json['id'])
        curr_board = collection.find_one({'_id': object_id})

        if curr_board:
            updated_board = board.Board(curr_board['num_rows'], curr_board['num_cols'], curr_board['board'], curr_board['dug'])
            if not updated_board.dig(request.json['row'], request.json['col']):
                curr_board['result'] = -1
                
            if updated_board.is_game_won() and curr_board['result'] != -1:
                curr_board['result'] = 1

            curr_board['board'] = updated_board.board
            curr_board['dug'] = updated_board.dug
            del curr_board['_id']

            collection.update_one({'_id': object_id}, {'$set': curr_board})

            # Convert ObjectId to string for JSON serialization
            curr_board['id'] = str(object_id)

            return jsonify(curr_board)
        else:
            return jsonify({'message': 'Board not found'}), 404

    except Exception as e:
        return jsonify({'message': str(e)}), 500
