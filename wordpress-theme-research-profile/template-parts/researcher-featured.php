<?php
/**
 * Template part for displaying featured researcher on homepage
 */

$researcher_data = research_profile_get_researcher_data(get_the_ID());
$openalex_data = $researcher_data['openalex_data'];
$author_stats = $openalex_data['author'] ?? null;
?>

<section class="hero-banner">
    <div class="hero-pattern"></div>
    <div class="hero-content">
        <div class="container mx-auto px-4 py-20">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <!-- Profile Image Section -->
                <div class="lg:col-span-4 flex justify-center lg:justify-start">
                    <div class="profile-image-container">
                        <div class="profile-image-glow"></div>
                        <div class="relative bg-white/10 backdrop-blur-sm rounded-full p-3 shadow-2xl">
                            <?php if (has_post_thumbnail()) : ?>
                                <?php the_post_thumbnail('large', array(
                                    'class' => 'w-44 h-44 lg:w-56 lg:h-56 rounded-full object-cover border-4 border-white/30 shadow-2xl',
                                    'alt' => esc_attr($researcher_data['display_name'] ?: get_the_title())
                                )); ?>
                            <?php else : ?>
                                <img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500" 
                                     alt="<?php echo esc_attr($researcher_data['display_name'] ?: get_the_title()); ?>" 
                                     class="w-44 h-44 lg:w-56 lg:h-56 rounded-full object-cover border-4 border-white/30 shadow-2xl">
                            <?php endif; ?>
                            <div class="profile-badge absolute -bottom-3 -right-3 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center">
                                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Content Section -->
                <div class="lg:col-span-8 text-center lg:text-left text-white space-y-8">
                    <div class="space-y-6">
                        <div>
                            <p class="text-lg text-white/80 mb-2"><?php _e('Featured Researcher', 'research-profile'); ?></p>
                            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                                <?php echo esc_html($researcher_data['display_name'] ?: get_the_title()); ?>
                            </h1>
                            <?php if ($researcher_data['title']) : ?>
                                <p class="text-xl sm:text-2xl mb-6 text-white/90 font-light tracking-wide">
                                    <?php echo esc_html($researcher_data['title']); ?>
                                </p>
                            <?php endif; ?>
                        </div>
                        
                        <?php if ($researcher_data['bio']) : ?>
                            <p class="text-lg leading-relaxed text-white/90 max-w-2xl">
                                <?php echo esc_html(wp_trim_words($researcher_data['bio'], 30)); ?>
                            </p>
                        <?php endif; ?>
                        
                        <div class="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <a href="<?php echo esc_url(get_permalink()); ?>" class="btn btn-primary">
                                <?php _e('View Full Profile', 'research-profile'); ?>
                            </a>
                            <?php if ($researcher_data['cv_url']) : ?>
                                <a href="<?php echo esc_url($researcher_data['cv_url']); ?>" 
                                   class="btn btn-secondary" 
                                   target="_blank" rel="noopener">
                                    <?php _e('Download CV', 'research-profile'); ?>
                                </a>
                            <?php endif; ?>
                        </div>
                        
                        <!-- Quick Stats -->
                        <?php if ($author_stats) : ?>
                            <div class="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-white">
                                        <?php echo esc_html($author_stats['works_count'] ?? 0); ?>
                                    </div>
                                    <div class="text-white/70 text-sm"><?php _e('Publications', 'research-profile'); ?></div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-white">
                                        <?php echo esc_html($author_stats['cited_by_count'] ?? 0); ?>
                                    </div>
                                    <div class="text-white/70 text-sm"><?php _e('Citations', 'research-profile'); ?></div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-white">
                                        <?php echo esc_html($author_stats['summary_stats']['h_index'] ?? 0); ?>
                                    </div>
                                    <div class="text-white/70 text-sm"><?php _e('h-index', 'research-profile'); ?></div>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>