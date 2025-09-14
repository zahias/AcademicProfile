<?php
/**
 * The template for displaying all single posts
 */

get_header(); ?>

<div class="single-post">
    <div class="container mx-auto px-4 py-16">
        <div class="max-w-4xl mx-auto">
            <?php while (have_posts()) : the_post(); ?>
                
                <article id="post-<?php the_ID(); ?>" <?php post_class('research-card'); ?>>
                    <div class="p-8">
                        <header class="entry-header mb-8">
                            <?php the_title('<h1 class="entry-title text-4xl font-bold mb-6">', '</h1>'); ?>
                            
                            <?php if ('post' === get_post_type()) : ?>
                                <div class="entry-meta text-gray-600 mb-6">
                                    <div class="flex flex-wrap items-center gap-6">
                                        <time class="published flex items-center" datetime="<?php echo esc_attr(get_the_date('c')); ?>">
                                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <?php echo get_the_date(); ?>
                                        </time>
                                        
                                        <span class="byline flex items-center">
                                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                            <span class="author vcard">
                                                <a class="url fn n hover:text-blue-600" href="<?php echo esc_url(get_author_posts_url(get_the_author_meta('ID'))); ?>">
                                                    <?php echo get_the_author(); ?>
                                                </a>
                                            </span>
                                        </span>

                                        <?php if (has_category()) : ?>
                                            <span class="categories flex items-center">
                                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                                </svg>
                                                <?php the_category(', '); ?>
                                            </span>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </header><!-- .entry-header -->

                        <?php if (has_post_thumbnail()) : ?>
                            <div class="post-thumbnail mb-8">
                                <?php the_post_thumbnail('large', array('class' => 'w-full h-auto rounded-lg shadow-lg')); ?>
                            </div>
                        <?php endif; ?>

                        <div class="entry-content prose prose-lg max-w-none">
                            <?php
                            the_content();

                            wp_link_pages(array(
                                'before' => '<div class="page-links mt-8 p-4 bg-gray-50 rounded-lg">' . esc_html__('Pages:', 'research-profile'),
                                'after'  => '</div>',
                            ));
                            ?>
                        </div><!-- .entry-content -->

                        <footer class="entry-footer mt-8 pt-8 border-t border-gray-200">
                            <?php if (has_tag()) : ?>
                                <div class="tags mb-4">
                                    <span class="font-medium text-gray-700 mr-2"><?php _e('Tags:', 'research-profile'); ?></span>
                                    <?php the_tags('<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-2">', '</span><span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-2">', '</span>'); ?>
                                </div>
                            <?php endif; ?>

                            <div class="flex items-center justify-between">
                                <div class="author-bio flex items-center">
                                    <div class="author-avatar mr-4">
                                        <?php echo get_avatar(get_the_author_meta('ID'), 48, '', '', array('class' => 'rounded-full')); ?>
                                    </div>
                                    <div>
                                        <div class="font-medium"><?php echo get_the_author(); ?></div>
                                        <?php if (get_the_author_meta('description')) : ?>
                                            <div class="text-sm text-gray-600"><?php echo esc_html(get_the_author_meta('description')); ?></div>
                                        <?php endif; ?>
                                    </div>
                                </div>

                                <div class="social-share">
                                    <!-- Add social sharing buttons here if needed -->
                                </div>
                            </div>
                        </footer><!-- .entry-footer -->
                    </div>
                </article><!-- #post-<?php the_ID(); ?> -->

                <?php
                // Post navigation
                the_post_navigation(array(
                    'prev_text' => '<span class="nav-subtitle">' . esc_html__('Previous:', 'research-profile') . '</span> <span class="nav-title">%title</span>',
                    'next_text' => '<span class="nav-subtitle">' . esc_html__('Next:', 'research-profile') . '</span> <span class="nav-title">%title</span>',
                ));

                // Comments section
                if (comments_open() || get_comments_number()) :
                    echo '<div class="mt-16">';
                    comments_template();
                    echo '</div>';
                endif;
                ?>

            <?php endwhile; ?>
        </div>
    </div>
</div>

<?php get_footer(); ?>