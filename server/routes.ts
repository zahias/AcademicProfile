import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { OpenAlexService } from "./services/openalexApi";
import { insertResearcherProfileSchema, updateResearcherProfileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  const openalexService = new OpenAlexService();

  // Configure multer for CV uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'));
      }
    },
  });

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
      const publications = await storage.getPublications(openalexId, 10);
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

  // CV Upload endpoint
  app.post('/api/upload/cv', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = req.user.claims.sub;
      const file = req.file;
      
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `cv-${userId}-${nanoid(8)}${fileExtension}`;
      
      // Store file in object storage private directory
      const privateDir = process.env.PRIVATE_OBJECT_DIR;
      if (!privateDir) {
        throw new Error('Object storage not configured');
      }
      
      const filePath = path.join(privateDir, filename);
      
      // Write file to object storage
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, file.buffer);
      
      // Generate public URL (you may need to adjust this based on your object storage setup)
      const publicUrl = `/api/files/cv/${filename}`;
      
      res.json({ url: publicUrl, filename });
    } catch (error) {
      console.error('Error uploading CV:', error);
      res.status(500).json({ message: 'Failed to upload CV' });
    }
  });

  // Serve CV files
  app.get('/api/files/cv/:filename', isAuthenticated, async (req: any, res) => {
    try {
      const { filename } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify the file belongs to the authenticated user
      if (!filename.includes(`cv-${userId}-`)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const privateDir = process.env.PRIVATE_OBJECT_DIR;
      if (!privateDir) {
        throw new Error('Object storage not configured');
      }
      
      const filePath = path.join(privateDir, filename);
      
      // Check if file exists and serve it
      const fs = await import('fs/promises');
      try {
        await fs.access(filePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        
        const fileStream = await import('fs');
        fileStream.createReadStream(filePath).pipe(res);
      } catch (fileError) {
        res.status(404).json({ message: 'File not found' });
      }
    } catch (error) {
      console.error('Error serving CV file:', error);
      res.status(500).json({ message: 'Failed to serve file' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
