DROP INDEX "idx_articles_pinned";--> statement-breakpoint
CREATE INDEX "idx_articles_published_at" ON "articles" USING btree ("published_at" DESC NULLS LAST) WHERE "articles"."status" = 'published';--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "pinned";--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "pinned_at";