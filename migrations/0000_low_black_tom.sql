CREATE TABLE "affiliations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"openalex_id" varchar NOT NULL,
	"institution_id" varchar NOT NULL,
	"institution_name" text NOT NULL,
	"institution_type" varchar,
	"country_code" varchar,
	"years" jsonb,
	"start_year" integer,
	"end_year" integer
);
--> statement-breakpoint
CREATE TABLE "openalex_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"openalex_id" varchar NOT NULL,
	"data_type" varchar NOT NULL,
	"data" jsonb NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"openalex_id" varchar NOT NULL,
	"work_id" varchar NOT NULL,
	"title" text NOT NULL,
	"author_names" text,
	"journal" text,
	"publication_year" integer,
	"citation_count" integer DEFAULT 0,
	"topics" jsonb,
	"doi" varchar,
	"is_open_access" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "research_topics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"openalex_id" varchar NOT NULL,
	"topic_id" varchar NOT NULL,
	"display_name" text NOT NULL,
	"count" integer NOT NULL,
	"subfield" text,
	"field" text,
	"domain" text,
	"value" varchar
);
--> statement-breakpoint
CREATE TABLE "researcher_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"openalex_id" varchar NOT NULL,
	"display_name" text,
	"title" text,
	"bio" text,
	"cv_url" varchar,
	"is_public" boolean DEFAULT true,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "researcher_profiles_openalex_id_unique" UNIQUE("openalex_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "researcher_profiles" ADD CONSTRAINT "researcher_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");