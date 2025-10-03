<?php
/**
 * OpenAlex API Integration
 * 
 * Handles communication with the OpenAlex API
 */

if (!defined('ABSPATH')) {
    exit;
}

class RPP_OpenAlex_API {
    
    private $base_url = 'https://api.openalex.org';
    
    /**
     * Search for researcher by OpenAlex ID
     */
    public function get_researcher($openalex_id) {
        $url = $this->base_url . '/authors/' . $openalex_id;
        
        $response = wp_remote_get($url, array(
            'timeout' => 15,
            'headers' => array(
                'User-Agent' => 'Research Profile Platform (WordPress)'
            )
        ));
        
        if (is_wp_error($response)) {
            error_log('OpenAlex API Error: ' . $response->get_error_message());
            return null;
        }
        
        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }
    
    /**
     * Get works (publications) for a researcher
     */
    public function get_works($openalex_id, $page = 1, $per_page = 50) {
        $url = $this->base_url . '/works';
        $url = add_query_arg(array(
            'filter' => 'authorships.author.id:' . $openalex_id,
            'per-page' => $per_page,
            'page' => $page,
            'sort' => 'cited_by_count:desc'
        ), $url);
        
        $response = wp_remote_get($url, array(
            'timeout' => 15,
            'headers' => array(
                'User-Agent' => 'Research Profile Platform (WordPress)'
            )
        ));
        
        if (is_wp_error($response)) {
            error_log('OpenAlex API Error: ' . $response->get_error_message());
            return array('results' => array());
        }
        
        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }
    
    /**
     * Get topics for a researcher
     */
    public function get_topics($openalex_id) {
        // Get researcher data which includes topics
        $researcher = $this->get_researcher($openalex_id);
        
        if (!$researcher || !isset($researcher['topics'])) {
            return array();
        }
        
        return $researcher['topics'];
    }
    
    /**
     * Sync all researcher data from OpenAlex
     */
    public function sync_researcher_data($openalex_id) {
        $results = array();
        
        // 1. Get and cache researcher data
        $researcher_data = $this->get_researcher($openalex_id);
        if ($researcher_data) {
            RPP_Database::cache_data($openalex_id, 'researcher', $researcher_data);
            $results['researcher'] = 'success';
            
            // Extract and save topics
            if (isset($researcher_data['topics']) && is_array($researcher_data['topics'])) {
                $topics = array();
                foreach ($researcher_data['topics'] as $topic) {
                    $topics[] = array(
                        'topic_id' => isset($topic['id']) ? $topic['id'] : '',
                        'display_name' => isset($topic['display_name']) ? $topic['display_name'] : '',
                        'count' => isset($topic['count']) ? $topic['count'] : 0,
                        'subfield' => isset($topic['subfield']['display_name']) ? $topic['subfield']['display_name'] : null,
                        'field' => isset($topic['field']['display_name']) ? $topic['field']['display_name'] : null,
                        'domain' => isset($topic['domain']['display_name']) ? $topic['domain']['display_name'] : null,
                        'value' => isset($topic['value']) ? $topic['value'] : null
                    );
                }
                RPP_Database::save_topics($openalex_id, $topics);
                $results['topics'] = count($topics);
            }
        }
        
        // 2. Get and cache works (publications)
        $works_data = $this->get_works($openalex_id, 1, 100);
        if ($works_data && isset($works_data['results'])) {
            RPP_Database::cache_data($openalex_id, 'works', $works_data);
            $results['works_cached'] = 'success';
            
            // Process and save publications
            $publications = array();
            foreach ($works_data['results'] as $work) {
                // Extract author names
                $author_names = array();
                if (isset($work['authorships']) && is_array($work['authorships'])) {
                    foreach ($work['authorships'] as $authorship) {
                        if (isset($authorship['author']['display_name'])) {
                            $author_names[] = $authorship['author']['display_name'];
                        }
                    }
                }
                
                // Extract topics
                $topics = array();
                if (isset($work['topics']) && is_array($work['topics'])) {
                    foreach ($work['topics'] as $topic) {
                        if (isset($topic['display_name'])) {
                            $topics[] = $topic['display_name'];
                        }
                    }
                }
                
                $publications[] = array(
                    'work_id' => isset($work['id']) ? $work['id'] : '',
                    'title' => isset($work['title']) ? $work['title'] : 'Untitled',
                    'author_names' => implode(', ', $author_names),
                    'journal' => isset($work['primary_location']['source']['display_name']) ? $work['primary_location']['source']['display_name'] : null,
                    'publication_year' => isset($work['publication_year']) ? $work['publication_year'] : null,
                    'citation_count' => isset($work['cited_by_count']) ? $work['cited_by_count'] : 0,
                    'topics' => $topics,
                    'doi' => isset($work['doi']) ? str_replace('https://doi.org/', '', $work['doi']) : null,
                    'is_open_access' => isset($work['open_access']['is_oa']) ? $work['open_access']['is_oa'] : false
                );
            }
            RPP_Database::save_publications($openalex_id, $publications);
            $results['publications'] = count($publications);
        }
        
        // 3. Extract and save affiliations
        if ($researcher_data && isset($researcher_data['affiliations'])) {
            $affiliations = array();
            foreach ($researcher_data['affiliations'] as $affiliation) {
                if (isset($affiliation['institution'])) {
                    $inst = $affiliation['institution'];
                    $affiliations[] = array(
                        'institution_id' => isset($inst['id']) ? $inst['id'] : '',
                        'institution_name' => isset($inst['display_name']) ? $inst['display_name'] : '',
                        'institution_type' => isset($inst['type']) ? $inst['type'] : null,
                        'country_code' => isset($inst['country_code']) ? $inst['country_code'] : null,
                        'years' => isset($affiliation['years']) ? $affiliation['years'] : array(),
                        'start_year' => isset($affiliation['years']) && !empty($affiliation['years']) ? min($affiliation['years']) : null,
                        'end_year' => isset($affiliation['years']) && !empty($affiliation['years']) ? max($affiliation['years']) : null
                    );
                }
            }
            RPP_Database::save_affiliations($openalex_id, $affiliations);
            $results['affiliations'] = count($affiliations);
        }
        
        // Update last synced timestamp
        $profile = RPP_Database::get_profile_by_openalex_id($openalex_id);
        if ($profile) {
            global $wpdb;
            $table = $wpdb->prefix . 'rpp_profiles';
            $wpdb->update(
                $table,
                array('last_synced_at' => current_time('mysql')),
                array('openalex_id' => $openalex_id)
            );
        }
        
        return $results;
    }
}
