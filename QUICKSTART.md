# ⚡ Quick Start Guide

Get your portfolio running in **5 minutes**!

## 🎯 Local Development Setup

### Step 1: Prerequisites (1 min)

✅ Python 3.11+ installed
✅ Supabase account (free)
✅ Git installed

### Step 2: Clone & Setup (2 min)

```bash
# Clone repository
git clone https://github.com/25bcyc15-wq/portfolio-site.git
cd portfolio-site

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # macOS/Linux

# Install dependencies
cd backend
pip install -r requirements_fastapi.txt
```

### Step 3: Configure Supabase (1 min)

1. Go to [supabase.com](https://supabase.com) → Create Project
2. Get your `SUPABASE_URL` and `SUPABASE_KEY`
3. Create `.env` file in `backend/`:

```env
ENVIRONMENT=development
PORT=8000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

4. In Supabase SQL Editor, run:

```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
```

### Step 4: Run Server (1 min)

```bash
# From backend/ directory
python main.py
```

✅ You should see:
```
🚀 Starting Portfolio API Server
📍 Running on: http://localhost:8000
📚 API Docs: http://localhost:8000/docs
```

### Step 5: Open in Browser

- **Portfolio**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs ← Test API here!
- **Submit Message**: Fill form and see it in messages

---

## 🧪 Quick API Tests

### Test 1: Submit Message

In **API Docs** (http://localhost:8000/docs):
1. Find `POST /api/contact`
2. Click "Try it out"
3. Fill in:
   ```json
   {
     "name": "Your Name",
     "email": "your@email.com",
     "message": "This is a great portfolio!"
   }
   ```
4. Click "Execute"
5. See the response!

### Test 2: View Messages

1. Find `GET /api/messages`
2. Click "Try it out"
3. Click "Execute"
4. See all messages!

### Test 3: Delete Messages

1. Find `DELETE /api/messages`
2. Click "Try it out"
3. Click "Execute"
4. Messages deleted! ✅

---

## 📦 Project Structure

```
portfolio-site/
├── frontend/              # Your website UI
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/              # FastAPI server
│   ├── main.py           # ← Start here
│   ├── models.py
│   ├── database.py
│   ├── routes/
│   └── .env              # ← Add your keys here
└── README_PRODUCTION.md  # Full docs
```

---

## 🚀 Deploy to Render (Free!)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "FastAPI portfolio with Supabase"
git push
```

### Step 2: Create Render Service

1. Go to [render.com](https://render.com)
2. Connect GitHub → Select your repo
3. Settings:
   - **Build**: `pip install -r backend/requirements_fastapi.txt`
   - **Start**: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Env Vars

In Render dashboard:
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
ENVIRONMENT=production
```

### Step 4: Deploy!

Done! Your site is live at:
```
https://your-service-name.onrender.com
```

---

## 🎨 Customize Your Portfolio

Edit `frontend/index.html`:
- Change name, title, skills
- Add your projects
- Update social links

Edit `frontend/style.css`:
- Change colors (search `--primary`, `--secondary`)
- Adjust spacing
- Customize fonts

---

## ❓ Common Issues

### "ModuleNotFoundError: fastapi"
```bash
pip install -r requirements_fastapi.txt
```

### "Port 8000 already in use"
```bash
# Use different port
PORT=8001 python main.py
```

### "Supabase connection failed"
- Check SUPABASE_URL is correct
- Check SUPABASE_KEY is correct
- Verify internet connection

### "No styles loading"
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors

---

## 📚 Next Steps

After quick start:

1. Read [README_PRODUCTION.md](./README_PRODUCTION.md) for full details
2. Read [BACKEND.md](./BACKEND.md) for API documentation
3. Customize portfolio with your info
4. Deploy to Render
5. Share with the world! 🌍

---

## 📞 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/contact` | Submit message |
| GET | `/api/messages` | Get all messages |
| DELETE | `/api/messages` | Delete all messages |
| GET | `/health` | Health check |
| GET | `/docs` | Interactive API docs |

---

**You're all set! 🎉 Start building!**
