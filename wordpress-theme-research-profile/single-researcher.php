<?php
/**
 * Single Researcher Template
 * 
 * This template displays individual researcher profiles
 */

get_header();

while (have_posts()) :
    the_post();
    
    // Get researcher data
    $researcher_data = research_profile_get_researcher_data(get_the_ID());
    
    // Check if profile is public
    if ($researcher_data['is_public'] !== '1' && !current_user_can('edit_posts')) {
        ?>
        <div class="container mx-auto px-4 py-20 text-center">
            <h1 class="text-3xl font-bold mb-4"><?php _e('Profile Not Available', 'research-profile'); ?></h1>
            <p class="text-lg text-gray-600"><?php _e('This researcher profile is not public.', 'research-profile'); ?></p>
        </div>
        <?php
        get_footer();
        return;
    }
    
    $openalex_data = $researcher_data['openalex_data'];
    $author_stats = $openalex_data['author'] ?? null;
?>

<div class="researcher-profile">
    <!-- Hero Banner Section -->
    <section class="hero-banner">
        <div class="hero-pattern"></div>
        <div class="hero-content">
            <div class="container mx-auto px-4 py-20">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <!-- Profile Image Section -->
                    <div class="lg:col-span-4 flex justify-center lg:justify-start">
                        <div class="profile-image-container">
                            <div class="profile-image-glow"></div>
                            <div class="relative bg-white/10 backdrop-blur-sm rounded-full p-3 shadow-2xl">
                                <?php if (has_post_thumbnail()) : ?>
                                    <?php the_post_thumbnail('large', array(
                                        'class' => 'w-44 h-44 lg:w-56 lg:h-56 rounded-full object-cover border-4 border-white/30 shadow-2xl',
                                        'alt' => esc_attr($researcher_data['display_name'] ?: get_the_title())
                                    )); ?>
                                <?php else : ?>
                                    <img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500" 
                                         alt="<?php echo esc_attr($researcher_data['display_name'] ?: get_the_title()); ?>" 
                                         class="w-44 h-44 lg:w-56 lg:h-56 rounded-full object-cover border-4 border-white/30 shadow-2xl">
                                <?php endif; ?>
                                <div class="profile-badge absolute -bottom-3 -right-3 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center">
                                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Content Section -->
                    <div class="lg:col-span-8 text-center lg:text-left text-white space-y-8">
                        <div class="space-y-6">
                            <div>
                                <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-tight bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                                    <?php echo esc_html($researcher_data['display_name'] ?: get_the_title()); ?>
                                </h1>
                                <?php if ($researcher_data['title']) : ?>
                                    <p class="text-2xl sm:text-3xl mb-6 text-white/90 font-light tracking-wide">
                                        <?php echo esc_html($researcher_data['title']); ?>
                                    </p>
                                <?php endif; ?>
                                
                                <?php if ($researcher_data['current_affiliation']) : ?>
                                    <div class="flex items-center justify-center lg:justify-start text-white/80 mb-6">
                                        <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                        <span class="text-lg">
                                            <?php if ($researcher_data['current_affiliation_url']) : ?>
                                                <a href="<?php echo esc_url($researcher_data['current_affiliation_url']); ?>" 
                                                   class="hover:text-white transition-colors" 
                                                   target="_blank" rel="noopener">
                                                    <?php echo esc_html($researcher_data['current_affiliation']); ?>
                                                </a>
                                            <?php else : ?>
                                                <?php echo esc_html($researcher_data['current_affiliation']); ?>
                                            <?php endif; ?>
                                            <?php if ($researcher_data['current_position']) : ?>
                                                <span class="block text-white/70 text-base">
                                                    <?php echo esc_html($researcher_data['current_position']); ?>
                                                </span>
                                            <?php endif; ?>
                                        </span>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <?php if ($researcher_data['bio']) : ?>
                                <p class="text-xl leading-relaxed text-white/90 max-w-3xl">
                                    <?php echo wp_kses_post(nl2br($researcher_data['bio'])); ?>
                                </p>
                            <?php endif; ?>
                            
                            <div class="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <?php if ($researcher_data['cv_url']) : ?>
                                    <a href="<?php echo esc_url($researcher_data['cv_url']); ?>" 
                                       class="btn btn-primary" 
                                       target="_blank" rel="noopener">
                                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        <?php _e('Download CV', 'research-profile'); ?>
                                    </a>
                                <?php endif; ?>
                                
                                <?php if ($researcher_data['openalex_id']) : ?>
                                    <a href="<?php echo esc_url('https://openalex.org/authors/' . $researcher_data['openalex_id']); ?>" 
                                       class="btn btn-secondary" 
                                       target="_blank" rel="noopener">
                                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                        </svg>
                                        <?php _e('OpenAlex Profile', 'research-profile'); ?>
                                    </a>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats Overview Section -->
    <?php if ($author_stats) : ?>
        <section class="py-16 -mt-10">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="stat-card bg-card rounded-lg shadow-lg border border-border p-6 text-center">
                        <div class="text-3xl font-bold text-blue-600 mb-2">
                            <?php echo esc_html($author_stats['works_count'] ?? 0); ?>
                        </div>
                        <div class="text-gray-600"><?php _e('Publications', 'research-profile'); ?></div>
                    </div>
                    
                    <div class="stat-card bg-card rounded-lg shadow-lg border border-border p-6 text-center">
                        <div class="text-3xl font-bold text-green-600 mb-2">
                            <?php echo esc_html($author_stats['cited_by_count'] ?? 0); ?>
                        </div>
                        <div class="text-gray-600"><?php _e('Total Citations', 'research-profile'); ?></div>
                    </div>
                    
                    <div class="stat-card bg-card rounded-lg shadow-lg border border-border p-6 text-center">
                        <div class="text-3xl font-bold text-blue-600 mb-2">
                            <?php echo esc_html($author_stats['summary_stats']['h_index'] ?? 0); ?>
                        </div>
                        <div class="text-gray-600"><?php _e('h-index', 'research-profile'); ?></div>
                    </div>
                    
                    <div class="stat-card bg-card rounded-lg shadow-lg border border-border p-6 text-center">
                        <div class="text-3xl font-bold text-green-600 mb-2">
                            <?php echo esc_html($author_stats['summary_stats']['i10_index'] ?? 0); ?>
                        </div>
                        <div class="text-gray-600"><?php _e('i10-index', 'research-profile'); ?></div>
                    </div>
                </div>
            </div>
        </section>
    <?php endif; ?>

    <!-- Publication Analytics Charts -->
    <?php if ($openalex_data && isset($openalex_data['works']) && !empty($openalex_data['works'])) : ?>
        <section class="py-16">
            <div class="container mx-auto px-4">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-4"><?php _e('Publication Analytics', 'research-profile'); ?></h2>
                    <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                        <?php _e('Comprehensive analysis of research output and impact over time.', 'research-profile'); ?>
                    </p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <!-- Publications Over Time Chart -->
                    <div class="research-card p-6">
                        <h3 class="text-xl font-semibold mb-4"><?php _e('Publications Over Time', 'research-profile'); ?></h3>
                        <div class="chart-container">
                            <canvas id="publicationsChart"></canvas>
                        </div>
                    </div>

                    <!-- Citations Chart -->
                    <div class="research-card p-6">
                        <h3 class="text-xl font-semibold mb-4"><?php _e('Citation Impact', 'research-profile'); ?></h3>
                        <div class="chart-container">
                            <canvas id="citationsChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Research Topics -->
                    <div class="research-card p-6">
                        <h3 class="text-xl font-semibold mb-4"><?php _e('Research Topics', 'research-profile'); ?></h3>
                        <div class="chart-container">
                            <canvas id="topicsChart"></canvas>
                        </div>
                    </div>

                    <!-- Publication Venues -->
                    <div class="research-card p-6">
                        <h3 class="text-xl font-semibold mb-4"><?php _e('Publication Venues', 'research-profile'); ?></h3>
                        <div class="chart-container">
                            <canvas id="venuesChart"></canvas>
                        </div>
                    </div>

                    <!-- Open Access -->
                    <div class="research-card p-6">
                        <h3 class="text-xl font-semibold mb-4"><?php _e('Open Access', 'research-profile'); ?></h3>
                        <div class="chart-container">
                            <canvas id="openAccessChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pass data to JavaScript -->
        <script>
        window.researcherPublications = <?php echo json_encode($openalex_data['works']); ?>;
        window.researcherStats = <?php echo json_encode($author_stats); ?>;
        </script>
    <?php endif; ?>

    <!-- Publications List -->
    <?php if ($openalex_data && isset($openalex_data['works']) && !empty($openalex_data['works'])) : ?>
        <section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-4">
                        <?php _e('Publications', 'research-profile'); ?>
                        <span class="text-sm font-normal text-gray-500 ml-2">(<?php echo count($openalex_data['works']); ?>)</span>
                    </h2>
                    <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                        <?php _e('Research contributions with comprehensive details and metrics.', 'research-profile'); ?>
                    </p>
                </div>

                <div class="space-y-6" id="publications-list">
                    <?php foreach (array_slice($openalex_data['works'], 0, 10) as $work) : ?>
                        <div class="research-card p-6 hover:shadow-lg transition-shadow">
                            <h3 class="text-xl font-semibold mb-3 text-gray-900 leading-tight">
                                <?php if (!empty($work['doi'])) : ?>
                                    <a href="https://doi.org/<?php echo esc_attr($work['doi']); ?>" 
                                       target="_blank" rel="noopener" 
                                       class="hover:text-blue-600 transition-colors">
                                        <?php echo esc_html($work['title'] ?? __('Untitled', 'research-profile')); ?>
                                    </a>
                                <?php else : ?>
                                    <?php echo esc_html($work['title'] ?? __('Untitled', 'research-profile')); ?>
                                <?php endif; ?>
                            </h3>
                            
                            <div class="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4">
                                <?php if (!empty($work['publication_year'])) : ?>
                                    <span class="flex items-center">
                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <?php echo esc_html($work['publication_year']); ?>
                                    </span>
                                <?php endif; ?>
                                
                                <?php if (!empty($work['cited_by_count'])) : ?>
                                    <span class="flex items-center">
                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                                        </svg>
                                        <?php echo esc_html($work['cited_by_count']); ?> <?php _e('citations', 'research-profile'); ?>
                                    </span>
                                <?php endif; ?>
                                
                                <?php if (!empty($work['is_oa'])) : ?>
                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                        <?php _e('Open Access', 'research-profile'); ?>
                                    </span>
                                <?php endif; ?>
                            </div>
                            
                            <?php if (!empty($work['host_venue']['display_name'])) : ?>
                                <p class="text-gray-700 mb-2">
                                    <span class="font-medium"><?php _e('Published in:', 'research-profile'); ?></span>
                                    <?php echo esc_html($work['host_venue']['display_name']); ?>
                                </p>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>

                <?php if (count($openalex_data['works']) > 10) : ?>
                    <div class="text-center mt-12">
                        <button id="load-more-publications" class="btn btn-primary">
                            <?php _e('Load More Publications', 'research-profile'); ?>
                        </button>
                    </div>
                <?php endif; ?>
            </div>
        </section>
    <?php endif; ?>
</div>

<?php
endwhile;
get_footer();
?>