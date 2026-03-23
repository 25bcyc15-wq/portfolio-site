# Vercel Deployment Guide

Deploy your FastAPI portfolio to Vercel with one click!

## Prerequisites

- GitHub account with your repository
- Vercel account (free tier at [vercel.com](https://vercel.com))
- Supabase project with credentials

## Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** or **Sign In** with GitHub
3. Grant Vercel access to your repositories

## Step 2: Import Your Project

1. Click **New Project** or **Add New** → **Project**
2. Find and select your `portfolio-site` repository
3. Click **Import**

## Step 3: Configure Environment Variables

1. Under **Environment Variables**, add:

   ```
   Name: SUPABASE_URL
   Value: https://tzbjqifwrsocyeolmeal.supabase.co
   
   Name: SUPABASE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YmpxaWZ3cnNvY3llb2xtZWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzA1MTcsImV4cCI6MjA4OTgwNjUxN30.Hk1C7AVZCaR8JOE3L0PgLR64xHoI-sGyarPDwdARav4
   
   Name: ENVIRONMENT
   Value: production
   ```

## Step 4: Deploy

1. Review the project configuration:
   - **Framework**: None (using Python runtime)
   - **Build Command**: (default)
   - **Output Directory**: frontend

2. Click **Deploy**

Vercel will build and deploy your project within 2-5 minutes.

## Step 5: Access Your Live Site

Your portfolio will be live at: `https://portfolio-site.vercel.app`

The exact URL will be shown in the Vercel dashboard after deployment.

## Automatic Deployments

After the initial deployment:
- **Every push to `main`** → Automatic preview/production deployment
- **Pull requests** → Automatic preview deployment URL
- **Rollback**: Use Vercel dashboard to rollback to any previous deployment

## API Endpoints

Your FastAPI endpoints are available at:

- **Contact Form**: `POST https://portfolio-site.vercel.app/api/contact`
- **View Messages**: `GET https://portfolio-site.vercel.app/api/messages`
- **Health Check**: `GET https://portfolio-site.vercel.app/health`

## Troubleshooting

### Build Fails with Missing Modules

**Solution**: Ensure `requirements.txt` is in the root directory with all dependencies.

### CORS Errors

**Solution**: Check that your Vercel domain is in the CORS whitelist in `api/index.py`.

### 404 Errors on API Routes

**Solution**: Verify environment variables are set in Vercel dashboard under **Settings** → **Environment Variables**.

### Database Connection Errors

**Cause**: Supabase credentials are missing or incorrect

**Solution**:
1. Go to Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
4. Redeploy: Click **Deployments** → Select latest → Click **Redeploy**

## Custom Domain

To use a custom domain:

1. Go to your Vercel project **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Monitor Deployments

1. Open Vercel dashboard
2. Click your project
3. View **Deployments** tab to see:
   - Build status
   - Deployment logs
   - Performance metrics

## Scale & Performance

Vercel automatically scales your API:
- Unlimited requests
- Auto-scales serverless functions
- CDN for frontend static files
- 99.95% uptime SLA

---

**Next Steps**:
- Add your custom domain (optional)
- Monitor performance in Vercel Analytics
- Update your portfolio content in `frontend/index.html`
- Test API endpoints at `/health` and `/docs` (auto-generated OpenAPI docs)

For more help: [Vercel Documentation](https://vercel.com/docs)
