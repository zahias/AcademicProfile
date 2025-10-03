<?php
/**
 * Publication Analytics Elementor Widget
 *
 * @package Research_Profile
 */

if (!defined('ABSPATH')) {
    exit;
}

class Research_Profile_Analytics_Widget extends \Elementor\Widget_Base {
    
    public function get_name() {
        return 'publication_analytics';
    }
    
    public function get_title() {
        return __('Publication Analytics', 'research-profile');
    }
    
    public function get_icon() {
        return 'eicon-chart';
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
            'show_stats',
            [
                'label' => __('Show Statistics', 'research-profile'),
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
        
        $service = new Research_Profile_OpenAlex_Service();
        $analytics = $service->get_analytics_data($researcher_id);
        ?>
        <div class="publication-analytics py-12">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-gray-900 mb-8">
                    <?php esc_html_e('Publication Analytics', 'research-profile'); ?>
                </h2>
                
                <?php if ($settings['show_stats'] === 'yes') : ?>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-blue-50 rounded-lg p-6">
                            <h3 class="text-sm font-medium text-gray-600 mb-2">
                                <?php esc_html_e('Total Publications', 'research-profile'); ?>
                            </h3>
                            <p class="text-3xl font-bold text-blue-600">
                                <?php echo esc_html($analytics['total_publications']); ?>
                            </p>
                        </div>
                        
                        <div class="bg-green-50 rounded-lg p-6">
                            <h3 class="text-sm font-medium text-gray-600 mb-2">
                                <?php esc_html_e('Total Citations', 'research-profile'); ?>
                            </h3>
                            <p class="text-3xl font-bold text-green-600">
                                <?php echo esc_html($analytics['total_citations']); ?>
                            </p>
                        </div>
                        
                        <div class="bg-purple-50 rounded-lg p-6">
                            <h3 class="text-sm font-medium text-gray-600 mb-2">
                                <?php esc_html_e('Avg Citations', 'research-profile'); ?>
                            </h3>
                            <p class="text-3xl font-bold text-purple-600">
                                <?php echo esc_html($analytics['avg_citations']); ?>
                            </p>
                        </div>
                    </div>
                <?php endif; ?>
                
                <div class="bg-gray-50 rounded-lg p-8">
                    <div id="elementor-analytics-charts-<?php echo esc_attr($researcher_id); ?>" 
                         data-researcher-id="<?php echo esc_attr($researcher_id); ?>"
                         data-growth='<?php echo wp_json_encode($analytics['growth']); ?>'
                         data-types='<?php echo wp_json_encode($analytics['types']); ?>'
                         data-citations='<?php echo wp_json_encode($analytics['citations']); ?>'>
                        <p class="text-center text-gray-500">
                            <?php esc_html_e('Charts will be rendered here via JavaScript', 'research-profile'); ?>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}
