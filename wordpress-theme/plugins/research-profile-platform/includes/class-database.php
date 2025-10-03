<?php
/**
 * Database Management Class
 * 
 * Handles database table creation and schema management
 */

if (!defined('ABSPATH')) {
    exit;
}

class RPP_Database {
    
    /**
     * Create all required database tables
     */
    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        // Table: researcher_profiles
        $table_name = $wpdb->prefix . 'rpp_profiles';
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            openalex_id varchar(255) NOT NULL,
            display_name text,
            title text,
            bio text,
            cv_url varchar(500),
            current_affiliation text,
            current_position text,
            current_affiliation_url varchar(500),
            current_affiliation_start_date date,
            is_public tinyint(1) DEFAULT 1,
            last_synced_at datetime,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY openalex_id (openalex_id),
            KEY user_id (user_id),
            KEY is_public (is_public)
        ) $charset_collate;";
        dbDelta($sql);
        
        // Table: openalex_data_cache
        $table_name = $wpdb->prefix . 'rpp_openalex_cache';
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            openalex_id varchar(255) NOT NULL,
            data_type varchar(50) NOT NULL,
            data longtext NOT NULL,
            last_updated datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY openalex_id (openalex_id),
            KEY data_type (data_type),
            UNIQUE KEY openalex_data_type (openalex_id, data_type)
        ) $charset_collate;";
        dbDelta($sql);
        
        // Table: research_topics
        $table_name = $wpdb->prefix . 'rpp_topics';
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            openalex_id varchar(255) NOT NULL,
            topic_id varchar(255) NOT NULL,
            display_name text NOT NULL,
            count int(11) NOT NULL,
            subfield text,
            field text,
            domain text,
            value varchar(255),
            PRIMARY KEY  (id),
            KEY openalex_id (openalex_id),
            KEY topic_id (topic_id)
        ) $charset_collate;";
        dbDelta($sql);
        
        // Table: publications
        $table_name = $wpdb->prefix . 'rpp_publications';
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            openalex_id varchar(255) NOT NULL,
            work_id varchar(255) NOT NULL,
            title text NOT NULL,
            author_names text,
            journal text,
            publication_year int(11),
            citation_count int(11) DEFAULT 0,
            topics longtext,
            doi varchar(255),
            is_open_access tinyint(1) DEFAULT 0,
            PRIMARY KEY  (id),
            KEY openalex_id (openalex_id),
            KEY work_id (work_id),
            KEY publication_year (publication_year)
        ) $charset_collate;";
        dbDelta($sql);
        
        // Table: affiliations
        $table_name = $wpdb->prefix . 'rpp_affiliations';
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            openalex_id varchar(255) NOT NULL,
            institution_id varchar(255) NOT NULL,
            institution_name text NOT NULL,
            institution_type varchar(100),
            country_code varchar(10),
            years longtext,
            start_year int(11),
            end_year int(11),
            PRIMARY KEY  (id),
            KEY openalex_id (openalex_id),
            KEY institution_id (institution_id)
        ) $charset_collate;";
        dbDelta($sql);
    }
    
    /**
     * Get researcher profile by OpenAlex ID
     */
    public static function get_profile_by_openalex_id($openalex_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_profiles';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE openalex_id = %s",
            $openalex_id
        ), ARRAY_A);
    }
    
    /**
     * Get all public profiles
     */
    public static function get_public_profiles() {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_profiles';
        
        return $wpdb->get_results(
            "SELECT * FROM $table WHERE is_public = 1 ORDER BY updated_at DESC",
            ARRAY_A
        );
    }
    
    /**
     * Create or update researcher profile
     */
    public static function upsert_profile($data) {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_profiles';
        
        // Check if profile exists
        $existing = self::get_profile_by_openalex_id($data['openalex_id']);
        
        if ($existing) {
            // Update
            $wpdb->update(
                $table,
                $data,
                array('openalex_id' => $data['openalex_id'])
            );
            return self::get_profile_by_openalex_id($data['openalex_id']);
        } else {
            // Insert
            $wpdb->insert($table, $data);
            return self::get_profile_by_openalex_id($data['openalex_id']);
        }
    }
    
    /**
     * Get cached OpenAlex data
     */
    public static function get_cached_data($openalex_id, $data_type) {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_openalex_cache';
        
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE openalex_id = %s AND data_type = %s ORDER BY last_updated DESC LIMIT 1",
            $openalex_id,
            $data_type
        ), ARRAY_A);
        
        if ($row && isset($row['data'])) {
            $row['data'] = json_decode($row['data'], true);
        }
        
        return $row;
    }
    
    /**
     * Cache OpenAlex data
     */
    public static function cache_data($openalex_id, $data_type, $data) {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_openalex_cache';
        
        $data_json = json_encode($data);
        
        // Delete existing cache for this type
        $wpdb->delete($table, array(
            'openalex_id' => $openalex_id,
            'data_type' => $data_type
        ));
        
        // Insert new cache
        $wpdb->insert($table, array(
            'openalex_id' => $openalex_id,
            'data_type' => $data_type,
            'data' => $data_json,
            'last_updated' => current_time('mysql')
        ));
    }
    
    /**
     * Get research topics for a researcher
     */
    public static function get_topics($openalex_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_topics';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE openalex_id = %s ORDER BY count DESC",
            $openalex_id
        ), ARRAY_A);
    }
    
    /**
     * Save research topics
     */
    public static function save_topics($openalex_id, $topics) {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_topics';
        
        // Delete existing topics
        $wpdb->delete($table, array('openalex_id' => $openalex_id));
        
        // Insert new topics
        foreach ($topics as $topic) {
            $topic['openalex_id'] = $openalex_id;
            $wpdb->insert($table, $topic);
        }
    }
    
    /**
     * Get publications for a researcher
     */
    public static function get_publications($openalex_id, $limit = 50) {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_publications';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE openalex_id = %s ORDER BY publication_year DESC, citation_count DESC LIMIT %d",
            $openalex_id,
            $limit
        ), ARRAY_A);
    }
    
    /**
     * Save publications
     */
    public static function save_publications($openalex_id, $publications) {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_publications';
        
        // Delete existing publications
        $wpdb->delete($table, array('openalex_id' => $openalex_id));
        
        // Insert new publications
        foreach ($publications as $pub) {
            $pub['openalex_id'] = $openalex_id;
            if (isset($pub['topics']) && is_array($pub['topics'])) {
                $pub['topics'] = json_encode($pub['topics']);
            }
            $wpdb->insert($table, $pub);
        }
    }
    
    /**
     * Get affiliations for a researcher
     */
    public static function get_affiliations($openalex_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_affiliations';
        
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE openalex_id = %s ORDER BY start_year DESC",
            $openalex_id
        ), ARRAY_A);
        
        // Decode years JSON
        foreach ($results as &$row) {
            if (isset($row['years'])) {
                $row['years'] = json_decode($row['years'], true);
            }
        }
        
        return $results;
    }
    
    /**
     * Save affiliations
     */
    public static function save_affiliations($openalex_id, $affiliations) {
        global $wpdb;
        $table = $wpdb->prefix . 'rpp_affiliations';
        
        // Delete existing affiliations
        $wpdb->delete($table, array('openalex_id' => $openalex_id));
        
        // Insert new affiliations
        foreach ($affiliations as $affiliation) {
            $affiliation['openalex_id'] = $openalex_id;
            if (isset($affiliation['years']) && is_array($affiliation['years'])) {
                $affiliation['years'] = json_encode($affiliation['years']);
            }
            $wpdb->insert($table, $affiliation);
        }
    }
}
