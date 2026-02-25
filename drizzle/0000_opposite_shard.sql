CREATE TABLE IF NOT EXISTS "about_page" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "about_page_section_unique" UNIQUE("section")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"author" varchar(255) DEFAULT 'Curtis Israel' NOT NULL,
	"published_at" timestamp with time zone,
	"category" varchar(100) NOT NULL,
	"read_time" integer NOT NULL,
	"cover_image" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"pinned_at" timestamp with time zone,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comment_likes_comment_id_user_id_unique" UNIQUE("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"path" varchar(1024) NOT NULL,
	"type" varchar(50) NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"upload_date" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "files_type_check" CHECK ("files"."type" IN ('code', 'video', 'pdf', 'image', 'document', 'other'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "live_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" varchar(20) NOT NULL,
	"username" varchar(255) NOT NULL,
	"is_live" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "live_status_platform_username_unique" UNIQUE("platform","username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "past_streams" (
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
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"image" text,
	"provider" varchar(50) DEFAULT 'google' NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_provider_provider_id_unique" UNIQUE("provider","provider_id")
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_articles_pinned" ON "articles" USING btree ("pinned","pinned_at" DESC NULLS LAST) WHERE "articles"."status" = 'published';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_comment_likes_comment_id" ON "comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_comment_likes_user_id" ON "comment_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_comments_article_id" ON "comments" USING btree ("article_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_comments_user_id" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_files_type" ON "files" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_files_path" ON "files" USING btree ("path");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_past_streams_date" ON "past_streams" USING btree ("streamed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_provider_id" ON "users" USING btree ("provider","provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");
