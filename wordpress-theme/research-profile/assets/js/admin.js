/**
 * Research Profile Admin Scripts
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Handle CV upload
        $('#upload_cv_button').on('click', function(e) {
            e.preventDefault();
            
            const frame = wp.media({
                title: 'Select or Upload CV',
                button: {
                    text: 'Use this file'
                },
                library: {
                    type: 'application/pdf'
                },
                multiple: false
            });
            
            frame.on('select', function() {
                const attachment = frame.state().get('selection').first().toJSON();
                $('#cv_url').val(attachment.url);
            });
            
            frame.open();
        });
        
        // Handle sync researcher button
        $('#sync-researcher-button').on('click', function() {
            const button = $(this);
            const researcherId = button.data('researcher-id');
            const statusDiv = $('#sync-status');
            
            button.prop('disabled', true).text('Syncing...');
            statusDiv.show().html('<p>Synchronizing with OpenAlex...</p>');
            
            $.ajax({
                url: researchProfileAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'sync_researcher',
                    researcher_id: researcherId,
                    nonce: researchProfileAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        statusDiv.html('<p style="color: green;">✓ ' + response.data.message + '</p>');
                        setTimeout(function() {
                            location.reload();
                        }, 2000);
                    } else {
                        statusDiv.html('<p style="color: red;">✗ ' + response.data.message + '</p>');
                        button.prop('disabled', false).text('Sync with OpenAlex');
                    }
                },
                error: function() {
                    statusDiv.html('<p style="color: red;">✗ Sync failed. Please try again.</p>');
                    button.prop('disabled', false).text('Sync with OpenAlex');
                }
            });
        });
    });
    
})(jQuery);
