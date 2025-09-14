/**
 * Admin JavaScript for Research Profile Theme
 * 
 * Handles admin functionality like OpenAlex data syncing
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        initializeOpenAlexSync();
    });

    /**
     * Initialize OpenAlex data synchronization
     */
    function initializeOpenAlexSync() {
        const syncButton = $('#sync-openalex-data');
        
        if (!syncButton.length) {
            return;
        }

        syncButton.on('click', function(e) {
            e.preventDefault();
            
            const button = $(this);
            const originalText = button.text();
            const postId = $('#post_ID').val();
            
            if (!postId) {
                alert('Please save the researcher profile first.');
                return;
            }

            // Show loading state
            button.text('Syncing...').prop('disabled', true);
            
            // Make AJAX request
            $.ajax({
                url: research_profile_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'sync_openalex_data',
                    post_id: postId,
                    nonce: research_profile_ajax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        // Show success message
                        showAdminNotice('success', 'OpenAlex data synced successfully!');
                        
                        // Update last synced time if element exists
                        const lastSyncedElement = button.closest('tr').find('td').last();
                        if (lastSyncedElement.length && response.data.last_synced) {
                            lastSyncedElement.html(response.data.last_synced + ' <button type="button" id="sync-openalex-data" class="button">Sync Now</button>');
                        }
                        
                        // Suggest page refresh
                        if (confirm('Data synced successfully! Would you like to refresh the page to see updated information?')) {
                            window.location.reload();
                        }
                    } else {
                        showAdminNotice('error', 'Error: ' + (response.data || 'Unknown error occurred'));
                    }
                },
                error: function(xhr, status, error) {
                    showAdminNotice('error', 'Network error: ' + error);
                },
                complete: function() {
                    // Reset button
                    button.text(originalText).prop('disabled', false);
                }
            });
        });
    }

    /**
     * Show admin notice
     */
    function showAdminNotice(type, message) {
        const noticeClass = type === 'success' ? 'notice-success' : 'notice-error';
        const notice = $('<div class="notice ' + noticeClass + ' is-dismissible"><p>' + message + '</p></div>');
        
        // Add dismiss button
        notice.append('<button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>');
        
        // Insert after h1 or at the beginning of the page
        const target = $('.wrap h1').first();
        if (target.length) {
            target.after(notice);
        } else {
            $('.wrap').prepend(notice);
        }
        
        // Handle dismiss
        notice.on('click', '.notice-dismiss', function() {
            notice.fadeOut();
        });
        
        // Auto-dismiss success messages after 5 seconds
        if (type === 'success') {
            setTimeout(function() {
                notice.fadeOut();
            }, 5000);
        }
    }

    /**
     * Handle OpenAlex ID field validation
     */
    $(document).on('blur', '#researcher_openalex_id', function() {
        const field = $(this);
        const value = field.val().trim();
        
        if (value && !value.match(/^A\d+$/)) {
            // Auto-format the ID
            let formattedValue = value.toUpperCase();
            if (!formattedValue.startsWith('A')) {
                formattedValue = 'A' + formattedValue.replace(/^A*/i, '');
            }
            
            // Remove non-digit characters except the leading A
            formattedValue = 'A' + formattedValue.substring(1).replace(/\D/g, '');
            
            if (formattedValue !== value) {
                field.val(formattedValue);
                showAdminNotice('info', 'OpenAlex ID has been auto-formatted to: ' + formattedValue);
            }
        }
    });

    /**
     * Add confirmation to profile deletion
     */
    $('#delete-action a').on('click', function(e) {
        if (!confirm('Are you sure you want to delete this researcher profile? This action cannot be undone.')) {
            e.preventDefault();
        }
    });

    /**
     * Add helpful tooltips and descriptions
     */
    function initializeTooltips() {
        // Add tooltips for various fields
        const tooltips = {
            '#researcher_openalex_id': 'Find your OpenAlex ID by searching for your name on openalex.org',
            '#researcher_cv_url': 'Direct link to your CV file (PDF recommended)',
            '#researcher_current_affiliation_url': 'Link to your institution\'s homepage or your profile page'
        };

        $.each(tooltips, function(selector, text) {
            const field = $(selector);
            if (field.length) {
                field.attr('title', text);
            }
        });
    }

    // Initialize tooltips when DOM is ready
    initializeTooltips();

})(jQuery);