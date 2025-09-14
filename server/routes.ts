import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { OpenAlexService } from "./services/openalexApi";
import { insertResearcherProfileSchema, updateResearcherProfileSchema, type ResearchTopic, type Publication, type Affiliation } from "@shared/schema";
import { z } from "zod";

// Admin authentication middleware
function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check for admin API token
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) {
    console.error('ADMIN_API_TOKEN environment variable not set');
    return res.status(500).json({ message: 'Admin authentication not configured' });
  }

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`Unauthorized admin access attempt from ${req.ip} to ${req.path}`);
    return res.status(401).json({ message: 'Bearer token required for admin endpoints' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  if (token !== adminToken) {
    console.warn(`Invalid admin token attempt from ${req.ip} to ${req.path}`);
    return res.status(403).json({ message: 'Invalid admin token' });
  }

  // Optional: IP restriction (allow localhost and private networks)
  const clientIP = req.ip || req.connection.remoteAddress;
  const isLocalhost = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === '::ffff:127.0.0.1';
  const isPrivateNetwork = clientIP?.startsWith('192.168.') || clientIP?.startsWith('10.') || clientIP?.startsWith('172.');
  
  if (!isLocalhost && !isPrivateNetwork && process.env.NODE_ENV === 'production') {
    console.warn(`Admin access denied from non-local IP ${clientIP} to ${req.path}`);
    return res.status(403).json({ message: 'Admin endpoints restricted to local access' });
  }

  // Log admin operation for audit trail
  console.log(`Admin operation: ${req.method} ${req.path} from ${clientIP}`);
  next();
}

// Rate limiting for admin endpoints (simple in-memory implementation)
const adminRateLimit = (() => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_REQUESTS = 100; // per window
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || 'unknown';
    const now = Date.now();
    
    const clientData = requests.get(clientIP);
    if (!clientData || now > clientData.resetTime) {
      requests.set(clientIP, { count: 1, resetTime: now + WINDOW_MS });
      return next();
    }
    
    if (clientData.count >= MAX_REQUESTS) {
      console.warn(`Admin rate limit exceeded for IP ${clientIP}`);
      return res.status(429).json({ message: 'Rate limit exceeded for admin operations' });
    }
    
    clientData.count++;
    next();
  };
})();

// OpenAlex researcher data interface
interface OpenAlexResearcherData {
  works_count?: number;
  cited_by_count?: number;
  summary_stats?: {
    h_index?: number;
    i10_index?: number;
  };
  [key: string]: any;
}

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
  const openalexService = new OpenAlexService();

  // Get all public researcher profiles for directory
  app.get('/api/researchers/public', async (req, res) => {
    try {
      const profiles = await storage.getAllPublicResearcherProfiles();
      
      // Get basic stats for each researcher
      const profilesWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const researcherData = await storage.getOpenalexData(profile.openalexId, 'researcher');
          const data = researcherData?.data as OpenAlexResearcherData | undefined;
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
      const publications = await storage.getPublications(openalexId);
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

  // SECURE ADMIN ENDPOINTS - Requires Bearer token authentication
  // These endpoints are protected and can only be accessed with valid admin token

  // Create researcher profile (ADMIN ONLY)
  app.post('/api/admin/researcher/profile', adminRateLimit, adminAuthMiddleware, async (req, res) => {
    try {
      const profileData = insertResearcherProfileSchema.parse(req.body);
      const profile = await storage.upsertResearcherProfile(profileData);
      
      // Trigger initial data sync from OpenAlex (non-blocking)
      if (profile.openalexId) {
        openalexService.syncResearcherData(profile.openalexId).catch(error => {
          console.error(`Failed to sync OpenAlex data for ${profile.openalexId}:`, error);
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

  // Update researcher profile (ADMIN ONLY)
  app.put('/api/admin/researcher/profile/:openalexId', adminRateLimit, adminAuthMiddleware, async (req, res) => {
    try {
      const { openalexId } = req.params;
      
      // Find profile by OpenAlex ID
      const profile = await storage.getResearcherProfileByOpenalexId(openalexId);
      if (!profile) {
        return res.status(404).json({ message: "Researcher profile not found" });
      }
      
      const updates = updateResearcherProfileSchema.parse({
        ...req.body,
        id: profile.id
      });
      
      const updatedProfile = await storage.updateResearcherProfile(profile.id, updates);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating researcher profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update researcher profile" });
      }
    }
  });

  // Sync researcher data (ADMIN ONLY)
  app.post('/api/admin/researcher/:openalexId/sync', adminRateLimit, adminAuthMiddleware, async (req, res) => {
    try {
      const { openalexId } = req.params;
      const profile = await storage.getResearcherProfileByOpenalexId(openalexId);
      
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

  // Search researchers by OpenAlex ID (public)
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

  // Export researcher website as static HTML (public)
  app.get('/api/researcher/:openalexId/export', async (req, res) => {
    try {
      const { openalexId } = req.params;
      
      // Get researcher profile (must be public)
      const profile = await storage.getResearcherProfileByOpenalexId(openalexId);
      if (!profile || !profile.isPublic) {
        return res.status(404).json({ message: "Researcher not found or not public" });
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

  const httpServer = createServer(app);
  return httpServer;
}