<?php
/**
 * The template for displaying search results pages
 */

get_header(); ?>

<div class="search-results">
    <section class="py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <?php if (have_posts()) : ?>
                    <h1 class="text-4xl font-bold mb-4">
                        <?php
                        printf(
                            esc_html__('Search Results for: %s', 'research-profile'),
                            '<span class="text-blue-600">"' . get_search_query() . '"</span>'
                        );
                        ?>
                    </h1>
                    <p class="text-lg text-gray-600">
                        <?php
                        global $wp_query;
                        printf(
                            esc_html(_n('Found %d result', 'Found %d results', $wp_query->found_posts, 'research-profile')),
                            $wp_query->found_posts
                        );
                        ?>
                    </p>
                <?php else : ?>
                    <h1 class="text-4xl font-bold mb-4"><?php _e('No Results Found', 'research-profile'); ?></h1>
                    <p class="text-lg text-gray-600 mb-8">
                        <?php
                        printf(
                            esc_html__('Sorry, no results were found for "%s". Try different keywords or browse our researchers.', 'research-profile'),
                            get_search_query()
                        );
                        ?>
                    </p>
                <?php endif; ?>
            </div>

            <?php if (have_posts()) : ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <?php while (have_posts()) : the_post(); ?>
                        <?php if (get_post_type() === 'researcher') : ?>
                            <?php get_template_part('template-parts/researcher', 'card'); ?>
                        <?php else : ?>
                            <div class="research-card">
                                <?php get_template_part('template-parts/content', get_post_format()); ?>
                            </div>
                        <?php endif; ?>
                    <?php endwhile; ?>
                </div>

                <div class="mt-12">
                    <?php
                    the_posts_pagination(array(
                        'mid_size' => 2,
                        'prev_text' => __('&laquo; Previous', 'research-profile'),
                        'next_text' => __('Next &raquo;', 'research-profile'),
                    ));
                    ?>
                </div>

            <?php else : ?>
                <div class="max-w-2xl mx-auto">
                    <div class="bg-gray-50 rounded-lg p-8 mb-8">
                        <h2 class="text-2xl font-semibold mb-4"><?php _e('Search Suggestions', 'research-profile'); ?></h2>
                        <ul class="space-y-2 text-left">
                            <li class="flex items-center">
                                <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                                <?php _e('Make sure all words are spelled correctly', 'research-profile'); ?>
                            </li>
                            <li class="flex items-center">
                                <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                                <?php _e('Try different or more general keywords', 'research-profile'); ?>
                            </li>
                            <li class="flex items-center">
                                <svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                                <?php _e('Try searching for research topics or institution names', 'research-profile'); ?>
                            </li>
                        </ul>
                    </div>

                    <div class="text-center">
                        <h3 class="text-xl font-semibold mb-4"><?php _e('Try Another Search', 'research-profile'); ?></h3>
                        <?php get_search_form(); ?>
                        
                        <div class="mt-8">
                            <p class="mb-4"><?php _e('Or explore our researchers:', 'research-profile'); ?></p>
                            <?php if (post_type_exists('researcher')) : ?>
                                <a href="<?php echo esc_url(get_post_type_archive_link('researcher')); ?>" class="btn btn-primary">
                                    <?php _e('Browse All Researchers', 'research-profile'); ?>
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </section>
</div>

<?php get_footer(); ?>