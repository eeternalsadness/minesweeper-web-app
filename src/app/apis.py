from flask import request, jsonify, current_app as app
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from models import board

client = MongoClient('mongodb://localhost:27017')
db = client['minesweeper']
collection = db['board']

CORS(app)

@app.route('/start', methods=['POST'])
def create_board():
    if 'num_rows' not in request.json:
        return jsonify({'error': 'Number of rows is required'}), 400
    if 'num_cols' not in request.json:
        return jsonify({'error': 'Number of columns is required'}), 400
    
    game_board = board.Board(request.json['num_rows'], request.json['num_cols'])
    
    try:
        data = {
            'board': game_board.board,
            'num_rows': game_board.num_rows,
            'num_cols': game_board.num_cols,
            'dug': game_board.dug,
            'flags': game_board.flags,
            'result': 0
        }

        result = collection.insert_one(data)
        data['_id'] = str(result.inserted_id)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
    return jsonify(data)

@app.route('/board', methods=['GET'])
def get_board():
    try:
        object_id = ObjectId(request.args.get('id'))
        curr_board = collection.find_one({'_id': object_id})

        if curr_board:
            # check if game is already over
            if curr_board['result'] != 0:
                return jsonify({'error': 'Game is already over'}), 400
            
            # Convert ObjectId to string for JSON serialization
            curr_board['_id'] = str(curr_board['_id'])
            return jsonify(curr_board)
        else:
            return jsonify({'error': 'Board not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/board', methods=['DELETE'])
def delete_board():
    try:
        object_id = ObjectId(request.args.get('id'))
        collection.delete_one({'_id': object_id})
        return jsonify({'message': f'Deleted board {object_id}'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/dig', methods=['POST'])
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
            updated_board = board.Board(
                num_rows = curr_board['num_rows'], 
                num_cols = curr_board['num_cols'], 
                board = curr_board['board'], 
                dug = curr_board['dug'], 
                flags = curr_board['flags']
                )
            if not updated_board.dig(request.json['row'], request.json['col']):
                curr_board['result'] = -1
                
            if updated_board.is_game_won() and curr_board['result'] != -1:
                curr_board['result'] = 1

            curr_board['board'] = updated_board.board
            curr_board['dug'] = updated_board.dug

            collection.update_one({'_id': object_id}, {'$set': curr_board})

            # Convert ObjectId to string for JSON serialization
            curr_board['_id'] = str(object_id)

            return jsonify(curr_board)
        else:
            return jsonify({'error': 'Board not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/flag', methods=['POST'])
def flag():
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
            updated_board = board.Board(
                num_rows = curr_board['num_rows'], 
                num_cols = curr_board['num_cols'], 
                board = curr_board['board'], 
                dug = curr_board['dug'], 
                flags = curr_board['flags']
                )
            
            updated_board.flag(request.json['row'], request.json['col'])

            curr_board['flags'] = updated_board.flags

            collection.update_one({'_id': object_id}, {'$set': curr_board})

            # Convert ObjectId to string for JSON serialization
            curr_board['_id'] = str(object_id)

            return jsonify(curr_board)
        else:
            return jsonify({'error': 'Board not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500