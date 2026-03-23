# Backend setup guide

To run the Python backend locally:

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the development server:
   ```
   python app.py
   ```

The backend will start on http://localhost:5000

## Project Structure

- `app.py` - Main Flask application
- `requirements.txt` - Python dependencies
- `.env` - Environment variables (development)

## API Endpoints

- `POST /contact` - Submit a contact message
- `GET /messages` - Retrieve all contact messages
- `DELETE /messages` - Clear all messages
- `GET /health` - Health check endpoint

## Database

- Development: SQLite (portfolio.db)
- Production: PostgreSQL (via DATABASE_URL environment variable)
