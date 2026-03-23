# 🔧 Backend API Documentation

FastAPI-based REST API for the portfolio portfolio with Supabase integration.

## 📁 Files Overview

- **main.py** - FastAPI application entry point
- **models.py** - Pydantic models for request/response validation
- **database.py** - Supabase client initialization and database operations
- **routes/contact_routes.py** - API endpoints for contact management
- **requirements_fastapi.txt** - Python package dependencies

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements_fastapi.txt
```

### 2. Configure Environment

Create `.env` file:

```env
ENVIRONMENT=development
PORT=8000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

### 3. Run Server

```bash
python main.py
```

### 4. Access API

- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 📚 API Endpoints

### Contact Management

#### Submit Contact Form
```
POST /api/contact
Content-Type: application/json

{
  "name": "Your Name",
  "email": "your@email.com",
  "message": "Your message here"
}
```

**Validation Rules:**
- `name`: 2-100 characters, required
- `email`: Valid email format, required
- `message`: 10-5000 characters, required

**Response:**
```json
{
  "success": true,
  "message": "Message submitted successfully",
  "data": {
    "id": "uuid-here",
    "name": "Your Name",
    "email": "your@email.com",
    "message": "Your message",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Get All Messages
```
GET /api/messages
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

#### Delete All Messages
```
DELETE /api/messages
```

**Response:**
```json
{
  "success": true,
  "message": "All messages deleted successfully"
}
```

## 🏛️ Architecture

### Layer Structure

1. **Main (main.py)**
   - FastAPI app initialization
   - CORS middleware setup
   - Route registration
   - Static file serving

2. **Models (models.py)**
   - Request/Response Pydantic models
   - Validation rules
   - Documentation strings

3. **Database (database.py)**
   - Supabase client initialization
   - CRUD operations
   - Error handling and logging

4. **Routes (routes/contact_routes.py)**
   - API endpoint definitions
   - Route logic
   - Response formatting

### Data Flow

```
Frontend Request
    ↓
FastAPI Route Handler
    ↓
Pydantic Validation
    ↓
Database Operation
    ↓
Supabase/PostgreSQL
    ↓
Response Formatting
    ↓
Frontend Response
```

## 🗄️ Database Schema

### Contacts Table

```sql
id              UUID (Primary Key)
name            TEXT (Required)
email           TEXT (Required)
message         TEXT (Required)
created_at      TIMESTAMP (Auto-generated)
```

### Indexes

- `idx_contacts_created_at` - For fast retrieval by date
- `idx_contacts_email` - For filtering by email

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| ENVIRONMENT | Runtime environment | `development` or `production` |
| PORT | Server port | `8000` |
| SUPABASE_URL | Supabase project URL | `https://project.supabase.co` |
| SUPABASE_KEY | Supabase anon key | `eyJ...` |

## 🧪 Testing

### Using FastAPI Swagger UI
```
http://localhost:8000/docs
```

### Using cURL

```bash
# Submit message
curl -X POST "http://localhost:8000/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello world test message here"}'

# Get messages
curl -X GET "http://localhost:8000/api/messages"

# Delete messages
curl -X DELETE "http://localhost:8000/api/messages"
```

### Using Python Requests

```python
import requests

# Submit
response = requests.post(
    "http://localhost:8000/api/contact",
    json={
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Great portfolio!"
    }
)
print(response.json())

# Get
response = requests.get("http://localhost:8000/api/messages")
print(response.json())
```

## 📊 Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 201 | Created | Contact saved successfully |
| 200 | OK | Messages retrieved successfully |
| 400 | Bad Request | Invalid input data |
| 422 | Validation Error | Email format invalid |
| 500 | Server Error | Database connection failed |

## 🔄 Error Handling

All errors return structured responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

## 📝 Logging

Logs are printed to console with timestamps:

```
[INFO] ✅ Supabase initialized successfully
[INFO] 📨 New contact submission from John Doe
[INFO] ✅ Contact message created from john@example.com
[ERROR] ❌ Error creating contact message: [error details]
```

## 🚀 Performance Tips

1. **Indexes**: Database indexes on `created_at` and `email` for faster queries
2. **Pagination**: Future: add limit/offset for large message lists
3. **Caching**: Consider caching for GET /api/messages
4. **Rate Limiting**: Add rate limiting to prevent spam

## 🔑 Production Considerations

- ✅ Use strong secrets for SUPABASE_KEY
- ✅ Enable HTTPS
- ✅ Set ENVIRONMENT=production
- ✅ Add authentication for admin endpoints
- ✅ Monitor error logs
- ✅ Set up backup strategy for Supabase
- ✅ Use connection pooling for database

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.104.1 | Web framework |
| uvicorn | 0.24.0 | ASGI server |
| pydantic | 2.5.0 | Data validation |
| supabase | 2.3.4 | Database client |
| httpx | 0.25.0 | HTTP requests |
| python-dotenv | 1.0.0 | Environment variables |

---

**For full setup instructions, see [README_PRODUCTION.md](../README_PRODUCTION.md)**
