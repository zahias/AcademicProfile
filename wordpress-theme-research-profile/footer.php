<?php
/**
 * The template for displaying the footer
 */
?>

    </div><!-- #content -->

    <footer id="colophon" class="site-footer bg-gray-900 text-white mt-20">
        <div class="container mx-auto px-4 py-12">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Site Info -->
                <div>
                    <h3 class="text-xl font-bold mb-4"><?php bloginfo('name'); ?></h3>
                    <?php if (get_bloginfo('description')) : ?>
                        <p class="text-gray-300 mb-4"><?php bloginfo('description'); ?></p>
                    <?php endif; ?>
                    <p class="text-gray-300 text-sm">
                        <?php _e('Powered by Research Profile Theme', 'research-profile'); ?>
                    </p>
                </div>

                <!-- Quick Links -->
                <div>
                    <h4 class="text-lg font-semibold mb-4"><?php _e('Quick Links', 'research-profile'); ?></h4>
                    <?php
                    wp_nav_menu(array(
                        'theme_location' => 'footer',
                        'menu_class' => 'space-y-2',
                        'container' => false,
                        'fallback_cb' => 'research_profile_footer_default_menu',
                    ));
                    ?>
                </div>

                <!-- Contact/Additional Info -->
                <div>
                    <h4 class="text-lg font-semibold mb-4"><?php _e('Research Profile', 'research-profile'); ?></h4>
                    <p class="text-gray-300 text-sm leading-relaxed">
                        <?php _e('Showcase academic research with beautiful profiles, interactive analytics, and comprehensive publication listings.', 'research-profile'); ?>
                    </p>
                </div>
            </div>

            <div class="border-t border-gray-700 mt-8 pt-8 text-center">
                <p class="text-gray-400 text-sm">
                    &copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. <?php _e('All rights reserved.', 'research-profile'); ?>
                </p>
            </div>
        </div>
    </footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

<script>
// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});
</script>

</body>
</html>

<?php
// Default footer menu fallback
function research_profile_footer_default_menu() {
    echo '<ul class="space-y-2">';
    echo '<li><a href="' . esc_url(home_url('/')) . '" class="text-gray-300 hover:text-white text-sm">' . __('Home', 'research-profile') . '</a></li>';
    
    // Add researchers archive link if the post type exists
    if (post_type_exists('researcher')) {
        $researchers_url = get_post_type_archive_link('researcher');
        if ($researchers_url) {
            echo '<li><a href="' . esc_url($researchers_url) . '" class="text-gray-300 hover:text-white text-sm">' . __('Researchers', 'research-profile') . '</a></li>';
        }
    }
    
    echo '<li><a href="' . esc_url(admin_url()) . '" class="text-gray-300 hover:text-white text-sm">' . __('Admin', 'research-profile') . '</a></li>';
    echo '</ul>';
}
?>