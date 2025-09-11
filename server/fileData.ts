import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

// Schema for validating JSON template files
export const researcherInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  currentAffiliation: z.string().optional(),
  currentPosition: z.string().optional(),
  currentAffiliationUrl: z.string().url().optional().or(z.literal("")),
  currentAffiliationStartDate: z.string().optional(),
  openalexId: z.string().transform((val) => {
    // Ensure OpenAlex ID is properly formatted with capital A
    const trimmed = val.trim();
    if (trimmed.toLowerCase().startsWith('a') && !trimmed.startsWith('A')) {
      return 'A' + trimmed.slice(1);
    }
    return trimmed.startsWith('A') ? trimmed : `A${trimmed}`;
  }).refine((val) => /^A\d+$/.test(val), {
    message: "OpenAlex ID must start with 'A' followed by numbers (e.g., A5056485484)"
  }),
  links: z.object({
    website: z.string().url().optional().or(z.literal("")),
    google_scholar: z.string().url().optional().or(z.literal("")),
    orcid: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().url().optional().or(z.literal("")),
    github: z.string().optional(),
  }).optional(),
  theme: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    fontFamily: z.enum(['inter', 'roboto', 'playfair', 'source-serif']).optional(),
    layout: z.enum(['classic', 'modern', 'minimal']).optional(),
  }).optional(),
  isPublic: z.boolean().default(true),
});

export type ResearcherInput = z.infer<typeof researcherInputSchema>;

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Ensure the data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Get a list of all JSON template files in the data directory
 */
export async function listTemplates(): Promise<Array<{ slug: string; filename: string; lastModified: Date }>> {
  try {
    await ensureDataDirectory();
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const templates = await Promise.all(
      jsonFiles.map(async (filename) => {
        const filepath = path.join(DATA_DIR, filename);
        const stats = await fs.stat(filepath);
        const slug = filename.replace('.json', '');
        
        return {
          slug,
          filename,
          lastModified: stats.mtime,
        };
      })
    );
    
    // Sort by last modified date, newest first
    return templates.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  } catch (error) {
    console.error('Error listing templates:', error);
    throw new Error('Failed to list templates');
  }
}

/**
 * Get a specific template by slug
 */
export async function getTemplate(slug: string): Promise<{ data: ResearcherInput; lastModified: Date } | null> {
  try {
    await ensureDataDirectory();
    const filename = `${slug}.json`;
    const filepath = path.join(DATA_DIR, filename);
    
    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return null; // File doesn't exist
    }
    
    // Read file content
    const content = await fs.readFile(filepath, 'utf-8');
    const stats = await fs.stat(filepath);
    
    // Parse and validate JSON
    let jsonData;
    try {
      jsonData = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Invalid JSON in file ${filename}: ${parseError instanceof Error ? parseError.message : 'Unknown JSON error'}`);
    }
    
    // Validate against schema
    try {
      const validatedData = researcherInputSchema.parse(jsonData);
      return {
        data: validatedData,
        lastModified: stats.mtime,
      };
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed for ${filename}: ${errorMessages}`);
      }
      throw new Error(`Validation failed for ${filename}: ${validationError instanceof Error ? validationError.message : 'Unknown validation error'}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      throw error; // Re-throw validation errors as-is
    }
    console.error(`Error reading template ${slug}:`, error);
    throw new Error(`Failed to read template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the modification time of a template file
 */
export async function getTemplateModTime(slug: string): Promise<Date | null> {
  try {
    await ensureDataDirectory();
    const filename = `${slug}.json`;
    const filepath = path.join(DATA_DIR, filename);
    
    try {
      const stats = await fs.stat(filepath);
      return stats.mtime;
    } catch {
      return null; // File doesn't exist
    }
  } catch (error) {
    console.error(`Error getting modification time for template ${slug}:`, error);
    return null;
  }
}

/**
 * Save a template (for future use - not required for initial implementation)
 */
export async function saveTemplate(slug: string, data: ResearcherInput): Promise<void> {
  try {
    await ensureDataDirectory();
    const filename = `${slug}.json`;
    const filepath = path.join(DATA_DIR, filename);
    
    // Validate data first
    const validatedData = researcherInputSchema.parse(data);
    
    // Write to file
    await fs.writeFile(filepath, JSON.stringify(validatedData, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error saving template ${slug}:`, error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    throw new Error(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}