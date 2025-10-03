<?php
/**
 * Researcher Hero Elementor Widget
 *
 * @package Research_Profile
 */

if (!defined('ABSPATH')) {
    exit;
}

class Research_Profile_Researcher_Hero_Widget extends \Elementor\Widget_Base {
    
    public function get_name() {
        return 'researcher_hero';
    }
    
    public function get_title() {
        return __('Researcher Hero', 'research-profile');
    }
    
    public function get_icon() {
        return 'eicon-person';
    }
    
    public function get_categories() {
        return ['research-profile'];
    }
    
    protected function register_controls() {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Content', 'research-profile'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );
        
        $this->add_control(
            'researcher_id',
            [
                'label' => __('Researcher', 'research-profile'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'options' => $this->get_researchers(),
                'default' => '',
            ]
        );
        
        $this->add_control(
            'show_bio',
            [
                'label' => __('Show Biography', 'research-profile'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes',
            ]
        );
        
        $this->add_control(
            'show_cv_button',
            [
                'label' => __('Show CV Button', 'research-profile'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes',
            ]
        );
        
        $this->end_controls_section();
    }
    
    private function get_researchers() {
        $researchers = get_posts([
            'post_type' => 'researcher',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ]);
        
        $options = ['' => __('Select Researcher', 'research-profile')];
        foreach ($researchers as $researcher) {
            $options[$researcher->ID] = $researcher->post_title;
        }
        
        return $options;
    }
    
    protected function render() {
        $settings = $this->get_settings_for_display();
        $researcher_id = $settings['researcher_id'];
        
        if (!$researcher_id) {
            echo '<p>' . esc_html__('Please select a researcher', 'research-profile') . '</p>';
            return;
        }
        
        $post = get_post($researcher_id);
        $title = get_post_meta($researcher_id, 'title', true);
        $affiliation = get_post_meta($researcher_id, 'current_affiliation', true);
        $bio = get_post_meta($researcher_id, 'bio', true);
        $cv_url = get_post_meta($researcher_id, 'cv_url', true);
        ?>
        <div class="researcher-hero bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4">
            <div class="max-w-4xl mx-auto">
                <?php if (has_post_thumbnail($researcher_id)) : ?>
                    <div class="mb-6">
                        <?php echo get_the_post_thumbnail($researcher_id, 'medium', ['class' => 'rounded-full w-32 h-32 object-cover mx-auto']); ?>
                    </div>
                <?php endif; ?>
                
                <h1 class="text-4xl font-bold text-gray-900 text-center mb-2">
                    <?php echo esc_html($post->post_title); ?>
                </h1>
                
                <?php if ($title) : ?>
                    <p class="text-xl text-gray-600 text-center mb-4">
                        <?php echo esc_html($title); ?>
                    </p>
                <?php endif; ?>
                
                <?php if ($affiliation) : ?>
                    <p class="text-lg text-gray-500 text-center mb-6">
                        <?php echo esc_html($affiliation); ?>
                    </p>
                <?php endif; ?>
                
                <?php if ($settings['show_bio'] === 'yes' && $bio) : ?>
                    <div class="prose max-w-none text-center">
                        <?php echo wpautop(esc_html($bio)); ?>
                    </div>
                <?php endif; ?>
                
                <?php if ($settings['show_cv_button'] === 'yes' && $cv_url) : ?>
                    <div class="mt-6 text-center">
                        <a href="<?php echo esc_url($cv_url); ?>" 
                           class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                           target="_blank" rel="noopener noreferrer">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <?php esc_html_e('Download CV', 'research-profile'); ?>
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
}
