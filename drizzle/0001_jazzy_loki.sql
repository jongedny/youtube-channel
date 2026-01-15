CREATE TABLE "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"species" varchar(100) NOT NULL,
	"pocket_artifact" varchar(255) NOT NULL,
	"role_and_vibe" text NOT NULL,
	"backstory" text,
	"is_original" boolean DEFAULT false NOT NULL,
	"generated_by" varchar(50) DEFAULT 'manual' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"scenario_id" integer,
	"character_id" integer,
	"url" varchar(500) NOT NULL,
	"prompt" text,
	"generated_by" varchar(50) DEFAULT 'gemini' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lore" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"character_ids" text NOT NULL,
	"location" varchar(255),
	"mission" text,
	"generated_by" varchar(50) DEFAULT 'gemini' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"scenario_id" integer,
	"url" varchar(500) NOT NULL,
	"prompt" text,
	"duration" integer,
	"generated_by" varchar(50) DEFAULT 'gemini' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE no action ON UPDATE no action;