import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Researcher profiles table
export const researcherProfiles = pgTable("researcher_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  openalexId: varchar("openalex_id").unique().notNull(),
  displayName: text("display_name"),
  title: text("title"),
  bio: text("bio"),
  cvUrl: varchar("cv_url"),
  isPublic: boolean("is_public").default(true),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OpenAlex researcher data cache
export const openalexData = pgTable("openalex_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  openalexId: varchar("openalex_id").notNull(),
  dataType: varchar("data_type").notNull(), // 'researcher', 'works', 'topics'
  data: jsonb("data").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Research topics cache
export const researchTopics = pgTable("research_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  openalexId: varchar("openalex_id").notNull(),
  topicId: varchar("topic_id").notNull(),
  displayName: text("display_name").notNull(),
  count: integer("count").notNull(),
  subfield: text("subfield"),
  field: text("field"),
  domain: text("domain"),
  value: varchar("value"), // topic share value
});

// Publications cache
export const publications = pgTable("publications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  openalexId: varchar("openalex_id").notNull(),
  workId: varchar("work_id").notNull(),
  title: text("title").notNull(),
  authorNames: text("author_names"),
  journal: text("journal"),
  publicationYear: integer("publication_year"),
  citationCount: integer("citation_count").default(0),
  topics: jsonb("topics"), // array of topic tags
  doi: varchar("doi"),
  isOpenAccess: boolean("is_open_access").default(false),
});

// Affiliations cache
export const affiliations = pgTable("affiliations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  openalexId: varchar("openalex_id").notNull(),
  institutionId: varchar("institution_id").notNull(),
  institutionName: text("institution_name").notNull(),
  institutionType: varchar("institution_type"),
  countryCode: varchar("country_code"),
  years: jsonb("years"), // array of years
  startYear: integer("start_year"),
  endYear: integer("end_year"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertResearcherProfile = typeof researcherProfiles.$inferInsert;
export type ResearcherProfile = typeof researcherProfiles.$inferSelect;

export type InsertOpenalexData = typeof openalexData.$inferInsert;
export type OpenalexData = typeof openalexData.$inferSelect;

export type InsertResearchTopic = typeof researchTopics.$inferInsert;
export type ResearchTopic = typeof researchTopics.$inferSelect;

export type InsertPublication = typeof publications.$inferInsert;
export type Publication = typeof publications.$inferSelect;

export type InsertAffiliation = typeof affiliations.$inferInsert;
export type Affiliation = typeof affiliations.$inferSelect;

export const insertResearcherProfileSchema = createInsertSchema(researcherProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  openalexId: z.string().transform((val) => {
    // Ensure OpenAlex ID is properly formatted with capital A
    const trimmed = val.trim();
    if (trimmed.toLowerCase().startsWith('a') && !trimmed.startsWith('A')) {
      return 'A' + trimmed.slice(1);
    }
    return trimmed.startsWith('A') ? trimmed : `A${trimmed}`;
  }).refine((val) => /^A\d+$/.test(val), {
    message: "OpenAlex ID must start with 'A' followed by numbers (e.g., A5056485484)"
  })
});

export const updateResearcherProfileSchema = insertResearcherProfileSchema.partial().extend({
  id: z.string(),
});
