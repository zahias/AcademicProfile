# A2hosting Deployment Checklist

Use this checklist to ensure a smooth deployment to A2hosting.

## ✅ Pre-Deployment Checklist

### Before You Start
- [ ] A2hosting account with cPanel access
- [ ] Database connection string ready
  - [ ] Neon database URL, OR
  - [ ] A2hosting PostgreSQL database created
- [ ] Generate admin token: `openssl rand -base64 32`
- [ ] Download `deployment-package.tar.gz` (336KB)

### Files You Need
- [ ] `deployment-package.tar.gz` - The deployment package
- [ ] `DEPLOYMENT.md` - Full documentation
- [ ] `QUICK-START.md` - Quick reference guide
- [ ] `.env.a2hosting.template` - Environment variables reference

## 📋 Step-by-Step Deployment

### Step 1: Database Setup
- [ ] Have your database connection string ready
- [ ] Format: `postgresql://user:pass@host:port/dbname?sslmode=require`
- [ ] Test connection if possible

### Step 2: Upload Package
- [ ] Log into cPanel
- [ ] Navigate to destination folder (e.g., `public_html/research-platform`)
- [ ] Upload `deployment-package.tar.gz`
- [ ] Extract the archive
- [ ] Verify files extracted correctly

### Step 3: Configure Node.js App
- [ ] Go to cPanel → Setup Node.js App
- [ ] Click CREATE APPLICATION
- [ ] Set Node.js version: 18.x or 20.x
- [ ] Set Application root: (your folder path)
- [ ] Set Application URL: `/research` (or your choice)
- [ ] Set Application startup file: `dist/index.js`
- [ ] Click Create

### Step 4: Environment Variables
Add these in Node.js Selector (click Save after each):

- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = (your PostgreSQL connection string)
- [ ] `ADMIN_API_TOKEN` = (your generated token)
- [ ] `BASE_PATH` = (your Application URL, e.g., `/research`) - Optional but recommended

### Step 5: Install Dependencies
- [ ] In Node.js Selector, click "Run NPM Install"
- [ ] Wait for completion (2-3 minutes)
- [ ] Check for any errors in the output

### Step 6: Database Migration
Choose one method:

#### Option A: cPanel Terminal
- [ ] Open cPanel Terminal
- [ ] `cd ~/your-app-folder`
- [ ] `npm run db:push`

#### Option B: SSH
- [ ] SSH into server
- [ ] `cd ~/your-app-folder`
- [ ] `source ~/virtualenv/your-app-folder/18/bin/activate`
- [ ] `npm run db:push`

### Step 7: Start Application
- [ ] Go back to Setup Node.js App
- [ ] Find your application
- [ ] Click RESTART
- [ ] Wait for application to start

### Step 8: Test
- [ ] Visit: `https://yourdomain.com/research` (or your URL)
- [ ] Verify site loads
- [ ] Check that CSS/JS loads correctly
- [ ] Test basic navigation

## 🐛 Troubleshooting Checklist

### If Site Won't Load
- [ ] Check Application is running in Node.js Selector
- [ ] Verify Application URL matches your routes
- [ ] Check error logs in cPanel
- [ ] Confirm startup file is `dist/index.js`

### If Database Won't Connect
- [ ] Verify DATABASE_URL is correct
- [ ] Check database allows external connections
- [ ] Test with `psql $DATABASE_URL`

### If Static Files Missing
- [ ] Verify `dist/public` folder exists
- [ ] Check Application URL setting
- [ ] Restart application

### If Getting 500 Errors
- [ ] Check Node.js app error logs
- [ ] Verify all environment variables set
- [ ] Confirm npm install completed
- [ ] Check Passenger logs

## ⚠️ Important Notes

### Authentication Warning
- [ ] **CRITICAL**: Replit Auth won't work on A2hosting
- [ ] Login/authentication features will not function
- [ ] Options:
  - Make profiles public-only (remove auth)
  - Implement alternative authentication

### Phusion Passenger Routes
- [ ] If routes don't work, they may need path prefix
- [ ] Contact developer if routing issues occur

## 📊 Post-Deployment

### Verify Everything Works
- [ ] Site is accessible
- [ ] Database connections work
- [ ] Static assets load
- [ ] No errors in logs
- [ ] SSL certificate active

### Security
- [ ] HTTPS enabled
- [ ] Strong ADMIN_API_TOKEN set
- [ ] Database credentials secure
- [ ] No secrets in code

### Optional Enhancements
- [ ] Set up custom domain
- [ ] Configure monitoring
- [ ] Set up database backups
- [ ] Enable gzip compression
- [ ] Configure error notifications

## 📝 Maintenance Checklist

### To Update Application Later
- [ ] Make changes locally
- [ ] Run: `bash create-deployment-package.sh`
- [ ] Upload new `deployment-package.tar.gz`
- [ ] Extract (overwrite existing)
- [ ] Run npm install (if dependencies changed)
- [ ] Run `npm run db:push` (if schema changed)
- [ ] Restart application

### Regular Maintenance
- [ ] Monitor error logs weekly
- [ ] Database backups configured
- [ ] Keep dependencies updated
- [ ] Monitor resource usage

## 🆘 Getting Help

### Documentation
- [ ] Read `DEPLOYMENT.md` for detailed instructions
- [ ] Read `QUICK-START.md` for quick reference
- [ ] Check `.env.a2hosting.template` for environment setup

### Support Resources
- [ ] A2hosting Knowledge Base: https://www.a2hosting.com/kb/
- [ ] A2hosting Support Ticket
- [ ] Your development team

---

## Quick Commands Reference

```bash
# Generate admin token
openssl rand -base64 32

# Create deployment package
bash create-deployment-package.sh

# Upload via SSH
scp deployment-package.tar.gz user@yoursite.com:~/your-app-folder/

# Database migration
npm run db:push

# View package contents
tar -tzf deployment-package.tar.gz
```

---

**Last Updated**: After completing all deployment preparation tasks
**Package Version**: deployment-package.tar.gz (336KB)
**Status**: ✅ Production Ready
