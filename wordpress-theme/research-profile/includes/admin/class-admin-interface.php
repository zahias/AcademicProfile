<?php
/**
 * Admin Interface
 *
 * @package Research_Profile
 */

if (!defined('ABSPATH')) {
    exit;
}

class Research_Profile_Admin_Interface {
    
    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('add_meta_boxes', [$this, 'add_meta_boxes']);
        add_action('save_post_researcher', [$this, 'save_meta_boxes']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        add_action('wp_ajax_sync_researcher', [$this, 'ajax_sync_researcher']);
    }
    
    public function add_admin_menu() {
        add_menu_page(
            __('Research Profiles', 'research-profile'),
            __('Research Profiles', 'research-profile'),
            'manage_options',
            'research-profiles',
            [$this, 'admin_page'],
            'dashicons-id',
            30
        );
        
        add_submenu_page(
            'research-profiles',
            __('Settings', 'research-profile'),
            __('Settings', 'research-profile'),
            'manage_options',
            'research-profile-settings',
            [$this, 'settings_page']
        );
    }
    
    public function add_meta_boxes() {
        add_meta_box(
            'researcher_details',
            __('Researcher Details', 'research-profile'),
            [$this, 'render_details_meta_box'],
            'researcher',
            'normal',
            'high'
        );
        
        add_meta_box(
            'researcher_sync',
            __('OpenAlex Sync', 'research-profile'),
            [$this, 'render_sync_meta_box'],
            'researcher',
            'side',
            'default'
        );
    }
    
    public function render_details_meta_box($post) {
        wp_nonce_field('researcher_details_nonce', 'researcher_details_nonce');
        
        $openalex_id = get_post_meta($post->ID, 'openalex_id', true);
        $bio = get_post_meta($post->ID, 'bio', true);
        $title = get_post_meta($post->ID, 'title', true);
        $current_affiliation = get_post_meta($post->ID, 'current_affiliation', true);
        $cv_url = get_post_meta($post->ID, 'cv_url', true);
        ?>
        <table class="form-table">
            <tr>
                <th><label for="openalex_id"><?php esc_html_e('OpenAlex ID', 'research-profile'); ?></label></th>
                <td>
                    <input type="text" id="openalex_id" name="openalex_id" 
                           value="<?php echo esc_attr($openalex_id); ?>" 
                           class="regular-text" 
                           placeholder="A1234567890">
                    <p class="description"><?php esc_html_e('Enter the OpenAlex author ID (e.g., A1234567890)', 'research-profile'); ?></p>
                </td>
            </tr>
            <tr>
                <th><label for="title"><?php esc_html_e('Title/Position', 'research-profile'); ?></label></th>
                <td>
                    <input type="text" id="title" name="title" 
                           value="<?php echo esc_attr($title); ?>" 
                           class="regular-text" 
                           placeholder="Professor of Computer Science">
                </td>
            </tr>
            <tr>
                <th><label for="current_affiliation"><?php esc_html_e('Current Affiliation', 'research-profile'); ?></label></th>
                <td>
                    <input type="text" id="current_affiliation" name="current_affiliation" 
                           value="<?php echo esc_attr($current_affiliation); ?>" 
                           class="regular-text" 
                           placeholder="Stanford University">
                </td>
            </tr>
            <tr>
                <th><label for="bio"><?php esc_html_e('Biography', 'research-profile'); ?></label></th>
                <td>
                    <textarea id="bio" name="bio" rows="5" class="large-text"><?php echo esc_textarea($bio); ?></textarea>
                </td>
            </tr>
            <tr>
                <th><label for="cv_url"><?php esc_html_e('CV URL', 'research-profile'); ?></label></th>
                <td>
                    <input type="url" id="cv_url" name="cv_url" 
                           value="<?php echo esc_url($cv_url); ?>" 
                           class="regular-text" 
                           placeholder="https://example.com/cv.pdf">
                    <button type="button" class="button" id="upload_cv_button">
                        <?php esc_html_e('Upload CV', 'research-profile'); ?>
                    </button>
                </td>
            </tr>
        </table>
        <?php
    }
    
    public function render_sync_meta_box($post) {
        $last_synced = get_post_meta($post->ID, 'last_synced_at', true);
        ?>
        <div class="sync-meta-box">
            <?php if ($last_synced) : ?>
                <p>
                    <strong><?php esc_html_e('Last Synced:', 'research-profile'); ?></strong><br>
                    <?php echo esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($last_synced))); ?>
                </p>
            <?php else : ?>
                <p><?php esc_html_e('Not synced yet', 'research-profile'); ?></p>
            <?php endif; ?>
            
            <p>
                <button type="button" class="button button-primary button-large" id="sync-researcher-button" 
                        data-researcher-id="<?php echo esc_attr($post->ID); ?>">
                    <?php esc_html_e('Sync with OpenAlex', 'research-profile'); ?>
                </button>
            </p>
            
            <div id="sync-status" style="display: none; margin-top: 10px;"></div>
        </div>
        <?php
    }
    
    public function save_meta_boxes($post_id) {
        if (!isset($_POST['researcher_details_nonce']) || 
            !wp_verify_nonce($_POST['researcher_details_nonce'], 'researcher_details_nonce')) {
            return;
        }
        
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        $fields = ['openalex_id', 'bio', 'title', 'current_affiliation', 'cv_url'];
        
        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, $field, sanitize_text_field($_POST[$field]));
            }
        }
    }
    
    public function enqueue_admin_scripts($hook) {
        if ('post.php' === $hook || 'post-new.php' === $hook) {
            global $post;
            if ($post && $post->post_type === 'researcher') {
                wp_enqueue_media();
                wp_enqueue_script(
                    'research-profile-admin',
                    RESEARCH_PROFILE_URL . '/assets/js/admin.js',
                    ['jquery'],
                    RESEARCH_PROFILE_VERSION,
                    true
                );
                wp_localize_script('research-profile-admin', 'researchProfileAdmin', [
                    'ajaxUrl' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('research_profile_admin'),
                ]);
            }
        }
    }
    
    public function ajax_sync_researcher() {
        check_ajax_referer('research_profile_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied', 'research-profile')]);
        }
        
        $researcher_id = intval($_POST['researcher_id']);
        $openalex_id = get_post_meta($researcher_id, 'openalex_id', true);
        
        if (!$openalex_id) {
            wp_send_json_error(['message' => __('OpenAlex ID not set', 'research-profile')]);
        }
        
        $service = new Research_Profile_OpenAlex_Service();
        $result = $service->sync_researcher_data($researcher_id, $openalex_id);
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Research Profiles', 'research-profile'); ?></h1>
            
            <p><?php esc_html_e('Manage researcher profiles with OpenAlex integration.', 'research-profile'); ?></p>
            
            <p>
                <a href="<?php echo esc_url(admin_url('post-new.php?post_type=researcher')); ?>" class="button button-primary">
                    <?php esc_html_e('Add New Researcher', 'research-profile'); ?>
                </a>
            </p>
        </div>
        <?php
    }
    
    public function settings_page() {
        if (isset($_POST['submit']) && check_admin_referer('research_profile_settings')) {
            update_option('research_profile_mailto_email', sanitize_email($_POST['mailto_email']));
            echo '<div class="notice notice-success"><p>' . esc_html__('Settings saved.', 'research-profile') . '</p></div>';
        }
        
        $mailto_email = get_option('research_profile_mailto_email', get_bloginfo('admin_email'));
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Research Profile Settings', 'research-profile'); ?></h1>
            
            <form method="post">
                <?php wp_nonce_field('research_profile_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th><label for="mailto_email"><?php esc_html_e('OpenAlex Mailto Email', 'research-profile'); ?></label></th>
                        <td>
                            <input type="email" id="mailto_email" name="mailto_email" 
                                   value="<?php echo esc_attr($mailto_email); ?>" 
                                   class="regular-text" required>
                            <p class="description">
                                <?php esc_html_e('Email address for OpenAlex API requests (recommended for better rate limits)', 'research-profile'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <p class="submit">
                    <input type="submit" name="submit" class="button button-primary" 
                           value="<?php esc_attr_e('Save Settings', 'research-profile'); ?>">
                </p>
            </form>
        </div>
        <?php
    }
}

new Research_Profile_Admin_Interface();
