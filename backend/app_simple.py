import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__, static_folder='../frontend', static_url_path='')

# Configuration
PORT = int(os.getenv('PORT', 5000))

print('=== BACKEND STARTUP ===')
print('Port:', PORT)
print('FLASK_ENV:', os.getenv('FLASK_ENV', 'development'))

# Initialize CORS
CORS(app)

# In-memory storage for messages (for local development)
messages_db = []

# Serve static files from frontend folder
@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('../frontend', filename)

# API Routes

@app.route('/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not all(key in data for key in ['name', 'email', 'message']):
            return jsonify({'message': 'Missing required fields'}), 400
        
        name = data['name'].strip()
        email = data['email'].strip()
        message = data['message'].strip()
        
        if not name or not email or not message:
            return jsonify({'message': 'All fields are required'}), 400
        
        # Create message object
        msg_obj = {
            'id': len(messages_db) + 1,
            'name': name,
            'email': email,
            'message': message,
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Store in memory
        messages_db.append(msg_obj)
        
        print(f'New message from {name} ({email})')
        return jsonify({'message': 'Message received successfully', 'id': msg_obj['id']}), 201
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/messages', methods=['GET'])
def get_messages():
    try:
        # Return messages in reverse order (newest first)
        return jsonify(messages_db[::-1]), 200
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/messages', methods=['DELETE'])
def delete_messages():
    try:
        global messages_db
        messages_db = []
        return jsonify({'message': 'All messages deleted'}), 200
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'environment': os.getenv('FLASK_ENV', 'development')}), 200

if __name__ == '__main__':
    print(f'\n✅ Server starting on http://localhost:{PORT}')
    print('📂 Serving frontend from:', os.path.join(os.path.dirname(__file__), '../frontend'))
    print('Press Ctrl+C to stop\n')
    app.run(host='0.0.0.0', port=PORT, debug=True)
