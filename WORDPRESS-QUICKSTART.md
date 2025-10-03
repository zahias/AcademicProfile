# WordPress Quick Start Guide

Get your Research Profile Platform running on WordPress in 15 minutes.

## What You're Deploying

- **WordPress Theme**: Frontend React app (`research-profile-platform.zip`)
- **Node.js Backend**: Separate API server (`wordpress-backend-package.tar.gz`)

**Both packages are required** - The theme needs the backend to function.

## Prerequisites Checklist

- [ ] WordPress site (any hosting)
- [ ] Node.js hosting account (Replit, Railway, Heroku, etc.)
- [ ] PostgreSQL database URL
- [ ] Admin token (generate with: `openssl rand -base64 32`)

## Part 1: Deploy Backend (10 minutes)

### Option A: Using Replit (Easiest - Already Set Up!)

Your backend is already running on Replit!

1. Note your URL: `https://your-project.replit.app`
2. **IMPORTANT**: Add environment variable in Replit Secrets:
   ```
   ALLOWED_ORIGINS=https://your-wordpress-site.com
   ```
   (Replace with your actual WordPress URL. This is required for security.)
3. Restart your Replit if needed
4. Done! Move to Part 2.

### Option B: Deploy to Railway (Recommended)

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" > "Deploy from GitHub"
3. Or use the deployment package:
   - Extract `wordpress-backend-package.tar.gz`
   - Upload to Railway
4. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=postgresql://...`
   - `ADMIN_API_TOKEN=<your-token>`
   - `ALLOWED_ORIGINS=https://your-wordpress-site.com`
5. Railway will auto-deploy
6. Note your Railway URL: `https://your-app.railway.app`

### Option C: Deploy to Heroku

1. Install Heroku CLI
2. Extract `wordpress-backend-package.tar.gz`
3. Deploy:
   ```bash
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   heroku config:set DATABASE_URL=postgresql://...
   heroku config:set ADMIN_API_TOKEN=your-token
   heroku config:set ALLOWED_ORIGINS=https://your-wordpress-site.com
   git push heroku main
   ```
4. Note your Heroku URL: `https://your-app.herokuapp.com`

## Part 2: Install WordPress Theme (5 minutes)

### Step 1: Upload Theme

1. Download `research-profile-platform.zip` (if not already downloaded)
2. Log into WordPress Admin
3. Go to **Appearance > Themes**
4. Click **Add New** > **Upload Theme**
5. Choose `research-profile-platform.zip`
6. Click **Install Now**
7. Click **Activate**

### Step 2: Configure API Connection

1. In WordPress Admin, go to **Settings > Research Profile**
2. Enter your Backend API URL:
   - Replit: `https://your-project.replit.app`
   - Railway: `https://your-app.railway.app`
   - Heroku: `https://your-app.herokuapp.com`
3. Click **Save Settings**

### Step 3: Set Homepage (Optional)

To make the research platform your main page:

1. **Settings > Reading**
2. Select "A static page"
3. Choose or create "Home" page
4. Save

### Step 4: Test It!

Visit your WordPress site. You should see the Research Profile Platform!

## Troubleshooting (2 minutes to fix common issues)

### ❌ Blank Page

**Check:**
1. Backend URL is correct in Settings > Research Profile
2. Backend is running (visit `https://your-backend-url/api/health`)
3. Browser console for errors (F12)

**Fix:**
- Update `ALLOWED_ORIGINS` on backend to include your WordPress URL
- Restart backend server

### ❌ CORS Error

**Error message:**
```
Access to fetch... has been blocked by CORS policy
```

**Fix:**
Add to backend environment variables:
```
ALLOWED_ORIGINS=https://your-wordpress-site.com
```

If you have `www` and non-`www` versions:
```
ALLOWED_ORIGINS=https://yoursite.com,https://www.yoursite.com
```

Restart backend.

### ❌ CSS/JS Not Loading

**Fix:**
1. Clear WordPress cache
2. Clear browser cache
3. Re-upload theme if needed

### ❌ Database Errors

**Fix:**
- Verify `DATABASE_URL` on backend
- Run migrations: `npm run db:push`

## Environment Variables Quick Reference

### Backend (Required):
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
ADMIN_API_TOKEN=<generate with: openssl rand -base64 32>
ALLOWED_ORIGINS=https://your-wordpress-site.com
```

### WordPress Theme:
- Set in **Settings > Research Profile**
- Backend API URL: Your backend URL from Part 1

## Deployment Architecture

```
WordPress (Frontend)          Node.js Backend           Database
  ↓                              ↓                         ↓
Your WordPress Site    →    Replit/Railway/Heroku  →   PostgreSQL
Port 80/443                 Port 5000                   Port 5432
```

## Next Steps After Deployment

1. **SSL Certificate**: Enable HTTPS on WordPress (usually automatic)
2. **Custom Domain**: Point your domain to WordPress
3. **Add Content**: Use admin dashboard to add researcher profiles
4. **Performance**: Install caching plugin (WP Super Cache)
5. **Monitoring**: Set up uptime monitoring

## Need Help?

### Quick Checks
1. Backend health: `curl https://your-backend-url/api/health`
2. WordPress theme active: **Appearance > Themes**
3. API URL correct: **Settings > Research Profile**
4. Environment variables set: Check your hosting dashboard

### Common Commands
```bash
# Generate admin token
openssl rand -base64 32

# Test backend
curl https://your-backend-url/api/health

# Check package contents
tar -tzf wordpress-backend-package.tar.gz | head -20
```

### Documentation
- **Full Guide**: See `WORDPRESS-DEPLOYMENT.md`
- **Backend Setup**: See `README.txt` inside backend package
- **Theme Install**: See `INSTALL.txt` inside theme

## Support

**Backend not responding?**
- Check hosting platform logs
- Verify environment variables
- Restart the service

**WordPress errors?**
- Check WordPress error logs
- Enable WP_DEBUG temporarily
- Check theme is activated

**CORS issues?**
- Double-check `ALLOWED_ORIGINS` includes your WordPress URL
- No typos in the URL (include `https://`)
- Restart backend after changing environment variables

---

## Success Checklist

- [ ] Backend deployed and running
- [ ] Backend URL noted
- [ ] `ALLOWED_ORIGINS` set with WordPress URL
- [ ] WordPress theme uploaded
- [ ] WordPress theme activated
- [ ] Backend API URL configured in WordPress
- [ ] Site loads without errors
- [ ] Can navigate to researcher profiles

## Time Estimate

- **Part 1 (Backend)**: 5-10 minutes
- **Part 2 (WordPress)**: 5 minutes
- **Testing & Troubleshooting**: 5 minutes
- **Total**: ~15 minutes

---

**Ready to go?** Start with Part 1 (Deploy Backend), then move to Part 2 (Install Theme).

**Already deployed?** Visit your WordPress site and enjoy your Research Profile Platform!
