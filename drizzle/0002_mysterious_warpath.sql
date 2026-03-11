CREATE TABLE "live_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" varchar(20) NOT NULL,
	"username" varchar(255) NOT NULL,
	"is_live" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "live_status_platform_username_unique" UNIQUE("platform","username")
);
--> statement-breakpoint
CREATE TABLE "past_streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" varchar(20) NOT NULL,
	"platform_id" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"duration" varchar(20) NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"streamed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "past_streams_platform_platform_id_unique" UNIQUE("platform","platform_id")
);
--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "published_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "idx_past_streams_date" ON "past_streams" USING btree ("streamed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_articles_published_at" ON "articles" USING btree ("published_at" DESC NULLS LAST) WHERE "articles"."status" = 'published';--> statement-breakpoint
CREATE INDEX "idx_comment_likes_comment_id" ON "comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_comment_likes_user_id" ON "comment_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_files_type" ON "files" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_files_path" ON "files" USING btree ("path");--> statement-breakpoint
CREATE INDEX "idx_users_provider_id" ON "users" USING btree ("provider","provider_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_user_id_unique" UNIQUE("comment_id","user_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_provider_provider_id_unique" UNIQUE("provider","provider_id");--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_type_check" CHECK ("files"."type" IN ('code', 'video', 'pdf', 'image', 'document', 'other'));