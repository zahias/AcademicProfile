<?php
/**
 * OpenAlex API Service
 *
 * @package Research_Profile
 */

if (!defined('ABSPATH')) {
    exit;
}

class Research_Profile_OpenAlex_Service {
    
    private $api_base = 'https://api.openalex.org';
    private $mailto = 'research@example.com';
    
    public function __construct() {
        $email = get_option('research_profile_mailto_email');
        if ($email) {
            $this->mailto = $email;
        }
    }
    
    private function make_request($endpoint, $params = []) {
        $params['mailto'] = $this->mailto;
        
        $url = $this->api_base . $endpoint;
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        
        $response = wp_remote_get($url, [
            'timeout' => 30,
            'headers' => [
                'User-Agent' => 'Research Profile WordPress Theme/1.0',
            ],
        ]);
        
        if (is_wp_error($response)) {
            throw new Exception('OpenAlex API request failed: ' . $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Failed to parse OpenAlex response');
        }
        
        return $data;
    }
    
    public function get_researcher($openalex_id) {
        $endpoint = '/authors/' . $openalex_id;
        return $this->make_request($endpoint);
    }
    
    public function get_researcher_works($openalex_id, $page = 1, $per_page = 50) {
        $endpoint = '/works';
        $params = [
            'filter' => 'author.id:' . $openalex_id,
            'page' => $page,
            'per-page' => $per_page,
            'sort' => 'publication_year:desc',
        ];
        
        return $this->make_request($endpoint, $params);
    }
    
    public function sync_researcher_data($researcher_id, $openalex_id) {
        try {
            $researcher_data = $this->get_researcher($openalex_id);
            
            Research_Profile_Database::save_openalex_data(
                $researcher_id,
                'researcher',
                $researcher_data
            );
            
            $works_data = $this->get_researcher_works($openalex_id);
            
            if (isset($works_data['results'])) {
                $publications = [];
                foreach ($works_data['results'] as $work) {
                    $publications[] = [
                        'id' => $work['id'] ?? '',
                        'title' => $work['title'] ?? '',
                        'display_name' => $work['display_name'] ?? '',
                        'publication_year' => $work['publication_year'] ?? null,
                        'publication_date' => $work['publication_date'] ?? null,
                        'cited_by_count' => $work['cited_by_count'] ?? 0,
                        'type' => $work['type'] ?? '',
                        'doi' => $work['doi'] ?? '',
                    ];
                }
                
                Research_Profile_Database::save_publications($researcher_id, $publications);
            }
            
            if (isset($researcher_data['topics'])) {
                $topics = [];
                foreach ($researcher_data['topics'] as $topic) {
                    $topics[] = [
                        'id' => $topic['id'] ?? '',
                        'display_name' => $topic['display_name'] ?? '',
                        'subfield' => $topic['subfield']['display_name'] ?? '',
                        'field' => $topic['field']['display_name'] ?? '',
                        'domain' => $topic['domain']['display_name'] ?? '',
                        'count' => $topic['count'] ?? 0,
                    ];
                }
                
                Research_Profile_Database::save_topics($researcher_id, $topics);
            }
            
            if (isset($researcher_data['affiliations'])) {
                $affiliations = [];
                foreach ($researcher_data['affiliations'] as $affiliation) {
                    if (isset($affiliation['institution'])) {
                        $affiliations[] = [
                            'institution_id' => $affiliation['institution']['id'] ?? '',
                            'institution_name' => $affiliation['institution']['display_name'] ?? '',
                            'years' => $affiliation['years'] ?? [],
                        ];
                    }
                }
                
                Research_Profile_Database::save_affiliations($researcher_id, $affiliations);
            }
            
            update_post_meta($researcher_id, 'last_synced_at', current_time('mysql'));
            
            return [
                'success' => true,
                'message' => 'Data synchronized successfully',
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
    
    public function get_analytics_data($researcher_id) {
        $publications = Research_Profile_Database::get_researcher_publications($researcher_id);
        
        $years = [];
        $types = [];
        $citations_by_year = [];
        $total_citations = 0;
        
        foreach ($publications as $pub) {
            $year = $pub->publication_year;
            if ($year) {
                $years[$year] = ($years[$year] ?? 0) + 1;
                $citations_by_year[$year] = ($citations_by_year[$year] ?? 0) + $pub->cited_by_count;
            }
            
            $type = $pub->type ?: 'other';
            $types[$type] = ($types[$type] ?? 0) + 1;
            
            $total_citations += $pub->cited_by_count;
        }
        
        ksort($years);
        ksort($citations_by_year);
        
        $growth_data = [];
        foreach ($years as $year => $count) {
            $growth_data[] = ['year' => $year, 'count' => $count];
        }
        
        $type_data = [];
        foreach ($types as $type => $count) {
            $type_data[] = ['type' => $type, 'count' => $count];
        }
        
        $citation_data = [];
        foreach ($citations_by_year as $year => $citations) {
            $citation_data[] = ['year' => $year, 'citations' => $citations];
        }
        
        return [
            'growth' => $growth_data,
            'types' => $type_data,
            'citations' => $citation_data,
            'total_publications' => count($publications),
            'total_citations' => $total_citations,
            'avg_citations' => count($publications) > 0 ? round($total_citations / count($publications), 1) : 0,
        ];
    }
}
