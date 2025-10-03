=== Research Profile ===

Contributors: Your Name
Tags: education, research, academic, portfolio, elementor
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

A comprehensive WordPress theme for showcasing academic research profiles with OpenAlex API integration and Elementor support.

== Description ==

Research Profile is a modern WordPress theme designed specifically for researchers and academics to showcase their work. It features:

* OpenAlex API integration for automatic publication data synchronization
* Beautiful publication analytics with charts and visualizations
* Custom post type for researchers with detailed profiles
* Elementor widget support for easy page building
* Research topics and affiliations management
* CV/Resume upload and download functionality
* Responsive design with dark mode support
* RESTful API for data access

== Installation ==

1. Download the theme ZIP file
2. Go to WordPress Admin > Appearance > Themes > Add New
3. Click "Upload Theme" and select the ZIP file
4. Click "Install Now" and then "Activate"
5. The theme will create custom database tables on activation

== Configuration ==

After activation:

1. Go to Research Profiles > Settings
2. Enter your email address for OpenAlex API (recommended for better rate limits)
3. Click "Save Settings"

== Creating a Researcher Profile ==

1. Go to Researchers > Add New Researcher
2. Enter the researcher's name as the title
3. Fill in the Researcher Details:
   - OpenAlex ID (e.g., A1234567890) - REQUIRED for data sync
   - Title/Position
   - Current Affiliation
   - Biography
   - CV URL (or upload a PDF using the Upload CV button)
4. Click "Publish"
5. Click "Sync with OpenAlex" to fetch publications and data

== Using Elementor Widgets ==

The theme includes 4 custom Elementor widgets:

1. **Researcher Hero** - Displays researcher profile header with photo, bio, and CV button
2. **Publication Analytics** - Shows charts and statistics for publications
3. **Publications List** - Displays a list of recent publications
4. **Research Topics** - Shows research areas in a grid layout

To use:
1. Edit any page with Elementor
2. Search for "Research Profile" in the widgets panel
3. Drag widgets onto your page
4. Configure widget settings (select researcher, customize display)

== Template Files ==

The theme includes these template files:

* `single-researcher.php` - Individual researcher profile page
* `archive-researcher.php` - Researchers listing page (create this if needed)
* `header.php` - Site header
* `footer.php` - Site footer
* `index.php` - Default template

== REST API Endpoints ==

The theme exposes these REST API endpoints:

* `GET /wp-json/research-profile/v1/researcher/{id}` - Get researcher data
* `GET /wp-json/research-profile/v1/researcher/{id}/analytics` - Get analytics data
* `GET /wp-json/research-profile/v1/researcher/{id}/publications` - Get publications
* `POST /wp-json/research-profile/v1/researcher/{id}/sync` - Sync with OpenAlex (admin only)

== Customization ==

**Colors:**
Edit `/assets/css/main.css` to customize the color scheme. Main variables:

--color-primary: #2563eb;
--color-secondary: #64748b;
--color-success: #10b981;

**Charts:**
The chart rendering can be customized in `/assets/js/charts.js`

For advanced Chart.js visualizations, include Chart.js library:
```
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

== Database Tables ==

The theme creates these custom tables:

* `wp_rp_publications` - Researcher publications
* `wp_rp_research_topics` - Research topics/areas
* `wp_rp_affiliations` - Institutional affiliations
* `wp_rp_openalex_data` - Cached OpenAlex API responses

== Requirements ==

* WordPress 6.0+
* PHP 7.4+
* MySQL 5.7+ or MariaDB 10.2+
* Elementor (optional, for page builder functionality)
* Internet connection for OpenAlex API

== Frequently Asked Questions ==

**Q: Where do I get an OpenAlex ID?**
A: Visit https://openalex.org and search for the researcher. The ID is in the URL (e.g., https://openalex.org/authors/A1234567890)

**Q: How often does data sync?**
A: Currently, sync is manual via the "Sync with OpenAlex" button. Automatic sync can be added via WP-Cron.

**Q: Can I use this without Elementor?**
A: Yes! The `single-researcher.php` template works independently. Elementor widgets are optional.

**Q: How do I migrate from the old React app?**
A: Export your PostgreSQL data as JSON/CSV, then import into WordPress using the REST API or create researchers manually.

== Changelog ==

= 1.0.0 =
* Initial release
* OpenAlex API integration
* Custom researcher post type
* Publication analytics
* Elementor widgets
* REST API endpoints
* Admin interface
* CV upload functionality

== Upgrade Notice ==

= 1.0.0 =
Initial release.

== Credits ==

* OpenAlex API - https://openalex.org
* TailwindCSS - https://tailwindcss.com
* Elementor - https://elementor.com

== Support ==

For support and documentation, visit: [Your website]
GitHub: [Your GitHub repository]
