<?php
/**
 * Elementor Integration
 *
 * @package Research_Profile
 */

if (!defined('ABSPATH')) {
    exit;
}

class Research_Profile_Elementor_Integration {
    
    public function __construct() {
        add_action('elementor/widgets/register', [$this, 'register_widgets']);
        add_action('elementor/elements/categories_registered', [$this, 'add_elementor_category']);
    }
    
    public function add_elementor_category($elements_manager) {
        $elements_manager->add_category(
            'research-profile',
            [
                'title' => __('Research Profile', 'research-profile'),
                'icon' => 'fa fa-graduation-cap',
            ]
        );
    }
    
    public function register_widgets($widgets_manager) {
        require_once RESEARCH_PROFILE_PATH . '/includes/elementor/widgets/researcher-hero.php';
        require_once RESEARCH_PROFILE_PATH . '/includes/elementor/widgets/publication-analytics.php';
        require_once RESEARCH_PROFILE_PATH . '/includes/elementor/widgets/publications-list.php';
        require_once RESEARCH_PROFILE_PATH . '/includes/elementor/widgets/research-topics.php';
        
        $widgets_manager->register(new Research_Profile_Researcher_Hero_Widget());
        $widgets_manager->register(new Research_Profile_Analytics_Widget());
        $widgets_manager->register(new Research_Profile_Publications_List_Widget());
        $widgets_manager->register(new Research_Profile_Research_Topics_Widget());
    }
}

new Research_Profile_Elementor_Integration();
