<?php
/**
 * Footer template
 *
 * @package Research_Profile
 */
?>

    </div>

    <footer id="colophon" class="site-footer bg-gray-50 border-t border-gray-200 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center text-gray-600">
                <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. 
                <?php esc_html_e('Powered by OpenAlex API.', 'research-profile'); ?></p>
            </div>
        </div>
    </footer>
</div>

<?php wp_footer(); ?>
</body>
</html>
