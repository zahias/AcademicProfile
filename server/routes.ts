import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { OpenAlexService } from "./services/openalexApi";
import { insertResearcherProfileSchema, updateResearcherProfileSchema, type ResearchTopic, type Publication, type Affiliation } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { listTemplates, getTemplate, getTemplateModTime } from "./fileData";
import { z } from "zod";

// Security utility functions for safe HTML generation

// Test function to verify XSS protection
function testXSSProtection() {
  const maliciousInputs = [
    '<script>alert("XSS")</script>',
    '"><script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '&lt;script&gt;alert("XSS")&lt;/script&gt;'
  ];

  console.log('🔒 Testing XSS Protection...');
  
  maliciousInputs.forEach((input, index) => {
    const escaped = escapeHtml(input);
    const attributeEscaped = escapeHtmlAttribute(input);
    const urlSanitized = validateAndSanitizeUrl(input);
    
    console.log(`Test ${index + 1}:`);
    console.log(`  Input: ${input}`);
    console.log(`  HTML Escaped: ${escaped}`);
    console.log(`  Attribute Escaped: ${attributeEscaped}`);
    console.log(`  URL Sanitized: ${urlSanitized}`);
    console.log('  ---');
  });

  // Test that valid URLs still work
  const validUrls = ['https://example.com', '/path/to/page', '#anchor'];
  console.log('Valid URL tests:');
  validUrls.forEach(url => {
    console.log(`  ${url} -> ${validateAndSanitizeUrl(url)}`);
  });
  
  console.log('✅ XSS Protection tests completed');
}
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
                ${topics.slice(0, 15).map((topic: ResearchTopic) => `
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
                ${publications.slice(0, 10).map((pub: Publication) => `
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
                ${affiliations.map((aff: Affiliation) => `
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
  // Auth middleware
  await setupAuth(app);

  const openalexService = new OpenAlexService();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Researcher profile routes
  app.get('/api/researcher/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getResearcherProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching researcher profile:", error);
      res.status(500).json({ message: "Failed to fetch researcher profile" });
    }
  });

  app.post('/api/researcher/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertResearcherProfileSchema.parse({
        ...req.body,
        userId
      });
      
      const profile = await storage.upsertResearcherProfile(profileData);
      
      // Trigger initial data sync from OpenAlex (non-blocking)
      if (profile.openalexId) {
        openalexService.syncResearcherData(profile.openalexId).catch(error => {
          console.error(`Failed to sync OpenAlex data for ${profile.openalexId}:`, error);
          // Don't fail the profile creation - sync can be attempted later
        });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error creating researcher profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create researcher profile" });
      }
    }
  });

  app.put('/api/researcher/profile/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileId = req.params.id;
      
      // Verify profile ownership
      const existingProfile = await storage.getResearcherProfile(userId);
      if (!existingProfile || existingProfile.id !== profileId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updates = updateResearcherProfileSchema.parse({
        ...req.body,
        id: profileId
      });
      
      const profile = await storage.updateResearcherProfile(profileId, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating researcher profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update researcher profile" });
      }
    }
  });

  // Get all public researcher profiles for directory
  app.get('/api/researchers/public', async (req, res) => {
    try {
      const profiles = await storage.getAllPublicResearcherProfiles();
      
      // Get basic stats for each researcher
      const profilesWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const researcherData = await storage.getOpenalexData(profile.openalexId, 'researcher');
          const data = researcherData?.data as any; // OpenAlex API response structure
          return {
            ...profile,
            stats: data ? {
              worksCount: data.works_count || 0,
              citedByCount: data.cited_by_count || 0,
              hIndex: data.summary_stats?.h_index || 0,
              i10Index: data.summary_stats?.i10_index || 0,
            } : null
          };
        })
      );
      
      res.json(profilesWithStats);
    } catch (error) {
      console.error("Error fetching public researcher profiles:", error);
      res.status(500).json({ message: "Failed to fetch researcher profiles" });
    }
  });

  // Public researcher data routes
  app.get('/api/researcher/:openalexId/data', async (req, res) => {
    try {
      const { openalexId } = req.params;
      
      // Get researcher profile (if public)
      const profile = await storage.getResearcherProfileByOpenalexId(openalexId);
      if (!profile || !profile.isPublic) {
        return res.status(404).json({ message: "Researcher not found or not public" });
      }

      // Get cached OpenAlex data
      const researcherData = await storage.getOpenalexData(openalexId, 'researcher');
      const researchTopics = await storage.getResearchTopics(openalexId);
      const publications = await storage.getPublications(openalexId); // Get ALL publications for accurate analytics
      const affiliations = await storage.getAffiliations(openalexId);

      res.json({
        profile,
        researcher: researcherData?.data || null,
        topics: researchTopics,
        publications,
        affiliations,
        lastSynced: profile.lastSyncedAt
      });
    } catch (error) {
      console.error("Error fetching researcher data:", error);
      res.status(500).json({ message: "Failed to fetch researcher data" });
    }
  });

  // Data sync routes
  app.post('/api/researcher/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getResearcherProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Researcher profile not found" });
      }

      await openalexService.syncResearcherData(profile.openalexId);
      
      // Update last synced timestamp
      await storage.updateResearcherProfile(profile.id, {
        lastSyncedAt: new Date()
      });

      res.json({ message: "Data sync completed successfully" });
    } catch (error) {
      console.error("Error syncing researcher data:", error);
      res.status(500).json({ message: "Failed to sync researcher data" });
    }
  });

  // Search researchers by OpenAlex ID
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

  // Template routes (no authentication required)
  
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

  // Export researcher website as static HTML
  app.get('/api/researcher/:openalexId/export', isAuthenticated, async (req: any, res) => {
    try {
      const { openalexId } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify ownership - user can only export their own profile
      const profile = await storage.getResearcherProfile(userId);
      if (!profile || profile.openalexId !== openalexId) {
        return res.status(403).json({ message: "Unauthorized - you can only export your own profile" });
      }

      // Get all researcher data
      const researcherData = await storage.getOpenalexData(openalexId, 'researcher');
      const researchTopics = await storage.getResearchTopics(openalexId);
      const publications = await storage.getPublications(openalexId);
      const affiliations = await storage.getAffiliations(openalexId);

      const exportData = {
        profile,
        researcher: researcherData?.data || null,
        topics: researchTopics,
        publications,
        affiliations,
        lastSynced: profile.lastSyncedAt,
        exportedAt: new Date().toISOString(),
        exportUrl: `${req.protocol}://${req.get('host')}/researcher/${openalexId}`
      };

      // Generate static HTML
      const staticHTML = generateStaticHTML(exportData);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${profile.displayName || 'researcher'}-profile.html"`);
      res.send(staticHTML);
    } catch (error) {
      console.error("Error exporting researcher profile:", error);
      res.status(500).json({ message: "Failed to export researcher profile" });
    }
  });

  // CV Upload URL endpoint
  app.post('/api/upload/cv/url', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { filename } = req.body;
      
      if (!filename) {
        return res.status(400).json({ message: 'Filename is required' });
      }
      
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getCVUploadURL(userId, filename);
      
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting CV upload URL:', error);
      res.status(500).json({ message: 'Failed to get upload URL' });
    }
  });

  // CV Upload completion endpoint
  app.put('/api/upload/cv/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { uploadURL } = req.body;
      
      if (!uploadURL) {
        return res.status(400).json({ message: 'Upload URL is required' });
      }
      
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        uploadURL,
        {
          owner: userId,
          visibility: "private", // CV files should be private
        },
      );
      
      res.json({ objectPath, url: objectPath });
    } catch (error) {
      console.error('Error completing CV upload:', error);
      res.status(500).json({ message: 'Failed to complete upload' });
    }
  });

  // Serve CV files
  app.get('/objects/:objectPath(*)', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const objectStorageService = new ObjectStorageService();
      
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('Error serving file:', error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ message: 'File not found' });
      }
      return res.status(500).json({ message: 'Failed to serve file' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
