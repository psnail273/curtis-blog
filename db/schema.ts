import { pgTable, uuid, varchar, integer, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

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
})

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  author: varchar('author', { length: 255 }).notNull().default('Curtis Israel'),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  readTime: integer('read_time').notNull(),
  coverImage: text('cover_image'),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

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
})

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const commentLikes = pgTable('comment_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  commentId: uuid('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
