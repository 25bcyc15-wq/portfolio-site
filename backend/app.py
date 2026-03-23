import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configuration
PORT = int(os.getenv('PORT', 5000))
IS_PRODUCTION = os.getenv('FLASK_ENV') == 'production'
DATABASE_URL = os.getenv('DATABASE_URL')

print('=== BACKEND STARTUP ===')
print('Port:', PORT)
print('FLASK_ENV:', os.getenv('FLASK_ENV', 'undefined'))
print('Is Production:', IS_PRODUCTION)
print('DATABASE_URL:', '✓ present' if DATABASE_URL else '✗ missing')

# Set up database
if DATABASE_URL and IS_PRODUCTION:
    # PostgreSQL for production
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    # SQLite for development
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# Database Model
class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'message': self.message,
            'created_at': self.created_at.isoformat()
        }

# Initialize database
def init_db():
    with app.app_context():
        db.create_all()
        print('Database initialized')

# Serve frontend
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
        
        # Create and save message
        contact_msg = ContactMessage(name=name, email=email, message=message)
        db.session.add(contact_msg)
        db.session.commit()
        
        return jsonify({'message': 'Message received successfully', 'id': contact_msg.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f'Error: {str(e)}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/messages', methods=['GET'])
def get_messages():
    try:
        messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
        return jsonify([msg.to_dict() for msg in messages]), 200
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/messages', methods=['DELETE'])
def delete_messages():
    try:
        ContactMessage.query.delete()
        db.session.commit()
        return jsonify({'message': 'All messages deleted'}), 200
    except Exception as e:
        db.session.rollback()
        print(f'Error: {str(e)}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=PORT, debug=not IS_PRODUCTION)
