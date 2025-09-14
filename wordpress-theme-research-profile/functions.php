<?php
/**
 * Research Profile Theme Functions
 * 
 * This file contains all the main functionality for the Research Profile WordPress theme
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Theme setup
function research_profile_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    add_theme_support('custom-logo');
    
    // Register menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'research-profile'),
        'footer' => __('Footer Menu', 'research-profile'),
    ));
}
add_action('after_setup_theme', 'research_profile_setup');

// Enqueue styles and scripts
function research_profile_enqueue_scripts() {
    // Main theme stylesheet
    wp_enqueue_style('research-profile-style', get_stylesheet_uri(), array(), '1.0.0');
    
    // Chart.js for analytics
    wp_enqueue_script('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js', array(), '3.9.1', true);
    
    // Date library for chart formatting
    wp_enqueue_script('date-fns', 'https://cdn.jsdelivr.net/npm/date-fns@2.29.3/index.min.js', array(), '2.29.3', true);
    
    // Theme custom scripts
    wp_enqueue_script('research-profile-scripts', get_template_directory_uri() . '/assets/js/theme-scripts.js', array('jquery', 'chart-js'), '1.0.0', true);
    
    // Localize script for AJAX
    wp_localize_script('research-profile-scripts', 'research_profile_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('research_profile_nonce'),
    ));
}
add_action('wp_enqueue_scripts', 'research_profile_enqueue_scripts');

// Admin enqueue scripts
function research_profile_admin_enqueue_scripts() {
    wp_enqueue_style('research-profile-admin', get_template_directory_uri() . '/assets/css/admin-style.css', array(), '1.0.0');
    wp_enqueue_script('research-profile-admin', get_template_directory_uri() . '/assets/js/admin-scripts.js', array('jquery'), '1.0.0', true);
}
add_action('admin_enqueue_scripts', 'research_profile_admin_enqueue_scripts');

// Register Custom Post Type for Researchers
function research_profile_register_post_types() {
    // Researcher CPT
    $args = array(
        'labels' => array(
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
        ),
        'public' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'researcher'),
        'capability_type' => 'post',
        'has_archive' => true,
        'hierarchical' => false,
        'menu_position' => 20,
        'menu_icon' => 'dashicons-admin-users',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_rest' => true,
    );
    register_post_type('researcher', $args);
}
add_action('init', 'research_profile_register_post_types');

// Add meta boxes for researcher data
function research_profile_add_meta_boxes() {
    add_meta_box(
        'researcher_basic_info',
        __('Basic Information', 'research-profile'),
        'research_profile_basic_info_callback',
        'researcher',
        'normal',
        'high'
    );
    
    add_meta_box(
        'researcher_openalex_info',
        __('OpenAlex Integration', 'research-profile'),
        'research_profile_openalex_info_callback',
        'researcher',
        'normal',
        'high'
    );
    
    add_meta_box(
        'researcher_affiliation',
        __('Current Affiliation', 'research-profile'),
        'research_profile_affiliation_callback',
        'researcher',
        'normal',
        'high'
    );
    
    add_meta_box(
        'researcher_settings',
        __('Profile Settings', 'research-profile'),
        'research_profile_settings_callback',
        'researcher',
        'side',
        'high'
    );
}
add_action('add_meta_boxes', 'research_profile_add_meta_boxes');

// Basic Information meta box callback
function research_profile_basic_info_callback($post) {
    wp_nonce_field('research_profile_save_meta', 'research_profile_nonce');
    
    $display_name = get_post_meta($post->ID, '_researcher_display_name', true);
    $title = get_post_meta($post->ID, '_researcher_title', true);
    $bio = get_post_meta($post->ID, '_researcher_bio', true);
    $cv_url = get_post_meta($post->ID, '_researcher_cv_url', true);
    
    echo '<table class="form-table">';
    echo '<tr>';
    echo '<th scope="row"><label for="researcher_display_name">' . __('Display Name', 'research-profile') . '</label></th>';
    echo '<td><input type="text" id="researcher_display_name" name="researcher_display_name" value="' . esc_attr($display_name) . '" style="width: 100%;" /></td>';
    echo '</tr>';
    echo '<tr>';
    echo '<th scope="row"><label for="researcher_title">' . __('Professional Title', 'research-profile') . '</label></th>';
    echo '<td><input type="text" id="researcher_title" name="researcher_title" value="' . esc_attr($title) . '" style="width: 100%;" placeholder="e.g., Professor of Computer Science" /></td>';
    echo '</tr>';
    echo '<tr>';
    echo '<th scope="row"><label for="researcher_bio">' . __('Biography', 'research-profile') . '</label></th>';
    echo '<td><textarea id="researcher_bio" name="researcher_bio" rows="5" style="width: 100%;">' . esc_textarea($bio) . '</textarea></td>';
    echo '</tr>';
    echo '<tr>';
    echo '<th scope="row"><label for="researcher_cv_url">' . __('CV URL', 'research-profile') . '</label></th>';
    echo '<td><input type="url" id="researcher_cv_url" name="researcher_cv_url" value="' . esc_url($cv_url) . '" style="width: 100%;" /></td>';
    echo '</tr>';
    echo '</table>';
}

// OpenAlex Integration meta box callback
function research_profile_openalex_info_callback($post) {
    $openalex_id = get_post_meta($post->ID, '_researcher_openalex_id', true);
    $last_synced = get_post_meta($post->ID, '_researcher_last_synced', true);
    
    echo '<table class="form-table">';
    echo '<tr>';
    echo '<th scope="row"><label for="researcher_openalex_id">' . __('OpenAlex ID', 'research-profile') . '</label></th>';
    echo '<td>';
    echo '<input type="text" id="researcher_openalex_id" name="researcher_openalex_id" value="' . esc_attr($openalex_id) . '" style="width: 300px;" placeholder="A5056485484" />';
    echo '<p class="description">' . __('Enter the OpenAlex Author ID (e.g., A5056485484). This will automatically sync publication data.', 'research-profile') . '</p>';
    echo '</td>';
    echo '</tr>';
    if ($last_synced) {
        echo '<tr>';
        echo '<th scope="row">' . __('Last Synced', 'research-profile') . '</th>';
        echo '<td>' . esc_html(date('Y-m-d H:i:s', $last_synced)) . ' <button type="button" id="sync-openalex-data" class="button">' . __('Sync Now', 'research-profile') . '</button></td>';
        echo '</tr>';
    } else {
        echo '<tr>';
        echo '<th scope="row"></th>';
        echo '<td><button type="button" id="sync-openalex-data" class="button">' . __('Sync OpenAlex Data', 'research-profile') . '</button></td>';
        echo '</tr>';
    }
    echo '</table>';
}

// Current Affiliation meta box callback
function research_profile_affiliation_callback($post) {
    $current_affiliation = get_post_meta($post->ID, '_researcher_current_affiliation', true);
    $current_position = get_post_meta($post->ID, '_researcher_current_position', true);
    $affiliation_url = get_post_meta($post->ID, '_researcher_current_affiliation_url', true);
    $start_date = get_post_meta($post->ID, '_researcher_current_affiliation_start_date', true);
    
    echo '<table class="form-table">';
    echo '<tr>';
    echo '<th scope="row"><label for="researcher_current_affiliation">' . __('Institution Name', 'research-profile') . '</label></th>';
    echo '<td><input type="text" id="researcher_current_affiliation" name="researcher_current_affiliation" value="' . esc_attr($current_affiliation) . '" style="width: 100%;" placeholder="e.g., Stanford University" /></td>';
    echo '</tr>';
    echo '<tr>';
    echo '<th scope="row"><label for="researcher_current_position">' . __('Position/Role', 'research-profile') . '</label></th>';
    echo '<td><input type="text" id="researcher_current_position" name="researcher_current_position" value="' . esc_attr($current_position) . '" style="width: 100%;" placeholder="e.g., Associate Professor" /></td>';
    echo '</tr>';
    echo '<tr>';
    echo '<th scope="row"><label for="researcher_affiliation_url">' . __('Institution URL', 'research-profile') . '</label></th>';
    echo '<td><input type="url" id="researcher_affiliation_url" name="researcher_current_affiliation_url" value="' . esc_url($affiliation_url) . '" style="width: 100%;" /></td>';
    echo '</tr>';
    echo '<tr>';
    echo '<th scope="row"><label for="researcher_start_date">' . __('Start Date', 'research-profile') . '</label></th>';
    echo '<td><input type="date" id="researcher_start_date" name="researcher_current_affiliation_start_date" value="' . esc_attr($start_date) . '" /></td>';
    echo '</tr>';
    echo '</table>';
}

// Profile Settings meta box callback
function research_profile_settings_callback($post) {
    $is_public = get_post_meta($post->ID, '_researcher_is_public', true);
    if ($is_public === '') $is_public = '1'; // Default to public
    
    echo '<p>';
    echo '<label><input type="checkbox" name="researcher_is_public" value="1"' . checked($is_public, '1', false) . ' /> ' . __('Make profile public', 'research-profile') . '</label>';
    echo '</p>';
    echo '<p class="description">' . __('When enabled, this researcher profile will be visible to the public.', 'research-profile') . '</p>';
}

// Save meta box data
function research_profile_save_meta($post_id) {
    // Check if nonce is valid
    if (!isset($_POST['research_profile_nonce']) || !wp_verify_nonce($_POST['research_profile_nonce'], 'research_profile_save_meta')) {
        return;
    }
    
    // Check if user has permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // Check if not an autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // Save meta fields
    $fields = array(
        'researcher_display_name' => '_researcher_display_name',
        'researcher_title' => '_researcher_title',
        'researcher_bio' => '_researcher_bio',
        'researcher_cv_url' => '_researcher_cv_url',
        'researcher_openalex_id' => '_researcher_openalex_id',
        'researcher_current_affiliation' => '_researcher_current_affiliation',
        'researcher_current_position' => '_researcher_current_position',
        'researcher_current_affiliation_url' => '_researcher_current_affiliation_url',
        'researcher_current_affiliation_start_date' => '_researcher_current_affiliation_start_date',
    );
    
    foreach ($fields as $field_key => $meta_key) {
        if (isset($_POST[$field_key])) {
            update_post_meta($post_id, $meta_key, sanitize_text_field($_POST[$field_key]));
        }
    }
    
    // Handle checkbox
    $is_public = isset($_POST['researcher_is_public']) ? '1' : '0';
    update_post_meta($post_id, '_researcher_is_public', $is_public);
}
add_action('save_post', 'research_profile_save_meta');

// AJAX handler for OpenAlex data sync
function research_profile_sync_openalex_data() {
    check_ajax_referer('research_profile_nonce', 'nonce');
    
    if (!current_user_can('edit_posts')) {
        wp_die('Unauthorized');
    }
    
    $post_id = intval($_POST['post_id']);
    $openalex_id = get_post_meta($post_id, '_researcher_openalex_id', true);
    
    if (!$openalex_id) {
        wp_send_json_error('OpenAlex ID not found');
    }
    
    // Sync data from OpenAlex API
    $synced_data = research_profile_fetch_openalex_data($openalex_id);
    
    if ($synced_data) {
        // Save synced data as post meta
        update_post_meta($post_id, '_researcher_openalex_data', $synced_data);
        update_post_meta($post_id, '_researcher_last_synced', time());
        
        wp_send_json_success(array(
            'message' => 'Data synced successfully',
            'last_synced' => date('Y-m-d H:i:s')
        ));
    } else {
        wp_send_json_error('Failed to sync data from OpenAlex');
    }
}
add_action('wp_ajax_sync_openalex_data', 'research_profile_sync_openalex_data');

// Function to fetch data from OpenAlex API
function research_profile_fetch_openalex_data($openalex_id) {
    // Ensure OpenAlex ID is properly formatted
    if (!preg_match('/^A\d+$/', $openalex_id)) {
        return false;
    }
    
    $author_url = "https://api.openalex.org/authors/{$openalex_id}";
    $works_url = "https://api.openalex.org/works?filter=author.id:{$openalex_id}&per-page=200&sort=publication_year:desc";
    
    // Fetch author data
    $author_response = wp_remote_get($author_url, array('timeout' => 30));
    if (is_wp_error($author_response) || wp_remote_retrieve_response_code($author_response) !== 200) {
        return false;
    }
    
    // Fetch works data
    $works_response = wp_remote_get($works_url, array('timeout' => 30));
    if (is_wp_error($works_response) || wp_remote_retrieve_response_code($works_response) !== 200) {
        return false;
    }
    
    $author_data = json_decode(wp_remote_retrieve_body($author_response), true);
    $works_data = json_decode(wp_remote_retrieve_body($works_response), true);
    
    return array(
        'author' => $author_data,
        'works' => $works_data['results'] ?? array(),
        'works_count' => $works_data['meta']['count'] ?? 0,
        'synced_at' => time()
    );
}

// Custom query for public researchers only on frontend
function research_profile_public_researchers_only($query) {
    if (!is_admin() && $query->is_main_query()) {
        if (is_post_type_archive('researcher') || (is_home() && get_option('show_on_front') === 'posts')) {
            $query->set('meta_query', array(
                array(
                    'key' => '_researcher_is_public',
                    'value' => '1',
                    'compare' => '='
                )
            ));
        }
    }
}
add_action('pre_get_posts', 'research_profile_public_researchers_only');

// Add custom columns to the researcher admin list
function research_profile_add_custom_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = $columns['title'];
    $new_columns['researcher_name'] = __('Researcher Name', 'research-profile');
    $new_columns['openalex_id'] = __('OpenAlex ID', 'research-profile');
    $new_columns['affiliation'] = __('Current Affiliation', 'research-profile');
    $new_columns['is_public'] = __('Public', 'research-profile');
    $new_columns['date'] = $columns['date'];
    
    return $new_columns;
}
add_filter('manage_researcher_posts_columns', 'research_profile_add_custom_columns');

// Populate custom columns
function research_profile_populate_custom_columns($column, $post_id) {
    switch ($column) {
        case 'researcher_name':
            $display_name = get_post_meta($post_id, '_researcher_display_name', true);
            echo $display_name ? esc_html($display_name) : '—';
            break;
        case 'openalex_id':
            $openalex_id = get_post_meta($post_id, '_researcher_openalex_id', true);
            echo $openalex_id ? esc_html($openalex_id) : '—';
            break;
        case 'affiliation':
            $affiliation = get_post_meta($post_id, '_researcher_current_affiliation', true);
            echo $affiliation ? esc_html($affiliation) : '—';
            break;
        case 'is_public':
            $is_public = get_post_meta($post_id, '_researcher_is_public', true);
            echo $is_public === '1' ? __('Yes', 'research-profile') : __('No', 'research-profile');
            break;
    }
}
add_action('manage_researcher_posts_custom_column', 'research_profile_populate_custom_columns', 10, 2);

// Theme customizer options
function research_profile_customize_register($wp_customize) {
    // Theme Options Section
    $wp_customize->add_section('research_profile_theme_options', array(
        'title' => __('Theme Options', 'research-profile'),
        'priority' => 120,
    ));
    
    // Homepage setting
    $wp_customize->add_setting('research_profile_homepage_researcher', array(
        'default' => '',
        'sanitize_callback' => 'absint',
    ));
    
    $wp_customize->add_control('research_profile_homepage_researcher', array(
        'label' => __('Featured Researcher on Homepage', 'research-profile'),
        'section' => 'research_profile_theme_options',
        'type' => 'select',
        'choices' => research_profile_get_researcher_choices(),
    ));
}
add_action('customize_register', 'research_profile_customize_register');

// Helper function to get researcher choices for customizer
function research_profile_get_researcher_choices() {
    $researchers = get_posts(array(
        'post_type' => 'researcher',
        'posts_per_page' => -1,
        'post_status' => 'publish',
        'meta_query' => array(
            array(
                'key' => '_researcher_is_public',
                'value' => '1',
                'compare' => '='
            )
        )
    ));
    
    $choices = array('' => __('Select a researcher', 'research-profile'));
    foreach ($researchers as $researcher) {
        $display_name = get_post_meta($researcher->ID, '_researcher_display_name', true);
        $choices[$researcher->ID] = $display_name ? $display_name : $researcher->post_title;
    }
    
    return $choices;
}

// Helper functions for template use
function research_profile_get_researcher_data($post_id) {
    return array(
        'display_name' => get_post_meta($post_id, '_researcher_display_name', true),
        'title' => get_post_meta($post_id, '_researcher_title', true),
        'bio' => get_post_meta($post_id, '_researcher_bio', true),
        'cv_url' => get_post_meta($post_id, '_researcher_cv_url', true),
        'openalex_id' => get_post_meta($post_id, '_researcher_openalex_id', true),
        'current_affiliation' => get_post_meta($post_id, '_researcher_current_affiliation', true),
        'current_position' => get_post_meta($post_id, '_researcher_current_position', true),
        'current_affiliation_url' => get_post_meta($post_id, '_researcher_current_affiliation_url', true),
        'current_affiliation_start_date' => get_post_meta($post_id, '_researcher_current_affiliation_start_date', true),
        'is_public' => get_post_meta($post_id, '_researcher_is_public', true),
        'openalex_data' => get_post_meta($post_id, '_researcher_openalex_data', true),
        'last_synced' => get_post_meta($post_id, '_researcher_last_synced', true),
    );
}
?>