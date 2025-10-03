# Quick Start: Deploy to A2hosting

This is a simplified guide to get your Research Profile Platform deployed to A2hosting as quickly as possible.

## ⚠️ Important Warning

**This application uses Replit authentication which won't work on A2hosting.** You'll need to modify the authentication or make the app public-only. For testing, you can proceed with deployment but authentication features won't work.

## 📋 What You Need

1. ✅ A2hosting account with cPanel
2. ✅ PostgreSQL database (use your existing Neon database or create one on A2hosting)
3. ✅ Database connection string
4. ✅ The `deployment-package.tar.gz` file

## 🚀 5-Minute Deployment

### Step 1: Get Your Database Connection String

**Using Neon Database (current):**
```
postgresql://username:password@host.region.aws.neon.tech/dbname?sslmode=require
```

**Using A2hosting PostgreSQL:**
1. cPanel → MySQL/PostgreSQL Databases
2. Create database and user
3. Format: `postgresql://user:pass@localhost:5432/dbname?sslmode=require`

### Step 2: Upload the Package

1. Log into cPanel
2. File Manager → Navigate to `public_html` or subdirectory
3. Upload `deployment-package.tar.gz`
4. Right-click → Extract

### Step 3: Set Up Node.js App

1. cPanel → Software → **Setup Node.js App**
2. Click **CREATE APPLICATION**
3. Fill in:
   - **Node.js version**: 18.x or 20.x
   - **Application root**: `public_html/research-platform` (or your folder)
   - **Application URL**: `/research` (or your preferred URL)
   - **Application startup file**: `dist/index.js`
4. Click **Create**

### Step 4: Add Environment Variables

In the same Node.js App interface, scroll to **Environment Variables**:

Add these (click "Save" after each):

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your PostgreSQL connection string |
| `ADMIN_API_TOKEN` | Generate with: `openssl rand -base64 32` |

### Step 5: Install Dependencies

1. Stay in Node.js App interface
2. Click **Run NPM Install**
3. Wait 2-3 minutes for installation

### Step 6: Run Database Migration

**Option A - Using cPanel Terminal (if available):**
```bash
cd ~/public_html/research-platform
npm run db:push
```

**Option B - Using SSH:**
```bash
ssh user@yoursite.com
cd ~/public_html/research-platform
source ~/virtualenv/public_html/research-platform/18/bin/activate
npm run db:push
```

**Option C - Skip for now** (database will auto-migrate on first run in some cases)

### Step 7: Start the Application

1. Go back to **Setup Node.js App**
2. Find your application
3. Click **RESTART**

### Step 8: Visit Your Site

Go to: `https://yourdomain.com/research`

(Replace `/research` with whatever you set as Application URL)

## 🐛 Troubleshooting

### "Cannot GET /research"
- **Fix**: Check Application URL matches your routes
- Verify startup file is `dist/index.js`

### Database Connection Error
- **Fix**: Verify DATABASE_URL is correct
- Test with: `psql $DATABASE_URL`
- Ensure database allows external connections

### 500 Internal Server Error
- **Fix**: Check error logs in cPanel
- Verify all environment variables are set
- Ensure npm install completed successfully

### Application Won't Start
- **Fix**: Check Node.js app logs in cPanel interface
- Verify Node.js version is 18.x or higher
- Make sure all files extracted correctly

### Static Files Not Loading (CSS/JS missing)
- **Fix**: Verify Application URL setting
- Check that `dist/public` folder exists
- Restart application

## 📝 Important Configuration Notes

### Phusion Passenger Path Requirement

A2hosting uses Phusion Passenger which requires special routing. If your Application URL is `/research`, all routes must start with `/research`.

**This may require code modification.** Contact your developer if routes don't work.

### Authentication Issue

Replit OIDC won't work on A2hosting. You have 2 options:

1. **Public-only mode**: Remove all authentication (for read-only profiles)
2. **Alternative auth**: Implement username/password authentication

For now, the app will deploy but login won't work.

## 📞 Getting Help

**Package Contents Issue:**
```bash
# Verify package contents
tar -tzf deployment-package.tar.gz
```

**Check Application Logs:**
- cPanel → Setup Node.js App → [Your App] → View logs
- cPanel → Metrics → Errors → View error logs

**A2hosting Support:**
- Knowledge Base: https://www.a2hosting.com/kb/
- Open Ticket: https://my.a2hosting.com/

## 🔄 Update Your App Later

1. Make changes locally
2. Run: `bash create-deployment-package.sh`
3. Upload new `deployment-package.tar.gz`
4. Extract (overwrite existing files)
5. Restart app in cPanel

## ✅ Success Checklist

- [ ] Database connection string obtained
- [ ] Package uploaded and extracted
- [ ] Node.js app created in cPanel
- [ ] Environment variables set (NODE_ENV, DATABASE_URL, ADMIN_API_TOKEN)
- [ ] NPM install completed
- [ ] Database migration run (or will auto-run)
- [ ] Application restarted
- [ ] Site accessible at your URL

## 🎯 Next Steps After Deployment

1. **SSL Certificate**: Enable in cPanel (usually auto-enabled)
2. **Custom Domain**: Point domain to A2hosting
3. **Implement Auth**: Replace Replit auth with alternative
4. **Monitoring**: Set up uptime monitoring
5. **Backups**: Configure database backups

---

**Need detailed instructions?** See `DEPLOYMENT.md` for comprehensive documentation.

**Need to create package again?** Run: `bash create-deployment-package.sh`
