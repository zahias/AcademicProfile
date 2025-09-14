<?php
/**
 * The header for our theme
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site">
    <a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e('Skip to content', 'research-profile'); ?></a>

    <header id="masthead" class="site-header">
        <nav class="navbar bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <div class="container mx-auto px-4">
                <div class="flex items-center justify-between h-16">
                    <!-- Logo/Site Title -->
                    <div class="flex-shrink-0">
                        <?php if (has_custom_logo()) : ?>
                            <?php the_custom_logo(); ?>
                        <?php else : ?>
                            <a href="<?php echo esc_url(home_url('/')); ?>" class="text-2xl font-bold text-gray-900">
                                <?php bloginfo('name'); ?>
                            </a>
                        <?php endif; ?>
                    </div>

                    <!-- Navigation Menu -->
                    <div class="hidden md:block">
                        <?php
                        wp_nav_menu(array(
                            'theme_location' => 'primary',
                            'menu_class' => 'flex space-x-8',
                            'container' => false,
                            'fallback_cb' => 'research_profile_default_menu',
                        ));
                        ?>
                    </div>

                    <!-- Mobile menu button -->
                    <div class="md:hidden">
                        <button type="button" class="mobile-menu-toggle inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                            <span class="sr-only"><?php esc_html_e('Open main menu', 'research-profile'); ?></span>
                            <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Mobile Navigation Menu -->
                <div class="mobile-menu hidden md:hidden">
                    <div class="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                        <?php
                        wp_nav_menu(array(
                            'theme_location' => 'primary',
                            'menu_class' => 'mobile-nav-menu',
                            'container' => false,
                            'fallback_cb' => 'research_profile_mobile_default_menu',
                        ));
                        ?>
                    </div>
                </div>
            </div>
        </nav>
    </header><!-- #masthead -->

    <div id="content" class="site-content">

<?php
// Default menu fallback for desktop
function research_profile_default_menu() {
    echo '<ul class="flex space-x-8">';
    echo '<li><a href="' . esc_url(home_url('/')) . '" class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">' . __('Home', 'research-profile') . '</a></li>';
    
    // Add researchers archive link if the post type exists
    if (post_type_exists('researcher')) {
        $researchers_url = get_post_type_archive_link('researcher');
        if ($researchers_url) {
            echo '<li><a href="' . esc_url($researchers_url) . '" class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">' . __('Researchers', 'research-profile') . '</a></li>';
        }
    }
    
    echo '</ul>';
}

// Default menu fallback for mobile
function research_profile_mobile_default_menu() {
    echo '<a href="' . esc_url(home_url('/')) . '" class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">' . __('Home', 'research-profile') . '</a>';
    
    // Add researchers archive link if the post type exists
    if (post_type_exists('researcher')) {
        $researchers_url = get_post_type_archive_link('researcher');
        if ($researchers_url) {
            echo '<a href="' . esc_url($researchers_url) . '" class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">' . __('Researchers', 'research-profile') . '</a>';
        }
    }
}
?>