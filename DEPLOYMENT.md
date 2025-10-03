# A2hosting Deployment Guide

This guide will help you deploy your Research Profile Platform to A2hosting shared hosting using their Node.js Selector.

## Prerequisites

1. A2hosting account with cPanel access
2. Normal shell access (not jailshell) - contact A2 support if needed
3. PostgreSQL database (external or A2hosting provided)
4. Google Cloud Storage credentials (if using file uploads)

## Important Notes

⚠️ **Authentication Limitation**: This application currently uses Replit OIDC authentication which will NOT work on A2hosting. You have two options:

1. **Option A**: Remove authentication and make profiles public-only
2. **Option B**: Implement alternative authentication (username/password, JWT, etc.)

For this deployment, we recommend starting with Option A for testing, then implementing Option B if user accounts are needed.

## Step 1: Prepare Your Database

### Option 1: Use A2hosting PostgreSQL (if available)
1. Create a PostgreSQL database in cPanel
2. Note the connection details (host, port, database name, user, password)

### Option 2: Continue Using Neon Database
1. Keep your existing Neon database connection string
2. Make sure it allows connections from A2hosting IPs

### Create Connection String
Format: `postgresql://username:password@host:port/database?sslmode=require`

Example: `postgresql://myuser:mypass@ep-cool-meadow-123456.us-east-1.aws.neon.tech/mydb?sslmode=require`

## Step 2: Build the Application

On your local machine or Replit environment:

```bash
npm run build
```

This creates a `dist` folder with:
- `dist/index.js` - Your bundled Express server
- `dist/public/` - Your built React frontend

## Step 3: Create Deployment Package

Run the deployment packaging script:

```bash
npm run package:deploy
```

This creates `deployment-package.tar.gz` containing:
- Built application files
- package.json (production dependencies only)
- All necessary configuration files

## Step 4: Upload to A2hosting

### Using cPanel File Manager:
1. Log into cPanel
2. Go to File Manager
3. Navigate to your desired directory (e.g., `public_html/research-platform`)
4. Upload `deployment-package.tar.gz`
5. Extract it: Right-click → Extract

### Using SSH (if available):
```bash
# Upload the package
scp deployment-package.tar.gz user@yoursite.com:~/research-platform/

# SSH into your server
ssh user@yoursite.com

# Extract
cd ~/research-platform
tar -xzf deployment-package.tar.gz
```

## Step 5: Configure Node.js Application in cPanel

1. Go to cPanel → Software → Setup Node.js App
2. Click **CREATE APPLICATION**
3. Configure:
   - **Node.js version**: 18.x or higher
   - **Application root**: Path to your app (e.g., `research-platform`)
   - **Application URL**: `/research` (or your preferred path)
   - **Application startup file**: `dist/index.js`
   - **Passenger log file**: Leave default or specify custom path

4. Click **Create**

## Step 6: Set Environment Variables

In the Node.js Selector interface, add these environment variables:

### Required:
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/dbname?sslmode=require
ADMIN_API_TOKEN=your-high-entropy-random-token-here
```

### Optional (if using Google Cloud Storage):
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GCS_BUCKET_NAME=your-bucket-name
```

### Generate Admin Token:
```bash
# Generate a secure random token
openssl rand -base64 32
```

## Step 7: Install Dependencies

In the Node.js Selector interface:
1. Find your application
2. Click **Run NPM Install**
3. Wait for installation to complete (may take several minutes)

## Step 8: Configure Application Routes

⚠️ **Critical**: A2hosting uses Phusion Passenger which requires routes to match your Application URL.

If your Application URL is `/research`, you need to modify the Express app to handle this path prefix.

### Option A: Use Environment Variable (Recommended)
Add to environment variables:
```
BASE_PATH=/research
```

### Option B: Modify server code
Update `server/index.ts` to handle the base path:
```javascript
const BASE_PATH = process.env.BASE_PATH || '';
app.use(BASE_PATH, router);
```

## Step 9: Database Migration

After uploading and configuring, run database migrations:

### Option 1: Using SSH
```bash
cd ~/research-platform
source ~/virtualenv/research-platform/18/bin/activate
npm run db:push
```

### Option 2: Using cPanel Terminal (if available)
```bash
cd ~/research-platform
npm run db:push
```

## Step 10: Start the Application

1. Go back to Setup Node.js App in cPanel
2. Find your application
3. Click **Restart**
4. Wait for the application to start

## Step 11: Test Your Application

Visit: `https://yourdomain.com/research` (or your configured Application URL)

### Troubleshooting:

**"Cannot GET /research"**
- Check that your startup file is correctly specified
- Verify routes include the Application URL prefix
- Check Passenger error logs

**Database connection errors**
- Verify DATABASE_URL is correct
- Check database credentials
- Ensure database allows connections from A2hosting IPs
- Test connection with: `psql $DATABASE_URL`

**500 Internal Server Error**
- Check Node.js app error logs in cPanel
- Check Passenger error logs
- Verify all environment variables are set
- Check that all npm dependencies installed successfully

**Missing static files (CSS/JS)**
- Verify Application URL matches in both cPanel and app configuration
- Check that dist/public folder was uploaded correctly
- Verify static file middleware paths

## Step 12: Custom Domain (Optional)

If using a custom domain or subdomain:
1. Point domain to your A2hosting account
2. In Node.js Selector, update Application URL
3. Restart application

## File Structure on Server

```
research-platform/
├── dist/
│   ├── index.js          # Server bundle
│   └── public/           # Frontend assets
│       ├── index.html
│       └── assets/
├── package.json          # Production dependencies
├── package-lock.json
├── migrations/           # Database migrations
├── node_modules/         # Installed after npm install
└── .env                  # Environment variables (optional)
```

## Security Checklist

✅ Use HTTPS (A2hosting provides free SSL)
✅ Set strong ADMIN_API_TOKEN
✅ Use environment variables for secrets (never commit to code)
✅ Set NODE_ENV=production
✅ Keep database credentials secure
✅ Regularly update dependencies

## Performance Optimization

1. **Enable Gzip compression** in cPanel
2. **Use CDN** for static assets if needed
3. **Database connection pooling** is configured by default
4. **Monitor resource usage** in cPanel metrics

## Maintenance

### Update Application:
1. Build new version locally: `npm run build`
2. Create new deployment package: `npm run package:deploy`
3. Upload and extract to server
4. Run npm install if dependencies changed
5. Restart application in Node.js Selector

### View Logs:
- Application logs: Check Node.js Selector interface
- Passenger logs: `/home/username/passenger.log`
- Error logs: cPanel Error Log viewer

### Backup:
- Regular database backups (use pg_dump or A2hosting backup tools)
- Keep deployment packages for rollback capability

## Next Steps

1. **Implement Alternative Authentication** if user accounts are needed
2. **Set up monitoring** for uptime and errors
3. **Configure custom domain** if desired
4. **Optimize database** queries and indexes
5. **Set up automated backups**

## Support

- A2hosting Support: https://www.a2hosting.com/kb/
- A2hosting Node.js Docs: https://www.a2hosting.com/kb/cpanel/cpanel-software/create-application-with-nodejs-selector/
- Application Issues: Contact your development team

---

**Need Help?** If you encounter issues during deployment, check the Passenger error logs first, then contact A2hosting support with specific error messages.
