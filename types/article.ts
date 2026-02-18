export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  readTime: number;
  coverImage?: string;
  status?: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
  pinned?: boolean;
  pinnedAt?: string;
}

export interface AboutPageSection {
  id: string;
  section: string;
  content: string;
  order: number;
  updatedAt: string;
}

/** New single-content model for the about page. */
export interface AboutContent {
  content: string;
  updatedAt: string | null;
}
