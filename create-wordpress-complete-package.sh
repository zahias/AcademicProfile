#!/bin/bash

# Complete WordPress Package Creator
# Creates a single WordPress package with theme + plugin

set -e

echo "🚀 Creating complete WordPress package (theme + plugin)..."

TEMP_DIR="wordpress-complete-temp"
PACKAGE_NAME="research-profile-wordpress-complete.zip"

# Clean up
rm -rf "$TEMP_DIR"
rm -f "$PACKAGE_NAME"

# Create temp directory
mkdir -p "$TEMP_DIR"

echo "📦 Copying WordPress theme..."
mkdir -p "$TEMP_DIR/theme"
cp -r wordpress-theme/* "$TEMP_DIR/theme/"

echo "📦 Copying WordPress plugin..."
mkdir -p "$TEMP_DIR/plugin"
cp -r wordpress-theme/plugins/research-profile-platform/* "$TEMP_DIR/plugin/"

# Create README with installation instructions
cat > "$TEMP_DIR/README.txt" << 'EOF'
==========================================
Research Profile Platform for WordPress
Complete Package
==========================================

This package contains EVERYTHING needed to run Research Profile Platform on WordPress.
No separate backend hosting required!

CONTENTS:
---------
1. theme/        - WordPress theme (frontend)
2. plugin/       - WordPress plugin (backend functionality)

WHAT'S INCLUDED:
----------------
✅ React frontend application
✅ PHP backend (replaces Node.js)
✅ OpenAlex API integration
✅ WordPress REST API endpoints
✅ Database tables (automatic creation)
✅ Admin interface
✅ CV upload functionality
✅ Data caching system

INSTALLATION STEPS:
-------------------

STEP 1: Install the Plugin
1. Go to WordPress Admin → Plugins → Add New → Upload Plugin
2. Choose: plugin/ folder (or zip the plugin/ folder first)
3. Click "Install Now"
4. Click "Activate"

STEP 2: Install the Theme
1. Go to WordPress Admin → Appearance → Themes → Add New → Upload Theme
2. Choose: theme/ folder (or zip the theme/ folder first)
3. Click "Install Now"
4. Click "Activate"

STEP 3: Add Your First Profile
1. Go to WordPress Admin → Research Profiles
2. Click "Add New"
3. Enter an OpenAlex ID (e.g., A5056485484)
4. Click "Add Profile & Sync Data"

STEP 4: View Your Site
Visit your WordPress site to see the research profile interface!

IMPORTANT NOTES:
----------------

✅ Everything runs on WordPress - no separate server needed
✅ Uses WordPress authentication - no API tokens required
✅ CVs stored in WordPress Media Library
✅ Data cached in WordPress database (MySQL)
✅ Compatible with any WordPress hosting

SYSTEM REQUIREMENTS:
--------------------
- WordPress 5.8+
- PHP 7.4+
- MySQL 5.7+

FINDING OPENALEX IDS:
---------------------
1. Go to https://openalex.org/
2. Search for a researcher
3. Copy their author ID (starts with A, like A5056485484)

API ENDPOINTS:
--------------
Base URL: https://your-site.com/wp-json/research-profile/v1/

Public:
  GET /researcher/{openalex_id}/data
  GET /openalex/search/{openalex_id}

Admin (requires WordPress login):
  POST /admin/researcher/profile
  PUT /admin/researcher/profile/{openalex_id}
  POST /admin/researcher/{openalex_id}/sync
  POST /admin/researcher/{openalex_id}/upload-cv

FEATURES:
---------
✅ Automatic OpenAlex data synchronization
✅ Publications, topics, and affiliations
✅ Citation metrics and h-index
✅ Public researcher profiles
✅ Admin dashboard for management
✅ CV/resume uploads
✅ Data caching for performance

TROUBLESHOOTING:
----------------

Problem: Plugin or theme won't activate
Solution: Check WordPress and PHP versions meet requirements

Problem: Can't see profiles after adding
Solution: Click "Sync" button in admin to refresh data from OpenAlex

Problem: OpenAlex sync fails
Solution: Check that your server can make outbound HTTPS requests to api.openalex.org

Problem: 404 errors on REST API endpoints
Solution: Go to Settings → Permalinks and click "Save Changes" to flush rewrite rules

SUPPORT:
--------
For issues or questions, check the README files in theme/ and plugin/ folders.

==========================================
Ready to install? Follow the steps above!
==========================================
EOF

# Create installation guide
cat > "$TEMP_DIR/QUICK-INSTALL.txt" << 'EOF'
QUICK INSTALLATION GUIDE
========================

5-Minute Setup:

1. Install Plugin:
   - WordPress Admin → Plugins → Add New → Upload
   - Choose: plugin/ folder (zip it first if needed)
   - Activate

2. Install Theme:
   - WordPress Admin → Appearance → Themes → Add New → Upload
   - Choose: theme/ folder (zip it first if needed)
   - Activate

3. Add Profile:
   - WordPress Admin → Research Profiles → Add New
   - Enter OpenAlex ID (e.g., A5056485484)
   - Click "Add Profile & Sync Data"

4. Done!
   Visit your WordPress site to see it in action.

Need OpenAlex IDs? Go to https://openalex.org/ and search for researchers.
EOF

# Create plugin ZIP
echo "📦 Creating plugin ZIP..."
cd "$TEMP_DIR/plugin"
zip -r ../research-profile-platform-plugin.zip . -x "*.git*" "*.DS_Store" > /dev/null 2>&1
cd ../..

# Create theme ZIP
echo "📦 Creating theme ZIP..."
cd "$TEMP_DIR/theme"
zip -r ../research-profile-platform-theme.zip . -x "*.git*" "*.DS_Store" "plugins/*" > /dev/null 2>&1
cd ../..

# Create complete package
echo "🗜️  Creating complete package..."
cd "$TEMP_DIR"
zip -r "../$PACKAGE_NAME" . -x "*.git*" "*.DS_Store" > /dev/null 2>&1
cd ..

# Clean up
rm -rf "$TEMP_DIR"

# Get package size
PACKAGE_SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)

echo "✅ Complete WordPress package created!"
echo ""
echo "📊 Package details:"
echo "   Name: $PACKAGE_NAME"
echo "   Size: $PACKAGE_SIZE"
echo ""
echo "📦 What's included:"
echo "   ✓ WordPress theme (frontend React app)"
echo "   ✓ WordPress plugin (PHP backend)"
echo "   ✓ Installation instructions"
echo "   ✓ Quick start guide"
echo ""
echo "🎯 Installation:"
echo "   1. Extract the ZIP file"
echo "   2. Install plugin from plugin/ folder"
echo "   3. Install theme from theme/ folder"
echo "   4. Add research profiles in WordPress admin"
echo ""
echo "📚 See README.txt inside the package for detailed instructions"
echo ""
echo "🎉 Ready to upload to WordPress!"
