from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Initialize database
def init_db():
    with sqlite3.connect("messages.db") as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL
            )
        """)
        conn.commit()

@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"message": "All fields are required."}), 400

    try:
        with sqlite3.connect("messages.db") as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
                (name, email, message)
            )
            conn.commit()
        return jsonify({"message": "Message saved successfully!"}), 201
    except Exception as e:
        return jsonify({"message": "Database error", "error": str(e)}), 500

@app.route("/messages", methods=["GET"])
def get_messages():
    try:
        with sqlite3.connect("messages.db") as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM contact_messages")
            rows = cursor.fetchall()

        messages = [
            {"id": row[0], "name": row[1], "email": row[2], "message": row[3]}
            for row in rows
        ]
        return jsonify(messages)
    except Exception as e:
        return jsonify({"message": "Database error", "error": str(e)}), 500

if __name__ == "__main__":
    init_db()
    app.run(port=5000, debug=True)