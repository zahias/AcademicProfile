/**
 * Research Profile Theme JavaScript
 * 
 * This file contains all the JavaScript functionality for the Research Profile theme
 * including Chart.js implementations for publication analytics
 */

(function($) {
    'use strict';

    // Chart color palette
    const CHART_COLORS = [
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(16, 185, 129, 0.8)',  // Green  
        'rgba(245, 158, 11, 0.8)',  // Amber
        'rgba(168, 85, 247, 0.8)',  // Purple
        'rgba(239, 68, 68, 0.8)',   // Red
        'rgba(6, 182, 212, 0.8)',   // Cyan
        'rgba(139, 69, 19, 0.8)',   // Brown
        'rgba(75, 85, 99, 0.8)',    // Gray
    ];

    const CHART_COLORS_BORDER = [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)', 
        'rgb(245, 158, 11)',
        'rgb(168, 85, 247)',
        'rgb(239, 68, 68)',
        'rgb(6, 182, 212)',
        'rgb(139, 69, 19)',
        'rgb(75, 85, 99)',
    ];

    // Initialize charts when document is ready
    $(document).ready(function() {
        initializeCharts();
        initializeLoadMorePublications();
        initializeMobileMenu();
    });

    /**
     * Initialize all research analytics charts
     */
    function initializeCharts() {
        if (typeof window.researcherPublications === 'undefined' || !window.researcherPublications) {
            return;
        }

        const publications = window.researcherPublications;
        const stats = window.researcherStats || {};

        // Process publication data
        const chartData = processPublicationData(publications);

        // Initialize each chart
        createPublicationsOverTimeChart(chartData.yearlyData);
        createCitationsChart(chartData.citationData);
        createTopicsChart(chartData.topicsData);
        createVenuesChart(chartData.venuesData);
        createOpenAccessChart(chartData.openAccessData);
    }

    /**
     * Process publication data for charts
     */
    function processPublicationData(publications) {
        const currentYear = new Date().getFullYear();
        const yearCounts = {};
        const yearCitations = {};
        const topicCounts = {};
        const venueCounts = {};
        let openAccessCount = 0;
        let closedAccessCount = 0;

        // Process each publication
        publications.forEach(pub => {
            const year = pub.publication_year || currentYear;
            const citations = pub.cited_by_count || 0;

            // Year counts
            yearCounts[year] = (yearCounts[year] || 0) + 1;
            yearCitations[year] = (yearCitations[year] || 0) + citations;

            // Topics
            if (pub.topics && Array.isArray(pub.topics)) {
                pub.topics.forEach(topic => {
                    if (topic.display_name) {
                        topicCounts[topic.display_name] = (topicCounts[topic.display_name] || 0) + 1;
                    }
                });
            }

            // Venues
            if (pub.host_venue && pub.host_venue.display_name) {
                const venue = pub.host_venue.display_name;
                venueCounts[venue] = (venueCounts[venue] || 0) + 1;
            }

            // Open Access
            if (pub.is_oa) {
                openAccessCount++;
            } else {
                closedAccessCount++;
            }
        });

        // Create yearly data
        const startYear = Math.min(...Object.keys(yearCounts).map(Number));
        const endYear = Math.max(...Object.keys(yearCounts).map(Number));
        const yearlyData = [];

        for (let year = startYear; year <= endYear; year++) {
            yearlyData.push({
                year: year,
                publications: yearCounts[year] || 0,
                citations: yearCitations[year] || 0
            });
        }

        // Create topics data (top 8)
        const topicsData = Object.entries(topicCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([topic, count]) => ({
                topic: topic.length > 25 ? topic.substring(0, 25) + "..." : topic,
                count: count
            }));

        // Create venues data (top 6)
        const venuesData = Object.entries(venueCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([venue, count]) => ({
                venue: venue.length > 30 ? venue.substring(0, 30) + "..." : venue,
                count: count
            }));

        // Create citation data (publications with most citations)
        const citationData = publications
            .filter(pub => (pub.cited_by_count || 0) > 0)
            .sort((a, b) => (b.cited_by_count || 0) - (a.cited_by_count || 0))
            .slice(0, 10)
            .map(pub => ({
                title: pub.title && pub.title.length > 40 ? 
                       pub.title.substring(0, 40) + "..." : pub.title,
                citations: pub.cited_by_count || 0,
                year: pub.publication_year
            }));

        return {
            yearlyData,
            citationData,
            topicsData,
            venuesData,
            openAccessData: {
                openAccess: openAccessCount,
                closedAccess: closedAccessCount
            }
        };
    }

    /**
     * Create Publications Over Time Chart
     */
    function createPublicationsOverTimeChart(data) {
        const ctx = document.getElementById('publicationsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.year),
                datasets: [{
                    label: 'Publications per Year',
                    data: data.map(d => d.publications),
                    borderColor: CHART_COLORS_BORDER[0],
                    backgroundColor: CHART_COLORS[0],
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Publications: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    /**
     * Create Citations Chart
     */
    function createCitationsChart(data) {
        const ctx = document.getElementById('citationsChart');
        if (!ctx || !data.length) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.title),
                datasets: [{
                    label: 'Citations',
                    data: data.map(d => d.citations),
                    backgroundColor: CHART_COLORS[1],
                    borderColor: CHART_COLORS_BORDER[1],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dataPoint = data[context.dataIndex];
                                return `Citations: ${context.parsed.x} (${dataPoint.year})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Create Research Topics Chart
     */
    function createTopicsChart(data) {
        const ctx = document.getElementById('topicsChart');
        if (!ctx || !data.length) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.topic),
                datasets: [{
                    data: data.map(d => d.count),
                    backgroundColor: CHART_COLORS.slice(0, data.length),
                    borderColor: CHART_COLORS_BORDER.slice(0, data.length),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create Publication Venues Chart
     */
    function createVenuesChart(data) {
        const ctx = document.getElementById('venuesChart');
        if (!ctx || !data.length) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.venue),
                datasets: [{
                    label: 'Publications',
                    data: data.map(d => d.count),
                    backgroundColor: CHART_COLORS[2],
                    borderColor: CHART_COLORS_BORDER[2],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    /**
     * Create Open Access Chart
     */
    function createOpenAccessChart(data) {
        const ctx = document.getElementById('openAccessChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Open Access', 'Closed Access'],
                datasets: [{
                    data: [data.openAccess, data.closedAccess],
                    backgroundColor: [CHART_COLORS[1], CHART_COLORS[3]],
                    borderColor: [CHART_COLORS_BORDER[1], CHART_COLORS_BORDER[3]],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = data.openAccess + data.closedAccess;
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize Load More Publications functionality
     */
    function initializeLoadMorePublications() {
        const loadMoreBtn = $('#load-more-publications');
        const publicationsList = $('#publications-list');
        
        if (!loadMoreBtn.length || typeof window.researcherPublications === 'undefined') {
            return;
        }

        const publications = window.researcherPublications;
        let currentIndex = 10; // First 10 already shown

        loadMoreBtn.on('click', function() {
            const nextBatch = publications.slice(currentIndex, currentIndex + 10);
            
            nextBatch.forEach(function(work) {
                const publicationHtml = createPublicationHTML(work);
                publicationsList.append(publicationHtml);
            });

            currentIndex += 10;

            // Hide button if no more publications
            if (currentIndex >= publications.length) {
                loadMoreBtn.hide();
            }
        });
    }

    /**
     * Create HTML for a publication
     */
    function createPublicationHTML(work) {
        const title = work.title || 'Untitled';
        const year = work.publication_year || '';
        const citations = work.cited_by_count || 0;
        const venue = work.host_venue?.display_name || '';
        const doi = work.doi || '';
        const isOpenAccess = work.is_oa;

        let html = `
            <div class="research-card p-6 hover:shadow-lg transition-shadow">
                <h3 class="text-xl font-semibold mb-3 text-gray-900 leading-tight">
        `;

        if (doi) {
            html += `<a href="https://doi.org/${doi}" target="_blank" rel="noopener" class="hover:text-blue-600 transition-colors">${title}</a>`;
        } else {
            html += title;
        }

        html += `</h3>
                <div class="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4">`;

        if (year) {
            html += `
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    ${year}
                </span>
            `;
        }

        if (citations > 0) {
            html += `
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                    </svg>
                    ${citations} citations
                </span>
            `;
        }

        if (isOpenAccess) {
            html += `<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Open Access</span>`;
        }

        html += `</div>`;

        if (venue) {
            html += `<p class="text-gray-700 mb-2"><span class="font-medium">Published in:</span> ${venue}</p>`;
        }

        html += `</div>`;

        return html;
    }

    /**
     * Initialize mobile menu functionality
     */
    function initializeMobileMenu() {
        const mobileMenuToggle = $('.mobile-menu-toggle');
        const mobileMenu = $('.mobile-menu');
        
        mobileMenuToggle.on('click', function() {
            mobileMenu.toggleClass('hidden');
            
            // Toggle hamburger/X icon
            const icon = $(this).find('svg');
            if (mobileMenu.hasClass('hidden')) {
                icon.html('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />');
            } else {
                icon.html('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />');
            }
        });

        // Close mobile menu when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.mobile-menu-toggle, .mobile-menu').length) {
                mobileMenu.addClass('hidden');
                const icon = mobileMenuToggle.find('svg');
                icon.html('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />');
            }
        });
    }

})(jQuery);