from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # allow requests from your frontend

# --- Database Setup ---
def init_db():
    conn = sqlite3.connect("submissions.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

# --- Routes ---
@app.route("/submit", methods=["POST"])
def submit():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    # Save to database
    conn = sqlite3.connect("submissions.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO submissions (name, email, message) VALUES (?, ?, ?)",
        (name, email, message)
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "success", "message": "Form submitted successfully!"}), 200


@app.route("/submissions", methods=["GET"])
def get_submissions():
    conn = sqlite3.connect("submissions.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, message FROM submissions")
    rows = cursor.fetchall()
    conn.close()

    submissions = [
        {"id": row[0], "name": row[1], "email": row[2], "message": row[3]}
        for row in rows
    ]
    return jsonify(submissions)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)