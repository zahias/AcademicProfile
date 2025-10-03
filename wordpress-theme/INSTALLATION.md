# Research Profile WordPress Theme - Installation Guide

## Quick Start

### 1. Download and Install

1. **Download the theme**
   - Locate the `research-profile` folder in `wordpress-theme/`
   - Compress it as a ZIP file (name it `research-profile.zip`)

2. **Upload to WordPress**
   ```
   WordPress Admin → Appearance → Themes → Add New → Upload Theme
   ```
   - Select the ZIP file
   - Click "Install Now"
   - Click "Activate"

### 2. Initial Configuration

After activation, the theme will automatically:
- Create custom database tables
- Register the "Researcher" custom post type
- Register REST API endpoints
- Add admin menu pages

**Configure Settings:**
1. Go to `Research Profiles → Settings`
2. Enter your email for OpenAlex API (improves rate limits)
3. Click "Save Settings"

### 3. Create Your First Researcher Profile

1. **Add New Researcher**
   ```
   Researchers → Add New Researcher
   ```

2. **Fill in Details:**
   - **Title**: Researcher's full name
   - **OpenAlex ID**: Find it at https://openalex.org (e.g., `A5056485484`)
   - **Title/Position**: e.g., "Professor of Computer Science"
   - **Current Affiliation**: e.g., "Stanford University"
   - **Biography**: Brief bio (optional)
   - **CV URL**: Upload PDF or enter URL

3. **Sync with OpenAlex**
   - Click the "Sync with OpenAlex" button in the sidebar
   - Wait for sync to complete (may take 10-30 seconds)
   - The system will fetch:
     - Publications
     - Research topics
     - Affiliations
     - Citation metrics

4. **Publish**
   - Click "Publish" to make the profile live
   - View at: `yoursite.com/researcher/researcher-name/`

## Using with Elementor

### Install Elementor (if not already installed)

```
Plugins → Add New → Search "Elementor" → Install & Activate
```

### Available Widgets

The theme adds 4 custom widgets under the "Research Profile" category:

#### 1. Researcher Hero
- **Purpose**: Profile header with photo, name, bio, and CV download
- **Settings**:
  - Select researcher
  - Toggle biography display
  - Toggle CV button
- **Best Used**: Top of researcher profile pages

#### 2. Publication Analytics
- **Purpose**: Charts and statistics for publications
- **Settings**:
  - Select researcher
  - Toggle statistics cards
- **Displays**:
  - Total publications
  - Total citations
  - Average citations
  - Growth over time chart
  - Publication types breakdown
  - Citation impact by year

#### 3. Publications List
- **Purpose**: Displays recent publications
- **Settings**:
  - Select researcher
  - Number of publications to show (1-50)
- **Displays**: Title, year, type, citations

#### 4. Research Topics
- **Purpose**: Grid of research areas
- **Settings**: Select researcher
- **Displays**: Topic name, field, publication count

### Creating a Profile Page with Elementor

1. **Create New Page**
   ```
   Pages → Add New
   ```

2. **Edit with Elementor**
   - Click "Edit with Elementor"

3. **Add Widgets**
   - Drag "Researcher Hero" to top
   - Add "Publication Analytics" below
   - Add "Research Topics" section
   - Add "Publications List" at bottom

4. **Configure Each Widget**
   - Select the same researcher for all widgets
   - Customize display options

5. **Publish**

## Customization

### Styling

**CSS Customization:**
Edit `assets/css/main.css` to change:
- Color scheme
- Typography
- Layout spacing
- Dark mode colors

**Key Variables:**
```css
:root {
  --color-primary: #2563eb;     /* Main blue */
  --color-secondary: #64748b;   /* Gray */
  --color-success: #10b981;     /* Green */
  --border-radius: 0.5rem;      /* Roundness */
}
```

### Adding Chart.js for Better Visualizations

1. **Enqueue Chart.js**
   Add to `functions.php`:
   ```php
   wp_enqueue_script('chartjs', 'https://cdn.jsdelivr.net/npm/chart.js', [], null, true);
   ```

2. **Update charts.js**
   Replace the simple table charts with actual Chart.js implementations

### Custom Templates

**Override Templates:**
1. Copy template files to your child theme
2. Modify as needed
3. WordPress will use your version

**Available Templates:**
- `single-researcher.php` - Individual profile
- `archive-researcher.php` - Listing page (create if needed)
- `template-parts/` - Component templates

## Data Migration from React App

If you're migrating from the original React/Express app:

### Option 1: Manual Entry
1. Create researcher profiles one by one
2. Use OpenAlex sync to fetch publications automatically

### Option 2: REST API Import
1. Export data from PostgreSQL as JSON
2. Use WordPress REST API to import:
   ```bash
   curl -X POST https://yoursite.com/wp-json/wp/v2/researcher \
     -H "Content-Type: application/json" \
     -d '{"title":"Researcher Name","status":"publish"}'
   ```
3. Add meta fields and sync with OpenAlex

### Option 3: Custom Import Script
Create a PHP script in `wp-content/themes/research-profile/import.php`:
```php
<?php
// Import researchers from JSON export
require_once('wp-load.php');

$json = file_get_contents('researchers-export.json');
$researchers = json_decode($json, true);

foreach ($researchers as $researcher) {
    $post_id = wp_insert_post([
        'post_title' => $researcher['displayName'],
        'post_type' => 'researcher',
        'post_status' => 'publish',
    ]);
    
    update_post_meta($post_id, 'openalex_id', $researcher['openalexId']);
    update_post_meta($post_id, 'bio', $researcher['bio']);
    // ... add other fields
    
    // Trigger sync
    $service = new Research_Profile_OpenAlex_Service();
    $service->sync_researcher_data($post_id, $researcher['openalexId']);
}
```

## Troubleshooting

### Sync Fails
- **Check OpenAlex ID**: Verify format (should start with 'A' followed by numbers)
- **API Rate Limit**: Add mailto email in settings
- **Connection Issues**: Check server can access openalex.org

### Charts Not Displaying
- Check JavaScript console for errors
- Ensure Chart.js is loaded (if using advanced charts)
- Verify data is synced (check Publications in database)

### Elementor Widgets Not Showing
- Ensure Elementor is installed and activated
- Clear Elementor cache: `Elementor → Tools → Regenerate CSS`
- Check theme functions.php has no errors

### Database Tables Not Created
- Deactivate and reactivate the theme
- Or manually run: `Research_Profile_Database::create_tables();`

## Advanced Configuration

### Automatic Sync with WP-Cron

Add to `functions.php`:
```php
add_action('wp', 'schedule_researcher_sync');
function schedule_researcher_sync() {
    if (!wp_next_scheduled('daily_researcher_sync')) {
        wp_schedule_event(time(), 'daily', 'daily_researcher_sync');
    }
}

add_action('daily_researcher_sync', 'sync_all_researchers');
function sync_all_researchers() {
    $researchers = get_posts([
        'post_type' => 'researcher',
        'posts_per_page' => -1,
    ]);
    
    $service = new Research_Profile_OpenAlex_Service();
    
    foreach ($researchers as $researcher) {
        $openalex_id = get_post_meta($researcher->ID, 'openalex_id', true);
        if ($openalex_id) {
            $service->sync_researcher_data($researcher->ID, $openalex_id);
        }
    }
}
```

### Custom Post Type Slug

Change the URL structure by editing `functions.php`:
```php
'rewrite' => ['slug' => 'profile'], // Changes to /profile/researcher-name/
```
Then: `Settings → Permalinks → Save Changes` (flush rewrite rules)

## Support

For issues or questions:
- Check the FAQ in README.txt
- Review WordPress and PHP error logs
- Check browser console for JavaScript errors
- Ensure all requirements are met (PHP 7.4+, WordPress 6.0+)

## Next Steps

1. ✅ Install and activate theme
2. ✅ Configure OpenAlex email
3. ✅ Create first researcher profile
4. ✅ Sync with OpenAlex
5. ✅ Install Elementor (optional)
6. ✅ Create custom pages with widgets
7. ✅ Customize styling
8. ✅ Set up automatic sync (optional)
9. ✅ Migrate existing data (if applicable)

You're all set! Your research profile platform is ready to use.
