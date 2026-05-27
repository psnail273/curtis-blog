ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "parent_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_comments_article_id" ON "comments" USING btree ("article_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_comments_user_id" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_comments_parent_id" ON "comments" USING btree ("parent_id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE;