<?php
/**
 * Template part for displaying posts
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class('research-card mb-8'); ?>>
    <div class="p-6">
        <header class="entry-header mb-4">
            <?php
            if (is_singular()) :
                the_title('<h1 class="entry-title text-3xl font-bold mb-4">', '</h1>');
            else :
                the_title('<h2 class="entry-title text-2xl font-bold mb-2"><a href="' . esc_url(get_permalink()) . '" rel="bookmark" class="hover:text-blue-600 transition-colors">', '</a></h2>');
            endif;
            ?>

            <?php if ('post' === get_post_type()) : ?>
                <div class="entry-meta text-sm text-gray-600">
                    <?php
                    echo '<time class="published" datetime="' . esc_attr(get_the_date('c')) . '">';
                    echo get_the_date();
                    echo '</time>';
                    
                    echo '<span class="byline"> by ';
                    echo '<span class="author vcard"><a class="url fn n" href="' . esc_url(get_author_posts_url(get_the_author_meta('ID'))) . '">';
                    echo get_the_author();
                    echo '</a></span>';
                    echo '</span>';
                    ?>
                </div>
            <?php endif; ?>
        </header><!-- .entry-header -->

        <?php if (has_post_thumbnail() && !is_singular()) : ?>
            <div class="post-thumbnail mb-4">
                <a href="<?php the_permalink(); ?>">
                    <?php the_post_thumbnail('medium', array('class' => 'w-full h-48 object-cover rounded-lg')); ?>
                </a>
            </div>
        <?php endif; ?>

        <div class="entry-content">
            <?php
            if (is_singular() || is_home()) {
                the_content();
            } else {
                the_excerpt();
            }

            wp_link_pages(array(
                'before' => '<div class="page-links mt-4">' . esc_html__('Pages:', 'research-profile'),
                'after'  => '</div>',
            ));
            ?>
        </div><!-- .entry-content -->

        <?php if (!is_singular()) : ?>
            <div class="entry-footer mt-4 pt-4 border-t">
                <a href="<?php the_permalink(); ?>" class="text-blue-600 hover:text-blue-700 font-medium">
                    <?php _e('Read More →', 'research-profile'); ?>
                </a>
            </div>
        <?php endif; ?>
    </div>
</article><!-- #post-<?php the_ID(); ?> -->