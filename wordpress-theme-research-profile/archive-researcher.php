<?php
/**
 * Archive template for researchers
 * 
 * This template displays the archive page for all researchers
 */

get_header(); ?>

<div class="researchers-archive">
    <!-- Header Section -->
    <section class="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-5xl font-bold mb-6">
                <?php _e('Our Researchers', 'research-profile'); ?>
            </h1>
            <p class="text-xl max-w-3xl mx-auto text-white/90">
                <?php _e('Meet our distinguished faculty and researchers who are pushing the boundaries of knowledge in their respective fields.', 'research-profile'); ?>
            </p>
        </div>
    </section>

    <!-- Researchers Grid -->
    <section class="py-16">
        <div class="container mx-auto px-4">
            <?php if (have_posts()) : ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <?php while (have_posts()) : the_post(); ?>
                        <?php get_template_part('template-parts/researcher', 'card'); ?>
                    <?php endwhile; ?>
                </div>

                <?php
                // Pagination
                the_posts_pagination(array(
                    'mid_size' => 2,
                    'prev_text' => __('&laquo; Previous', 'research-profile'),
                    'next_text' => __('Next &raquo;', 'research-profile'),
                    'class' => 'pagination-wrapper mt-12 text-center',
                ));
                ?>

            <?php else : ?>
                <div class="text-center py-20">
                    <h2 class="text-3xl font-bold mb-4"><?php _e('No Researchers Found', 'research-profile'); ?></h2>
                    <p class="text-lg text-gray-600">
                        <?php _e('There are currently no public researcher profiles available.', 'research-profile'); ?>
                    </p>
                </div>
            <?php endif; ?>
        </div>
    </section>
</div>

<?php get_footer(); ?>