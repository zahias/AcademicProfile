<?php
/**
 * Template part for displaying researcher cards
 */

$researcher_data = research_profile_get_researcher_data(get_the_ID());
$openalex_data = $researcher_data['openalex_data'];
$author_stats = $openalex_data['author'] ?? null;
?>

<div class="research-card group cursor-pointer" onclick="location.href='<?php echo esc_url(get_permalink()); ?>'">
    <div class="aspect-w-16 aspect-h-9 mb-4 overflow-hidden rounded-lg">
        <?php if (has_post_thumbnail()) : ?>
            <?php the_post_thumbnail('medium', array(
                'class' => 'w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300',
                'alt' => esc_attr($researcher_data['display_name'] ?: get_the_title())
            )); ?>
        <?php else : ?>
            <div class="w-full h-48 bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
            </div>
        <?php endif; ?>
    </div>

    <div class="p-6">
        <h3 class="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
            <?php echo esc_html($researcher_data['display_name'] ?: get_the_title()); ?>
        </h3>

        <?php if ($researcher_data['title']) : ?>
            <p class="text-gray-600 mb-3 text-sm">
                <?php echo esc_html($researcher_data['title']); ?>
            </p>
        <?php endif; ?>

        <?php if ($researcher_data['current_affiliation']) : ?>
            <p class="text-gray-500 text-sm mb-4 flex items-center">
                <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <?php echo esc_html($researcher_data['current_affiliation']); ?>
            </p>
        <?php endif; ?>

        <?php if ($researcher_data['bio']) : ?>
            <p class="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                <?php echo esc_html(wp_trim_words($researcher_data['bio'], 20)); ?>
            </p>
        <?php endif; ?>

        <!-- Stats -->
        <?php if ($author_stats) : ?>
            <div class="grid grid-cols-3 gap-3 text-center border-t pt-4">
                <div>
                    <div class="text-lg font-bold text-blue-600">
                        <?php echo esc_html($author_stats['works_count'] ?? 0); ?>
                    </div>
                    <div class="text-xs text-gray-600"><?php _e('Papers', 'research-profile'); ?></div>
                </div>
                <div>
                    <div class="text-lg font-bold text-green-600">
                        <?php echo esc_html($author_stats['cited_by_count'] ?? 0); ?>
                    </div>
                    <div class="text-xs text-gray-600"><?php _e('Citations', 'research-profile'); ?></div>
                </div>
                <div>
                    <div class="text-lg font-bold text-purple-600">
                        <?php echo esc_html($author_stats['summary_stats']['h_index'] ?? 0); ?>
                    </div>
                    <div class="text-xs text-gray-600"><?php _e('h-index', 'research-profile'); ?></div>
                </div>
            </div>
        <?php endif; ?>

        <div class="mt-4 pt-4 border-t">
            <span class="text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                <?php _e('View Profile →', 'research-profile'); ?>
            </span>
        </div>
    </div>
</div>