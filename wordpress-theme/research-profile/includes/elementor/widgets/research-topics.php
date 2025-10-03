<?php
/**
 * Research Topics Elementor Widget
 *
 * @package Research_Profile
 */

if (!defined('ABSPATH')) {
    exit;
}

class Research_Profile_Research_Topics_Widget extends \Elementor\Widget_Base {
    
    public function get_name() {
        return 'research_topics';
    }
    
    public function get_title() {
        return __('Research Topics', 'research-profile');
    }
    
    public function get_icon() {
        return 'eicon-tags';
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
        
        $topics = Research_Profile_Database::get_researcher_topics($researcher_id);
        ?>
        <div class="research-topics py-12 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-gray-900 mb-8">
                    <?php esc_html_e('Research Areas', 'research-profile'); ?>
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($topics as $topic) : ?>
                        <div class="bg-white rounded-lg p-6 shadow-sm">
                            <h3 class="font-semibold text-gray-900 mb-2">
                                <?php echo esc_html($topic->display_name); ?>
                            </h3>
                            <div class="text-sm text-gray-500 space-y-1">
                                <?php if ($topic->field) : ?>
                                    <p><?php esc_html_e('Field:', 'research-profile'); ?> <?php echo esc_html($topic->field); ?></p>
                                <?php endif; ?>
                                <p><?php esc_html_e('Publications:', 'research-profile'); ?> <?php echo esc_html($topic->count); ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php
    }
}
