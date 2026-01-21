ALTER TABLE "videos" ADD COLUMN "youtube_id" varchar(100);--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "youtube_url" varchar(500);--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "upload_status" varchar(50) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "uploaded_at" timestamp;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "upload_error" text;