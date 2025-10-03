<?php
/**
 * Research Profile Platform - WordPress Theme Functions (Updated for Plugin Integration)
 * 
 * This theme loads a React application and integrates with the Research Profile Platform plugin.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Theme setup
 */
function research_profile_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_filter('show_admin_bar', '__return_false');
}
add_action('after_setup_theme', 'research_profile_setup');

/**
 * Enqueue React app scripts and styles
 */
function research_profile_enqueue_scripts() {
    $theme_dir = get_template_directory_uri();
    $build_dir = $theme_dir . '/build';
    
    $index_html_path = get_template_directory() . '/build/index.html';
    
    if (file_exists($index_html_path)) {
        $html_content = file_get_contents($index_html_path);
        
        // Extract CSS file
        if (preg_match('/<link rel="stylesheet"[^>]*href="([^"]+)"/', $html_content, $css_match)) {
            $css_file = $css_match[1];
            wp_enqueue_style(
                'research-profile-css',
                $build_dir . $css_file,
                array(),
                null
            );
        }
        
        // Extract JS file
        if (preg_match('/<script[^>]*src="([^"]+)"[^>]*><\/script>/', $html_content, $js_match)) {
            $js_file = $js_match[1];
            wp_enqueue_script(
                'research-profile-main',
                $build_dir . $js_file,
                array(),
                null,
                true
            );
            
            // Pass WordPress configuration to React app
            wp_localize_script('research-profile-main', 'ResearchProfileConfig', array(
                'apiUrl' => rest_url('research-profile/v1'),
                'siteUrl' => get_site_url(),
                'themePath' => $theme_dir,
                'nonce' => wp_create_nonce('wp_rest'),
                'isWordPress' => true
            ));
        }
    }
}
add_action('wp_enqueue_scripts', 'research_profile_enqueue_scripts');

/**
 * Remove default WordPress content
 */
function research_profile_remove_default_content() {
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'rsd_link');
}
add_action('init', 'research_profile_remove_default_content');
