<?php
/**
 * The template for displaying 404 pages (not found)
 */

get_header(); ?>

<div class="error-404-container">
    <section class="py-20">
        <div class="container mx-auto px-4 text-center">
            <div class="max-w-2xl mx-auto">
                <div class="mb-8">
                    <div class="text-8xl font-bold text-blue-600 mb-4">404</div>
                    <h1 class="text-4xl font-bold mb-6"><?php _e('Page Not Found', 'research-profile'); ?></h1>
                    <p class="text-lg text-gray-600 mb-8">
                        <?php _e('The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.', 'research-profile'); ?>
                    </p>
                </div>

                <div class="bg-gray-50 rounded-lg p-8 mb-8">
                    <h2 class="text-2xl font-semibold mb-4"><?php _e('What can you do?', 'research-profile'); ?></h2>
                    <div class="space-y-4 text-left">
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                            <div>
                                <strong><?php _e('Go back to homepage:', 'research-profile'); ?></strong>
                                <a href="<?php echo esc_url(home_url('/')); ?>" class="text-blue-600 hover:text-blue-700 ml-2">
                                    <?php _e('Visit Homepage', 'research-profile'); ?>
                                </a>
                            </div>
                        </div>

                        <?php if (post_type_exists('researcher')) : ?>
                            <div class="flex items-start">
                                <svg class="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                                <div>
                                    <strong><?php _e('Browse researchers:', 'research-profile'); ?></strong>
                                    <a href="<?php echo esc_url(get_post_type_archive_link('researcher')); ?>" class="text-blue-600 hover:text-blue-700 ml-2">
                                        <?php _e('View All Researchers', 'research-profile'); ?>
                                    </a>
                                </div>
                            </div>
                        <?php endif; ?>

                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                            <div>
                                <strong><?php _e('Try searching:', 'research-profile'); ?></strong>
                                <span class="ml-2"><?php _e('Use the search form below', 'research-profile'); ?></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-8">
                    <?php get_search_form(); ?>
                </div>

                <div class="flex justify-center space-x-4">
                    <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-primary">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        <?php _e('Go Home', 'research-profile'); ?>
                    </a>
                    
                    <?php if (post_type_exists('researcher')) : ?>
                        <a href="<?php echo esc_url(get_post_type_archive_link('researcher')); ?>" class="btn btn-secondary">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <?php _e('Browse Researchers', 'research-profile'); ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </section>
</div>

<?php get_footer(); ?>