# WordPress Deployment Guide

Complete guide to deploying the Research Profile Platform on WordPress.

## Architecture Overview

The WordPress deployment uses a **hybrid architecture**:

- **WordPress**: Hosts the frontend React application as a theme
- **Node.js Backend**: Separate server handling API requests, database, and file storage
- **PostgreSQL Database**: Connected to the Node.js backend
- **Google Cloud Storage**: File uploads (connected to Node.js backend)

## What You'll Deploy

1. **WordPress Theme** (`research-profile-platform.zip`) - Install on your WordPress site
2. **Node.js Backend** (`wordpress-backend-package.tar.gz`) - Deploy separately on any Node.js hosting

**Important**: Both packages are required. The WordPress theme contains only the frontend; the backend must be deployed separately.

## Prerequisites

- WordPress site (any hosting: Bluehost, SiteGround, WP Engine, etc.)
- Node.js hosting for backend (Replit, Railway, Heroku, VPS, etc.)
- PostgreSQL database (Neon, Supabase, or hosting-provided)
- Google Cloud Storage bucket (for file uploads)

## Part 1: Deploy the Node.js Backend

You must deploy the backend **FIRST** before installing the WordPress theme.

### Step 1A: Deploy Backend to Replit (Easiest)

If you're already on Replit:

1. Your backend is already running!
2. Note your Replit URL: `https://your-project.replit.app`
3. Make sure these environment variables are set:
   - `NODE_ENV=production`
   - `DATABASE_URL`
   - `ADMIN_API_TOKEN`
   - `ALLOWED_ORIGINS=*` (or your WordPress URL)
   - All other required environment variables

### Step 1B: Deploy Backend to Other Platforms

**Recommended Platforms:**
- **Railway**: Automatic deployments, built-in PostgreSQL
- **Heroku**: Popular, easy to use
- **DigitalOcean App Platform**: Flexible, good pricing
- **Render**: Modern, automatic deployments

**Deployment Steps:**

1. Extract `wordpress-backend-package.tar.gz`
2. Upload to your chosen platform
3. Set environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
   ADMIN_API_TOKEN=your-secure-token-here
   ALLOWED_ORIGINS=https://your-wordpress-site.com,https://www.your-wordpress-site.com
   PORT=5000
   ```
4. Install dependencies: `npm install --production`
5. Start server: `npm start`
6. Note your backend URL (e.g., `https://your-app.railway.app`)

### Step 2: Configure CORS for WordPress

The backend needs to allow requests from your WordPress site.

**Environment Variable (REQUIRED):**
```
ALLOWED_ORIGINS=https://yourwordpresssite.com,https://www.yourwordpresssite.com
```

⚠️ **Security**: This variable MUST be set explicitly. If not set, no cross-origin requests will be allowed (secure by default).

**Multiple WordPress sites:**
```
ALLOWED_ORIGINS=https://site1.com,https://site2.com,https://site3.com
```

**Development only (use with caution):**
```
ALLOWED_ORIGINS=*
```

**Note**: Never use `*` in production. Always specify your exact WordPress domain(s).

## Part 2: Install WordPress Theme

### Step 1: Upload Theme to WordPress

1. Download `research-profile-platform.zip`
2. Log into WordPress Admin Dashboard
3. Go to **Appearance > Themes**
4. Click **Add New** > **Upload Theme**
5. Choose `research-profile-platform.zip`
6. Click **Install Now**
7. Click **Activate**

### Step 2: Configure API Connection

1. In WordPress Admin, go to **Settings > Research Profile**
2. Enter your **Backend API URL** (from Part 1)
   - Example: `https://your-project.replit.app`
   - Example: `https://your-app.railway.app`
3. Click **Save Settings**

### Step 3: Set Homepage (Optional)

To make the research platform your homepage:

1. Go to **Settings > Reading**
2. Set "Your homepage displays" to **"A static page"**
3. Create a new page called "Home"
4. Select it as the Homepage
5. Save changes

### Step 4: Test the Installation

1. Visit your WordPress site homepage
2. You should see the Research Profile Platform interface
3. Try navigating (if you have data):
   - Admin dashboard: `/admin`
   - Researcher profile: `/researcher/A5056485484`

## Troubleshooting

### Problem: Blank Page or Loading Forever

**Causes:**
- Backend not running
- Wrong API URL configured
- CORS errors

**Solutions:**
1. Check backend is accessible: Visit `https://your-backend-url/api/health` (should return status)
2. Verify API URL in WordPress settings matches your backend URL exactly
3. Check browser console for errors (F12)
4. Verify `ALLOWED_ORIGINS` environment variable includes your WordPress domain

### Problem: CORS Errors in Browser Console

**Error:**
```
Access to fetch at 'https://backend.com/api/...' from origin 'https://wordpress.com' 
has been blocked by CORS policy
```

**Solution:**
Add your WordPress domain to `ALLOWED_ORIGINS` environment variable on backend:
```
ALLOWED_ORIGINS=https://your-wordpress-site.com
```

Then restart your backend server.

### Problem: 404 Errors for CSS/JS Files

**Causes:**
- Build files not in theme
- Incorrect file paths

**Solutions:**
1. Verify `wordpress-theme/build/` contains:
   - `index.html`
   - `assets/` folder with CSS and JS files
2. Re-upload the theme
3. Clear WordPress cache
4. Clear browser cache

### Problem: Database Connection Errors

**Solutions:**
1. Verify `DATABASE_URL` is set correctly on backend
2. Check PostgreSQL database is accessible
3. Test connection: `psql $DATABASE_URL`
4. Ensure database allows external connections

### Problem: Authentication Not Working

**Note:** The app currently uses Replit Auth which won't work in WordPress deployment.

**Workarounds:**
1. Make profiles public-only (no admin features)
2. Implement alternative authentication system
3. Use admin endpoints with token authentication only

### Problem: File Uploads Failing

**Solutions:**
1. Verify Google Cloud Storage credentials on backend
2. Check `GOOGLE_APPLICATION_CREDENTIALS` environment variable
3. Verify bucket permissions
4. Check backend logs for specific errors

## Updating the Theme

When you make changes to the React app:

### Step 1: Rebuild
```bash
npm run build
```

### Step 2: Update WordPress Theme
```bash
# Copy new build to theme
cp -r dist/public wordpress-theme/build

# Create new theme zip
cd wordpress-theme
zip -r research-profile-platform.zip . -x "*.git*" "*.DS_Store" "create-zip.sh"
```

### Step 3: Re-upload to WordPress
1. **Appearance > Themes**
2. Delete old version (settings are preserved)
3. Upload new `research-profile-platform.zip`
4. Activate

## Updating the Backend

When you make changes to the backend:

### Step 1: Rebuild Backend
```bash
npm run build
```

### Step 2: Deploy Update

**On Replit:** Changes deploy automatically

**On Other Platforms:**
1. Upload new `dist/index.js` to your server
2. Restart the application

## Environment Variables Reference

### Backend Environment Variables

#### Required:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
ADMIN_API_TOKEN=your-secure-random-token
ALLOWED_ORIGINS=https://your-wordpress-site.com
```

#### Optional:
```bash
PORT=5000
SESSION_SECRET=another-random-secret
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcs-key.json
GCS_BUCKET_NAME=your-bucket-name
```

### WordPress Theme Settings

Configured in WordPress Admin:
- **Backend API URL**: Your Node.js backend URL

## Security Best Practices

### 1. Use HTTPS Everywhere
- WordPress site: Enable SSL certificate
- Backend server: Enable HTTPS
- Database: Use SSL connections (`sslmode=require`)

### 2. Strong Tokens
Generate secure tokens:
```bash
openssl rand -base64 32
```

### 3. CORS Configuration
Never use `ALLOWED_ORIGINS=*` in production. Always specify exact domains:
```bash
ALLOWED_ORIGINS=https://yoursite.com,https://www.yoursite.com
```

### 4. Environment Variables
- Never commit secrets to code
- Use platform-provided environment variable management
- Rotate tokens regularly

### 5. Regular Updates
- Keep WordPress updated
- Update Node.js dependencies: `npm update`
- Monitor security advisories

## Performance Optimization

### WordPress Optimization
1. Use a caching plugin (WP Super Cache, W3 Total Cache)
2. Enable gzip compression
3. Use a CDN for static assets
4. Optimize images

### Backend Optimization
1. Enable database connection pooling (already configured)
2. Use Redis for session storage (optional)
3. Monitor resource usage
4. Scale horizontally as needed

## Hosting Recommendations

### WordPress Frontend
- **Budget**: Bluehost, HostGator ($3-10/month)
- **Performance**: WP Engine, Kinsta ($30-100/month)
- **Enterprise**: Pantheon, Pressable ($100+/month)

Requirements: PHP 7.4+, MySQL 5.7+

### Node.js Backend
- **Free/Hobby**: Replit, Railway free tier
- **Production**: Railway ($5+/month), Heroku ($7+/month)
- **Scalable**: DigitalOcean App Platform ($12+/month)
- **Enterprise**: AWS, Google Cloud, Azure

Requirements: Node.js 18+, 512MB RAM minimum

### Database
- **Serverless**: Neon (free tier available), Supabase
- **Managed**: Railway PostgreSQL, Heroku PostgreSQL
- **Self-hosted**: DigitalOcean Droplet, AWS RDS

### File Storage
- **Google Cloud Storage**: Current setup
- **AWS S3**: Alternative option (code supports both)
- **Cloudinary**: For image optimization

## Monitoring & Maintenance

### Health Checks
1. Backend health endpoint: `https://your-backend/api/health`
2. WordPress uptime monitoring
3. Database connection monitoring

### Logs
- **Backend logs**: Check platform logs (Railway, Heroku, etc.)
- **WordPress logs**: Enable WP_DEBUG in development
- **Error tracking**: Consider Sentry or similar service

### Backups
1. **Database**: Daily automated backups
2. **WordPress files**: Weekly backups
3. **Test restores**: Monthly

## Support & Documentation

### Theme Files
- `functions.php` - Theme functionality and API connection
- `index.php` - Main template file
- `style.css` - Theme metadata
- `build/` - React production build

### API Endpoints Used
- `GET /api/researcher/:id/data`
- `GET /api/researcher/:id/publications`
- `GET /api/researcher/:id/topics`
- `POST /api/admin/researcher/profile`
- `POST /api/admin/researcher/:id/sync`

### Getting Help
1. Check WordPress theme settings (Settings > Research Profile)
2. Review browser console for errors (F12)
3. Check backend server logs
4. Verify environment variables
5. Test backend health endpoint

## Architecture Diagram

```
┌─────────────────┐
│   WordPress     │
│   (Frontend)    │
│   Port 80/443   │
└────────┬────────┘
         │ HTTP/HTTPS
         │ Requests
         ▼
┌─────────────────┐      ┌──────────────┐
│   Node.js API   │─────▶│  PostgreSQL  │
│   (Backend)     │      │   Database   │
│   Port 5000     │      └──────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google Cloud   │
│    Storage      │
└─────────────────┘
```

## Quick Command Reference

```bash
# Rebuild frontend
npm run build

# Copy to WordPress theme
cp -r dist/public wordpress-theme/build

# Create WordPress theme zip
cd wordpress-theme && zip -r research-profile-platform.zip . -x "*.git*" "*.DS_Store" "create-zip.sh"

# Create backend deployment package
bash create-wordpress-backend-package.sh

# Generate secure token
openssl rand -base64 32

# Test backend health
curl https://your-backend-url/api/health
```

---

**Ready to deploy?** Follow Part 1 (Backend) then Part 2 (WordPress Theme) in order.

**Questions?** Check the Troubleshooting section or review backend logs for specific errors.
