import { pgTable, uuid, varchar, integer, text, timestamp, jsonb, boolean, index, unique, check } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  path: varchar('path', { length: 1024 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  size: integer('size').notNull().default(0),
  uploadDate: timestamp('upload_date', { withTimezone: true }).notNull().defaultNow(),
  description: text('description'),
  url: text('url').notNull(),
  metadata: jsonb('metadata').notNull().default({}),
}, (table) => [
  check('files_type_check', sql`${table.type} IN ('code', 'video', 'pdf', 'image', 'document', 'other')`),
  index('idx_files_type').on(table.type),
  index('idx_files_path').on(table.path),
])

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  author: varchar('author', { length: 255 }).notNull().default('Curtis Israel'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  category: varchar('category', { length: 100 }).notNull(),
  readTime: integer('read_time').notNull(),
  coverImage: text('cover_image'),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_articles_published_at')
    .on(table.publishedAt.desc().nullsLast())
    .where(sql`${table.status} = 'published'`),
])

export const aboutPage = pgTable('about_page', {
  id: uuid('id').primaryKey().defaultRandom(),
  section: varchar('section', { length: 50 }).notNull().unique(),
  content: text('content').notNull(),
  order: integer('order').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  image: text('image'),
  provider: varchar('provider', { length: 50 }).notNull().default('google'),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique('users_provider_provider_id_unique').on(table.provider, table.providerId),
  index('idx_users_provider_id').on(table.provider, table.providerId),
  index('idx_users_email').on(table.email),
])

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  index('idx_comments_article_id').on(table.articleId, table.createdAt.asc()),
  index('idx_comments_user_id').on(table.userId),
  index('idx_comments_parent_id').on(table.parentId),
])

export const commentLikes = pgTable('comment_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  commentId: uuid('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique('comment_likes_comment_id_user_id_unique').on(table.commentId, table.userId),
  index('idx_comment_likes_comment_id').on(table.commentId),
  index('idx_comment_likes_user_id').on(table.userId),
])

export const pastStreams = pgTable('past_streams', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: varchar('platform', { length: 20 }).notNull(),
  platformId: varchar('platform_id', { length: 255 }).notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  duration: varchar('duration', { length: 20 }).notNull(),
  viewCount: integer('view_count').notNull().default(0),
  streamedAt: timestamp('streamed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique('past_streams_platform_platform_id_unique').on(table.platform, table.platformId),
  index('idx_past_streams_date').on(table.streamedAt.desc()),
])

export const liveStatus = pgTable('live_status', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: varchar('platform', { length: 20 }).notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  isLive: boolean('is_live').notNull().default(false),
  metadata: jsonb('metadata').notNull().default({}),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique('live_status_platform_username_unique').on(table.platform, table.username),
])
