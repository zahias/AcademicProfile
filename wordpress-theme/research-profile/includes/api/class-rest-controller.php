<?php
/**
 * REST API Controller
 *
 * @package Research_Profile
 */

if (!defined('ABSPATH')) {
    exit;
}

class Research_Profile_REST_Controller extends WP_REST_Controller {
    
    protected $namespace = 'research-profile/v1';
    
    public function register_routes() {
        register_rest_route($this->namespace, '/researcher/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_researcher'],
            'permission_callback' => '__return_true',
        ]);
        
        register_rest_route($this->namespace, '/researcher/(?P<id>\d+)/analytics', [
            'methods' => 'GET',
            'callback' => [$this, 'get_analytics'],
            'permission_callback' => '__return_true',
        ]);
        
        register_rest_route($this->namespace, '/researcher/(?P<id>\d+)/sync', [
            'methods' => 'POST',
            'callback' => [$this, 'sync_researcher'],
            'permission_callback' => [$this, 'check_admin_permission'],
        ]);
        
        register_rest_route($this->namespace, '/researcher/(?P<id>\d+)/publications', [
            'methods' => 'GET',
            'callback' => [$this, 'get_publications'],
            'permission_callback' => '__return_true',
        ]);
    }
    
    public function get_researcher($request) {
        $id = $request['id'];
        $post = get_post($id);
        
        if (!$post || $post->post_type !== 'researcher') {
            return new WP_Error('not_found', 'Researcher not found', ['status' => 404]);
        }
        
        $data = [
            'id' => $id,
            'title' => get_the_title($id),
            'openalex_id' => get_post_meta($id, 'openalex_id', true),
            'bio' => get_post_meta($id, 'bio', true),
            'title_position' => get_post_meta($id, 'title', true),
            'current_affiliation' => get_post_meta($id, 'current_affiliation', true),
            'cv_url' => get_post_meta($id, 'cv_url', true),
            'last_synced' => get_post_meta($id, 'last_synced_at', true),
        ];
        
        return rest_ensure_response($data);
    }
    
    public function get_analytics($request) {
        $id = $request['id'];
        $service = new Research_Profile_OpenAlex_Service();
        $analytics = $service->get_analytics_data($id);
        
        return rest_ensure_response($analytics);
    }
    
    public function sync_researcher($request) {
        $id = $request['id'];
        $openalex_id = get_post_meta($id, 'openalex_id', true);
        
        if (!$openalex_id) {
            return new WP_Error('missing_openalex_id', 'OpenAlex ID not set', ['status' => 400]);
        }
        
        $service = new Research_Profile_OpenAlex_Service();
        $result = $service->sync_researcher_data($id, $openalex_id);
        
        return rest_ensure_response($result);
    }
    
    public function get_publications($request) {
        $id = $request['id'];
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        
        $offset = ($page - 1) * $per_page;
        $publications = Research_Profile_Database::get_researcher_publications($id, $per_page, $offset);
        
        return rest_ensure_response($publications);
    }
    
    public function check_admin_permission() {
        return current_user_can('manage_options');
    }
}
