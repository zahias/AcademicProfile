<?php
/**
 * Plugin Name: Research Profile Platform
 * Plugin URI: https://github.com/yourname/research-profile
 * Description: Backend functionality for Research Profile Platform - OpenAlex integration, REST API, and data management
 * Version: 1.0.0
 * Author: Research Profile Team
 * Author URI: https://yoursite.com
 * License: MIT
 * Text Domain: research-profile-platform
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('RPP_VERSION', '1.0.0');
define('RPP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('RPP_PLUGIN_URL', plugin_dir_url(__FILE__));

// Autoload classes
spl_autoload_register(function($class) {
    // Convert class name to file name
    $class_file = str_replace('_', '-', strtolower($class));
    $class_file = str_replace('rpp-', '', $class_file);
    
    $file = RPP_PLUGIN_DIR . 'includes/class-' . $class_file . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Include required files
require_once RPP_PLUGIN_DIR . 'includes/class-database.php';
require_once RPP_PLUGIN_DIR . 'includes/class-openalex-api.php';
require_once RPP_PLUGIN_DIR . 'includes/class-rest-api.php';
require_once RPP_PLUGIN_DIR . 'includes/class-admin.php';

// Activation hook
register_activation_hook(__FILE__, 'rpp_activate_plugin');
function rpp_activate_plugin() {
    // Create database tables
    RPP_Database::create_tables();
    
    // Flush rewrite rules
    flush_rewrite_rules();
    
    // Set default options
    add_option('rpp_version', RPP_VERSION);
    add_option('rpp_admin_token', wp_generate_password(32, true, true));
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'rpp_deactivate_plugin');
function rpp_deactivate_plugin() {
    flush_rewrite_rules();
}

// Initialize plugin
add_action('plugins_loaded', 'rpp_init_plugin');
function rpp_init_plugin() {
    // Initialize REST API
    new RPP_REST_API();
    
    // Initialize admin interface
    if (is_admin()) {
        new RPP_Admin();
    }
    
    // Check for database updates
    $current_version = get_option('rpp_version');
    if (version_compare($current_version, RPP_VERSION, '<')) {
        RPP_Database::create_tables();
        update_option('rpp_version', RPP_VERSION);
    }
}

// Add admin menu
add_action('admin_menu', 'rpp_add_admin_menu');
function rpp_add_admin_menu() {
    add_menu_page(
        'Research Profiles',
        'Research Profiles',
        'manage_options',
        'research-profiles',
        'rpp_admin_page',
        'dashicons-id',
        30
    );
    
    add_submenu_page(
        'research-profiles',
        'All Profiles',
        'All Profiles',
        'manage_options',
        'research-profiles',
        'rpp_admin_page'
    );
    
    add_submenu_page(
        'research-profiles',
        'Add New',
        'Add New',
        'manage_options',
        'research-profile-add',
        'rpp_add_profile_page'
    );
    
    add_submenu_page(
        'research-profiles',
        'Settings',
        'Settings',
        'manage_options',
        'research-profile-settings',
        'rpp_settings_page'
    );
}

// Admin pages (will be handled by RPP_Admin class)
function rpp_admin_page() {
    RPP_Admin::render_profiles_page();
}

function rpp_add_profile_page() {
    RPP_Admin::render_add_profile_page();
}

function rpp_settings_page() {
    RPP_Admin::render_settings_page();
}
