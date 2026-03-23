# 🚀 Deployment Guide

Complete step-by-step guide to deploy your portfolio to production.

## 📋 Deployment Checklist

- [ ] Supabase account created
- [ ] Database table created
- [ ] Environment variables configured
- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Service deployed
- [ ] Environment variables added to Render
- [ ] Site tested in production

---

## 🌐 Option 1: Deploy to Render (Recommended, Free)

### Prerequisites

- GitHub repository (with code)
- Supabase account (free)
- Render account ([render.com](https://render.com))

### Step 1: Prepare Code

Make sure your repository has:
- `backend/main.py`
- `backend/models.py`
- `backend/database.py`
- `backend/routes/contact_routes.py`
- `backend/requirements_fastapi.txt`
- `frontend/` folder with HTML/CSS/JS
- `render.yaml` configuration file
- `.env.example` (but NOT `.env`)

```bash
# From repo root
git add .
git commit -m "Production-ready FastAPI portfolio with Supabase"
git push origin main
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in with GitHub
3. Click **New Project**
4. Fill in:
   - Project Name: `portfolio`
   - Database Password: (strong password)
   - Region: (closest to you)
5. Wait for deployment (2-3 minutes)

### Step 3: Create Database Table

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Paste this SQL:

```sql
-- Create contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for contact form)
CREATE POLICY "Allow public insert" ON contacts FOR INSERT WITH CHECK (true);

-- Allow public read (optional)
CREATE POLICY "Allow public read" ON contacts FOR SELECT USING (true);
```

4. Click **Run**

### Step 4: Get Supabase Keys

1. Go to **Settings → API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 5: Create Render Service

1. Go to [render.com](https://render.com)
2. Sign up / Log in with GitHub
3. Click **New → Web Service**
4. Select your GitHub repository
5. Configure:
   - **Name**: `arsha-portfolio` (or your preference)
   - **Environment**: `Python 3`
   - **Region**: `Oregon` (or closest)
   - **Branch**: `main`
   - **Build Command**: 
     ```
     pip install -r backend/requirements_fastapi.txt
     ```
   - **Start Command**: 
     ```
     cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
6. Click **Create Web Service**

### Step 6: Add Environment Variables

After service is created:

1. Go to **Environment**
2. Add these variables:
   ```
   ENVIRONMENT=production
   PORT=8000
   SUPABASE_URL=https://your-project.region.supabase.co
   SUPABASE_KEY=your-anon-key-here
   ```
3. Click **Save** - deployment will restart

### Step 7: Wait for Deployment

Monitor the **Logs** tab:
- You should see build commands running
- Final message: `Running on http://...`
- Service URL shown at top

### Step 8: Test Your Site

Your portfolio is live at:
```
https://arsha-portfolio.onrender.com
```

Test by:
1. Opening the URL in browser
2. Submitting a test message
3. Checking messages appear in Supabase

---

## 🔄 Continuous Deployment

Once set up, Render auto-deploys on every GitHub push:

```bash
# Make a change to your code
echo "New content" >> frontend/index.html

# Commit and push
git add .
git commit -m "Updated portfolio"
git push origin main

# Render automatically builds and deploys!
# Check deployment progress in Render dashboard
```

---

## 📊 Monitoring Production

### View Logs

1. In Render dashboard, click your service
2. Go to **Logs** tab
3. See real-time logs

### Check Database

1. In Supabase, go to **Table Editor**
2. Click `contacts` table
3. See all submitted messages

### Performance Monitoring

- Render provides metrics on dashboard
- Monitor CPU, memory, disk usage
- Check response times

---

## 🔐 Security Checklist

- [ ] Never commit `.env` file
- [ ] Keep SUPABASE_KEY secret
- [ ] Use HTTPS (automatic with Render)
- [ ] Enable RLS in Supabase (Row Level Security)
- [ ] Regular backups (Supabase auto-backups)
- [ ] Monitor logs for errors
- [ ] Update dependencies regularly

---

## 🆘 Troubleshooting Deployment

### Issue: Build fails with missing dependencies

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**: Ensure `backend/requirements_fastapi.txt` is in repository

### Issue: Service shows error 500

**Check**:
1. Logs tab for error messages
2. SUPABASE_URL is correct
3. SUPABASE_KEY is correct
4. Database table exists

### Issue: Frontend not loading

**Check**:
1. Frontend files in `frontend/` folder
2. `main.py` has static file serving setup
3. URL structure is correct

### Issue: Messages not saving

**Check**:
1. Supabase credentials in Render environment
2. Database table `contacts` exists
3. RLS policies allow inserts

### View Full Logs

```bash
# SSH into Render service (if available)
render run "echo 'Your command here'"

# Or monitor real-time in UI
```

---

## 🐛 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Connection refused` | Supabase URL wrong | Check credentials |
| `Invalid token` | Wrong SUPABASE_KEY | Copy from Settings→API |
| `Table not found` | Schema not created | Run SQL in Supabase SQL Editor |
| `502 Bad Gateway` | Service crashed | Check logs |

---

## 📈 Performance Optimization

### Frontend
- Files are cached in browser
- CSS/JS minified for production
- Images optimized

### Backend
- Async operations with FastAPI
- Database indexes for fast queries
- Connection pooling ready

### Database
- Supabase handles scaling
- Automatic backups daily
- CDN for static files

---

## 🆕 Adding Features

### After Initial Deployment

To add new features:

1. Add code to your local repo
2. Test locally (`python main.py`)
3. Commit and push
4. Render auto-deploys

### Example: Add Projects Table

```sql
-- In Supabase SQL Editor
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    link TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Then update your backend to use it!

---

## 💰 Cost Analysis

### Supabase (Free Tier)
- ✅ 500 MB database storage
- ✅ Up to 50,000 rows
- ✅ Unlimited API requests
- ✅ Perfect for portfolio

### Render (Free Tier)
- ✅ Auto-deploys from GitHub
- ✅ Free SSL/HTTPS
- ✅ Auto-scale
- ⚠️ Service spins down after 15 min inactivity (acceptable for portfolio)

**Total Cost**: $0/month! 🎉

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [GitHub Actions](https://github.com/features/actions) (for advanced CI/CD)

---

## ✅ Getting Help

If deployment fails:

1. Check **Logs** in Render dashboard
2. Verify credentials in Supabase
3. Ensure `render.yaml` includes fastapi commands
4. Check GitHub Actions (if using)
5. See [README_PRODUCTION.md](./README_PRODUCTION.md)

---

**Your portfolio is production-ready! 🚀**
