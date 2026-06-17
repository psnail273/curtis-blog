CREATE TABLE "youtube_playlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playlist_id" varchar(255) NOT NULL,
	"video_id" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"duration" varchar(20) NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "youtube_playlist_items_playlist_video_unique" UNIQUE("playlist_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "youtube_playlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playlist_id" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "youtube_playlists_playlist_id_unique" UNIQUE("playlist_id")
);
--> statement-breakpoint
CREATE INDEX "idx_youtube_playlist_items_playlist" ON "youtube_playlist_items" USING btree ("playlist_id","position");--> statement-breakpoint
CREATE INDEX "idx_youtube_playlists_position" ON "youtube_playlists" USING btree ("position");