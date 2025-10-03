=== Research Profile Platform ===
Contributors: research-profile-team
Tags: research, academic, openalex, profiles, publications
Requires at least: 5.8
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Backend plugin for Research Profile Platform - OpenAlex integration, REST API endpoints, and data management.

== Description ==

Research Profile Platform Plugin provides the backend functionality for displaying academic research profiles powered by the OpenAlex API.

= Features =

* **OpenAlex Integration**: Automatically fetches researcher data, publications, topics, and affiliations
* **REST API**: WordPress REST API endpoints for frontend integration
* **Data Caching**: Caches OpenAlex data to reduce API calls
* **Admin Interface**: WordPress admin pages for managing profiles
* **File Uploads**: CV/resume upload using WordPress Media Library
* **Authentication**: Uses WordPress user permissions (no separate login required)

= Requirements =

* WordPress 5.8 or higher
* PHP 7.4 or higher
* MySQL 5.7 or higher
* Research Profile Platform theme (install both theme and plugin)

== Installation ==

1. Upload the `research-profile-platform` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Install and activate the Research Profile Platform theme
4. Go to 'Research Profiles' in WordPress admin
5. Add your first researcher profile using their OpenAlex ID

== Frequently Asked Questions ==

= Do I need the theme AND the plugin? =

Yes! The plugin provides backend functionality (database, API), while the theme provides the frontend interface.

= Where do I get OpenAlex IDs? =

Search for researchers on https://openalex.org/ and copy their author ID (starts with A followed by numbers).

= How do I add a researcher profile? =

1. Go to WordPress Admin > Research Profiles
2. Click "Add New"
3. Enter the OpenAlex ID
4. Fill in additional details (optional)
5. Click "Add Profile & Sync Data"

= Does this work without the Node.js backend? =

Yes! This WordPress plugin replaces the Node.js backend entirely. Everything runs on WordPress.

= Can I use this with Google Cloud Storage? =

No, this version uses WordPress Media Library for file uploads instead of Google Cloud Storage. CVs are stored in your WordPress uploads folder.

= How often is data synchronized? =

Data is cached and refreshed manually or based on your cache duration settings (default: 24 hours).

== Screenshots ==

1. Admin interface showing all research profiles
2. Add new profile page
3. Settings page with API information

== Changelog ==

= 1.0.0 =
* Initial release
* OpenAlex API integration
* WordPress REST API endpoints
* Admin interface for profile management
* CV upload functionality
* Data caching system

== Upgrade Notice ==

= 1.0.0 =
Initial release - requires Research Profile Platform theme to function.

== API Endpoints ==

Public endpoints (no authentication required):
* `GET /wp-json/research-profile/v1/researcher/{openalex_id}/data`
* `GET /wp-json/research-profile/v1/openalex/search/{openalex_id}`

Admin endpoints (requires WordPress login with manage_options capability):
* `POST /wp-json/research-profile/v1/admin/researcher/profile`
* `PUT /wp-json/research-profile/v1/admin/researcher/profile/{openalex_id}`
* `POST /wp-json/research-profile/v1/admin/researcher/{openalex_id}/sync`
* `POST /wp-json/research-profile/v1/admin/researcher/{openalex_id}/upload-cv`

== Support ==

For issues, questions, or contributions, please visit the GitHub repository.
