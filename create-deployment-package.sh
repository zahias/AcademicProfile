#!/bin/bash

# A2hosting Deployment Package Creator
# This script creates a deployment-ready package for A2hosting

set -e

echo "🚀 Creating A2hosting deployment package..."

# Create temporary directory
TEMP_DIR="deployment-temp"
PACKAGE_NAME="deployment-package.tar.gz"

# Clean up any existing temp directory
rm -rf "$TEMP_DIR"
rm -f "$PACKAGE_NAME"

# Create temporary directory structure
mkdir -p "$TEMP_DIR"

echo "📦 Copying production files..."

# Copy built application
cp -r dist "$TEMP_DIR/"

# Copy migrations (if they exist)
if [ -d "migrations" ]; then
  cp -r migrations "$TEMP_DIR/"
fi

# Copy shared schemas
if [ -d "shared" ]; then
  cp -r shared "$TEMP_DIR/"
fi

# Create production package.json (dependencies only, no devDependencies)
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

# Copy drizzle config if exists
if [ -f "drizzle.config.ts" ]; then
  cp drizzle.config.ts "$TEMP_DIR/"
fi

# Copy tsconfig if exists (might be needed for some runtime operations)
if [ -f "tsconfig.json" ]; then
  cp tsconfig.json "$TEMP_DIR/"
fi

# Create .npmrc for production install configuration
cat > "$TEMP_DIR/.npmrc" << 'NPMRC'
package-lock=true
production=true
NPMRC

# Create README for the package
cat > "$TEMP_DIR/README.txt" << 'EOF'
A2hosting Deployment Package
=============================

This package contains your built Research Profile Platform ready for deployment.

CONTENTS:
- dist/           : Built application (server + frontend)
- migrations/     : Database migration files
- shared/         : Shared TypeScript schemas
- package.json    : Production dependencies only
- drizzle.config.ts : Database configuration

DEPLOYMENT STEPS:

1. Extract this package on your A2hosting server:
   tar -xzf deployment-package.tar.gz

2. Install dependencies:
   npm install --production

3. Set up Node.js app in cPanel:
   - Application root: [your-extracted-folder]
   - Startup file: dist/index.js
   - Node version: 18.x or higher

4. Configure environment variables in cPanel Node.js Selector:
   - NODE_ENV=production
   - DATABASE_URL=postgresql://...
   - ADMIN_API_TOKEN=your-random-token

5. Run database migrations:
   npm run db:push

6. Restart your application in cPanel

See DEPLOYMENT.md in your source code for detailed instructions.

IMPORTANT: This application uses Replit Auth which won't work on A2hosting.
You'll need to implement alternative authentication or make it public-only.
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

echo "✅ Deployment package created successfully!"
echo ""
echo "📊 Package details:"
echo "   Name: $PACKAGE_NAME"
echo "   Size: $PACKAGE_SIZE"
echo ""
echo "📁 Contents:"
tar -tzf "$PACKAGE_NAME" | head -20
echo "   ... (and more)"
echo ""
echo "🎯 Next steps:"
echo "   1. Download: $PACKAGE_NAME"
echo "   2. Upload to your A2hosting server"
echo "   3. Follow instructions in DEPLOYMENT.md"
echo ""
echo "💡 Quick upload command (if using SSH):"
echo "   scp $PACKAGE_NAME user@yoursite.com:~/your-app-folder/"
