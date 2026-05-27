import type { Article } from './article';
import type { FileRecord } from './file';

export interface PastStream {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  createdAt: string;
  platform: 'twitch' | 'youtube';
}

export type SearchResult =
  | { type: 'article'; data: Article }
  | { type: 'stream'; data: PastStream }
  | { type: 'file'; data: FileRecord };

export type SearchResultType = 'article' | 'stream' | 'file';
