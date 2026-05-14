# Deployment Guide - Railway.app

This guide will walk you through deploying the AI & SAP Newsletter app from localhost to Railway.app.

## Prerequisites

- GitHub account (to link your repository)
- Railway.app account (free at https://railway.app)
- Your project pushed to a GitHub repository

## Step-by-Step Deployment

### 1. **Create a GitHub Repository**

```bash
cd e:/AI\ GIG
git init
git add .
git commit -m "Initial commit: AI & SAP Newsletter app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-sap-newsletter.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

### 2. **Sign Up for Railway.app**

1. Go to https://railway.app
2. Click "Start Project"
3. Sign in with GitHub (recommended)
4. Grant Railway access to your GitHub account

---

### 3. **Deploy from GitHub**

1. In Railway dashboard, click **"Create New Project"**
2. Select **"Deploy from GitHub repo"**
3. Search for and select your `ai-sap-newsletter` repository
4. Railway will automatically detect the Node.js application

---

### 4. **Configure Environment Variables**

After deployment starts, configure these environment variables in Railway:

1. Go to your project → **"Variables"** tab
2. Add the following variables:

```
GEMINI_API_KEY=AIzaSyDxDet8mL00fFB1aZNCohiCkx5gUYeEsMo
BREVO_API_KEY=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
BREVO_SENDER_EMAIL=noreply@newsletter.com
BREVO_SENDER_NAME=AI & SAP Newsletter
NODE_ENV=production
PORT=3000
```

---

### 5. **Get Your Public URL**

1. Once deployed, go to **"Deployments"** tab
2. Find the deployment URL (it will look like: `https://ai-sap-newsletter-production.up.railway.app`)
3. Your app is now live! 🎉

---

## What's Deployed

✅ **Subscriber Portal** → `https://your-url.railway.app/`
✅ **Admin Panel** → `https://your-url.railway.app/admin`
✅ **API Endpoints** → `https://your-url.railway.app/api/*`
✅ **Scheduled Tasks** → Running automatically
  - 3 AM: Fetch news from Gemini API
  - 6 AM: Send newsletters via Brevo

---

## Database & Storage

⚠️ **Important:** SQLite database is stored as a file on the Railway server. In Railway's free tier, this persists across deployments, but for production, consider:

- **Option 1** (Current): SQLite persists on Railway's filesystem
- **Option 2** (Recommended for scale): Migrate to PostgreSQL (Railway has free PostgreSQL)

### To upgrade to PostgreSQL:

1. Add PostgreSQL plugin in Railway dashboard
2. Update database connection in `backend/database/db.js`
3. Update table schemas to PostgreSQL syntax

---

## Monitoring & Logs

**View Logs in Railway:**
1. Go to your project → **"Logs"** tab
2. Watch real-time server output
3. Errors, scheduled tasks, email sends all logged here

---

## Custom Domain (Optional)

To use your own domain:

1. Buy a domain (GoDaddy, Namecheap, etc.)
2. In Railway, go to **"Settings"** → **"Domains"**
3. Add your custom domain
4. Update DNS records as instructed
5. Point your domain to Railway

---

## Troubleshooting

### App won't start?
- Check logs for errors
- Verify all environment variables are set
- Check Node.js version (should be 18.x)

### Emails not sending?
- Verify Brevo API key is correct
- Check email logs in admin panel
- Test with `/api/admin/send-newsletter` endpoint

### Database issues?
- Logs show any connection errors
- Database initializes automatically on first run
- Check `backend/database/newsletter.db` exists

---

## Next Steps

### After Deployment:
1. Test subscriber signup at `https://your-url/`
2. Access admin at `https://your-url/admin` (login: admin/admin123)
3. Verify scheduled tasks run (check logs at 3 AM and 6 AM)
4. Monitor email delivery via Brevo dashboard

### Optional Enhancements:
- Add custom domain
- Set up monitoring/alerts
- Migrate to PostgreSQL for better scalability
- Add authentication to admin panel
- Implement subscriber confirmations via email
- Add more robust error handling

---

## Support

For Railway.app issues:
- Railway Docs: https://docs.railway.app
- Railway Community: https://railway.app/community

For application issues:
- Check logs in Railway dashboard
- Review error messages in browser console
- Verify API keys are correct

---

## Cost Breakdown

**Railway.app Pricing:**
- Free tier: $5 monthly credit (usually covers a basic Node.js + SQLite app)
- Pay-as-you-go: Additional usage beyond credit
- For this app at low volume: **Likely free or under $5/month**

---

**Your app is now live on the web! 🚀**
