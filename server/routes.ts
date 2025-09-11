import type { Express } from "express";
import { createServer, type Server } from "http";
import { OpenAlexService } from "./services/openalexApi";
import { listTemplates, getTemplate } from "./fileData";

// Security utility functions for safe HTML generation
function escapeHtml(unsafe: string | undefined | null): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeHtmlAttribute(unsafe: string | undefined | null): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ');
}

function validateAndSanitizeUrl(url: string | undefined | null): string {
  if (!url) return '#';
  
  // Remove any potentially dangerous characters
  const sanitized = String(url).replace(/[<>"']/g, '');
  
  // Only allow http, https, and relative URLs
  try {
    const urlObj = new URL(sanitized, 'https://example.com');
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      return sanitized;
    }
  } catch {
    // If URL parsing fails, check if it's a relative URL
    if (sanitized.startsWith('/') || sanitized.startsWith('#')) {
      return sanitized;
    }
  }
  
  // Default to safe fallback
  return '#';
}

// Static HTML template for exported researcher profiles
function generateStaticHTML(data: any): string {
  const { profile, researcher, topics, publications, affiliations, exportedAt, exportUrl } = data;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtmlAttribute(profile.displayName) || 'Researcher Profile'} - Academic Profile</title>
    <meta name="description" content="${escapeHtmlAttribute(profile.bio) || `Academic profile of ${escapeHtmlAttribute(profile.displayName) || 'researcher'} with publications, research topics, and career information.`}">
    <meta name="author" content="${escapeHtmlAttribute(profile.displayName) || 'Researcher'}">
    
    <!-- Open Graph meta tags -->
    <meta property="og:title" content="${escapeHtmlAttribute(profile.displayName) || 'Researcher Profile'} - Academic Profile">
    <meta property="og:description" content="${escapeHtmlAttribute(profile.bio) || `Academic profile with ${publications?.length || 0} publications and ${researcher?.cited_by_count || 0} citations.`}">
    <meta property="og:type" content="profile">
    <meta property="og:url" content="${validateAndSanitizeUrl(exportUrl)}">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .stats-card { backdrop-filter: blur(10px); background: rgba(255,255,255,0.1); }
        .publication-card { transition: all 0.3s ease; }
        .publication-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
        @media print { .no-print { display: none !important; } }
    </style>
</head>
<body class="bg-gray-50 text-gray-900">
    <!-- Header -->
    <header class="gradient-bg text-white py-20">
        <div class="max-w-6xl mx-auto px-6">
            <div class="text-center">
                <div class="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-sm">
                    <span class="text-4xl font-bold text-white">${escapeHtml((profile.displayName || 'R').charAt(0))}</span>
                </div>
                <h1 class="text-5xl font-bold mb-4">${escapeHtml(profile.displayName) || 'Researcher Profile'}</h1>
                ${profile.title ? `<p class="text-xl mb-4 text-white/90">${escapeHtml(profile.title)}</p>` : ''}
                ${profile.currentAffiliation ? `<p class="text-lg text-white/80">${escapeHtml(profile.currentAffiliation)}</p>` : ''}
                ${profile.bio ? `<p class="mt-6 text-white/90 max-w-3xl mx-auto leading-relaxed">${escapeHtml(profile.bio)}</p>` : ''}
            </div>
        </div>
    </header>

    <!-- Stats Overview -->
    <section class="py-16 -mt-10 relative z-10">
        <div class="max-w-6xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="stats-card rounded-lg p-6 text-center text-white border border-white/20">
                    <div class="text-3xl font-bold">${publications?.length || 0}</div>
                    <div class="text-sm opacity-80">Publications</div>
                </div>
                <div class="stats-card rounded-lg p-6 text-center text-white border border-white/20">
                    <div class="text-3xl font-bold">${researcher?.cited_by_count || 0}</div>
                    <div class="text-sm opacity-80">Citations</div>
                </div>
                <div class="stats-card rounded-lg p-6 text-center text-white border border-white/20">
                    <div class="text-3xl font-bold">${researcher?.summary_stats?.h_index || 0}</div>
                    <div class="text-sm opacity-80">h-index</div>
                </div>
                <div class="stats-card rounded-lg p-6 text-center text-white border border-white/20">
                    <div class="text-3xl font-bold">${researcher?.summary_stats?.i10_index || 0}</div>
                    <div class="text-sm opacity-80">i10-index</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Research Topics -->
    ${topics && topics.length > 0 ? `
    <section class="py-16 bg-white">
        <div class="max-w-6xl mx-auto px-6">
            <h2 class="text-3xl font-bold mb-8 text-center">Research Areas</h2>
            <div class="flex flex-wrap gap-3 justify-center">
                ${topics.slice(0, 15).map((topic: any) => `
                    <span class="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        ${escapeHtml(topic.displayName)} (${escapeHtml(String(topic.count))})
                    </span>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Publications -->
    ${publications && publications.length > 0 ? `
    <section class="py-16 bg-gray-50">
        <div class="max-w-6xl mx-auto px-6">
            <h2 class="text-3xl font-bold mb-8 text-center">Recent Publications</h2>
            <div class="space-y-6">
                ${publications.slice(0, 10).map((pub: any) => `
                    <div class="publication-card bg-white rounded-lg p-6 shadow-sm border">
                        <h3 class="text-xl font-semibold mb-2 text-gray-900">${escapeHtml(pub.title)}</h3>
                        ${pub.authorNames ? `<p class="text-gray-600 mb-2">${escapeHtml(pub.authorNames)}</p>` : ''}
                        <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                            ${pub.journal ? `<span>📖 ${escapeHtml(pub.journal)}</span>` : ''}
                            ${pub.publicationYear ? `<span>📅 ${escapeHtml(String(pub.publicationYear))}</span>` : ''}
                            ${pub.citationCount ? `<span>📊 ${escapeHtml(String(pub.citationCount))} citations</span>` : ''}
                            ${pub.isOpenAccess ? '<span class="text-green-600">🔓 Open Access</span>' : ''}
                        </div>
                        ${pub.doi ? `<p class="mt-2 text-xs text-gray-400">DOI: ${escapeHtml(pub.doi)}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Affiliations -->
    ${affiliations && affiliations.length > 0 ? `
    <section class="py-16 bg-white">
        <div class="max-w-6xl mx-auto px-6">
            <h2 class="text-3xl font-bold mb-8 text-center">Institutional Affiliations</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${affiliations.map((aff: any) => `
                    <div class="bg-gray-50 rounded-lg p-6">
                        <h3 class="font-semibold text-lg mb-2">${escapeHtml(aff.institutionName)}</h3>
                        ${aff.institutionType ? `<p class="text-gray-600 mb-2">${escapeHtml(aff.institutionType)}</p>` : ''}
                        ${aff.countryCode ? `<p class="text-sm text-gray-500">📍 ${escapeHtml(aff.countryCode)}</p>` : ''}
                        ${aff.startYear || aff.endYear ? `
                            <p class="text-sm text-gray-500 mt-2">
                                ${escapeHtml(String(aff.startYear || '?'))} - ${escapeHtml(String(aff.endYear || 'Present'))}
                            </p>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-6xl mx-auto px-6 text-center">
            <p class="text-gray-400 mb-4">
                This profile was generated from OpenAlex data on ${escapeHtml(new Date(exportedAt).toLocaleDateString())}.
            </p>
            <p class="text-gray-500 text-sm">
                Data sourced from <a href="https://openalex.org" class="text-blue-400 hover:underline">OpenAlex</a> • 
                Generated by Research Profile Platform
            </p>
            <div class="mt-6 no-print">
                <a href="${validateAndSanitizeUrl(exportUrl)}" class="text-blue-400 hover:underline">View Live Profile</a>
            </div>
        </div>
    </footer>

    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Smooth scroll for any anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
        });
    </script>
</body>
</html>`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const openalexService = new OpenAlexService();

  // Search OpenAlex by ID (used by frontend to validate templates)
  app.get('/api/openalex/search/:openalexId', async (req, res) => {
    try {
      const { openalexId } = req.params;
      const data = await openalexService.getResearcher(openalexId);
      res.json(data);
    } catch (error) {
      console.error("Error searching OpenAlex:", error);
      res.status(500).json({ message: "Failed to search OpenAlex" });
    }
  });

  // Template routes - the core functionality of the generator
  
  // Get all available templates
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await listTemplates();
      res.json({
        templates: templates.map(template => ({
          slug: template.slug,
          filename: template.filename,
          lastModified: template.lastModified.toISOString(),
        })),
        count: templates.length
      });
    } catch (error) {
      console.error("Error listing templates:", error);
      res.status(500).json({ message: "Failed to list templates" });
    }
  });

  // Get specific template by slug
  app.get('/api/templates/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Validate slug to prevent directory traversal attacks
      if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
        return res.status(400).json({ message: "Invalid template slug. Only alphanumeric characters, hyphens, and underscores are allowed." });
      }
      
      const template = await getTemplate(slug);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json({
        slug,
        data: template.data,
        lastModified: template.lastModified.toISOString(),
      });
    } catch (error) {
      console.error(`Error fetching template ${req.params.slug}:`, error);
      
      // Handle validation errors specifically
      if (error instanceof Error && error.message.includes('Validation failed')) {
        return res.status(400).json({ 
          message: "Template validation failed", 
          error: error.message 
        });
      }
      
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Preview researcher profile from JSON template with live OpenAlex data
  app.get('/api/preview/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Validate slug to prevent directory traversal attacks
      if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
        return res.status(400).json({ message: "Invalid template slug. Only alphanumeric characters, hyphens, and underscores are allowed." });
      }
      
      // Load template data from JSON file
      const template = await getTemplate(slug);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      const templateData = template.data;
      
      // Convert template data to profile format
      const profile = {
        displayName: templateData.name,
        title: templateData.title || null,
        bio: templateData.bio || null,
        currentAffiliation: templateData.currentAffiliation || null,
        openalexId: templateData.openalexId,
        isPublic: templateData.isPublic !== false, // default to true
        links: templateData.links || null,
        theme: templateData.theme || null,
        lastSyncedAt: null, // Live data, not cached
      };

      // Fetch live data from OpenAlex API
      let researcher = null;
      let topics: any[] = [];
      let publications: any[] = [];
      let affiliations: any[] = [];

      try {
        // Fetch researcher data
        const researcherData = await openalexService.getResearcher(templateData.openalexId);
        researcher = researcherData;

        // Process research topics
        if (researcherData.topics && researcherData.topics.length > 0) {
          topics = researcherData.topics.map((topic: any) => ({
            openalexId: templateData.openalexId,
            topicId: topic.id,
            displayName: topic.display_name,
            count: topic.count,
            subfield: topic.subfield.display_name,
            field: topic.field.display_name,
            domain: topic.domain.display_name,
          }));
        }

        // Process affiliations
        if (researcherData.affiliations && researcherData.affiliations.length > 0) {
          affiliations = researcherData.affiliations.map((affiliation: any) => {
            const sortedYears = affiliation.years.sort((a: number, b: number) => a - b);
            return {
              openalexId: templateData.openalexId,
              institutionId: affiliation.institution.id,
              institutionName: affiliation.institution.display_name,
              institutionType: affiliation.institution.type,
              countryCode: affiliation.institution.country_code,
              years: affiliation.years,
              startYear: sortedYears[0],
              endYear: sortedYears[sortedYears.length - 1],
            };
          });
        }

        // Fetch and process publications/works
        try {
          const worksResponse = await openalexService.getResearcherWorks(templateData.openalexId);
          if (worksResponse.results && worksResponse.results.length > 0) {
            publications = worksResponse.results.map((work: any) => ({
              openalexId: templateData.openalexId,
              workId: work.id,
              title: work.title,
              authorNames: work.authorships.map((a: any) => a.author.display_name).join(', '),
              journal: work.primary_location?.source?.display_name || null,
              publicationYear: work.publication_year || null,
              citationCount: work.cited_by_count || 0,
              topics: work.topics ? work.topics.map((t: any) => t.display_name) : null,
              doi: work.doi || null,
              isOpenAccess: work.open_access?.is_oa || false,
            }));
          }
        } catch (worksError) {
          console.log(`No works found for ${templateData.openalexId} (this is normal for some researchers)`);
          // Continue with empty publications array
        }

      } catch (apiError) {
        console.error(`Error fetching OpenAlex data for ${templateData.openalexId}:`, apiError);
        // Return template data with error info if API fails
        return res.status(206).json({
          profile,
          researcher: null,
          topics: [],
          publications: [],
          affiliations: [],
          lastSynced: null,
          apiError: "Failed to fetch live OpenAlex data. Profile data from template only."
        });
      }

      // Return assembled data in same format as existing endpoint
      res.json({
        profile,
        researcher,
        topics,
        publications,
        affiliations,
        lastSynced: new Date().toISOString() // Live data timestamp
      });

    } catch (error) {
      console.error(`Error previewing template ${req.params.slug}:`, error);
      
      // Handle validation errors specifically
      if (error instanceof Error && error.message.includes('Validation failed')) {
        return res.status(400).json({ 
          message: "Template validation failed", 
          error: error.message 
        });
      }
      
      res.status(500).json({ message: "Failed to preview template" });
    }
  });

  // Export researcher profile from JSON template as static HTML
  app.get('/api/export/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Validate slug to prevent directory traversal attacks
      if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
        return res.status(400).json({ message: "Invalid template slug. Only alphanumeric characters, hyphens, and underscores are allowed." });
      }
      
      // Load template data from JSON file
      const template = await getTemplate(slug);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      const templateData = template.data;
      
      // Convert template data to profile format  
      const profile = {
        displayName: templateData.name,
        title: templateData.title || null,
        bio: templateData.bio || null,
        currentAffiliation: templateData.currentAffiliation || null,
        openalexId: templateData.openalexId,
        isPublic: templateData.isPublic !== false,
        links: templateData.links || null,
        theme: templateData.theme || null,
        lastSyncedAt: null,
      };

      // Fetch live data from OpenAlex API (same logic as preview)
      let researcher = null;
      let topics: any[] = [];
      let publications: any[] = [];
      let affiliations: any[] = [];

      try {
        const researcherData = await openalexService.getResearcher(templateData.openalexId);
        researcher = researcherData;

        if (researcherData.topics && researcherData.topics.length > 0) {
          topics = researcherData.topics.map((topic: any) => ({
            openalexId: templateData.openalexId,
            topicId: topic.id,
            displayName: topic.display_name,
            count: topic.count,
            subfield: topic.subfield.display_name,
            field: topic.field.display_name,
            domain: topic.domain.display_name,
          }));
        }

        if (researcherData.affiliations && researcherData.affiliations.length > 0) {
          affiliations = researcherData.affiliations.map((affiliation: any) => {
            const sortedYears = affiliation.years.sort((a: number, b: number) => a - b);
            return {
              openalexId: templateData.openalexId,
              institutionId: affiliation.institution.id,
              institutionName: affiliation.institution.display_name,
              institutionType: affiliation.institution.type,
              countryCode: affiliation.institution.country_code,
              years: affiliation.years,
              startYear: sortedYears[0],
              endYear: sortedYears[sortedYears.length - 1],
            };
          });
        }

        try {
          const worksResponse = await openalexService.getResearcherWorks(templateData.openalexId);
          if (worksResponse.results && worksResponse.results.length > 0) {
            publications = worksResponse.results.map((work: any) => ({
              openalexId: templateData.openalexId,
              workId: work.id,
              title: work.title,
              authorNames: work.authorships.map((a: any) => a.author.display_name).join(', '),
              journal: work.primary_location?.source?.display_name || null,
              publicationYear: work.publication_year || null,
              citationCount: work.cited_by_count || 0,
              topics: work.topics ? work.topics.map((t: any) => t.display_name) : null,
              doi: work.doi || null,
              isOpenAccess: work.open_access?.is_oa || false,
            }));
          }
        } catch (worksError) {
          console.log(`No works found for ${templateData.openalexId} during export`);
        }

      } catch (apiError) {
        console.error(`Error fetching OpenAlex data for export ${templateData.openalexId}:`, apiError);
        // Continue with template data only if API fails
      }

      // Prepare export data
      const exportData = {
        profile,
        researcher,
        topics,
        publications,
        affiliations,
        lastSynced: new Date().toISOString(),
        exportedAt: new Date().toISOString(),
        exportUrl: `${req.protocol}://${req.get('host')}/preview/${slug}`
      };

      // Generate static HTML using existing function
      const staticHTML = generateStaticHTML(exportData);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${(templateData.name || slug).replace(/[^a-zA-Z0-9_-]/g, '_')}-profile.html"`);
      res.send(staticHTML);

    } catch (error) {
      console.error(`Error exporting template ${req.params.slug}:`, error);
      
      if (error instanceof Error && error.message.includes('Validation failed')) {
        return res.status(400).json({ 
          message: "Template validation failed", 
          error: error.message 
        });
      }
      
      res.status(500).json({ message: "Failed to export template" });
    }
  });

  return createServer(app);
}