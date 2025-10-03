#!/bin/bash

# WordPress Backend Deployment Package Creator
# This script creates a deployment-ready package for the Node.js backend
# to be deployed alongside WordPress

set -e

echo "🚀 Creating WordPress backend deployment package..."

# Create temporary directory
TEMP_DIR="wordpress-backend-temp"
PACKAGE_NAME="wordpress-backend-package.tar.gz"

# Clean up any existing temp directory
rm -rf "$TEMP_DIR"
rm -f "$PACKAGE_NAME"

# Create temporary directory structure
mkdir -p "$TEMP_DIR"

echo "📦 Copying production files..."

# Copy built backend
cp -r dist "$TEMP_DIR/"

# Copy migrations (if they exist)
if [ -d "migrations" ]; then
  cp -r migrations "$TEMP_DIR/"
fi

# Copy shared schemas
if [ -d "shared" ]; then
  cp -r shared "$TEMP_DIR/"
fi

# Create production package.json
echo "📝 Creating production package.json..."
node -e "
const pkg = require('./package.json');
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  type: pkg.type,
  license: pkg.license,
  scripts: {
    start: pkg.scripts.start,
    'db:push': pkg.scripts['db:push']
  },
  dependencies: pkg.dependencies
};
require('fs').writeFileSync('$TEMP_DIR/package.json', JSON.stringify(prodPkg, null, 2));
"

# Copy package-lock.json for consistent dependency installation
if [ -f "package-lock.json" ]; then
  cp package-lock.json "$TEMP_DIR/"
fi

# Copy essential config files
echo "📋 Copying configuration files..."

if [ -f "drizzle.config.ts" ]; then
  cp drizzle.config.ts "$TEMP_DIR/"
fi

if [ -f "tsconfig.json" ]; then
  cp tsconfig.json "$TEMP_DIR/"
fi

# Create .npmrc for production install
cat > "$TEMP_DIR/.npmrc" << 'NPMRC'
package-lock=true
production=true
NPMRC

# Create environment variables template
cat > "$TEMP_DIR/.env.template" << 'EOF'
# WordPress Backend Environment Variables

# Required Variables
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
ADMIN_API_TOKEN=your-secure-random-token-here

# CORS Configuration - IMPORTANT for WordPress
# Add your WordPress site URL(s) here
ALLOWED_ORIGINS=https://your-wordpress-site.com,https://www.your-wordpress-site.com

# Optional Variables
PORT=5000
SESSION_SECRET=another-random-secret

# Google Cloud Storage (if using file uploads)
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
# GCS_BUCKET_NAME=your-bucket-name

# PostgreSQL Connection Details (if not using DATABASE_URL)
# PGHOST=your-db-host
# PGPORT=5432
# PGDATABASE=your-db-name
# PGUSER=your-db-user
# PGPASSWORD=your-db-password

# Generate secure tokens using:
# openssl rand -base64 32
EOF

# Create README for the backend package
cat > "$TEMP_DIR/README.txt" << 'EOF'
WordPress Backend Deployment Package
=====================================

This package contains the Node.js backend server for the Research Profile Platform.
Deploy this backend separately from your WordPress installation.

CONTENTS:
---------
- dist/              : Built backend server
- migrations/        : Database migration files
- shared/            : Shared TypeScript schemas
- package.json       : Production dependencies
- package-lock.json  : Dependency lock file
- .env.template      : Environment variables template
- drizzle.config.ts  : Database configuration

QUICK START:
------------

1. EXTRACT THE PACKAGE:
   tar -xzf wordpress-backend-package.tar.gz
   cd wordpress-backend-temp

2. SET ENVIRONMENT VARIABLES:
   Copy .env.template to .env and fill in your values:
   
   cp .env.template .env
   nano .env  # or use your preferred editor
   
   Required variables:
   - NODE_ENV=production
   - DATABASE_URL=postgresql://...
   - ADMIN_API_TOKEN=<generate with: openssl rand -base64 32>
   - ALLOWED_ORIGINS=https://your-wordpress-site.com

3. INSTALL DEPENDENCIES:
   npm install --production

4. RUN DATABASE MIGRATIONS:
   npm run db:push

5. START THE SERVER:
   npm start

   The server will run on the port specified in PORT environment variable (default: 5000)

DEPLOYMENT PLATFORMS:
---------------------

This backend can be deployed to:

✅ Replit          - Already configured, just deploy
✅ Railway         - Automatic deployments from Git
✅ Heroku          - Popular, easy setup
✅ DigitalOcean    - App Platform or Droplets
✅ Render          - Modern, automatic deployments
✅ Fly.io          - Global deployment
✅ Any VPS         - Ubuntu, Debian, CentOS with Node.js

IMPORTANT - CORS CONFIGURATION:
-------------------------------

For WordPress to communicate with the backend, you MUST set:

ALLOWED_ORIGINS=https://your-wordpress-site.com

Replace with your actual WordPress URL. For multiple sites:

ALLOWED_ORIGINS=https://site1.com,https://site2.com,https://site3.com

⚠️  Never use ALLOWED_ORIGINS=* in production!

PLATFORM-SPECIFIC DEPLOYMENT:
------------------------------

REPLIT:
1. Project is already on Replit
2. Set environment variables in Secrets
3. Deploy using "Run" or publish

RAILWAY:
1. Connect your GitHub repository
2. Set environment variables in Settings
3. Automatic deployments on git push

HEROKU:
1. Create new app: heroku create your-app-name
2. Set environment variables: heroku config:set KEY=value
3. Deploy: git push heroku main
4. Scale: heroku ps:scale web=1

DIGITALOCEAN:
1. Create new App
2. Connect GitHub or upload code
3. Set environment variables
4. Deploy

VPS (Ubuntu/Debian):
1. Install Node.js 18+: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
2. Install PostgreSQL client: sudo apt install postgresql-client
3. Upload and extract this package
4. Set environment variables in .env
5. Install PM2: sudo npm install -g pm2
6. Start with PM2: pm2 start dist/index.js --name research-backend
7. Save PM2 config: pm2 save && pm2 startup

HEALTH CHECK:
-------------

After deployment, verify the backend is working:

curl https://your-backend-url/api/health

Should return a successful response.

ENVIRONMENT VARIABLES CHECKLIST:
--------------------------------

Essential:
□ NODE_ENV=production
□ DATABASE_URL (PostgreSQL connection string)
□ ADMIN_API_TOKEN (secure random token)
□ ALLOWED_ORIGINS (your WordPress URL)

Optional:
□ PORT (default: 5000)
□ SESSION_SECRET
□ GOOGLE_APPLICATION_CREDENTIALS
□ GCS_BUCKET_NAME

DATABASE SETUP:
---------------

This backend requires PostgreSQL. Options:

1. Neon (Serverless PostgreSQL)
   - Free tier available
   - https://neon.tech

2. Supabase (PostgreSQL with extras)
   - Free tier available
   - https://supabase.com

3. Railway (PostgreSQL addon)
   - Integrated with Railway deployment
   - https://railway.app

4. Your hosting provider's PostgreSQL
   - Many VPS providers offer managed PostgreSQL

DATABASE_URL format:
postgresql://username:password@host:port/database?sslmode=require

CONNECTING TO WORDPRESS:
------------------------

After deploying the backend:

1. Note your backend URL (e.g., https://your-app.railway.app)
2. Log into WordPress Admin
3. Go to Settings > Research Profile
4. Enter your backend URL
5. Save settings

TROUBLESHOOTING:
----------------

Problem: Backend starts but WordPress can't connect
Solution: Check ALLOWED_ORIGINS includes your WordPress URL

Problem: Database connection errors
Solution: Verify DATABASE_URL is correct and database is accessible

Problem: 500 Internal Server Error
Solution: Check backend logs for specific error messages

Problem: File uploads not working
Solution: Verify Google Cloud Storage credentials are set correctly

LOGS & MONITORING:
------------------

View logs on different platforms:

Replit:    Check Console output
Railway:   railway logs
Heroku:    heroku logs --tail
VPS:       pm2 logs research-backend

MAINTENANCE:
------------

Update the backend:
1. Build new version: npm run build
2. Upload new dist/index.js
3. Restart the server

Database migrations:
npm run db:push

SECURITY:
---------

✅ Use HTTPS for your backend URL
✅ Set strong ADMIN_API_TOKEN
✅ Restrict ALLOWED_ORIGINS to your WordPress domain only
✅ Keep Node.js and dependencies updated
✅ Use SSL for database connections (sslmode=require)
✅ Never commit .env file to version control

SUPPORT:
--------

For detailed instructions, see WORDPRESS-DEPLOYMENT.md
For WordPress theme installation, see wordpress-theme folder

===================================
Ready to deploy? Follow the steps above!
===================================
EOF

# Create the tarball
echo "🗜️  Creating compressed package..."
cd "$TEMP_DIR"
tar -czf "../$PACKAGE_NAME" .
cd ..

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Get package size
PACKAGE_SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)

echo "✅ WordPress backend package created successfully!"
echo ""
echo "📊 Package details:"
echo "   Name: $PACKAGE_NAME"
echo "   Size: $PACKAGE_SIZE"
echo ""
echo "📁 Package contains:"
echo "   ✓ Backend server (dist/)"
echo "   ✓ Database migrations"
echo "   ✓ Production dependencies config"
echo "   ✓ Environment variables template"
echo "   ✓ Deployment instructions"
echo ""
echo "🎯 Next steps:"
echo "   1. Deploy this backend to your Node.js hosting"
echo "   2. Install WordPress theme on your WordPress site"
echo "   3. Configure WordPress to connect to your backend"
echo ""
echo "📚 See WORDPRESS-DEPLOYMENT.md for complete instructions"
