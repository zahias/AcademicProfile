<?php
/**
 * Single Researcher Template
 *
 * @package Research_Profile
 */

get_header();

while (have_posts()) :
    the_post();
    
    $researcher_id = get_the_ID();
    $openalex_id = get_post_meta($researcher_id, 'openalex_id', true);
    $bio = get_post_meta($researcher_id, 'bio', true);
    $title_position = get_post_meta($researcher_id, 'title', true);
    $current_affiliation = get_post_meta($researcher_id, 'current_affiliation', true);
    $cv_url = get_post_meta($researcher_id, 'cv_url', true);
    
    $researcher_data = Research_Profile_Database::get_openalex_data($researcher_id, 'researcher');
    $publications = Research_Profile_Database::get_researcher_publications($researcher_id, 10);
    $topics = Research_Profile_Database::get_researcher_topics($researcher_id);
    $affiliations = Research_Profile_Database::get_researcher_affiliations($researcher_id);
    
    $service = new Research_Profile_OpenAlex_Service();
    $analytics = $service->get_analytics_data($researcher_id);
    ?>
    
    <article id="researcher-<?php echo esc_attr($researcher_id); ?>" <?php post_class('researcher-profile'); ?>>
        
        <!-- Hero Section -->
        <section class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="md:col-span-2">
                        <?php if (has_post_thumbnail()) : ?>
                            <div class="mb-6">
                                <?php the_post_thumbnail('medium', ['class' => 'rounded-full w-32 h-32 object-cover']); ?>
                            </div>
                        <?php endif; ?>
                        
                        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            <?php the_title(); ?>
                        </h1>
                        
                        <?php if ($title_position) : ?>
                            <p class="text-xl text-gray-600 dark:text-gray-300 mb-4">
                                <?php echo esc_html($title_position); ?>
                            </p>
                        <?php endif; ?>
                        
                        <?php if ($current_affiliation) : ?>
                            <p class="text-lg text-gray-500 dark:text-gray-400 mb-6">
                                <?php echo esc_html($current_affiliation); ?>
                            </p>
                        <?php endif; ?>
                        
                        <?php if ($bio) : ?>
                            <div class="prose dark:prose-invert max-w-none">
                                <?php echo wpautop(esc_html($bio)); ?>
                            </div>
                        <?php endif; ?>
                        
                        <?php if ($cv_url) : ?>
                            <div class="mt-6">
                                <a href="<?php echo esc_url($cv_url); ?>" 
                                   class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                   target="_blank" rel="noopener noreferrer"
                                   data-testid="button-download-cv">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <?php esc_html_e('Download CV', 'research-profile'); ?>
                                </a>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="space-y-4">
                        <?php if ($openalex_id) : ?>
                            <a href="https://openalex.org/authors/<?php echo esc_attr($openalex_id); ?>" 
                               class="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
                               target="_blank" rel="noopener noreferrer"
                               data-testid="link-openalex">
                                <div class="flex items-center">
                                    <div class="flex-1">
                                        <h3 class="font-semibold text-gray-900 dark:text-white">
                                            <?php esc_html_e('OpenAlex Profile', 'research-profile'); ?>
                                        </h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            <?php esc_html_e('View on OpenAlex', 'research-profile'); ?>
                                        </p>
                                    </div>
                                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Analytics Section -->
        <section id="analytics" class="py-12 bg-white dark:bg-gray-900">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    <?php esc_html_e('Publication Analytics', 'research-profile'); ?>
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            <?php esc_html_e('Total Publications', 'research-profile'); ?>
                        </h3>
                        <p class="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-total-publications">
                            <?php echo esc_html($analytics['total_publications']); ?>
                        </p>
                    </div>
                    
                    <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            <?php esc_html_e('Total Citations', 'research-profile'); ?>
                        </h3>
                        <p class="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-citations">
                            <?php echo esc_html($analytics['total_citations']); ?>
                        </p>
                    </div>
                    
                    <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            <?php esc_html_e('Avg Citations', 'research-profile'); ?>
                        </h3>
                        <p class="text-3xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-avg-citations">
                            <?php echo esc_html($analytics['avg_citations']); ?>
                        </p>
                    </div>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                    <div id="analytics-charts" 
                         data-growth='<?php echo wp_json_encode($analytics['growth']); ?>'
                         data-types='<?php echo wp_json_encode($analytics['types']); ?>'
                         data-citations='<?php echo wp_json_encode($analytics['citations']); ?>'>
                        <p class="text-center text-gray-500">
                            <?php esc_html_e('Charts will be rendered here via JavaScript', 'research-profile'); ?>
                        </p>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Research Areas Section -->
        <section id="research" class="py-12 bg-gray-50 dark:bg-gray-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    <?php esc_html_e('Research Areas', 'research-profile'); ?>
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($topics as $topic) : ?>
                        <div class="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                                <?php echo esc_html($topic->display_name); ?>
                            </h3>
                            <div class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                <?php if ($topic->field) : ?>
                                    <p><?php esc_html_e('Field:', 'research-profile'); ?> <?php echo esc_html($topic->field); ?></p>
                                <?php endif; ?>
                                <p><?php esc_html_e('Publications:', 'research-profile'); ?> <?php echo esc_html($topic->count); ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        
        <!-- Publications Section -->
        <section id="publications" class="py-12 bg-white dark:bg-gray-900">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    <?php esc_html_e('Recent Publications', 'research-profile'); ?>
                </h2>
                
                <div class="space-y-6">
                    <?php foreach ($publications as $publication) : ?>
                        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6" data-testid="card-publication-<?php echo esc_attr($publication->id); ?>">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                <?php echo esc_html($publication->title); ?>
                            </h3>
                            <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <?php if ($publication->publication_year) : ?>
                                    <span><?php echo esc_html($publication->publication_year); ?></span>
                                <?php endif; ?>
                                <?php if ($publication->type) : ?>
                                    <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                        <?php echo esc_html($publication->type); ?>
                                    </span>
                                <?php endif; ?>
                                <span><?php esc_html_e('Citations:', 'research-profile'); ?> <?php echo esc_html($publication->cited_by_count); ?></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        
    </article>
    
    <?php
endwhile;

get_footer();
