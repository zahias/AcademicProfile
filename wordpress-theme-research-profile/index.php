<?php
/**
 * Main template file
 * 
 * This is the most generic template file in a WordPress theme
 * It displays the homepage and archives when no more specific template is available
 */

get_header(); ?>

<div class="container">
    <?php if (have_posts()) : ?>
        
        <?php if (is_home() && !is_paged()) : ?>
            <?php 
            // Check if there's a featured researcher set in customizer
            $featured_researcher_id = get_theme_mod('research_profile_homepage_researcher');
            if ($featured_researcher_id) {
                $featured_post = get_post($featured_researcher_id);
                if ($featured_post && get_post_meta($featured_post->ID, '_researcher_is_public', true) === '1') {
                    // Display featured researcher
                    setup_postdata($GLOBALS['post'] =& $featured_post);
                    get_template_part('template-parts/researcher', 'featured');
                    wp_reset_postdata();
                }
            } else {
                // Default welcome section
                ?>
                <section class="hero-banner">
                    <div class="hero-pattern"></div>
                    <div class="hero-content">
                        <div class="container">
                            <div class="text-center text-white py-20">
                                <h1 class="text-5xl font-bold mb-6 leading-tight">
                                    Academic Research Profiles
                                </h1>
                                <p class="text-2xl mb-8 text-white/90 font-light max-w-3xl mx-auto">
                                    Discover cutting-edge research, publications, and scholarly contributions from leading academics and researchers.
                                </p>
                                <a href="#researchers" class="btn btn-primary text-lg px-8 py-3">
                                    Explore Researchers
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
                <?php
            }
            ?>
        <?php endif; ?>
        
        <section id="researchers" class="py-16">
            <div class="container">
                <?php if (is_post_type_archive('researcher')) : ?>
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-bold mb-4">Our Researchers</h1>
                        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                            Meet our distinguished faculty and researchers who are pushing the boundaries of knowledge in their respective fields.
                        </p>
                    </div>
                <?php elseif (is_home()) : ?>
                    <div class="text-center mb-12">
                        <h2 class="text-3xl font-bold mb-4">Featured Researchers</h2>
                        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover the latest research and publications from our academic community.
                        </p>
                    </div>
                <?php endif; ?>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <?php while (have_posts()) : the_post(); ?>
                        <?php if (get_post_type() === 'researcher') : ?>
                            <?php get_template_part('template-parts/researcher', 'card'); ?>
                        <?php else : ?>
                            <?php get_template_part('template-parts/content', get_post_format()); ?>
                        <?php endif; ?>
                    <?php endwhile; ?>
                </div>
                
                <?php
                // Pagination
                the_posts_pagination(array(
                    'mid_size' => 2,
                    'prev_text' => __('&laquo; Previous', 'research-profile'),
                    'next_text' => __('Next &raquo;', 'research-profile'),
                ));
                ?>
            </div>
        </section>
        
    <?php else : ?>
        <section class="py-16">
            <div class="container">
                <div class="text-center">
                    <h1 class="text-3xl font-bold mb-4"><?php _e('No Content Found', 'research-profile'); ?></h1>
                    <p class="text-lg text-gray-600 mb-8">
                        <?php _e('It seems we can\'t find what you\'re looking for. Perhaps searching can help.', 'research-profile'); ?>
                    </p>
                    <?php get_search_form(); ?>
                </div>
            </div>
        </section>
    <?php endif; ?>
</div>

<?php get_footer(); ?>