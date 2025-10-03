#!/bin/bash
# Script to create a WordPress theme zip file
# Run this on your local machine if you have zip installed

echo "Creating WordPress theme zip file..."
cd "$(dirname "$0")"
zip -r research-profile-platform.zip . -x "*.git*" "*.DS_Store" "create-zip.sh"
echo "✅ Created: research-profile-platform.zip"
echo "📦 Ready to upload to WordPress!"
