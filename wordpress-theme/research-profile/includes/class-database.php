<?php
/**
 * Database management for custom tables
 *
 * @package Research_Profile
 */

if (!defined('ABSPATH')) {
    exit;
}

class Research_Profile_Database {
    
    public static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $tables = [
            "CREATE TABLE {$wpdb->prefix}rp_publications (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                researcher_id bigint(20) UNSIGNED NOT NULL,
                openalex_id varchar(255) NOT NULL,
                title text NOT NULL,
                publication_year int(11),
                publication_date date,
                cited_by_count int(11) DEFAULT 0,
                type varchar(100),
                doi varchar(255),
                display_name text,
                PRIMARY KEY (id),
                KEY researcher_id (researcher_id),
                KEY openalex_id (openalex_id)
            ) $charset_collate;",
            
            "CREATE TABLE {$wpdb->prefix}rp_research_topics (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                researcher_id bigint(20) UNSIGNED NOT NULL,
                openalex_id varchar(255) NOT NULL,
                display_name varchar(255) NOT NULL,
                subfield varchar(255),
                field varchar(255),
                domain varchar(255),
                count int(11) DEFAULT 0,
                PRIMARY KEY (id),
                KEY researcher_id (researcher_id)
            ) $charset_collate;",
            
            "CREATE TABLE {$wpdb->prefix}rp_affiliations (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                researcher_id bigint(20) UNSIGNED NOT NULL,
                institution_id varchar(255),
                institution_name text NOT NULL,
                years text,
                PRIMARY KEY (id),
                KEY researcher_id (researcher_id)
            ) $charset_collate;",
            
            "CREATE TABLE {$wpdb->prefix}rp_openalex_data (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                researcher_id bigint(20) UNSIGNED NOT NULL,
                data_type varchar(50) NOT NULL,
                data longtext NOT NULL,
                synced_at datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY researcher_id (researcher_id),
                KEY data_type (data_type)
            ) $charset_collate;"
        ];
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        foreach ($tables as $table) {
            dbDelta($table);
        }
    }
    
    public static function get_researcher_publications($researcher_id, $limit = null, $offset = 0) {
        global $wpdb;
        $table = $wpdb->prefix . 'rp_publications';
        
        $query = $wpdb->prepare(
            "SELECT * FROM $table WHERE researcher_id = %d ORDER BY publication_year DESC",
            $researcher_id
        );
        
        if ($limit) {
            $query .= $wpdb->prepare(" LIMIT %d OFFSET %d", $limit, $offset);
        }
        
        return $wpdb->get_results($query);
    }
    
    public static function get_researcher_topics($researcher_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'rp_research_topics';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE researcher_id = %d ORDER BY count DESC",
            $researcher_id
        ));
    }
    
    public static function get_researcher_affiliations($researcher_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'rp_affiliations';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE researcher_id = %d",
            $researcher_id
        ));
    }
    
    public static function save_publications($researcher_id, $publications) {
        global $wpdb;
        $table = $wpdb->prefix . 'rp_publications';
        
        $wpdb->query($wpdb->prepare("DELETE FROM $table WHERE researcher_id = %d", $researcher_id));
        
        foreach ($publications as $pub) {
            $wpdb->insert($table, [
                'researcher_id' => $researcher_id,
                'openalex_id' => $pub['id'] ?? '',
                'title' => $pub['title'] ?? '',
                'publication_year' => $pub['publication_year'] ?? null,
                'publication_date' => $pub['publication_date'] ?? null,
                'cited_by_count' => $pub['cited_by_count'] ?? 0,
                'type' => $pub['type'] ?? '',
                'doi' => $pub['doi'] ?? '',
                'display_name' => $pub['display_name'] ?? '',
            ]);
        }
    }
    
    public static function save_topics($researcher_id, $topics) {
        global $wpdb;
        $table = $wpdb->prefix . 'rp_research_topics';
        
        $wpdb->query($wpdb->prepare("DELETE FROM $table WHERE researcher_id = %d", $researcher_id));
        
        foreach ($topics as $topic) {
            $wpdb->insert($table, [
                'researcher_id' => $researcher_id,
                'openalex_id' => $topic['id'] ?? '',
                'display_name' => $topic['display_name'] ?? '',
                'subfield' => $topic['subfield'] ?? '',
                'field' => $topic['field'] ?? '',
                'domain' => $topic['domain'] ?? '',
                'count' => $topic['count'] ?? 0,
            ]);
        }
    }
    
    public static function save_affiliations($researcher_id, $affiliations) {
        global $wpdb;
        $table = $wpdb->prefix . 'rp_affiliations';
        
        $wpdb->query($wpdb->prepare("DELETE FROM $table WHERE researcher_id = %d", $researcher_id));
        
        foreach ($affiliations as $affiliation) {
            $wpdb->insert($table, [
                'researcher_id' => $researcher_id,
                'institution_id' => $affiliation['institution_id'] ?? '',
                'institution_name' => $affiliation['institution_name'] ?? '',
                'years' => maybe_serialize($affiliation['years'] ?? []),
            ]);
        }
    }
    
    public static function save_openalex_data($researcher_id, $data_type, $data) {
        global $wpdb;
        $table = $wpdb->prefix . 'rp_openalex_data';
        
        $wpdb->query($wpdb->prepare(
            "DELETE FROM $table WHERE researcher_id = %d AND data_type = %s",
            $researcher_id,
            $data_type
        ));
        
        $wpdb->insert($table, [
            'researcher_id' => $researcher_id,
            'data_type' => $data_type,
            'data' => maybe_serialize($data),
            'synced_at' => current_time('mysql'),
        ]);
    }
    
    public static function get_openalex_data($researcher_id, $data_type) {
        global $wpdb;
        $table = $wpdb->prefix . 'rp_openalex_data';
        
        $result = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE researcher_id = %d AND data_type = %s",
            $researcher_id,
            $data_type
        ));
        
        if ($result) {
            $result->data = maybe_unserialize($result->data);
        }
        
        return $result;
    }
}
