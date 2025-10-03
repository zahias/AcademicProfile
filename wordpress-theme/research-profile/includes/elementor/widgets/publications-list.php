<?php
/**
 * Publications List Elementor Widget
 *
 * @package Research_Profile
 */

if (!defined('ABSPATH')) {
    exit;
}

class Research_Profile_Publications_List_Widget extends \Elementor\Widget_Base {
    
    public function get_name() {
        return 'publications_list';
    }
    
    public function get_title() {
        return __('Publications List', 'research-profile');
    }
    
    public function get_icon() {
        return 'eicon-post-list';
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
            'limit',
            [
                'label' => __('Number of Publications', 'research-profile'),
                'type' => \Elementor\Controls_Manager::NUMBER,
                'default' => 10,
                'min' => 1,
                'max' => 50,
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
        $limit = $settings['limit'];
        
        if (!$researcher_id) {
            echo '<p>' . esc_html__('Please select a researcher', 'research-profile') . '</p>';
            return;
        }
        
        $publications = Research_Profile_Database::get_researcher_publications($researcher_id, $limit);
        ?>
        <div class="publications-list py-12">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-gray-900 mb-8">
                    <?php esc_html_e('Recent Publications', 'research-profile'); ?>
                </h2>
                
                <div class="space-y-6">
                    <?php foreach ($publications as $publication) : ?>
                        <div class="bg-gray-50 rounded-lg p-6">
                            <h3 class="text-xl font-semibold text-gray-900 mb-2">
                                <?php echo esc_html($publication->title); ?>
                            </h3>
                            <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                                <?php if ($publication->publication_year) : ?>
                                    <span><?php echo esc_html($publication->publication_year); ?></span>
                                <?php endif; ?>
                                <?php if ($publication->type) : ?>
                                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                        <?php echo esc_html($publication->type); ?>
                                    </span>
                                <?php endif; ?>
                                <span><?php esc_html_e('Citations:', 'research-profile'); ?> <?php echo esc_html($publication->cited_by_count); ?></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php
    }
}
