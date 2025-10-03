<?php
/**
 * REST API Handler
 * 
 * Registers WordPress REST API endpoints for the Research Profile Platform
 */

if (!defined('ABSPATH')) {
    exit;
}

class RPP_REST_API {
    
    private $namespace = 'research-profile/v1';
    private $openalex_api;
    
    public function __construct() {
        $this->openalex_api = new RPP_OpenAlex_API();
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register all REST API routes
     */
    public function register_routes() {
        // Public routes
        register_rest_route($this->namespace, '/researcher/(?P<openalex_id>[A-Za-z0-9]+)/data', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_researcher_data'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route($this->namespace, '/openalex/search/(?P<openalex_id>[A-Za-z0-9]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'search_openalex'),
            'permission_callback' => '__return_true'
        ));
        
        // Admin routes
        register_rest_route($this->namespace, '/admin/researcher/profile', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_profile'),
            'permission_callback' => array($this, 'check_admin_permission')
        ));
        
        register_rest_route($this->namespace, '/admin/researcher/profile/(?P<openalex_id>[A-Za-z0-9]+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_profile'),
            'permission_callback' => array($this, 'check_admin_permission')
        ));
        
        register_rest_route($this->namespace, '/admin/researcher/(?P<openalex_id>[A-Za-z0-9]+)/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'sync_researcher'),
            'permission_callback' => array($this, 'check_admin_permission')
        ));
        
        register_rest_route($this->namespace, '/admin/researcher/(?P<openalex_id>[A-Za-z0-9]+)/upload-cv', array(
            'methods' => 'POST',
            'callback' => array($this, 'upload_cv'),
            'permission_callback' => array($this, 'check_admin_permission')
        ));
    }
    
    /**
     * Check if user has admin permission
     */
    public function check_admin_permission() {
        return current_user_can('manage_options');
    }
    
    /**
     * Get researcher data (public endpoint)
     */
    public function get_researcher_data($request) {
        $openalex_id = $request['openalex_id'];
        
        // Get profile
        $profile = RPP_Database::get_profile_by_openalex_id($openalex_id);
        if (!$profile || !$profile['is_public']) {
            return new WP_Error('not_found', 'Researcher not found or not public', array('status' => 404));
        }
        
        // Get cached OpenAlex data
        $cached_data = RPP_Database::get_cached_data($openalex_id, 'researcher');
        $researcher_data = $cached_data ? $cached_data['data'] : null;
        
        // Get topics
        $topics = RPP_Database::get_topics($openalex_id);
        
        // Get publications
        $publications = RPP_Database::get_publications($openalex_id, 50);
        
        // Get affiliations
        $affiliations = RPP_Database::get_affiliations($openalex_id);
        
        return rest_ensure_response(array(
            'profile' => $profile,
            'openalexData' => $researcher_data,
            'topics' => $topics,
            'publications' => $publications,
            'affiliations' => $affiliations
        ));
    }
    
    /**
     * Search OpenAlex API
     */
    public function search_openalex($request) {
        $openalex_id = $request['openalex_id'];
        
        $data = $this->openalex_api->get_researcher($openalex_id);
        
        if (!$data) {
            return new WP_Error('not_found', 'Researcher not found in OpenAlex', array('status' => 404));
        }
        
        return rest_ensure_response($data);
    }
    
    /**
     * Create researcher profile (admin only)
     */
    public function create_profile($request) {
        $params = $request->get_json_params();
        
        // Validate required fields
        if (empty($params['openalex_id'])) {
            return new WP_Error('missing_field', 'OpenAlex ID is required', array('status' => 400));
        }
        
        // Normalize OpenAlex ID
        $openalex_id = $this->normalize_openalex_id($params['openalex_id']);
        if (!preg_match('/^A\d+$/', $openalex_id)) {
            return new WP_Error('invalid_id', 'OpenAlex ID must start with A followed by numbers', array('status' => 400));
        }
        
        // Set defaults
        $data = array(
            'user_id' => get_current_user_id(),
            'openalex_id' => $openalex_id,
            'display_name' => isset($params['displayName']) ? sanitize_text_field($params['displayName']) : null,
            'title' => isset($params['title']) ? sanitize_text_field($params['title']) : null,
            'bio' => isset($params['bio']) ? sanitize_textarea_field($params['bio']) : null,
            'current_affiliation' => isset($params['currentAffiliation']) ? sanitize_text_field($params['currentAffiliation']) : null,
            'current_position' => isset($params['currentPosition']) ? sanitize_text_field($params['currentPosition']) : null,
            'current_affiliation_url' => isset($params['currentAffiliationUrl']) ? esc_url_raw($params['currentAffiliationUrl']) : null,
            'current_affiliation_start_date' => isset($params['currentAffiliationStartDate']) && !empty($params['currentAffiliationStartDate']) ? $params['currentAffiliationStartDate'] : null,
            'is_public' => isset($params['isPublic']) ? (bool)$params['isPublic'] : true,
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql')
        );
        
        $profile = RPP_Database::upsert_profile($data);
        
        // Trigger sync in background if needed
        if ($profile) {
            wp_schedule_single_event(time(), 'rpp_sync_researcher', array($openalex_id));
        }
        
        return rest_ensure_response($profile);
    }
    
    /**
     * Update researcher profile (admin only)
     */
    public function update_profile($request) {
        $openalex_id = $request['openalex_id'];
        $params = $request->get_json_params();
        
        $profile = RPP_Database::get_profile_by_openalex_id($openalex_id);
        if (!$profile) {
            return new WP_Error('not_found', 'Profile not found', array('status' => 404));
        }
        
        // Build update data
        $data = array();
        if (isset($params['displayName'])) {
            $data['display_name'] = sanitize_text_field($params['displayName']);
        }
        if (isset($params['title'])) {
            $data['title'] = sanitize_text_field($params['title']);
        }
        if (isset($params['bio'])) {
            $data['bio'] = sanitize_textarea_field($params['bio']);
        }
        if (isset($params['currentAffiliation'])) {
            $data['current_affiliation'] = sanitize_text_field($params['currentAffiliation']);
        }
        if (isset($params['currentPosition'])) {
            $data['current_position'] = sanitize_text_field($params['currentPosition']);
        }
        if (isset($params['currentAffiliationUrl'])) {
            $data['current_affiliation_url'] = esc_url_raw($params['currentAffiliationUrl']);
        }
        if (isset($params['currentAffiliationStartDate'])) {
            $data['current_affiliation_start_date'] = !empty($params['currentAffiliationStartDate']) ? $params['currentAffiliationStartDate'] : null;
        }
        if (isset($params['isPublic'])) {
            $data['is_public'] = (bool)$params['isPublic'];
        }
        if (isset($params['cvUrl'])) {
            $data['cv_url'] = esc_url_raw($params['cvUrl']);
        }
        
        $data['openalex_id'] = $openalex_id;
        $updated_profile = RPP_Database::upsert_profile($data);
        
        return rest_ensure_response($updated_profile);
    }
    
    /**
     * Sync researcher data from OpenAlex (admin only)
     */
    public function sync_researcher($request) {
        $openalex_id = $request['openalex_id'];
        
        $profile = RPP_Database::get_profile_by_openalex_id($openalex_id);
        if (!$profile) {
            return new WP_Error('not_found', 'Profile not found', array('status' => 404));
        }
        
        try {
            $results = $this->openalex_api->sync_researcher_data($openalex_id);
            
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Data synchronized successfully',
                'results' => $results
            ));
        } catch (Exception $e) {
            return new WP_Error('sync_failed', $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Upload CV (admin only)
     */
    public function upload_cv($request) {
        $openalex_id = $request['openalex_id'];
        
        $profile = RPP_Database::get_profile_by_openalex_id($openalex_id);
        if (!$profile) {
            return new WP_Error('not_found', 'Profile not found', array('status' => 404));
        }
        
        // Get uploaded file
        $files = $request->get_file_params();
        if (empty($files['cv'])) {
            return new WP_Error('no_file', 'No file uploaded', array('status' => 400));
        }
        
        $file = $files['cv'];
        
        // Check file type
        if ($file['type'] !== 'application/pdf') {
            return new WP_Error('invalid_type', 'Only PDF files are allowed', array('status' => 400));
        }
        
        // Check file size (10MB max)
        if ($file['size'] > 10 * 1024 * 1024) {
            return new WP_Error('file_too_large', 'File must be less than 10MB', array('status' => 400));
        }
        
        // Use WordPress media upload
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        $attachment_id = media_handle_sideload($file, 0, 'CV for ' . $openalex_id);
        
        if (is_wp_error($attachment_id)) {
            return $attachment_id;
        }
        
        $cv_url = wp_get_attachment_url($attachment_id);
        
        // Update profile with CV URL
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_profiles';
        $wpdb->update(
            $table,
            array('cv_url' => $cv_url),
            array('openalex_id' => $openalex_id)
        );
        
        return rest_ensure_response(array(
            'success' => true,
            'cv_url' => $cv_url,
            'attachment_id' => $attachment_id
        ));
    }
    
    /**
     * Normalize OpenAlex ID
     */
    private function normalize_openalex_id($id) {
        $id = trim($id);
        if (strtolower(substr($id, 0, 1)) === 'a') {
            $id = 'A' . substr($id, 1);
        } elseif (!str_starts_with($id, 'A')) {
            $id = 'A' . $id;
        }
        return $id;
    }
}

// Register sync action for background processing
add_action('rpp_sync_researcher', function($openalex_id) {
    $api = new RPP_OpenAlex_API();
    $api->sync_researcher_data($openalex_id);
});
