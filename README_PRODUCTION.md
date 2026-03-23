# 🚀 Arsha Ashok - Full Stack Portfolio

A production-grade, pixel-perfect portfolio website built with **FastAPI**, **Supabase**, and modern frontend technologies.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Database Setup (Supabase)](#database-setup-supabase)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Best Practices](#best-practices)

---

## ✨ Features

- **Modern Dark Theme UI** with smooth animations
- **Responsive Design** (mobile, tablet, desktop)
- **FastAPI Backend** with async/await support
- **Supabase Database** for reliable data storage
- **Pydantic Validation** for input validation
- **CORS Enabled** for cross-origin requests
- **Interactive Elements** (nav, smooth scroll, hover effects)
- **Contact Form** with server-side validation
- **Message Management** (view, submit, delete)
- **API Documentation** with Swagger UI

---

## 🏗️ Project Structure

```
portfolio-site/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── style.css           # Styling (full responsive + dark theme)
│   ├── script.js           # Frontend logic & API integration
│   └── assets/             # Images, icons (if any)
│
├── backend/
│   ├── main.py             # FastAPI application setup
│   ├── models.py           # Pydantic data models
│   ├── database.py         # Supabase client & database operations
│   ├── routes/
│   │   ├── __init__.py
│   │   └── contact_routes.py   # API endpoints
│   ├── .env.example        # Environment variables template
│   ├── requirements_fastapi.txt  # Python dependencies
│   └── README.md           # Backend documentation
│
├── render.yaml             # Render deployment config
└── README.md               # This file
```

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid
- **JavaScript (ES6+)** - Interactive features
- **Font Awesome** - Icons
- **Responsive Design** - Mobile-first approach

### Backend
- **FastAPI** - Modern async Python framework
- **Uvicorn** - ASGI web server
- **Pydantic** - Data validation
- **Python 3.11+** - Language

### Database
- **Supabase** - PostgreSQL hosted backend
- **PostgreSQL** - Relational database

### Deployment
- **Render** - Cloud hosting

---

## 📦 Prerequisites

### Required
- Python 3.11 or higher
- Supabase account (free tier available)
- Git & GitHub repository
- Node.js (optional, for frontend tooling)

### Optional
- Postman or curl (for API testing)
- VS Code with Python extensions
- Git Bash or Terminal

---

## 🔧 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/25bcyc15-wq/portfolio-site.git
cd portfolio-site
```

### Step 2: Set Up Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Backend Dependencies

```bash
cd backend
pip install -r requirements_fastapi.txt
```

### Step 4: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your actual values (see next section for Supabase setup):

```env
ENVIRONMENT=development
PORT=8000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

---

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click **New Project**
4. Fill in project details:
   - Name: `portfolio-site`
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
5. Click **Create New Project** and wait for deployment

### Step 2: Get API Keys

1. In Supabase dashboard, go to **Settings → API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_KEY`
3. Paste these into your `.env` file

### Step 3: Create Contacts Table

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Create contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Enable RLS (Row Level Security) - optional but recommended
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow public reads (optional)
CREATE POLICY "Allow public read" ON contacts FOR SELECT USING (true);

-- Allow public inserts (for contact submissions)
CREATE POLICY "Allow public insert" ON contacts FOR INSERT WITH CHECK (true);
```

4. Click **Run**
5. You should see "Success" message

### Step 4: Verify Table

1. Go to **Table Editor**
2. You should see your `contacts` table listed

---

## 🏃 Running Locally

### Start the Backend (FastAPI Server)

```bash
cd backend
python main.py
```

Expected output:
```
==================================================
🚀 Starting Portfolio API Server
📍 Running on: http://localhost:8000
📚 API Docs: http://localhost:8000/docs
🔍 ReDoc: http://localhost:8000/redoc
==================================================
```

### Open in Browser

- **Portfolio**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (interactive Swagger UI)
- **ReDoc**: http://localhost:8000/redoc (alternative API docs)

---

## 📡 API Documentation

### Base URL
- **Local**: `http://localhost:8000`
- **Production**: `https://your-domain.com`

### Endpoints

#### 1. Submit Contact Message
```
POST /api/contact
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Great portfolio! Let's connect."
}

Response (201 Created):
{
  "success": true,
  "message": "Message submitted successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Great portfolio! Let's connect.",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Get All Messages
```
GET /api/messages

Response (200 OK):
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Great portfolio!",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 3. Delete All Messages
```
DELETE /api/messages

Response (200 OK):
{
  "success": true,
  "message": "All messages deleted successfully"
}
```

#### 4. Health Check
```
GET /health

Response:
{
  "status": "ok",
  "environment": "development",
  "database": "supabase"
}
```

---

## 🧪 API Testing

### Using Swagger UI (Recommended)
1. Go to `http://localhost:8000/docs`
2. Try endpoints directly from the UI
3. No additional setup needed

### Using cURL

```bash
# Submit contact message
curl -X POST "http://localhost:8000/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello, this is a test message!"
  }'

# Get all messages
curl -X GET "http://localhost:8000/api/messages"

# Delete all messages
curl -X DELETE "http://localhost:8000/api/messages"

# Health check
curl -X GET "http://localhost:8000/health"
```

### Using Postman

1. Install [Postman](https://www.postman.com/downloads/)
2. Create new request
3. Set method, URL, headers, body
4. Send

**Example:**
- Method: `POST`
- URL: `http://localhost:8000/api/contact`
- Headers: `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "message": "Testing the API"
  }
  ```

---

## 🚀 Deployment

### Deploy to Render (Free Tier)

#### Step 1: Push to GitHub

```bash
git add .
git commit -m "Production-ready portfolio with FastAPI and Supabase"
git push origin main
```

#### Step 2: Create Render Service

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **New → Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `arsha-portfolio`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements_fastapi.txt`
   - **Start Command**: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Click **Create Web Service**

#### Step 3: Set Environment Variables

1. In Render dashboard, go to service settings
2. Click **Environment**
3. Add variables:
   ```
   ENVIRONMENT=production
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   ```

#### Step 4: Deploy

Render auto-deploys on each push. Your site will be live at:
```
https://arsha-portfolio.onrender.com
```

---

## 🔒 Best Practices & Security

### Frontend
- ✅ Input validation (email, message length)
- ✅ XSS prevention (HTML escaping)
- ✅ Responsive error handling
- ✅ Loading states for async operations

### Backend
- ✅ Pydantic validation for all inputs
- ✅ Type hints for code clarity
- ✅ Comprehensive error handling
- ✅ Logging for debugging
- ✅ CORS properly configured

### Database
- ✅ Use environment variables for credentials
- ✅ Row-Level Security (RLS) policies
- ✅ Database indexes for performance
- ✅ Never commit `.env` files

### Production
- ✅ Use HTTPS always
- ✅ Add rate limiting (future: consider `slowapi`)
- ✅ Add authentication for admin endpoints (future)
- ✅ Use production ASGI server (Uvicorn configured)
- ✅ Monitor error logs regularly

---

## 🐛 Troubleshooting

### Issue: ModuleNotFoundError: No module named 'fastapi'

**Solution:**
```bash
pip install -r requirements_fastapi.txt
```

### Issue: Supabase connection fails

**Check:**
- SUPABASE_URL is correct
- SUPABASE_KEY is correct
- `.env` file exists in backend/ folder
- Internet connection is active

### Issue: Port 8000 already in use

**Solution:**
```bash
# Use different port
PORT=8001 python main.py

# Or kill existing process
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: Frontend not loading

**Check:**
- Backend is running
- Navigate to `http://localhost:8000` (not just `/static`)
- Check browser console for errors

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## 📝 License

This project is open source and available under the ISC License.

---

## 👤 Author

**Arsha Ashok**
- 💻 Full Stack Developer
- 🎯 Skills: C, Python, SQL, HTML, CSS, JavaScript
- 📍 Portfolio: [Your Website](https://portfolio-site-1-sw21.onrender.com)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

**Happy coding! 🚀**
