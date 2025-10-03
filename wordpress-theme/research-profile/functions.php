<?php
/**
 * Research Profile Theme Functions
 *
 * @package Research_Profile
 */

if (!defined('ABSPATH')) {
    exit;
}

define('RESEARCH_PROFILE_VERSION', '1.0.0');
define('RESEARCH_PROFILE_PATH', get_template_directory());
define('RESEARCH_PROFILE_URL', get_template_directory_uri());

class Research_Profile_Theme {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('after_setup_theme', [$this, 'theme_setup']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('init', [$this, 'register_post_types']);
        add_action('init', [$this, 'register_taxonomies']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        
        $this->includes();
    }
    
    public function theme_setup() {
        add_theme_support('title-tag');
        add_theme_support('post-thumbnails');
        add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
        add_theme_support('customize-selective-refresh-widgets');
        add_theme_support('elementor');
        
        register_nav_menus([
            'primary' => __('Primary Menu', 'research-profile'),
        ]);
    }
    
    public function enqueue_assets() {
        wp_enqueue_style(
            'research-profile-style',
            RESEARCH_PROFILE_URL . '/assets/css/main.css',
            [],
            RESEARCH_PROFILE_VERSION
        );
        
        wp_enqueue_script(
            'research-profile-charts',
            RESEARCH_PROFILE_URL . '/assets/js/charts.js',
            ['jquery'],
            RESEARCH_PROFILE_VERSION,
            true
        );
        
        wp_localize_script('research-profile-charts', 'researchProfileData', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => rest_url('research-profile/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);
    }
    
    public function register_post_types() {
        register_post_type('researcher', [
            'labels' => [
                'name' => __('Researchers', 'research-profile'),
                'singular_name' => __('Researcher', 'research-profile'),
                'add_new' => __('Add New Researcher', 'research-profile'),
                'add_new_item' => __('Add New Researcher', 'research-profile'),
                'edit_item' => __('Edit Researcher', 'research-profile'),
                'new_item' => __('New Researcher', 'research-profile'),
                'view_item' => __('View Researcher', 'research-profile'),
                'search_items' => __('Search Researchers', 'research-profile'),
                'not_found' => __('No researchers found', 'research-profile'),
                'not_found_in_trash' => __('No researchers found in trash', 'research-profile'),
            ],
            'public' => true,
            'has_archive' => true,
            'show_in_rest' => true,
            'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'menu_icon' => 'dashicons-id',
            'rewrite' => ['slug' => 'researcher'],
            'show_in_menu' => true,
            'capability_type' => 'post',
        ]);
    }
    
    public function register_taxonomies() {
        register_taxonomy('research_area', 'researcher', [
            'labels' => [
                'name' => __('Research Areas', 'research-profile'),
                'singular_name' => __('Research Area', 'research-profile'),
            ],
            'public' => true,
            'hierarchical' => false,
            'show_in_rest' => true,
            'rewrite' => ['slug' => 'research-area'],
        ]);
        
        register_taxonomy('affiliation', 'researcher', [
            'labels' => [
                'name' => __('Affiliations', 'research-profile'),
                'singular_name' => __('Affiliation', 'research-profile'),
            ],
            'public' => true,
            'hierarchical' => true,
            'show_in_rest' => true,
            'rewrite' => ['slug' => 'affiliation'],
        ]);
    }
    
    public function register_rest_routes() {
        require_once RESEARCH_PROFILE_PATH . '/includes/api/class-rest-controller.php';
        $rest_controller = new Research_Profile_REST_Controller();
        $rest_controller->register_routes();
    }
    
    private function includes() {
        require_once RESEARCH_PROFILE_PATH . '/includes/class-database.php';
        require_once RESEARCH_PROFILE_PATH . '/includes/class-openalex-service.php';
        require_once RESEARCH_PROFILE_PATH . '/includes/admin/class-admin-interface.php';
        
        if (did_action('elementor/loaded')) {
            require_once RESEARCH_PROFILE_PATH . '/includes/elementor/class-elementor-integration.php';
        }
    }
}

Research_Profile_Theme::get_instance();

register_activation_hook(__FILE__, 'research_profile_activate');
function research_profile_activate() {
    require_once RESEARCH_PROFILE_PATH . '/includes/class-database.php';
    Research_Profile_Database::create_tables();
    flush_rewrite_rules();
}
