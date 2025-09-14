# Research Profile Theme - Installation Guide

## Quick Installation

### Method 1: WordPress Admin Upload (Recommended)
1. Download the `research-profile-theme.zip` file
2. Log in to your WordPress admin dashboard
3. Go to **Appearance** > **Themes**
4. Click **Add New** > **Upload Theme**
5. Choose the ZIP file and click **Install Now**
6. Click **Activate** when installation completes

### Method 2: FTP Upload
1. Extract the theme files from the ZIP
2. Upload the `research-profile` folder to `/wp-content/themes/` via FTP
3. Go to **Appearance** > **Themes** in WordPress admin
4. Click **Activate** on the Research Profile Theme

## Theme Setup

### 1. Create Your First Researcher Profile
1. In WordPress admin, go to **Researchers** > **Add New**
2. Fill in the required information:
   - **Title**: Enter the researcher's name
   - **Display Name**: Professional display name
   - **Title**: Academic title (e.g., "Professor of Computer Science")
   - **Bio**: Professional biography
   - **Featured Image**: Upload a professional photo

### 2. Set Up OpenAlex Integration
1. Visit [OpenAlex.org](https://openalex.org) and search for the researcher
2. Copy their OpenAlex ID (format: A1234567890)
3. In the researcher edit page, paste the ID in the **OpenAlex ID** field
4. Click **Sync OpenAlex Data** to import publications automatically
5. Save the researcher profile

### 3. Configure Affiliation Information
1. Fill in **Current Affiliation** details:
   - Institution Name
   - Position/Role  
   - Institution URL
   - Start Date

### 4. Set Profile Visibility
1. Check **Make profile public** to display on the frontend
2. Uncheck to keep the profile private (admin-only)

## Theme Customization

### Homepage Settings
1. Go to **Appearance** > **Customize**
2. Open **Theme Options** section
3. Select a **Featured Researcher** for the homepage banner
4. Save changes

### Menu Setup
1. Go to **Appearance** > **Menus**
2. Create a new menu
3. Add pages and set location to **Primary Menu**
4. The theme automatically adds a "Researchers" link to the archive page

## Features Overview

### Automatic Data Synchronization
- The theme automatically syncs publication data from OpenAlex
- Citations, h-index, and publication counts update automatically
- Research topics are categorized automatically

### Interactive Analytics
The theme displays 5 types of charts:
1. **Publications Over Time** - Line chart showing publication frequency
2. **Citation Impact** - Bar chart of most cited papers
3. **Research Topics** - Doughnut chart of research areas
4. **Publication Venues** - Bar chart of journals/conferences
5. **Open Access Status** - Pie chart of accessibility

### Responsive Design
- Mobile-first design works on all devices
- Touch-friendly navigation and interactions
- Optimized loading for all screen sizes

## Requirements

### Minimum Requirements
- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.6 or MariaDB 10.0

### Recommended Requirements
- WordPress 6.0 or higher
- PHP 8.0 or higher
- MySQL 8.0 or MariaDB 10.3

## Troubleshooting

### Common Issues

**Charts not displaying:**
- Ensure JavaScript is enabled in the browser
- Check that Chart.js is loading correctly
- Verify OpenAlex data has been synced

**OpenAlex sync not working:**
- Check the OpenAlex ID format (should start with 'A')
- Verify internet connection
- Try the sync again after a few minutes

**Profile not showing on frontend:**
- Ensure "Make profile public" is checked
- Clear any caching plugins
- Check WordPress permalink settings

**Missing publications:**
- Verify the OpenAlex ID is correct
- Some publications may not be in OpenAlex database
- Try syncing data again

### Getting Help

If you encounter issues:

1. **Check the FAQ** in the theme documentation
2. **Verify Requirements** - ensure your server meets minimum requirements
3. **Test with Default Theme** - temporarily switch to Twenty Twenty-Three to isolate theme issues
4. **Check Browser Console** - look for JavaScript errors
5. **WordPress Debug** - enable WP_DEBUG to see PHP errors

### Debug Mode
To enable debugging:
```php
// Add to wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

## Advanced Configuration

### Custom Styling
Add custom CSS in **Appearance** > **Customize** > **Additional CSS** or edit `style.css` directly.

### Performance Optimization
- Use a caching plugin (WP Rocket, W3 Total Cache)
- Optimize images before uploading
- Consider a CDN for better global performance

### Security
- Keep WordPress and the theme updated
- Use strong passwords for admin accounts
- Consider a security plugin

## Support

For additional support and documentation:
- Theme documentation: [Link to documentation]
- Support forum: [Link to support]
- Email support: [Support email]

---

**Note**: This theme is designed specifically for academic and research professionals. It works best when researchers have profiles in the OpenAlex database for automatic data synchronization.