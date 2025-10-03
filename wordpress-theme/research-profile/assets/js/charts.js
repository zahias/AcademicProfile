/**
 * Research Profile Charts
 * 
 * Handles rendering of publication analytics charts
 */

(function($) {
    'use strict';
    
    // Chart.js configuration (load from CDN in footer)
    const chartColors = {
        primary: '#2563eb',
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        purple: '#8b5cf6',
        pink: '#ec4899',
    };
    
    // Initialize charts when DOM is ready
    $(document).ready(function() {
        initializeCharts();
    });
    
    function initializeCharts() {
        const chartContainers = document.querySelectorAll('[id^="analytics-charts"], [id^="elementor-analytics-charts"]');
        
        chartContainers.forEach(function(container) {
            const growthData = JSON.parse(container.dataset.growth || '[]');
            const typesData = JSON.parse(container.dataset.types || '[]');
            const citationsData = JSON.parse(container.dataset.citations || '[]');
            
            // Create placeholder for charts
            container.innerHTML = `
                <div class="mb-8">
                    <h3 class="text-xl font-semibold mb-4">Growth Over Time</h3>
                    <canvas id="growth-chart-${container.dataset.researcherId || 'default'}"></canvas>
                </div>
                <div class="mb-8">
                    <h3 class="text-xl font-semibold mb-4">Publication Types</h3>
                    <canvas id="types-chart-${container.dataset.researcherId || 'default'}"></canvas>
                </div>
                <div>
                    <h3 class="text-xl font-semibold mb-4">Citation Impact</h3>
                    <canvas id="citations-chart-${container.dataset.researcherId || 'default'}"></canvas>
                </div>
            `;
            
            // Note: Actual Chart.js rendering would happen here
            // For now, we'll display the data in a simple format
            renderSimpleCharts(container, growthData, typesData, citationsData);
        });
    }
    
    function renderSimpleCharts(container, growthData, typesData, citationsData) {
        // Simple text-based charts for demonstration
        // In production, this would use Chart.js or similar library
        
        const researcherId = container.dataset.researcherId || 'default';
        
        // Growth chart (simple table)
        const growthCanvas = container.querySelector(`#growth-chart-${researcherId}`);
        if (growthCanvas && growthData.length > 0) {
            const growthHTML = growthData.map(item => 
                `<div class="flex justify-between py-2 border-b">
                    <span>${item.year}</span>
                    <span class="font-semibold">${item.count} publications</span>
                </div>`
            ).join('');
            growthCanvas.outerHTML = `<div class="space-y-2">${growthHTML}</div>`;
        }
        
        // Types chart
        const typesCanvas = container.querySelector(`#types-chart-${researcherId}`);
        if (typesCanvas && typesData.length > 0) {
            const typesHTML = typesData.map(item => 
                `<div class="flex justify-between py-2 border-b">
                    <span class="capitalize">${item.type.replace(/-/g, ' ')}</span>
                    <span class="font-semibold">${item.count}</span>
                </div>`
            ).join('');
            typesCanvas.outerHTML = `<div class="space-y-2">${typesHTML}</div>`;
        }
        
        // Citations chart
        const citationsCanvas = container.querySelector(`#citations-chart-${researcherId}`);
        if (citationsCanvas && citationsData.length > 0) {
            const citationsHTML = citationsData.map(item => 
                `<div class="flex justify-between py-2 border-b">
                    <span>${item.year}</span>
                    <span class="font-semibold">${item.citations} citations</span>
                </div>`
            ).join('');
            citationsCanvas.outerHTML = `<div class="space-y-2">${citationsHTML}</div>`;
        }
    }
    
})(jQuery);
